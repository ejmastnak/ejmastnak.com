---
title: "Install a LEMP stack for deploying a Laravel web application"
prevFilename: "vps-setup"
nextFilename: "db"
date: 2023-07-17
---

{{< deploy-laravel/navbar >}}

# Install a LEMP stack for deploying a Laravel web application

{{< deploy-laravel/header >}}

This guide is opinionated and uses a LEMP stack.

## Install a LEMP stack

```bash
# At the time of writing on a Debian-based system
sudo apt install nginx php mariadb-server 

# Secure the MySQL install
mysql_secure_installation

# Enable and start web server and DB server if necessary
systemctl status nginx.service
systemctl status mariadb.service
```

## Install PHP extensions

Install [Laravel's list of PHP extensions](https://laravel.com/docs/10.x/deployment#server-requirements)

At the time of writing on Ubuntu 22.10:

```bash
# Specify version (e.g. php8.1-curl) if package manager defaults to different version.
# fpm and mysql are not listed by Laravel but required from my experience!
apt install \
  php-curl \
  php-fpm \
  php-mbstring \
  php-mysql \
  php-xml \
  php-zip

# If using SQLite or PostgreSQL, replace php-mysql with... 
# php-sqlite3
# php-pgsql
```

Here is how to display config files in use:

```bash
# For orientation: display config files currently used by PHP in CLI mode
php --ini

# Show all PHP extensions available from apt (replace 8.1 with your PHP version)
apt list | grep ^php8.1

# Show install PHP extensions 
apt list | grep ^php8.1.*installed
```

Here is a [list of Ubuntu PHP packages](https://packages.ubuntu.com/jammy/php/).

On an Ubuntu 22.10 Digital Ocean droplet at the time of writing, the following extensions are enabled by default according to `php --ini` (and are not listed by `apt list`):

- Ctype PHP Extension
- Fileinfo PHP Extension
- PDO PHP Extension
- Tokenizer PHP Extension

And the following extensions are installed with `apt`:

- cURL PHP Extension `php-curl`
- DOM PHP Extension (comes with `php-xml`)
- Mbstring PHP Extension `php-mbstring`
- XML PHP Extension `php-xml`

Finally, the following PHP extensions are suggested in the Laravel docs, but I didn't find packages for them and didn't run into any errors without them:

- Filter PHP Extension
- Hash PHP Extension
- OpenSSL PHP Extension (do double check you have the `openssl` package installed though; it should ship by default with Ubuntu)
- PCRE PHP Extension
- Session PHP Extension

## Disable and remove Apache {#remove-apache}

Your VPS might be using Apache as the default web server.
You should disable Apache (and optionally uninstall it) if you're using nginx.

```bash
# Stop the apache daemon
systemctl stop apache2.service

# Optionally, remove all apache related packages
apt purge apache2*
apt autoremove
```
