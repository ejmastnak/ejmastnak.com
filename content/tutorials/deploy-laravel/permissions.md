---
title: "Directory ownership and permissions for deploying a Laravel web application"
prevFilename: "env"
nextFilename: "nginx"
date: 2023-07-18
---

# Directory ownership and permissions for deploying a Laravel web app

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article covers a few ownership and permission settings that will allow the Nginx web server to properly serve your Laravel web app.
(Some familiarity with Unix permissions, users, and groups is helpful here; I've done my best to explain the big picture for everyone interested.)

## The big picture

*Feel free to [skip to the next section](#permissions), but reading the rest of this section might help you understand the reason for the ownership and permission tweaks in this article and later in the series.*

**The requirement:** For Laravel to run, your app's `storage/` and `bootstrap/cache/` directories must be writable by the web server that serves your app.

**Why this requirement?**
Laravel regularly records session information, writes logs, caches data, and stores uploaded user files.
All of these operations require writing to the file system, so Laravel needs write permissions on the directories in which it stores files as part of normal operation.
There are two special directories requiring write permissions[^1]:

1. `storage/`
2. `bootstrap/cache/`

[^1]: You can see the `storage/` and `bootstrap/cache/` directories mentioned in [old Laravel documentation](https://laravel.com/docs/5.3#configuration) (scroll to the "Directory Permissions" section), but for whatever reason I cannot find a reference to this in the current Laravel docs, although the requirement certainly still exists!.

**The solution:** simple---grant the web server running your Laravel app permissions to write files in your app's `storage/` and `bootstrap/cache/` directories.
In this guide we'll use Nginx to serve your app (this is covered in the next article), so you need to grant Nginx write permissions on the `storage/` and `bootstrap/cache/` directories.

In terms understood by your operating system (i.e. users and processes), what we really need to do is grant write permissions to the operating system *user* as which the Nginx *process* runs.
By default, Nginx runs as a user called `www-data`, so throughout this guide you'll see me granting `www-data` write permissions on your app's `storage/` and `bootstrap/cache/` directories.

**Here's how we'll perform the permission grants:**

- Keep the `laravel` user as the *owning user* of your app's files (this way you can still SSH into your server and manually manage your web app as the `laravel` user when needed)
- Make the `www-data` group the *owning group* of your app's files.
  Grant the owning group write permissions on your app's `storage/` and `bootstrap/cache/` directories.
  This way all users in the `www-data` group (i.e. the `www-data` user) have write permissions on these directories.

Okay, on to implementation!

## Grant Nginx write permissions on `storage/` and `bootstrap/cache`  {#permissions}

If you skipped the theory above: the Nginx user, `www-data`, needs write permissions on your app's `storage/` and `bootstrap/cache` directories, which we'll grant by targeting the `www-data` group. 

First change the group ownership of your app's files to the `www-data` group:

```bash
# Make www-data the owning group of your app's files
laravel@server$ sudo chgrp -R www-data /srv/www/laravel-project
```

Then give the owning group (i.e. `www-data`) write permissions on your app's `storage/` and `bootstrap/cache/` directories and the files.

```bash
# Grant the owning group write permissions on storage/ and bootstrap/cache/
laravel@server$ cd /srv/www/laravel-project/
laravel@server:laravel-project$ sudo chmod -R g=rwX storage/
laravel@server:laravel-project$ sudo chmod -R g=rwX bootstrap/cache/
```

I'm using `chmod`'s `g` mode to modify only group permissions,
using `r` and `w` to set read and write permissions, respectively, and using `chmod`'s special `X` mode to only set execute permissions for files that are already executable (in practice, this keeps directories executable, as they should be, but avoids unnecessarily making all regular files executable---recall that the permissions of regular files and directories are interpreted differently).

{{< details summary="Other ways you could set permissions..." >}}
This is just a short comparison of other techniques you'll find online.

You'll often see people do something like this:

```bash
# A more crude way to do this---it makes all regular files executable!
sudo chmod -R 775 storage/
sudo chmod -R 775 bootstrap/cache/
```

This gets the job done just fine, but it's bit more coarse than using `g=rwX`.
Using `chmod -R 775` makes *all* files (both directories and regular files) executable, even if they were originally non-executable regular files (`775` is equivalent to `ug=rwx, o=rx`).
You end up with a bunch of unnecessarily executable regular files.

Another technique you'll see (e.g. as in [this Stack Overflow answer](https://superuser.com/a/1325223)) looks something like this:

```bash
# Grant group read, write, and execute permissions on directories files...
find storage/ -type d -exec sudo chmod 775 {} \;
find bootstrap/cache/ -type d -exec sudo chmod 775 {} \;

# ...and read and write permissions on regular files...
find storage/ -type f -exec sudo chmod 664 {} \;
find bootstrap/cache/ -type f -exec sudo chmod 664 {} \;
```

This technique uses the `find` command to set different permissions for regular files (`-type f`) and directories `-type d`, and avoids unnecessarily making regular files executable by applying a blanket `775` to all files.

Using `find` also works perfectly well---it's just a bit harder to read and requires two passes per directory instead of just one with `chmod -R`.
{{< /details >}}

## If you're using SQLite...

*You can [skip to the next article]({{< relref "nginx" >}}) if you're not using SQLite for your database.*

The PHP SQLite driver requires that your `database.sqlite` file is inside a directory that is writable by your web server.
(I haven't found this in the Laravel docs, but have confirmed it personally; see [Stack Overflow](https://stackoverflow.com/a/3330616) for details.)

In other words, your database directory structure should look something like this:

```bash
/srv/www/laravel-project/
├── ...
├── database/
│   ├── factories/
│   ├── migrations/
│   ├── seeders/
│   └── sqlite/              # writable by www-data
│       └── database.sqlite  # writable by www-data
└─ ...
```

You can satisfy requirement this by moving your app's SQLite database file to a directory writable by the `www-data` group:

```bash
# Change into server-side Laravel app's database directory
laravel@server$ cd /srv/www/laravel-project/database

# Create a dedicated subdirectory for your SQLite database file
laravel@server:database$ mkdir sqlite  # the directory name is your choice

# Move your existing SQLite database to the dedicated sqlite directory...
laravel@server:database$ mv database.sqlite sqlite/database.sqlite
# ... or create a fresh SQLite database file if you haven't yet.
laravel@server:database$ touch sqlite/database.sqlite

# Grant www-data write permissions on your SQLite database directory
laravel@server$ sudo chgrp -R www-data sqlite
laravel@server$ sudo chmod 775 sqlite/
laravel@server$ sudo chmod 664 sqlite/database.sqlite
```

Be sure to update the Laravel `.env` file with the new path to the SQLite database.
The relevant `.env` file setting should look something like this:

```bash
DB_DATABASE=/srv/www/laravel-project/database/sqlite/database.sqlite
```

{{< deploy-laravel/navbar >}}
