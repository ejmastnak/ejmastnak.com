---
title: "Directory ownership and permissions for deploying a Laravel web application"
prevFilename: "server-setup-app#env"
nextFilename: "server-setup-app#nginx"
date: 2023-07-18
---

# Directory ownership and permissions for deploying a Laravel web app

{{< deploy-laravel/header >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

This article covers a few ownership and permission settings that will allow the Nginx web server to properly serve your Laravel web app.
(Some familiarity with Unix permissions, users, and groups is helpful here; I've done my best to explain the big picture for everyone interested.)

```bash
# Update ownership and group ownership
laravel@server$ sudo chown -R laravel:www-data /srv/www/laravel

# Grant write permissions on special directories
laravel@server$ sudo chmod -R g=rwX /srv/www/laravel/shared/storage
laravel@server$ sudo chmod -R g=rwX /srv/www/laravel/shared/sqlite

# Restrict access to env file
laravel@server$ sudo chmod 640 /srv/www/laravel/shared/.env
```

Here we have:

- Made the `laravel` user the owner of all app files and the Nginx user `www-data` the group owner of all app files.
- Given the owning group (i.e. Nginx) write permissions on `shared/storage` and `shared/sqlite`.
  I'm using `chmod`'s `g` mode to modify only group permissions,
  using `r` and `w` to set read and write permissions, respectively, and using `chmod`'s special `X` mode to only set execute permissions for files that are already executable (in practice, this keeps directories executable, as they should be, but avoids unnecessarily making all regular files executable---recall that the permissions of regular files and directories are interpreted differently).
- Restricted access to your app's `.env` file, which has sensitive information.

You can read more about the motivation for these commands in the details/summary element below, if desired.

{{< details summary="The theory behind these changes: skip or read depending on your patience and background knowledge." >}}
**The requirement:** For Laravel to run, your app's `storage/` and `bootstrap/cache/` directories, and the directory holding your app's SQLite database file (if you're using SQLite), must be writable by the web server that serves your app.

**Why this requirement?**
Laravel regularly records session information, writes logs, caches data, and stores uploaded user files.
All of these operations require writing to the file system, so Laravel needs write permissions on the directories in which it stores files as part of normal operation.
There are two special directories requiring write permissions[^1]:

1. `storage/`
2. `bootstrap/cache/`

[^1]: You can see the `storage/` and `bootstrap/cache/` directories mentioned in [old Laravel documentation](https://laravel.com/docs/5.3#configuration) (scroll to the "Directory Permissions" section), but for whatever reason I cannot find a reference to this in the current Laravel docs, although the requirement certainly still exists!

Additionally, the PHP SQLite driver requires that your `database.sqlite` file is inside a directory that is writable by your web server.
(I haven't found this in the Laravel docs, but it's straightforward to confirm; see [Stack Overflow](https://stackoverflow.com/a/3330616) for details.)

**The solution:** simple---grant the web server running your Laravel app permissions to write files in your app's `storage/` and `bootstrap/cache/` directories.
In this guide we'll use Nginx to serve your app (this is covered in the next article), so you need to grant Nginx write permissions on the `storage/` and `bootstrap/cache/` directories.

In terms understood by your operating system (i.e. users and processes), what we really need to do is grant write permissions to the operating system *user* as which the Nginx *process* runs.
By default, Nginx runs as a user called `www-data`, so throughout this guide you'll see me granting `www-data` write permissions on your app's `storage/` and `bootstrap/cache/` directories.

**Here's how we'll perform the permission grants:**

- Keep the `laravel` user as the *owning user* of your app's files (this way you can still SSH into your server and manually manage your web app as the `laravel` user when needed)
- Make the `www-data` group the *owning group* of your app's files.
  Grant the owning group write permissions on your app's `storage/` and `bootstrap/cache/` directories (and the SQLite database's parent directory, if relevant).
  This way all users in the `www-data` group (i.e. the `www-data` user) have write permissions on these directories.

(Yes, I know we haven't handled `bootstrap/cache` in the above commands; we'll do this when covering deployment in a future article.)
{{< /details >}}

## Allowing passwordless sudo for `chgrp` and `chmod` {#sudoers}

This is skipping ahead a bit, but since we're already on the subject of permissions...

**Problem:** you'll need to update ownership and permissions every time you redeploy your Laravel app.
The `chgrp` and `chmod` commands you use to do this require `sudo` privileges, but during automated redeployment you don't have access to an interactive prompt from which to enter a `sudo` password.

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
laravel ALL=NOPASSWD: /usr/bin/chgrp -R www-data /srv/www/laravel/releases/*

# Allow laravel user to change file permissions in release directories
laravel ALL=NOPASSWD: /usr/bin/chmod -R g\=rwX /srv/www/laravel/releases/**/*
```

Comments:

- We're targeting the `laravel` user, because the `post-receive` script runs as the `laravel` user (recall that you SSH into your server as the `laravel` user).
- The backslash in `g\=rwX` is intentional---you need to escape the `=` sign---see the "Other special characters and reserved words section" in the excellent `man sudoers` for details.

You can then save and exit the `sudoers` file.

**Next:** The next article shows how to configure Nginx for serving a Laravel web app.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>
