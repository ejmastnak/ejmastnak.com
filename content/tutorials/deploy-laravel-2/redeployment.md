---
title: "Automated zero-downtime redeployment of a Laravel application"
date: 2023-07-18
prevFilename: "deployment"
nextFilename: "about"
---

# Automated zero-downtime redeployment of a Laravel application

{{< deploy-laravel/header2 >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

This article shows how to automate the Laravel redeployment process using a technique called *zero-downtime redeployment*.

*Before beginning, you should have completed the manual deployment covered [in the previous phase of the tutorial]({{< relref "deployment" >}}).*

## Background: zero-downtime redeployment

This tutorial will use a deployment workflow called *zero-downtime redeployment*, and relies on a `post-receive` Git hook in the server-side Git repo to automatically run the deployment steps performed manually in the previous article every time you push new code to your production server. 

If you want to read an explanation of this deployment workflow, open the details/summary elements below.
Feel free to skip if impatient.

{{< details summary="How zero-downtime redeployment works" >}}
A typical redeployment looks something like this:

1. You develop your app on your dev machine.
2. You push code from your dev machine to your app's server-side Git repo, triggering a `post-receive` hook (a shell script that runs when you push code to your server-side repo; see `man githooks` for details).

   The `post-receive` hook runs the redeployment process we performed manually in the previous article.
   Among other things, it:

   1. Creates a dedicated directory in `/srv/www/laravel/releases/` to hold the latest version (or "release") of your app 
   1. Copies your app's code into the new release directory.
   1. Runs the standard Laravel redeployment procedure (Composer and NPM installs, rebuilding your app, caching routes and config, etc.) in the new release directory.
   1. *If* the redeployment completes successfully, publishes the new release by updating the symlink `/srv/www/laravel/active` to point to the latest release.

   (There are few more details we'll fill in later.)

For orientation, after a few redeployments, your server-side directory structure might look something like this...

```bash
/srv/www/laravel/
├── releases/
│   ├── initial/
│   ├── 2023-08-25_aj42lsa2/
│   ├── 2023-09-20_sf4jd9d2/
│   └── 2023-10-01_40mc202a/
├── active/ -> releases/2023-10-01_40mc202a/  # symlink to the active release
└── shared/  # contains `.env`, `storage/`, and other files shared by all releases
```

...where releases are named by date and Git commit hash. You should be familiar with the rest of the directory structure from the previous article.

And why would you want zero-downtime redeployment?

- Redeployment is practically instant---the time needed to update a symlink.
  This is why the workflow is called "zero-downtime" (less sophisticated techniques require you to place your app in maintenance mode for the duration of the redeployment process, causing downtime on each redeployment).
- A failed redeployment won't bring your app down because the `active` symlink will only update on a successful redeployment.
  If a redeployment fails, Nginx simply continues serving the previous version with your users none the wiser.

{{< /details >}}

## Create a `post-receive` hook

Create a `post-receive` hook in your server-side Git repo—this is a shell script that will automatically run whenever you push code to the repo.

```bash
# Change into your Git repo's hooks directory.
# (There will be many sample scripts you can look through for inspiration.)
laravel@server$ cd ~/repo/laravel.git/hooks

# Create the post-receive hook script.
# (This exact name is needed for the hook to run after Git pushes.)
laravel@server$ touch post-receive

# Make the post-receive hook executable
laravel@server$ chmod +x post-receive
```

## Add redeployment code

Open the `post-receive` hook for editing.
Inside, we'll place the deployment steps we performed manually in the previous article for the initial release; these steps will then run whenever you push new code to your server, automating the redeployment process.

The final script should look something like this:

```bash
#!/bin/sh
# A post-receive Git hook for zero-downtime redeployment of a Laravel app

# Abort if any errors occur on redeployment
set -e

# --------------------------------------------------------------------------- #
# Server and Git-related directories---adjust paths as needed.
# --------------------------------------------------------------------------- #
REPO="/home/laravel/repo/laravel.git"
SRV="/srv/www/laravel"
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
ln -sf ${SHARED}/.env ${RELEASE}/.env

# Replace release's boilerplate storage directory with shared storage directory
rm -rf ${RELEASE}/storage
ln -s ${SHARED}/storage ${RELEASE}/storage

# # If your app uses SQLite, create a parent directory and link database into place
# mkdir -p ${RELEASE}/database/sqlite
# ln -sf ${SHARED}/sqlite/database.sqlite ${RELEASE}/database/sqlite/database.sqlite
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

Comments: 

- The script is really just a Bash implementation of the zero-downtime redeployment procedure [from the previous article]({{< relref "deployment" >}}).
  Most of the commands should look familiar from previous article---they're just collected in one place here.
- I've chosen to name the releases by the date they are published followed by the SHA of the corresponding Git commit.
  For example, a release with commit SHA `a44fb73` published on 8 August 2023  would be named `2023-08-23_a44fb73`---naming by date allows easy sorting, and adding the commit SHA ensures each release is uniquely named.
  Of course, feel free to change this naming convention if you like.
- We're installing Node.js dependencies with `npm ci` instead of `npm install`.
  This is standard best practice in production environments---see e.g. [this Stack Overflow answer](https://stackoverflow.com/questions/52499617/what-is-the-difference-between-npm-install-and-npm-ci) for details.
- The `-f` flag in the final `ln` command is used to force an overwrite of the previous release link.
  The `-n` flag stops `ln` from trying to dereference and follow the previous release symlink; this is important---leave this out and you'll get a symlink *inside* of the existing `active` release, instead of in `/srv/www/laravel/` where it should be!
- Uncomment the SQLite-related code if your app uses SQLite.
- Note that we need `sudo` for the `chgrp` and `chmod` commands, but that you should be able to run these two commands as `sudo` without a password if you followed the `sudoers` instructions in the earlier [permissions article]({{< relref "permissions" >}}#sudoers).

## Cleaning up old releases (optional-ish)

**Problem:** you could run out of disk space.
The zero-downtime redeployment workflow described above does not remove old releases, and given that a typical Laravel app with a JavaScript frontend weighs in on the order of 100 MB, you could easily exhaust the disk space on a lightweight server after, say, a year of regular releases (and considerably sooner if you're hosting multiple apps on the same server or redeploy frequently).

**Solution:** 
I'd suggest adding a few lines to the end of your `post-receive` script to remove old releases after each redeployment, but I suppose you could also use a Systemd service/timer, or just manually SSH into your server every once in a while and manually delete old releases.

Below are two options to give you something to start with---pick one and modify as desired.

**Option 1: Keep only the N newest releases**

```bash
RELEASES="/srv/www/laravel/releases"
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
RELEASES="/srv/www/laravel/releases"
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

## Moment of truth

Time to test if this zero-downtime redeployment setup is working properly.

Make a test change to your app on your dev machine (add a new feature, change some text, tweak a color, etc.---anything you'll easily notice), commit the change, then push the new version of your app to the server:

```bash
# On your dev machine, push your app's main branch to the production server.
you@dev:laravel-project$ git push prod main
```

Here's what should happen:

- Git on your dev machine picks up on the SSH Git settings associated with the `dev`-side Git remote (covered at the start of the [previous article]({{< relref "deployment" >}}#ssh)), recognizes which SSH key to use to connect to the server, and prompts you for the key's password, if needed.
- Your app is pushed to the server-side Git repo (SSH into the server and check that `git log` in `/home/laravel/repo/laravel.git` shows your app's latest commit history).
- Pushing code to the server triggers the server-side `post-receive` hook.
- The `post-receive` script creates a new release directory under `/srv/www/laravel/releases/`, into which it copies the latest version of your app.
  The script then runs through each of the deployment steps covered in this and the previous article---you should be able to follow along as the script's standard output appears in your SSH session.
- The previous version of your app should continue to be live during the 30-60 seconds that the `post-receive` script is executing.

- Immediately after the `post-receive` script completes, your latest app release should be live, and you should be able to SSH into your server and confirm the latest release directory is present.

{{< details summary="Ran into problems?" >}}
Disclaimer: there are, of course, a million things that could go wrong, and it's best to manually inspect and try to understand any error messages (which are often helpful) and adjust accordingly.

With that said:

- Is your SSH connection failing?
  Ensure the dev-side Git remote and SSH host settings in your dev-side SSH config match what was covered in the [previous article]({{< relref "deployment" >}}#ssh)).
- The server-side `post-receive` hook is executable, right?
- All paths and usernames are correct (and not still using the generic names from this guide), right?
- Is the `npm run build` command failing? Make sure your Node.js is reasonably up to date and then your server has sufficient RAM (covered in the [Node.js article]({{< relref "nodejs" >}})).
- Check that you've properly performed the manual steps for [setting up zero-downtime redeployment](#preparations) (you've made a `shared` directory, all your symlinks are current, etc.).

Other than that, at the risk of being super annoying, give this article (*including the prerequisites!*) a reread and double-check every setting is correct---there are a lot of moving parts here and one misconfiguration will bring your app down.

And if you're sure you've exactly followed the guide so far and your app is still down, please [let me know](/contact)---I've done my best to battle-test this guide and triple-check that everything works, but there could still be mistakes or unexpected failure modes, which I would want to address.
{{< /details >}}

That wraps up this guide.
Whever you need to deploy a new version of your app, you should be able to just run `git push prod main` from your dev-side Git repo.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>

