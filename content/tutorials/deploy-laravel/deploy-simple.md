---
title: "Simple automated deployment of a Laravel web application"
prevFilename: "nginx"
nextFilename: "dns"
date: 2023-07-18
---

# Simple automated deployment of a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article walks you through a simple script for automatically redeploying your app after every Git push to the server.

{{< details summary="Disclaimer: this method not robust" >}}
This setup is simple and not robust (it reinstalls dependencies and rebuilds your app directly in your app's production directory).
It's meant more as a pedagogical exercise for people using Git hooks for the first time than for use on a real production system.

The main downsides of this workflow are:

- Your app is unavailable for the duration of each redeployment (usually about a minute or so of downtime---nothing catastrophic, but unacceptable for serious projects serving many users).
- An unexpected failure during deployment (a failed Composer install, NPM build, database migration, etc.) will bring your app down and requires manual intervention to resolve.
- You cannot easily roll back to previous versions of your app.

A more sophisticated setup would use [zero-downtime redeployment]({{< relref "deploy-zero-downtime" >}}), which solves all of these issues.

**My suggestion:** if this is your first time deploying a web app, read through this article, try it out, and then, once you feel ready, move on to [zero-downtime redeployment]({{< relref "deploy-zero-downtime" >}}) once you understand what's going on here.
Experienced users probably want to jump directly to zero-down redeployment.
{{< /details >}}

## Prerequisite

You should have read, implemented, and understood the earlier article on [server-side Git setup]({{< relref "git-server" >}}).
In particular you have a working `post-receive` hook in your server-side Git repo and understand what the hook does, i.e. copy your app to the production directory in `/srv/www/` after every Git push.

## The redeployment workflow

This redeployment workflow relies on the `post-receive` hook in your server-side Git repo and looks something like this:

1. You develop your app on your dev machine.
2. You push code from your dev machine to your app's server-side Git repo, triggering the `post-receive` hook.
3. The `post-receive` hook first copies your updated app to the production directory in `/srv/ww/` (as in [the server-side Git setup article]({{< relref "git-server" >}})), then runs the standard Laravel (re)deployment recipe, i.e. Composer and NPM installs, rebuilding your app, caching routes and config, etc.

We're basically collecting all of the deployment commands we've run manually over the past few articles, and adding them to the `post-receive` hook in your app's Git repo.

### Redeployment script

Your `post-receive` hook should look something like this:

```bash
#!/bin/sh

# Server and Git repo directories
SRV="/srv/www/laravel-project"
REPO="/home/laravel/repo/laravel-project.git"

# Copy app from Git repo to server directory
git --work-tree=${SRV} --git-dir=${REPO} checkout --force

# Perform standard Laravel redeployment procedure
cd ${SRV}

# Temporarily disable your app during the redeployment
# Documentation: https://laravel.com/docs/10.x/configuration#maintenance-mode
php artisan down

# A standard Composer install for a Laravel production environment
composer install --no-dev --optimize-autoloader

# Install node packages and build assets
npm install && npm run build

# Cache Laravel routes and configuration settings for efficiency
php artisan route:cache
php artisan config:cache

# Clear cache and restart and queued jobs
php artisan cache:clear
php artisan queue:restart

# Run database migrations.
# The force flag is needed for automated deploys to suppress warning prompt.
php artisan migrate --force

# Leave maintenance mode and reenable your application
php artisan up
```

Adjust this as needed for your app, but this recipe should work well for most cases.
The various redeployment commands should be familiar from the past few articles;
the only new commands are `php artisan up|down`, used to temporarily disable your app during the redeployment.

{{< deploy-laravel/navbar >}}
