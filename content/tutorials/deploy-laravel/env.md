---
title: "Configure production Laravel environment for deploying a Laravel web app"
prevFilename: "npm"
nextFilename: "maintenance-mode"
date: 2023-07-18
---

{{< deploy-laravel/navbar >}}

# Configure production Laravel environment

{{< deploy-laravel/header >}}

On the server, set the following in your Laravel app's `.env` file:

```bash
# Set:
# - APP_NAME to your app's name---this name will appear in the title of
#   browser tabs visiting your website
# - APP_URL to either your server's IP address or domain name if you have set
#   the appropriate DNS records.
APP_NAME='My Cool App'
APP_ENV=production
APP_DEBUG=false
APP_URL=foo.com
```

Database config:

```bash
# SQLite
# Set DB_DATABASE to the full path to your database file
DB_CONNECTION=sqlite
DB_DATABASE=/full/path/to/database.sqlite
DB_FOREIGN_KEYS=true

# For PostgreSQL and MySQL, set:
# - DB_DATABASE to the name of your app's database
# - DB_USERNAME to the name of the database user
# - DB_PASSWORD to the database user's password

# PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=foo
DB_USERNAME=bar
DB_PASSWORD=baz

# MySQL
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=foo
DB_USERNAME=bar
DB_PASSWORD=baz
```

Generate an encryption key for the Laravel app:

```bash
# Generate an encryption key
cd /var/www/laravel
php artisan key:generate
```

Run a few optimizations recommended by Laravel:

```bash
cd /var/www/laravel

# Cache your Laravel configuration settings for efficiency
php artisan config:cache

# Cache your routes
php artisan route:cache
```

These two cache commands should be rerun after each (re)deployment.
