---
title: "Set Laravel directory permissions for deploying a Laravel web application"
prevFilename: "git-dev"
nextFilename: "nginx"
date: 2023-07-18
---

{{< deploy-laravel/navbar >}}

# Directory ownership and permissions for deploying a Laravel web app

{{< deploy-laravel/header >}}

Background: the Nginx web server runs as the `www-data` user under normal operation, so you need to give the `www-data` user access to the directory from which your web app is served.

## Laravel app directory

```bash
# Change group ownership of app directory to www-data
sudo chown -R :www-data /var/www/laravel

# Give the web group write privileges on the storage and cache directories
# This, for example, lets Laravel write logs to storage/logs
sudo chmod -R 775 /var/www/laravel/storage
sudo chmod -R 775 /var/www/laravel/bootstrap/cache
```

**TODO:** what is the "web" group? This is separate from `www-data`?
What user/group does the process writing logs to `storage/logs` run as?
Hmm, I have a feeling that "web" should really be "www-data".
Then it makes sense using 775 to give owning group full permissions on directory.

## SQLite

If you are using SQLite, it seems the PDO SQLite driver requires that `database.sqlite` is inside a writable directory (see e.g. https://stackoverflow.com/a/3330616).

You can solve this by moving the app's SQLite database to a directory writable by the `www-data` group.
(Be sure to set path to database in the Laravel `.env` file accordingly.)

```bash
# Create an SQLite database in a directory writable by the www-data group
cd /var/www/laravel
mkdir database/sqlite
touch database/sqlite/database.sqlite
sudo chown -R :www-data database/sqlite
sudo chmod -R 775 database/sqlite
```
