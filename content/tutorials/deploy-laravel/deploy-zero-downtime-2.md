---
title: "Zero-downtime deployment of a Laravel web application"
prevFilename: "deploy-zero-downtime"
nextFilename: "dns"
date: 2023-07-18
---

# Zero-downtime deployment of a Laravel web application, part 2

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This is part 2 of the coverage of zero-downtime redeployment in this series.

- [Part 1]({{< relref "deploy-zero-downtime" >}}) explains zero-downtime redeployment and covers a few one-time manual preparations.
- [Part 2](#) (which you're reading now) shows how to automate the zero-downtime redeployment process using a post-receive Git hook.

## Prerequisite

You should have read, implemented, and understood [Part 1]({{< relref "deploy-zero-downtime-2" >}}).

## Automating redeployment

We're now ready to create a script to automate zero-downtime redeployment.
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
# Set up zero-downtime directory structure
# --------------------------------------------------------------------------- #
# Create directory for latest release
mkdir -p ${RELEASE}

# Copy latest app release into new release directory
git --work-tree=${RELEASE} --git-dir=${REPO} checkout --force

# Link shared env file into place
ln -s ${SHARED}/.env ${RELEASE}/.env

# Replace release's boilerplate storage directory with shared storage directory
rm -rf ${RELEASE}/storage
ln -s ${SHARED}/storage ${RELEASE}/storage

# # If your app uses SQLite, link database into place
# ln -s ${SHARED}/database.sqlite ${RELEASE}/database/sqlite/database.sqlite
# --------------------------------------------------------------------------- #


# --------------------------------------------------------------------------- #
# Perform the standard Laravel redeployment procedure
# --------------------------------------------------------------------------- #
cd ${RELEASE}
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
# --------------------------------------------------------------------------- #


# --------------------------------------------------------------------------- #
# Grant web server write privileges on the release's bootstrap/cache directory
# --------------------------------------------------------------------------- #
# Grant group ownership of your app's files to www-data
sudo chgrp -R www-data "${RELEASE}"

# Grant owning group write access for the release's bootstrap/cache directory
 sudo chmod -R g=rwX "${RELEASE}/bootstrap/cache"
# --------------------------------------------------------------------------- #


# --------------------------------------------------------------------------- #
# Publish most recent release after Laravel redeployment process completes
# --------------------------------------------------------------------------- #
ln -sfn ${RELEASE} ${ACTIVE}
# --------------------------------------------------------------------------- #
```

{{< details summary="A note on other deployment recipes" >}}
The above recipe should work well for most users, but it is certainly not the only possible way to (re)deploy a Laravel app.
You might find other guides online with a slightly different sequence of commands and/or slightly different commands---don't worry, they probably work, too!

Here are a few commands to consider using if your app needs them:

- `php artisan cache:clear` if using an [application cache](https://laravel.com/docs/cache)
- `php artisan queue:restart` if using [queues](https://laravel.com/docs/queues)

(But if you're using these more advanced Laravel features you probably already know what your doing!)

**A note on PHP-FPM**

I've seen some guides online
(e.g. [Loris Leiva's excellent guide to zero-downtime Laravel deployment using Deployer](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/install-and-configure-deployer#reloading-php-fpm))
suggest reloading PHP-FPM (a PHP [FastCGI](https://en.wikipedia.org/wiki/FastCGI) implementation that lets Nginx interface with your Laravel app) after each redeployment.

You could do this by running `sudo systemctl restart php8.1-fpm.service` (of course replacing 8.1 with your version of PHP) at the end of the `post-receive` script, although this requires root privileges and you'd need to add a `sudoers` entry to allow passwordless execution of the command (described below from `chmod` and `chgrp`).

But on the other hand, the official Deployer docs say to [avoid reloading PHP-FPM](https://deployer.org/docs/7.x/avoid-php-fpm-reloading), and that it suffices to use the `$realpath_root` Nginx variable when setting the `SCRIPT_FILENAME` FastCGI parameter in your site's Nginx config, which we did in the [Nginx article]({{< relref "nginx" >}}).
(Although we're not using Deployer, the directory structure used in this article is the same as the one used by Deployer, so Deployer's advice should apply here, too.)

So should you reload PHP-FPM?
I must admit I do not know enough about the PHP and web server ecosystem to make an informed first-principles decision here (if you know more, I'll be very happy if you [let me know](/contact)).
I personally take Deployer's advice and do not reload PHP-FPM, and I have not run into problems.
But this is just anecdata, and you might want to test both options and make a decision for yourself.

{{< /details >}}

Comments: 

- The script is really just a Bash implementation of the zero-downtime redeployment procedure [described in part 1]({{< relref "deploy-zero-downtime" >}}#how-it-works), followed by the standard Laravel redeployment commands and permission tweaks we've issued manually over the past few articles.
  Most of the commands should look familiar from previous articles---they're just collected in one place here.
- I've chosen to name the releases by the date they are published followed by the SHA of the corresponding Git commit.
  For example, a release with commit SHA `a44fb73` published on 8 August 2023  would be named `2023-08-23_a44fb73`---naming by date allows easy sorting, and adding the commit SHA ensures each release is uniquely named.
  Of course, feel free to change this naming convention if you like.
- We're installing Node.js dependencies with `npm ci` instead of `npm install`.
  This is standard best practice in production environments---see e.g. [this Stack Overflow answer](https://stackoverflow.com/questions/52499617/what-is-the-difference-between-npm-install-and-npm-ci) for details.
- The `-f` flag in the final `ln` command is used to force an overwrite of the previous release link.
  The `-n` flag stops `ln` from trying to dereference and follow the previous release symlink; this is important---leave this out and you'll get a symlink *inside* of the existing `active` release, instead of in `/srv/www/laravel-project/` where it should be!
- Note that we need `sudo` for the `chgrp` and `chmod` commands.
  This is a bit inconvenient---normally you use `sudo` by entering your password at an interactive shell prompt, but during automated redeployment from your dev machine you don't have access to a shell prompt on your app's server.

  Not to worry---this is a standard problem with a standard solution---in the next section we'll allow specifically those `chgrp` and `chmod` commands to run with `sudo` privileges without requiring a password.

### Allowing passwordless sudo for `chgrp` and `chmod`

**Problem:** the `post-receive` redeployment script needs `sudo` privileges to run the `chgrp` and `chmod` commands, but during redeployment you don't have access to an interactive prompt from which to enter a `sudo` password.

**Solution:** use the `sudoers` file to allow specifically those `chgrp` and `chmod` commands to run with `sudo` privileges without requiring a password.

{{< details summary="Wait, what is `sudoers`?" >}}
I'm referring to the standard file `/etc/sudoers`, which is used to manage which users have `sudo` privileges and the extent of these privileges.
I'm assuming a bit of familiarity with `sudoers` in this article, but if you've never worked with `sudoers` before, consider taking a detour and reading [this Digital Ocean guide to the sudoers file](https://www.digitalocean.com/community/tutorials/how-to-edit-the-sudoers-file).
{{< /details >}}

Go ahead and open the `sudoers` file for editing.

```bash
# Use visudo to safely open the sudoers file for editing.
# By default this uses the root user's $EDITOR...
laravel@server$ sudo visudo

# ...but you can easily override this with your preferred $EDITOR
laravel@server$ sudo EDITOR=nano visudo
laravel@server$ sudo EDITOR=vim visudo
```

{{< details summary="What is `visudo`?" >}}
A utility for safely editing the `sudoers` file.

In case this is your first time, the established best practice is to *always* edit the `sudoers` file with `visudo` (as opposed to directly using your preferred text editor).
Why?
Making mistakes in `sudoers` can lock you out of your system, and `visudo` lets you edit `sudoers` in a safe way.
See `man visudo` for details.

As an aside:
One inconvenience with `visudo` (because it runs as `root`) is that you'll usually be thrown into the root user's default text editor (as opposed to your preferred `$EDITOR`). You can get around this by manually setting `$EDITOR` before running `visudo`, as I've done above.
{{< /details >}}

Inside the `sudoers` file (e.g. towards the bottom, but anywhere should work), place the following lines:

```bash
# Allow laravel user to change owning group of release directories
laravel ALL=NOPASSWD: /usr/bin/chgrp -R www-data /srv/www/laravel-project/releases/*

# Allow laravel user to change file permissions in release directories
laravel ALL=NOPASSWD: /usr/bin/chmod -R g\=rwX /srv/www/laravel-project/releases/**/*
```

Comments:

- We're targeting the `laravel` user, because the `post-receive` script runs as the `laravel` user (recall that you SSH into your server as the `laravel` user).
- The backslash in `g\=rwX` is intentional---you need to escape the `=` sign---see the "Other special characters and reserved words section" in the excellent `man sudoers` for details.

You can then save and exit the `sudoers` file.
I suggest testing the updated `sudoers` settings: run the whitelisted commands as `sudo` and confirm that you are not prompted for a password.

```bash
# Clear potentially cached sudo password
laravel@server$ sudo -k

# Test that you can run the chgrp and chmod without a password.
# Attention: you need the full paths to match the globs in `sudoers`.
laravel@server$ sudo chgrp -R www-data /srv/www/laravel-project/releases/initial/
laravel@server$ sudo chmod -R g=rwX /srv/www/laravel-project/releases/initial/bootstrap/cache/
```

Still being prompted for a `sudo` password? Something is wrong with either your `sudoers` setup or the commands you entered---double check this section.

### Cleaning up old releases (optional-ish)

**Problem:** you could run out of disk space.
The zero-downtime redeployment workflow described above does not remove old releases, and given that a typical Laravel app with a JavaScript frontend weighs in on the order of 100 MB, you could easily exhaust the disk space on a lightweight server after, say, a year of regular releases (and considerably sooner if you're hosting multiple apps on the same server).

**Solution:** 
I'd suggest adding a few lines to the end of your `post-receive` script to remove old releases after each redeployment, but I suppose you could also use a Systemd service/timer, or just manually SSH into your server every once in a while and manually delete old releases.

Below are two options to give you something to start with---pick one and modify as desired.

**Option 1: Keep only the N newest releases**

```bash
RELEASES="/srv/www/laravel-project/releases"
cd ${RELEASES}

# Remove all but the N most recent releases (update path to rm if needed)
N=10
ls -1t ./ | grep "[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_\w\+" | tail -n +`expr ${N} + 1` | xargs /usr/bin/rm -rf
```

Since it's never easy to read other people's chained Unix commands:

- `ls -1t` sorts the directory contents by last-modified date (`-t`) and prints one entry per line (`-1`).
- `grep` filters out non-release files, relying on releases being named by date and Git commit SHA in `YYYY-MM-DD_SHA` format, with the commit SHA consisting of one or more alphanumeric characters (`\w\+`).
- `tail` filters out the most recent `$N` releases, and pipes all older releases to `xargs`, which passes them onward to `rm` for deletion.

  (To be more precise: ``-n +`expr ${N} + 1` `` &nbsp; prints only releases from `$N + 1` onward, i.e. filtering out the first `$N`)

**Option 2: Keep only releases less than MAX_DAYS days old**

```bash
RELEASES="/srv/www/laravel-project/releases"
cd ${RELEASES}

# Remove all releases older than MAX_DAYS days
MAX_DAYS=30
find ${RELEASES} -maxdepth 1 -mtime +${MAX_DAYS} -type d -regextype grep -regex "\./[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_\w\+" -print | xargs /usr/bin/rm -rf
```

Comments:

- `-maxdepth 1` restricts the `find` command to the `$RELEASES` directory (otherwise `find` would search through `$RELEASES` and then recursively search through all of its subdirectories).
- `-mtime +${MAX_DAYS}` (the `+` is important!) matches files modified more than `$MAX_DAYS` ago.
- `-type d` matches only directories
- `-regex` matches releases, relying on the same `YYYY-MM-DD_SHA` naming convention described above; `-regextype grep` tells `find` the regex uses `grep` format.
- `-print` passes matching releases releases to `xargs`, which passes them onward to `rm` for deletion.

I hope one of these options is helpful---I personally use Option 1 and stick the code at the bottom of `post-receive`, but feel free to modify this as you like.
### Moment of truth

Time to test if this zero-downtime redeployment setup is working properly.

Make a test change to your app on your dev machine (add a new feature, change some text, tweak a color, etc.---anything you'll easily notice), commit the change, then push the new version of your app to the server, just like in the [dev-side Git setup article]({{< relref "git-dev" >}})):

```bash
# On your dev machine, push your app's main branch to the production server.
you@dev:laravel-project$ git push production main
```

Here's what should happen (the first few steps are the same as in the [dev-side Git setup article]({{< relref "git-dev" >}})):

- Git on your dev machine recognizes which SSH key to use to connect to the server, and prompts you for the key's password, if needed.
- Your app is pushed to the server-side Git repo (SSH into the server and check the contents of `/home/laravel/repo/laravel-project.git`).
- Pushing code to the server triggers the server-side `post-receive` hook.
- The `post-receive` script creates a new release directory, into which it copies the latest version of your app.
  The script then runs through each of the deployment steps covered in this article---you should be able to follow along as the script's standard output appears in your SSH session; obviously, you want each deployment step to complete successfully.
- The previous version of your app should continue to be live during the 30-60 seconds that the `post-receive` script is executing.

- Immediately after the `post-receive` script completes, your latest app release should be live, and you should be able to SSH into your server and confirm the latest release directory is present.

{{< details summary="Ran into problems?" >}}
Disclaimer: there are, of course, a million things that could go wrong, and it's best to manually inspect and try to understand any error messages (which are often helpful) and adjust accordingly.

With that said:

- Is your SSH connection failing? Check the troubleshooting section [in the dev-side Git setup article]({{< relref "git-dev" >}}#push).
- The server-side `post-receive` hook is executable, right?
- All paths and usernames are correct (and not still using the generic names from this guide), right?
- Is the `npm run build` command failing? Make sure your Node.js is reasonably up to date and then your server has sufficient RAM (covered in the [Node.js article]({{< relref "nodejs" >}})).
- Check that you've properly performed the manual steps for [setting up zero-downtime redeployment](#preparations) (you've made a `shared` directory, all your symlinks are current, etc.).

Other than that, at the risk of being super annoying, give this article (*including the prerequisites!*) a reread and double-check every setting is correct---there are a lot of moving parts here and one misconfiguration will bring your app down.

And if you're sure you've exactly followed the guide so far and your app is still down, please [let me know](/contact)---I've done my best to battle-test this guide and triple-check that everything works, but there could still be mistakes or unexpected failure modes, which I would want to address.
{{< /details >}}

**Next:** The next article shows how to set up a custom domain name for your web app.

{{< deploy-laravel/navbar >}}
