---
title: "Simple automated deployment of a Laravel web application"
prevFilename: "deploy"
nextFilename: "dns"
date: 2023-07-18
---

# Simple automated deployment of a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article walks you through a simple script for automatically redeploying your app after every Git push to the server.

{{< details-warning summary="Disclaimer: this method not robust" >}}
This setup is simple and not robust (largely because it reinstalls dependencies and rebuilds your app directly in your app's production directory).
It's meant more as a learning exercise for people using Git hooks for the first time than for use on a real production system.

**My suggestion:** if this is your first time deploying a web app, read through this article, try it out, and then, once you feel ready, move on to [zero-downtime redeployment]({{< relref "deploy-zero-downtime" >}}) once you understand what's going on here.
Experienced users probably want to jump directly to zero-down redeployment.

The main downsides of the simple workflow in this article are:

- Your app is unavailable for the duration of each redeployment (usually about a minute or so of downtime---nothing catastrophic, but unacceptable for serious projects serving many users).
- An unexpected failure during deployment (a failed Composer install, NPM build, database migration, etc.) will bring your app down and requires manual intervention to resolve.
- You cannot easily roll back to previous versions of your app.

A more sophisticated setup would use [zero-downtime redeployment]({{< relref "deploy-zero-downtime" >}}), which solves all of these issues and is covered in a separate article.
{{< /details-warning >}}

## Prerequisites

1. You should have read, implemented, and understood the earlier article on [server-side Git setup]({{< relref "git-server" >}}).
In particular you have a working `post-receive` hook in your server-side Git repo and understand what the hook does, i.e. copy your app to the production directory in `/srv/www/` after every Git push.
2. You should have read, followed, and understood the manual deployment steps covered in the past few articles (in particular the [Composer]({{< relref "composer" >}}), [NPM]({{< relref "npm" >}}), [Laravel environment]({{< relref "env" >}}), and [Laravel directory permissions]({{< relref "permissions" >}}), and [Nginx]({{< relref "nginx" >}})) articles), and your app should be live when you visit your server's IP address from a web browser.

## The redeployment workflow

This redeployment workflow relies on the `post-receive` hook in your server-side Git repo and looks something like this:

1. You develop your app on your dev machine.
2. You push code from your dev machine to your app's server-side Git repo, triggering the `post-receive` hook.
3. The `post-receive` hook first copies your updated app to the production directory in `/srv/ww/` (as in [the server-side Git setup article]({{< relref "git-server" >}})), then runs the standard Laravel (re)deployment recipe, i.e. Composer and NPM installs, rebuilding your app, caching routes and config, etc.

### Create a redeployment script

We'll basically collect all of the deployment commands we've run manually over the past few articles, and add them to the `post-receive` hook in your app's Git repo.

Go ahead and open the `post-receive` in your server-side Git repo with a text editor and add in all of deployment steps used so far.
To save your from going back through all of the past articles, your final `post-receive` hook should look something like this:

```bash
#!/bin/sh

# Server and Git repo directories.
# Update paths as needed.
SRV="/srv/www/laravel-project"
REPO="/home/laravel/repo/laravel-project.git"

# Temporarily disable your app during the redeployment.
# See https://laravel.com/docs/10.x/configuration#maintenance-mode
cd ${SRV}
php artisan down

# Copy app from Git repo to server directory
git --work-tree=${SRV} --git-dir=${REPO} checkout --force

# A standard Composer install for a Laravel production environment.
# See https://laravel.com/docs/10.x/deployment#autoloader-optimization
composer install --no-dev --optimize-autoloader

# Install node packages and build assets.
# You can skip this if your app has no Node.js dependencies.
npm install && npm run build

# Cache Laravel configuration settings, routes, and views for efficiency.
# See https://laravel.com/docs/10.x/deployment#optimizing-configuration-loading,
# https://laravel.com/docs/10.x/deployment#optimizing-route-loading,
# and https://laravel.com/docs/10.x/deployment#optimizing-view-loading
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations.
# The force flag is needed for automated deploys to suppress warning prompt.
php artisan migrate --force

# Leave maintenance mode and reenable your application
php artisan up
```

The only new commands are `php artisan up|down`, used to temporarily disable your app during the redeployment (here's a [link to the Laravel docs](https://laravel.com/docs/configuration#maintenance-mode)).
The other redeployment commands should be familiar from the past few articles.

{{< details summary="A note on other deployment recipes" >}}
The above recipe should work well for most users, but it is certainly not the only possible way to (re)deploy a Laravel app.
You might find other guides online with a slightly different sequence of commands and/or slightly different commands---don't worry, they probably work, too!

It's more important to understand what each command does rather than blindly memorizing exact sequences of Artisan commands.
The [Laravel deployment docs](https://laravel.com/docs/10.x/deployment) are a good place to start.

Here are a few commands to consider using if your app needs them:

- `php artisan cache:clear` if using an [application cache](https://laravel.com/docs/cache)
- `php artisan queue:restart` if using [queues](https://laravel.com/docs/queues)

(But if you're using these more advanced Laravel features you probably already know what your doing!)

You might also want to throw in an `npm audit fix` after installing Node.js dependencies (to try to fix vulnerabilities in Node.js packages), but that depends on your personal preference.
{{< /details >}}

At this the `post-receive` hook should successfully take care of updating and redeploying your app everytime you push a new version to your server-side Git repo.

### Moment of truth

Time to test if this simple redeployment setup is working properly.
Make a test change to your app on your dev machine (add a new feature, change some text, tweak a color, etc.---anything you'll easily notice), commit the change, then push the new version of your app to the server.

```bash
# On your dev machine, push your app's main branch to the production server.
you@dev:laravel-project$ git push production main
```

Here's what should happen (the first few steps are the same as in the [dev-side Git setup article]({{< relref "git-dev" >}})):

- Git on your dev machine recognizes which SSH key to use to connect to the server, and prompts you for the key's password, if needed.
- Your app is pushed to the server-side Git repo (SSH into the server and check the contents of `/home/laravel/repo/laravel-project.git`).
- Pushing code to the server triggered the server-side `post-receive` hook.
- The `post-receive` hook begins executing---it first places your app in maintenance mode (which you can test by visiting your app in a browser during the redeployment process) and then begins running through each of the deployment steps added in this article.
  You should be able to follow along as the script's standard output appears in your SSH session; obviously, you want each deployment step to complete successfully.

- The redeployment should complete within a minute or so, the script should exit maintenance mode, and the latest version of your app should be live.

{{< details summary="Ran into problems?" >}}
Disclaimer: there are, of course, a million things that could go wrong, and it's best to manually inspect and try to understand any error messages (which are often helpful) and adjust accordingly.

With that said:

- Is your SSH connection failing? Check the troubleshooting section [in the dev-side Git setup article]({{< relref "git-dev" >}}#push).
- The server-side `post-receive` hook is executable, right?
- All paths and usernames are correct (and not still using the generic names from this guide), right?
- Is the `npm run build` command failing? Make sure your Node.js is reasonably up to date and then your server has sufficient RAM (covered in the [NPM article]({{< relref "npm" >}})).
{{< /details >}}

{{< deploy-laravel/navbar >}}
