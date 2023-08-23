---
title: "Zero-downtime deployment of a Laravel web application"
prevFilename: "deploy"
nextFilename: "dns"
date: 2023-07-18
---

# Zero-downtime deployment of a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article covers zero-downtime redeployment of a Laravel web application.

{{< details summary="There are two other redeployment options in this guide" >}}
1. [Super simple redeployment]({{< relref "deploy-simple" >}}): simpler but much less robust than zero-downtime redeployment. Meant as a learning exercise for beginners rather than a real-world technique.
1. [Zero-downtime redeployment using Deployer]({{< relref "deploy#deployer" >}}): more powerful than this article, but requires learning and using a third-party tool.
{{< /details >}}

## Prerequisites

1. You should have read, implemented, and understood the earlier article on [server-side Git setup]({{< relref "git-server" >}}).
In particular you have a working `post-receive` hook in your server-side Git repo and understand what the hook does, i.e. copy your app to the production directory in `/srv/www/` after every Git push.
2. You should have read, followed, and understood the manual deployment steps covered in the past few articles (in particular the [Composer]({{< relref "composer" >}}), [NPM]({{< relref "npm" >}}), [Laravel environment]({{< relref "env" >}}), and [Laravel directory permissions]({{< relref "permissions" >}}), and [Nginx]({{< relref "nginx" >}})) articles), and your app should be live when you visit your server's IP address from a web browser.

## How zero-downtime redeployment works {#how-it-works}

