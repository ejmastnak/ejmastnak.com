---
title: "Create a production .env file for a Laravel application"
prevFilename: "server-setup-app#db"
nextFilename: "server-setup-app#permissions"
date: 2023-07-18
---

# Create a production .env file for a Laravel application

{{< deploy-laravel/header >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

This article walks you through creating a `.env` file for running a Laravel app in production.
We'll do the following:

- set your app's environment to production,
- disable publicly-visible debug info,
- set the app's name and URL, and
- establish a database connection.

## Create an .env file

Create a new `.env` file at `/srv/www/laravel/shared/.env` (the same `.env` file will be shared between releases, so we'll place it in `shared/`).

Then open the `.env` file, and inside make the following changes.

### Add basic app settings

```bash
# Leave blank for now; you'll fill it in later using `php artisan key:generate`
APP_KEY=

# Update to a name of your choice
APP_NAME="My Cool App"

# Leave this as "production"
APP_ENV=production

# Leave this as "false"---debug mode should be disabled to avoid exposing
# sensitive config information.
# See e.g. https://laravel.com/docs/configuration#debug-mode
APP_DEBUG=false

# Set this to your server's IP address (or domain name, if
# you have one set up already).
APP_URL=http://1.2.3.4
```

### Establish a database connection

Then establish your app's database connection---I've included settings for SQLite, MySQL, and PostgreSQL:

#### SQLite

```bash
# The database connection should be "sqlite"
DB_CONNECTION=sqlite

# The full path to your app's SQLite database file;
# this location is explained later in this tutorial.
DB_DATABASE=/srv/www/laravel/shared/sqlite/database.sqlite

# You'll probably want to enable the use of foreign keys with SQLite
DB_FOREIGN_KEYS=true
```

#### MySQL

```bash
# The database connection should be "mysql"
DB_CONNECTION=mysql

# Leave this as 127.0.0.1---the IP address of localhost.
# This tells Laravel that your database is hosted locally on your server.
# Update only if your DB is hosted on a different machine, in which case you
# probably know what you're doing.
DB_HOST=127.0.0.1

# Leave this as 3306---the standard port number for MySQL
DB_PORT=3306

# Change to the name of your app's database, created earlier in this guide
DB_DATABASE=foo

# Change to the name of the database user created earlier in this guide
DB_USERNAME=bar

# Change to the database user's password
DB_PASSWORD=baz
```

#### PostgreSQL

```bash
# The database connection should be "pgsql""
DB_CONNECTION=pgsql

# Leave this as 127.0.0.1---the IP address of localhost.
# This tells Laravel that your database is hosted locally on your server.
# Update only if your DB is hosted on a different machine, in which case you
# probably know what you're doing.
DB_HOST=127.0.0.1

# Leave this as 5432---the standard port number for PostgreSQL
DB_PORT=5432

# Change to the name of your app's database, created earlier in this guide
DB_DATABASE=foo

# Change to the name of the database user created earlier in this guide
DB_USERNAME=bar

# Change to the database user's password
DB_PASSWORD=baz
```

### Disclaimer: there are many other environment settings...

The settings in this article should work well for most users and are all you need to get a basic Laravel app up and running...

...but there are *lots* of other settings (logging, Redis, email, AWS integration, etc.) you could reasonably tweak from the `.env` file or `config` folder.
These are beyond the scope of this guide (and if you're using these more advanced features you probably know what you're doing anyway); consider poking around your app's `config` folder and reading through [Laravel docs](https://laravel.com/docs/10.x/configuration) as a starting point for learning more.

**Next:** The next article covers setting up your app's database.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>

