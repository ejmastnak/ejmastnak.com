---
title: "Configure a Laravel web app environment for production"
prevFilename: "env"
nextFilename: "permissions"
date: 2023-07-18
---

# Configure a Laravel environment for production

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article covers the necessary environment configuration for running a Laravel app in production.

## Production environment configuration

### Preview

We'll use your app's `.env` file for the following production-specific settings:

- set your app's environment to production,
- disable publicly-visible debug info,
- set the app's name and URL,
- and establish a database connection.

### Create an .env file

You'll probably need to create a fresh `.env` file on the server---I suggest using the `.env.example` file (which should be included by default with a Laravel app) as a starting point.

```bash
# Create a `.env` file in your Laravel project's root directory, using the
# example .env.example file file as a starting point.
laravel@server$ cd /srv/www/laravel-project
laravel@server:laravel-project$ cp .env.example .env
```

Then open the `.env` file, and inside make the following changes.

### Add basic app settings

```bash
# Update to a name of your choice
APP_NAME='My Cool App'

# Leave this as "production"
APP_ENV=production

# Leave this as "false"---debug mode should be disabled to avoid exposing
# sensitive config information.
# See e.g. https://laravel.com/docs/10.x/configuration#debug-mode
APP_DEBUG=false

# Set this to either your server's IP address or domain name, if you have one.
APP_URL=1.2.3.4
# APP_URL=foo.com  # if you have a domain name
```

### Establish a database connection

Then establish your app's database connection---I've included settings for SQLite, MySQL, and PostgreSQL:

#### SQLite

```bash
# The database connection should be "sqlite"
DB_CONNECTION=sqlite

# Specify the full path to your app's SQLite database file
DB_DATABASE=/srv/www/laravel-project/path/to/database.sqlite

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

### Disclaimer: there are many other config settings...

This is just a disclaimer that the settings in this article should work well for most users and are all you need to get a basic Laravel up and running...

...but there are *lots* of other settings (Logging, Redis, email, AWS integration, etc.) you could reasonably tweak from the `.env` file or `config` folder.
These are beyond the scope of this guide (and if you're using these more advanced features you probably know what you're doing); consider poking around your app's `config` folder and reading through [Laravel docs](https://laravel.com/docs/10.x/configuration) as a starting point for learning more.

## Generate an encryption key

You need to generate an encryption key for your production app:

```bash
# Generate an encryption key
laravel@server$ cd /srv/www/laravel-project
laravel@server:laravel-project$ php artisan key:generate
```

(The Laravel project on your *development* machine probably had an encryption key pregenerated when you created the project, but this key won't have been copied to the server, so you have to generate a new key server-side. See e.g. this [StackOverflow answer](https://stackoverflow.com/a/33370272) for details.)

## Migrate and seed your app's database

You'll need to run your database migrations and seed your database for your app to run.

Exactly how you do this will depend on how you've set up your app, but it should usually suffice to use Artisan's `migrate` and `db:seed` commands:

```bash
# Change into your Laravel project's root directory
laravel@server$ cd /srv/www/laravel-project

# Run database migrations
laravel@server:laravel-project$ php artisan migrate

# Seed your database
laravel@server:laravel-project$ php artisan db:seed
```

## Optimizations

Finally, run a few standard optimizations [recommended by Laravel](https://laravel.com/docs/10.x/deployment#optimization) to speed up your app in production:

```bash
laravel@server$ cd /srv/www/laravel-project

# Cache your app's routes
laravel@server:laravel-project$ php artisan route:cache

# Cache your Laravel configuration settings
laravel@server:laravel-project$ php artisan config:cache
```

These two cache commands should be rerun after each (re)deployment---we'll take care of that in a future article.

{{< deploy-laravel/navbar >}}
