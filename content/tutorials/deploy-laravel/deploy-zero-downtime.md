---
title: "Zero-downtime deployment of a Laravel web application"
prevFilename: "nginx"
nextFilename: "dns"
date: 2023-07-18
---

# Zero-downtime deployment of a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article walks you through a simple script for automatically redeploying your Laravel app using zero-downtime deployment after every Git push to the server.

{{< details summary="Two other deployment options" >}}
There are two other redeployment options in this guide:

1. [Super simple redeployment]({{< relref "deploy-simple" >}}): simpler and less robust than zero-downtime redeployment. Meant as a pedagogical exercise for beginners rather than a real-world technique.
1. [Zero-downtime redeployment using Deployer]({{< relref "deploy#deployer" >}}): more powerful than this article, but requires learning and using a third-party tool.
{{< /details >}}

## Prerequisite

You have read, implemented, and understood the earlier article on [server-side Git setup]({{< relref "git-server" >}}).
In particular you have a working `post-receive` hook in your server-side Git repo and understand what the hook does, i.e. copy your app to the production directory in `/srv/www/` after every Git push.

## The redeployment workflow

This redeployment workflow uses the `post-receive` hook in your server-side Git repo.
The redeployment workflow is:

1. You develop your app on your dev machine.
2. You push code from your dev machine to your app's server-side Git repo.
3. The `post-receive` hook first copies your updated app to the production directory in `/srv/ww/` (as in [the server-side Git setup article]({{< relref "git-server" >}})), then runs the standard Laravel (re)deployment recipe, i.e. Composer and NPM installs, rebuilding your app, caching routes and config, etc.

The directory structure is new.

Otherwise we're basically collecting all of the deployment commands we've run manually over the past few articles, and adding them to the `post-receive` hook.

## Deployment script

At the bottom of the `post-receive` hook add more code.
This builds on [Git server-side article]({{< relref "git-server" >}}).

```bash
#!/bin/sh

# Abort if any errors occur on redeployment
set -e

REPO="/home/laravel/repo/laravel-project.git"
BASE_DIR="/srv/www/laravel-project"
SHARED="${BASE_DIR}/shared"
CURRENT="${BASE_DIR}/current"

# TODO: _2, _3, etc. as needed
RELEASE="${BASE_DIR}/releases/$(date -u +%Y-%m-%d)_1"

mkdir ${RELEASE}

# Copy latest code into new release directory
git --work-tree=${RELEASE} --git-dir=${REPO} checkout --force

# Link shared files into place
ln -s ${SHARED}/.env ${RELEASE}/.env
ln -s ${SHARED}/storage ${RELEASE}/storage
# If your app uses SQLite; update as needed
ln -s ${SHARED}/database.sqlite ${RELEASE}/database/sqlite/database.sqlite`

# Perform usual Laravel redeployment workflow
cd ${RELEASE}
composer install --no-dev --optimize-autoloader
npm install
npm run build
php artisan route:cache
php artisan config:cache
php artisan cache:clear
php artisan migrate --force

# Publish most recent release 
ln -sf ${RELEASE} ${CURRENT}
```

## Update Nginx config

Open your site's Nginx config file (`/etc/nginx/sites-available/laravel-project` if you're following along) and update the `root` directive to `/srv/www/laravel-project/current/public`.

{{< deploy-laravel/navbar >}}