*I know how zero-downtime redeployment works, please take me directly to [preparations for deployment](#preparations).*

This redeployment workflow relies on the `post-receive` hook in your server-side Git repo and uses a special directory structure to enable zero-downtime redeployment.

A typical redeployment looks something like this:

1. You develop your app on your dev machine.
2. You push code from your dev machine to your app's server-side Git repo, triggering the `post-receive` hook.
   The `post-receive` hook then:

   1. Creates a dedicated directory in `/srv/www/laravel-project/releases/` to hold the latest version (or "release") of your app 
   1. Copies your app's code into the new release directory.
   1. Runs the standard Laravel redeployment procedure (Composer and NPM installs, rebuilding your app, caching routes and config, etc.) in the new release directory.
   1. *If* the redeployment completes successfully, publishes the new release by symlinking `/srv/www/laravel-project/active` to the latest release.

   (There are few more details we'll fill in later.)

Why would you want this?

- Redeployment is practically instant---the time needed to update a symlink.
- A failed redeployment won't bring your app down because the `active` symlink will only update on a successful redeployment.
  If a redeployment fails, Nginx simply continues serving the previous version with your users none the wiser.

### Overview of the directory structure

Zero-downtime redeployment uses a directory structure something like this:

```bash
/srv/www/laravel-project/
├── releases/
│   ├── 1/
│   ├── 2/
│   └── 3/
├── active -> releases/3/  # symlink indicating active release
└── shared/  # contains `.env`, `storage/`, and other files shared by all releases
```

- The numbered directories in `releases/` hold releases of your app.
- `active` is a symlink pointing to the active release of your app (i.e. the release served to the public Web).
- `shared` contains files like `.env` and `storage` (and possibly `database.sqlite` if you use SQLite) that are shared by all releases and not normally tracked by Git.

Make sure you understand the role of the `active` symlink before going forward---it determines which release of your app is served to the public Web.

I also recommend reading Loris Leiva's description of [what happens during zero-downtime redeployment](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/deploy-with-zero-downtime#what-happened)---it covers the same material with nicer graphics.

## Preparations for deployment {#preparations}

There are a few manual preparations needed before we can automate the redeployment process.
(Don't worry---you'll only have to do these steps once.)

### Our starting point

Just so we're on the same page, I'm assuming you've followed along with the guide so far, and that your current directory structure looks something like this:

```bash
/srv/www/laravel-project/
├── app/
├── bootstrap/
├── config/
└── ...
```

For orientation, the directory structure after working through this section should look something like this:

```bash
/srv/www/laravel-project/
├── releases/
│   └── initial/
│       ├── app/
│       ├── bootstrap/
│       ├── config/
│       ├── ...
│       ├── .env -> ../../shared/.env
│       └── storage -> ../../shared/storage/
├── active -> releases/initial/  # symlink to initial release
└── shared/
    ├── .env
    └── storage/
```

Here's how I'd suggest going about this:

### Move your app to the `releases/` directory

1. Create a `releases/` directory.
1. Create an `initial/` directory inside `releases/` to hold your app's "initial" release (use a different name if you like, just be consistent).
1. Move your app's files into the intial release directory.

Do this however you like (`mv`, a command-line file manager, etc.);
after completing this step your directory structure should look like this:

```bash
/srv/www/laravel-project/
└── releases/
    └── initial/
        ├── app/
        ├── bootstrap/
        ├── config/
        ├── .env
        └── ...
```

This will temporarily break your app (since Nginx will still be trying to server your app from the old directory structure). Don't worry, we'll fix it soon!

### Create a directory for shared files

Next, create a dedicated `shared/` directory.
This will store Laravel files that are shared by all versions of your app and are not tracked by Git---your `.env` file, `storage/` directory, and SQLite database (if using SQLite).
Move these files from your initial release to the `shared` directory.

After this step your directory structure should be something like this:

```bash
/srv/www/laravel-project/
├── releases/
│   └── initial/
│       ├── app/
│       ├── bootstrap/
│       ├── config/
│       └── ...
└── shared/
    ├── .env
    └── storage/
```

### Link shared files into place

Link your shared files into place (in the future a redeployment script will do this for you, but you have to do it manually for the initial release).
Here's an example shell session:

```bash
# Change into initial release directory
laravel@server$ cd /srv/www/laravel-project/releases/initial

laravel@server:initial$ ln -s ../../shared/.env .env
laravel@server:laravel-project$ ln -s ../../shared/storage/ storage

# If using SQLite
laravel@server:laravel-project$ ln -s ../../shared/database.sqlite database/sqlite/database.sqlite
```

Here's what your directory structure should look like after this step:

```bash
/srv/www/laravel-project/
├── releases/
│   └── initial/
│       ├── app/
│       ├── bootstrap/
│       ├── config/
│       ├── .env -> ../../shared/.env
│       ├── storage/ -> ../../shared/storage/
│       └── ...
└── shared/
    ├── .env
    └── storage/
    # Add SQLite database if used by your app
```

### Create an `active` symlink

Activate your initial release by creating the `active` symlink:

```bash
# Create a symlink activating your initial release
laravel@server$ cd /srv/www/laravel-project/
laravel@server:laravel-project$ ln -s  releases/initial/ active
```

Your directory structure should now look like this:

```bash
/srv/www/laravel-project/
├── active/ -> releases/initial/
├── releases/
│   └── initial/
│       ├── app/
│       ├── bootstrap/
│       ├── config/
│       ├── .env -> ../../shared/.env
│       ├── storage/ -> ../../shared/storage/
│       └── ...
└── shared/
    ├── .env
    └── storage/
    # Add SQLite database if used by your app
```

### Ownership and permission reset

There's a chance you unintentionally tweaked directory ownership and/or permissions while rearranging your app's directory structure to accommodate zero-downtime redeployment.

Since Laravel is a bit finicky in this regard, you should run a quick double-check that you are still using [correct Laravel permissions]({{< relref "permissions" >}}):

```bash
# Give Nginx group ownership of all of your app's files
laravel@server:laravel-project$ sudo chown -R :www-data releases/ shared/

# Laravel-specific directory permissions
laravel@server$ sudo chmod -R 775 releases/initial/storage
laravel@server$ sudo chmod -R 775 releases/initial/bootstrap/cache
```

### Update your Laravel cache

Laravel will likely still be caching references to your old directory structure, in which case you'll need to refresh your app's configuration and route cache.

```bash
laravel@server:laravel-project$ cd releases/initial

# Clear configuration and route cache
laravel@server:initial$ php artisan config:clear
laravel@server:initial$ php artisan route:clear

# Recache your config and routes
laravel@server:initial$ php artisan config:cache
laravel@server:initial$ php artisan route:cache
```

### Update your Nginx config

Open your site's Nginx config file (`/etc/nginx/sites-available/laravel-project` if you're following along with the guide) and update the `root` directive to use the `active` symlink.

The new `root` directive should look like this:

```nginx
root /srv/www/laravel-project/active/public;
```

Test the syntax of the updated Nginx config, then reload Nginx:

```bash
# Test Nginx config syntax is ok, then reload config
laravel@server$ sudo nginx -t
laravel@server$ sudo systemctl restart nginx.service
```

### Moment of truth

At this point Nginx should have picked up on the updated zero-downtime redeployment directory structure, and your app should again be live when you visit your server's IP address from a web browser.

{{< details summary="Ran into problems?" >}}
At the risk of being super annoying, give this article (including the prerequisites!) a reread and double-check every setting is correct---there are a lot of moving parts here and one misconfiguration will bring your app down.

If you're sure you've exactly followed this article and your app is still down, please [let me know](/contact)---I've done my best to battle-test this guide to make triple-check everything works, but there could still be mistakes, which I would want to fix.
{{< /details >}}

## Automating redeployment

We can now create a script to automate zero-downtime redeployment.
We'll use the same `post-receive` hook [from the server-side Git setup article]({{< relref "git-server" >}}), but will have to modify it to accommodate the zero-downtime directory structure.

Go ahead and open the `post-receive` in your server-side Git repo with a text editor and implement the zero-downtime redeployment workflow.
There are of course multiple interpretations of how to do this; here's what I would suggest:

```bash
#!/bin/sh
# A post-receive Git hook for zero-downtime redeployment of a Laravel app

# Abort if any errors occur on redeployment
set -e

# --------------------------------------------------------------------------- #
# Server and Git-related directories---adjust paths as needed.
# --------------------------------------------------------------------------- #
REPO="/home/laravel/repo/laravel-project.git"
SRV="/srv/www/laravel-project"
SHARED="${SRV}/shared"
ACTIVE="${SRV}/active"
# Releases are named by date and short Git commit SHA in YYYY-MM-DD_SHA format.
# (But feel free to adjust naming if you want.)
RELEASE="${SRV}/releases/`date -u +%Y-%m-%d`_`git --git-dir=${REPO} rev-parse --short HEAD`"
# --------------------------------------------------------------------------- #


# --------------------------------------------------------------------------- #
# Set up zero-downtime redeployment directory structure
# --------------------------------------------------------------------------- #
# Create directory for latest release
mkdir -p ${RELEASE}

# Copy latest app release into new release directory
git --work-tree=${RELEASE} --git-dir=${REPO} checkout --force

# Link shared files into place
ln -s ${SHARED}/.env ${RELEASE}/.env
ln -s ${SHARED}/storage ${RELEASE}/storage
# If your app uses SQLite; remove if not needed
ln -s ${SHARED}/database.sqlite ${RELEASE}/database/sqlite/database.sqlite`
# --------------------------------------------------------------------------- #


# --------------------------------------------------------------------------- #
# Perform the standard Laravel redeployment procedure
# --------------------------------------------------------------------------- #
cd ${RELEASE}
composer install --no-dev --optimize-autoloader
npm install
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
# --------------------------------------------------------------------------- #


# --------------------------------------------------------------------------- #
# Grant web server write privileges on storage and bootstrap/cache directories
# --------------------------------------------------------------------------- #
# Grant group ownership of special directories to www-data
sudo chgrp -R www-data "${RELEASE}/storage"
sudo chgrp -R www-data "${RELEASE}/bootstrap/cache"

# Grant owning group write access for special directories
find "${RELEASE}/storage" -type f -exec sudo chmod 664 {} \;
find "${RELEASE}/storage" -type d -exec sudo chmod 775 {} \;
find "${RELEASE}/bootstrap/cache" -type f -exec sudo chmod 664 {} \;
find "${RELEASE}/bootstrap/cache" -type d -exec sudo chmod 775 {} \;
# --------------------------------------------------------------------------- #


# --------------------------------------------------------------------------- #
# Publish most recent release after Laravel redeployment process completes
# --------------------------------------------------------------------------- #
ln -sfn ${RELEASE} ${ACTIVE}
# --------------------------------------------------------------------------- #
```

Comments: 

- The script is really just a Bash implementation of the zero-downtime redeployment procedure [described earlier in this article](#how-it-works), followed by the standard Laravel redeployment commands and permission tweaks we've issued manually over the past few articles.
  Most of the commands should look familiar from previous articles---I've just collected them in one place here.
- I've chosen to name the releases by the date they are published followed by the SHA of the corresponding Git commit.
  For example, a release with commit SHA `a44fb73` published on 8 August 2023  would be named `2023-08-23_a44fb73`---naming by date allows easy sorting, and adding the commit SHA ensures each release is uniquely named.
  Of course, feel free to change this naming convention if you like.

- The owndership and permissions changes require `sudo`.
  `sudoers`

- The `-f` flag in the final `ln` command is used to force an overwrite of the previous release link.
  The `-n` flag stops `ln` from trying to dereference and follow the previous release symlink; this is important---leave this out and you'll get a symlink *inside* of the existing `active` release, instead of in `/srv/www/laravel-project/` where it should be!

### sudo permissions

Open `sudoers`.

```bash
# Use visudo to safely open the sudoers file for editing
laravel@server$ sudo visudo
```

Inside the `sudoers` file (e.g. at the bottom), place the following lines:

```bash
# Allow laravel user to change owning group of release directories to www-data
laravel ALL=NOPASSWD: /usr/bin/chgrp -R www-data /srv/www/nutria/releases/**/*

# Allow laravel user to change file permissions in release directories
laravel ALL=NOPASSWD: /usr/bin/chmod 664 /srv/www/nutria/releases/**/*
laravel ALL=NOPASSWD: /usr/bin/chmod 775 /srv/www/nutria/releases/**/*
```

[Digital Ocean guide to the sudoers file](https://www.digitalocean.com/community/tutorials/how-to-edit-the-sudoers-file)

### Moment of truth

Time to test if this zero-downtime redeployment setup is working properly.

```bash
# On your dev machine, push your app's main branch to the production server.
you@dev:laravel-project$ git push production main
```

{{< deploy-laravel/navbar >}}
