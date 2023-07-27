---
title: "Server-side Git hook for deploying a Laravel web application"
prevFilename: "db"
nextFilename: "git-dev"
date: 2023-07-18
---

# Server-side Git setup for deploying a Laravel web application, Part 2

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article shows how to create a deploy script for building a Laravel and Vue.js app and how to use a `post-receive` Git hook to automatically run the script after every Git push to the server.
 
{{< details summary="Credit where credit is due" >}}
The Git workflow used in this guide is based on [Farhan Hasin Chowdhury's guide to deploying a Laravel web app on a VPS](https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers) (which in turm seems to be inspired by [J. Alexander Curtis's guide to deploying a Laravel 5.3 app on a LEMP stack](https://devmarketer.io/learn/deploy-laravel-5-app-lemp-stack-ubuntu-nginx/)).
I encourage you to read through both guides.
{{< /details >}}

The `build` script installs PHP packages, builds the app, and runs PHP Artisan commands, and otherwise prepares the app for deployment

```bash
# Open existing post-receive hook for editing
vim /var/repo/site.git/hooks/post-receive
```

At the bottom add:

```bash
sudo /usr/local/bin/build
```

The final `post-receive` script should look like this: 

```bash
#!/bin/sh
# Run the checkout script (to be created) on the post-receive hook
sudo /usr/local/bin/checkout

# Run the build script after completing the checkout script
sudo /usr/local/bin/build
```

Then create `/usr/local/bin/build` and inside place:

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

Ensure `build` is executable

```bash
chmod +x /usr/local/bin/build
```

Give the `laravel` user permission to run the `build` hook with `sudo` privileges:

```bash
# Safely opens the sudoers file for editing
visudo /etc/sudoers
```

Add the following to the bottom of `/etc/sudoers`:

```bash
# Give laravel user permission to execute checkout scripts as sudo without password
laravel ALL=NOPASSWD: /usr/local/bin/checkout, /usr/local/bin/build
```
