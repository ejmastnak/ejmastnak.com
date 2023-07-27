---
title: "Configure a Laravel web app environment for production"
prevFilename: "npm"
nextFilename: "maintenance-mode"
date: 2023-07-18
---

# Configure a Laravel environment for production

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article covers the necessary environment configuration for running a Laravel app in production.
We will add some production-specific config settings to your app's `.env` file, generate an encryption key, and run a few optimizations.

## Production environment configuration

Context: most of the configuration of a Laravel app is done in the app's `config` folder ([here are the official docs](https://laravel.com/docs/10.x/configuration)), but there are a few environment-specific settings best suited to the `.env` file.

For our purposes, these are to:

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

# The environment should be set to "production"
APP_ENV=production

# Debug mode should be disabled to avoid exposing sensitive config information.
# See e.g. https://laravel.com/docs/10.x/configuration#debug-mode
APP_DEBUG=false

# Set this to either your server's IP address or domain name, if you have one
APP_URL=1.2.3.4
# APP_URL=foo.com  # if you have a domain name
```

### Establish a database connection

Then establish your app's database connection---I've included settings for SQLite, MySQL, and PostgreSQL:

#### SQLite

```bash
# The database connection should be "sqlite"
DB_CONNECTION=sqlite

# Specify the full path (relative to server's root directory)
DB_DATABASE=/srv/www/laravel-project/path/to/database.sqlite

# You'll probably want to enable the use of foreign keys with SQLite
DB_FOREIGN_KEYS=true
```

#### MySQL

```bash
# The database connection should be "mysql""
DB_CONNECTION=mysql

# This tells Laravel that your database is hosted locally on your server
# (127.0.0.1 is the localhost IP address). Update if your DB is hosted on a
# different machine, in which case you probably know what you're doing.
DB_HOST=127.0.0.1

# This is the standard port number for MySQL
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

# This tells Laravel that your database is hosted locally on your server
# (127.0.0.1 is the localhost IP address). Update if your DB is hosted on a
# different machine, in which case you probably know what you're doing.
DB_HOST=127.0.0.1

# This is the standard port number for PostgreSQL
DB_PORT=5432

# Change to the name of your app's database, created earlier in this guide
DB_DATABASE=foo

# Change to the name of the database user created earlier in this guide
DB_USERNAME=bar

# Change to the database user's password
DB_PASSWORD=baz
```

### There are many other config settings...

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

## Optimizations

Finally, run a few standard optimizations [recommended by Laravel](https://laravel.com/docs/10.x/deployment#optimization) to speed up your app in production:

```bash
laravel@server$ cd /srv/www/laravel-project

# Cache your routes
laravel@server:laravel-project$ php artisan route:cache

# Cache your Laravel configuration settings for efficiency
laravel@server:laravel-project$ php artisan config:cache
```

These two cache commands should be rerun after each (re)deployment.

{{< deploy-laravel/navbar >}}
