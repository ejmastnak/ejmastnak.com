---
title: "Install PHP extensions for deploying a Laravel web application"
date: 2023-07-17
prevFilename: "server-setup-once#firewall"
nextFilename: "server-setup-once#db"
---

# Install PHP and extensions for deploying a Laravel web application

{{< deploy-laravel/header2 >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

This article covers the installation of PHP and the PHP extensions needed for Laravel to run.
(Laravel is written in PHP, so you'll need PHP to run a Laravel application.)

## Install PHP

```bash
# Install the latest version of PHP packaged for your Linux distro
root@server$ apt install php
```

(If you know what you're doing and have a good reason do so, you can install a specific version of PHP with e.g. `apt install php8.2` for PHP 8.2.)


## Install PHP extensions

Then install the [list of PHP extensions required by Laravel](https://laravel.com/docs/10.x/deployment#server-requirements).
At the time of writing on a Debian-based system, do this with:

```bash
# Install PHP extensions required by Laravel
root@server$ apt install php-curl php-mbstring php-xml
```

Ensure your PHP version matches the version of your PHP extensions.
You only need to worry about this if you explicitly installed a specific version of PHP (e.g. if you explicitly install `php8.2`, then explicitly install `php8.2-curl`, `php8.2-fpm`, etc.).

You'll also need a PHP extension for your database management system.
This depends on your choice of MySQL/MariaDB, SQLite, or PostgreSQL:

```bash
# If using MySQL/MariaDB
root@server$ apt install php-mysql

# If using SQLite
root@server$ apt install php-sqlite3

# If PostgreSQL
root@server$ apt install php-pgsql
```

And two more extensions—`fpm` is by Nginx to serve your application, and `cli` lets you run PHP from the command line:

```bash
# Two more PHP extensions
root@server$ apt install php-fpm php-cli
```

At this point you can move on to the next article.
But if you're curious here's a bit more on PHP extensions.

### More on Laravel-related PHP extensions

On an Ubuntu 22.10 Digital Ocean droplet at the time of writing...

1. The following extensions are enabled by default according to `php --ini` (i.e. you do not have to explicitly install them, and they are not available as dedicated packages from APT):

   - Ctype PHP Extension
   - Fileinfo PHP Extension
   - PDO PHP Extension
   - Tokenizer PHP Extension
 
1. The following extensions are installed with `apt`:
 
   - cURL PHP Extension `php-curl`
   - Mbstring PHP Extension `php-mbstring`
   - XML PHP Extension `php-xml`
   - DOM PHP Extension (comes with `php-xml`)
   - FPM PHP Extension `php-fpm`
   - MySQL `php-mysql`, PostgreSQL `php-psql`, or SQLite `php-sqlite3` PHP Extensions, depending on your DBMS (not listed in the Laravel docs at the time of writing, but required for PHP to interact with your database)

1. And the following PHP extensions are [suggested in the Laravel docs](https://laravel.com/docs/10.x/deployment#server-requirements), but I didn't find packages for them and didn't run into any errors without them (perhaps I am missing something, please shoot me an email if you know more!):
 
   - Filter PHP Extension
   - Hash PHP Extension
   - OpenSSL PHP Extension (do double check you have the `openssl` package installed though; it should ship by default with Ubuntu)
   - PCRE PHP Extension
   - Session PHP Extension

{{< details summary="Which PHP extensions am I currently using? Which are available?" >}}

Here's how to list all PHP extensions available from APT:

```bash
# Show all PHP extensions available from apt.
# (Replace 8.3 with your PHP version if necessary (check with `php --version`)).
apt list | grep ^php8.3
```

Here's how to list all PHP extensions you have installed:

```bash
# Show install PHP extensions 
apt list | grep ^php8.3.*installed
```

And here is how you can check which extensions are being used by PHP:

```bash
# This technically lists the configuration files used by PHP in command line
# mode, but can be used in practice to see which extensions PHP is loading.
php --ini
```

An example `php --ini` output after a fresh install of PHP on Ubuntu 22.10 looks like this:

```txt
/etc/php/8.3/cli/conf.d/10-pdo.ini,
/etc/php/8.3/cli/conf.d/20-calendar.ini,
/etc/php/8.3/cli/conf.d/20-ctype.ini,
/etc/php/8.3/cli/conf.d/20-exif.ini,
/etc/php/8.3/cli/conf.d/20-ffi.ini,
/etc/php/8.3/cli/conf.d/20-fileinfo.ini,
/etc/php/8.3/cli/conf.d/20-ftp.ini,
/etc/php/8.3/cli/conf.d/20-gettext.ini,
/etc/php/8.3/cli/conf.d/20-iconv.ini,
/etc/php/8.3/cli/conf.d/20-phar.ini,
/etc/php/8.3/cli/conf.d/20-posix.ini,
/etc/php/8.3/cli/conf.d/20-readline.ini,
/etc/php/8.3/cli/conf.d/20-shmop.ini,
/etc/php/8.3/cli/conf.d/20-sockets.ini,
/etc/php/8.3/cli/conf.d/20-sysvmsg.ini,
/etc/php/8.3/cli/conf.d/20-sysvsem.ini,
/etc/php/8.3/cli/conf.d/20-sysvshm.ini,
/etc/php/8.3/cli/conf.d/20-tokenizer.ini
```

How to interpret: the above `php --ini` output tells us that the PDO, Calendar, Ctype, Exif, FFI, Fileinfo, etc. PHP extensions are already installed and being used by PHP.

Caution: there are some subtleties with `php --ini`, for example after installing the XML extension, `php --ini` shows the conf files `20-xmlreader.ini` and `20-xmlwriter.ini` instead of `20-xml.ini`, and the FPM extension does not have an entry at all!

{{< /details >}}

**Next:** The next article covers the installation and basic set-up a database management system.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>
