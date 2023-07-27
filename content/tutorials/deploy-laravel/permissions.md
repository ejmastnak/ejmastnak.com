---
title: "Directory ownership and permissions for deploying a Laravel web application"
prevFilename: "git-dev"
nextFilename: "composer"
date: 2023-07-18
---

# Directory ownership and permissions for deploying a Laravel web app

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article covers a few ownership and permission tweaks that will allow the Nginx web server to properly serve your Laravel web app.

## Laravel app directory

Background: the Nginx web server (which we'll set up in a few articles to serve your app) runs as the `www-data` user under normal operation, so you need to give the `www-data` user access to the directory from which your web app is served.
We'll do this by targetting the `www-data` user's group.

First change the group ownership of the served directory to the `www-data` group:

```bash
# Change group ownership of app directory to www-data
laravel@server$ sudo chown -R :www-data /srv/www/laravel
```

Then give the owning group (i.e. `www-data`) write permissions on two special directories:

```bash
# Give the web group write privileges on the storage and cache directories
# This allows Laravel to write to these directories during normal operation.
laravel@server$ sudo chmod -R 775 /srv/www/laravel/storage
laravel@server$ sudo chmod -R 775 /srv/www/laravel/bootstrap/cache
```

Laravel needs to write to these two directories as part of normal operation, and you'll run into errors if the directories are not writable to the `www-data` user.

## SQLite

(You can ignore this if you're not using SQLite for your database.)

If you are using SQLite, it seems the PDO SQLite driver requires that `database.sqlite` is inside a writable directory (I haven't found this in the Laravel docs, but have confirmed it personally and found a similar issue [on Stack Overflow](https://stackoverflow.com/a/3330616)).

You can solve this by moving the app's SQLite database to a directory writable by the `www-data` group:

```bash
# Change into server-side Laravel app's database directory
laravel@server$ cd /srv/www/laravel/database

# Create an SQLite subdirectory and database
laravel@server$ mkdir sqlite  # the directory name is your choice
laravel@server$ touch sqlite/database.sqlite

# Give group ownership and permisions to www-data
laravel@server$ sudo chown -R :www-data sqlite
laravel@server$ sudo chmod -R 775 sqlite
```

Be sure to update the Laravel `.env` file with the new path to the SQLite database.
The relevant `.env` file setting should look something like this:

```bash
DB_DATABASE=/srv/www/project/database/sqlite/database.sqlite
```

{{< deploy-laravel/navbar >}}
