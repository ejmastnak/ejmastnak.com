---
title: "Server-side Git setup for deploying a Laravel web application"
prevFilename: "db"
nextFilename: "git-dev"
date: 2023-07-18
---

# Server-side Git setup for deploying a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

Credit: the Git workflow used in this guide is based on https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers (which in turm seems to be inspired by https://devmarketer.io/learn/deploy-laravel-5-app-lemp-stack-ubuntu-nginx/)

Install Git in the unlikely event it's not already installed on your server:

```bash
# Install Git, if needed (unlikely, most distros come with Git preinstalled)
sudo apt install git-all
```

Create a bare Git repository in `/var/repo/` to hold the web app's code on the server:

```bash
# Create directory to store project
mkdir -p /var/repo/landmarks.git

# Make the laravel user the owner of project repo
chown laravel:laravel /var/repo/landmarks.git

# Create a bare git repo for project
cd /var/repo/landmarks.git
git init --bare
```

Create a directory in `/var/www/` from which to serve the app:

```bash
# Create directory to hold app files on server
mkdir -p /var/www/landmarks
chown laravel:laravel /var/www/landmarks
```

Workflow: push the web app to `/var/repo/landmarks.git` and serve it from `/var/www/landmarks`.

## Create post-receive hook

Git hooks allow you to run scripts in response to important events.
For more on Git hooks [consult the Git book](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks).

Our plan is to use the `post-receive` Git hook to run two custom scripts, `checkout` and `post-checkout`.

```bash
# (On server)
cd /var/repo/landmarks.git /hooks
```

**TODO:** is post-receive automatically present or do we create it manually?
If we create it, then

```bash
# Create the post-receive hook script
touch post-receive

# Make post-receive hook executable
chmod +x post-receive

# Open the post-receive script for editing
vim post-receive
```

Inside add:

```bash
#!/bin/sh
# Run the checkout script (to be created) on the post-receive hook
sudo /usr/local/bin/checkout
```

### checkout script

The `checkout` script will updates the files in the served app directory `/var/www/landmarks/` to match the version pushed to `/var/repo/landmarks.git`.

Then create `/usr/local/bin/checkout` and inside place:

```bash
#!/bin/sh
# Move code in Git repo to application directory
git --work-tree=/var/www/landmarks --git-dir=/var/repo/landmarks.git checkout --force
```

This code updates the files in the served app directory `/var/www/landmarks/` to match the version pushed to `/var/repo/landmarks.git`;
for practical purposes, it copies the code you pushed to the served app directory.

```bash
# Make checkout script executable
chmod +x /usr/local/bin/checkout
```

Give the `laravel` user permission to run the `post-checkout` hook with `sudo` privileges:

```bash
# Safely opens the sudoers file for editing
visudo /etc/sudoers
```

Add the following to the bottom of `/etc/sudoers`:

```bash
# Give non-root user permission to execute checkout script as sudo without password
laravel ALL=NOPASSWD: /usr/local/bin/checkout
```

### post-checkout script

The `post-checkout` script installs PHP packages, builds the app, and runs PHP Artisan commands, and otherwise prepares the app for deployment

```bash
# Open existing post-receive hook for editing
vim /var/repo/site.git/hooks/post-receive
```

At the bottom add:

```bash
sudo /usr/local/bin/post-checkout
```

The final `post-receive` script should look like this: 

```bash
#!/bin/sh
# Run the checkout script (to be created) on the post-receive hook
sudo /usr/local/bin/checkout

# Run the post-checkout script after completing the checkout script
sudo /usr/local/bin/post-checkout
```

Then create `/usr/local/bin/post-checkout` and inside place:

```bash
#!/bin/sh
cd /var/www/landmarks

# Using the `-n` flag to not overwrite an existing `.env` file
cp -n ./.env.example ./.env

# Enter maintenance mode
php artisan down

# Temporarily suppresses warning when composer runs with root privileges
# Otherwise a standard composer install for a Laravel production environment
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader

# Install node packages and build assets
npm install && npm run build

# # If applicable to your application
# php artisan queue:restart
# php artisan cache:clear

# Caches Laravel routes and configuration settings for efficiency
php artisan route:cache
php artisan config:cache

# Force flag is needed for automated deploys to suppress warning prompt
php artisan migrate --force

# Leave maintenance mode
php artisan up
```

Ensure `post-checkout` is executable

```bash
chmod +x /usr/local/bin/post-checkout
```

Give the `laravel` user permission to run the `post-checkout` hook with `sudo` privileges:

```bash
# Safely opens the sudoers file for editing
visudo /etc/sudoers
```

Add the following to the bottom of `/etc/sudoers`:

```bash
# Give laravel user permission to execute checkout scripts as sudo without password
laravel ALL=NOPASSWD: /usr/local/bin/checkout, /usr/local/bin/post-checkout
```
