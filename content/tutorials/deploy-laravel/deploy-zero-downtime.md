---
title: "Zero-downtime deployment of a Laravel web application"
prevFilename: "nginx"
nextFilename: "dns"
date: 2023-07-18
---

# Zero-downtime deployment of a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article covers zero-downtime redeployment of a Laravel web application.

{{< details summary="There are two other redeployment options in this guide" >}}
1. [Super simple redeployment]({{< relref "deploy-simple" >}}): simpler but much less robust than zero-downtime redeployment. Meant as a pedagogical exercise for beginners rather than a real-world technique.
1. [Zero-downtime redeployment using Deployer]({{< relref "deploy#deployer" >}}): more powerful than this article, but requires learning and using a third-party tool.
{{< /details >}}

## Prerequisite

You should have read, implemented, and understood the earlier article on [server-side Git setup]({{< relref "git-server" >}}).
In particular you have a working `post-receive` hook in your server-side Git repo and understand what the hook does, i.e. copy your app to the production directory in `/srv/www/` after every Git push.

## The big picture

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

## Preparations for deployment

There are a few manual preparations needed before we can automate the redeployment process.

Just so we're on the same page, I'm assuming your current directory structure looks like this (i.e. how it would look if you're following along with the guide):

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
├── active -> releases/initial/  # symlinked to initial release
└── shared/
    ├── .env
    └── storage/
```

Here's how I'd suggest going about this:

### Create a directory for shared files

First create a dedicated `shared/` directory.
This will store Laravel files that are shared by all versions of your app and are not tracked by Git---your `.env` file, `storage/` directory, and SQLite database (if using SQLite).
Move these files inside.

After this step your directory structure should be something like this:

```bash
/srv/www/laravel-project/
├── shared/
│   ├── .env
│   ├── storage/
│   └── database.sqlite  # if using SQLite
├── app/
├── bootstrap/
├── config/
└── ...
```

### Move your app to the `releases/` directory

Next:

1. Create a `releases/` directory.
1. Create an `initial/` directory inside `releases/` to hold your app's "initial" release.
1. Move your app's files into the intial release directory.

Do this however you like (`mv`, a command-line file manager, etc.);
here is what your directory structure should look like:

```bash
/srv/www/laravel-project/
├── releases/
│   └── initial/
│       ├── app/
│       ├── bootstrap/
│       └── config/
└── shared/
    ├── .env
    └── storage/
```

**TODO:** ownership reset?
I.e. something like `laravel@server:laravel-project$ sudo chown :www-data /releases/initial`.
How about ownership when creating new releases programmatically?
Hey, does `www-data` even need to own `/srv/www/laravel-project/releases/*/` or just the contents thereoff?
Wouldn't you still have to change permissions on `storage` and `bootstrap/cache` after each release?

### Link shared files into place

Link your shared files into place (in the future a redeployment script will do this for you, but you have to do it manually for the initial release).
Here's an example shell session:

**TODO:** figure out relative or absolute paths for symlinking.
https://askubuntu.com/questions/994103/why-does-the-ln-command-need-an-absolute-path

```bash
laravel@server$ cd laravel-project/

laravel@server:laravel-project$ ln -s shared/.env releases/initial/.env
laravel@server:laravel-project$ ln -s shared/storage/ releases/initial/storage/

# If using SQLite
laravel@server:laravel-project$ ln -s shared/database.sqlite releases/initial/database/sqlite/database.sqlite
```

### Create a `active` symlink

Activate your initial release by creating the `active` symlink:

```bash
# Create a symlink activating your initial release
laravel@server:laravel-project$ ln -sf  /srv/www/laravel-project/releases/initial/ /srv/www/laravel-project/active
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
sudo nginx -t
sudo nginx -s reload
```

**TODO:** app should be live at this point, no?

## Automating redeployment

We can now create a script to automate zero-downtime redeployment.

We'll use the same `post-receive` hook [from the server-side Git setup article]({{< relref "git-server" >}}), but will have to modify it to accommodate the zero-downtime directory structure.

Below is the `post-receive` hook I would suggest using.
It's basically an automated version of the manual redeployment steps used over the past few articles.

```bash
#!/bin/sh
# A post-receive Git hook for zero-downtime redeployment of a Laravel app

# Abort if any errors occur on redeployment
set -e

# Server and Git-related directories---adjust paths as needed.
# I've named releases by date and short Git commit SHA in YYYY-MM-DD_SHA format,
# but feel free to adjust naming if desired.
REPO="/home/laravel/repo/laravel-project.git"
SRV="/srv/www/laravel-project"
SHARED="${SRV}/shared"
ACTIVE="${SRV}/active"
RELEASE="${SRV}/releases/`date -u +%Y-%m-%d`_`git --git-dir=${REPO} rev-parse --short HEAD`"

# Create directory for latest release
mkdir ${RELEASE}

# Copy latest code into new release directory
git --work-tree=${RELEASE} --git-dir=${REPO} checkout --force

# Link shared files into place
ln -s ${SHARED}/.env ${RELEASE}/.env
ln -s ${SHARED}/storage ${RELEASE}/storage
# If your app uses SQLite; remove if not needed
ln -s ${SHARED}/database.sqlite ${RELEASE}/database/sqlite/database.sqlite`

# Perform the usual Laravel redeployment workflow
cd ${RELEASE}
composer install --no-dev --optimize-autoloader
npm install
npm run build
php artisan route:cache
php artisan config:cache
php artisan cache:clear
php artisan queue:restart
php artisan migrate --force

# Publish most recent release 
ln -sf ${RELEASE} ${ACTIVE}
```

**TODO:** can we get away with not reloading PHP-FPM?

### Moment of truth

Time to test if this zero-downtime redeployment setup is working properly.

```bash
# On your dev machine, push your app's main branch to the production server.
you@dev:laravel-project$ git push production main
```

{{< deploy-laravel/navbar >}}
