---
title: "Install Composer for deploying a Laravel web application"
prevFilename: "permissions"
nextFilename: "npm"
date: 2023-07-18
---

# Install Composer for deploying a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article shows how to install [Composer](https://getcomposer.org/), the standard package manager for PHP, and how to install the PHP packages required for serving a Laravel application.

You might also like [this guide from Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-composer-on-debian-11) on the same topic.

## Possibly create a swap file

Rumor has it you need about 2 GB of RAM to comfortably install Composer packages.
If your server has less than 2 GB RAM, consider creating and activating a swap file (which lets the server use hard disk space to supplement RAM):

```bash
# Create a 1 GB swap file (adjust as needed to get about 2 GB total swap + RAM)
laravel@server$ sudo dd if=/dev/zero of=/swapfile bs=1M count=1024 status=progress
laravel@server$ sudo chmod 0600 /swapfile
laravel@server$ sudo mkswap /swapfile
laravel@server$ sudo swapon /swapfile
```

To make the swap file permanent, you need to add an entry in the `/etc/fstab` file.
To do this, open `/etc/fstab` and at the bottom (carefully!) place the following line:

```bash
# Place this line at the bottom of /etc/fstab
/swapfile none swap defaults 0 0
```

## Install Composer
 
First install dependencies for installing Composer (you'll probably have many of these already installed):

```bash
# Dependencies for installing Composer 
# (curl downloads Composer, unzip unpackages it, and php-cli is needed to run it)
laravel@server$ sudo apt install curl unzip php-cli 
```

We'll perform the installation with Composer's official installer.
I'm essentially following the [official instructions](https://getcomposer.org/download/); here is what to do:

```bash
# Change into your home directory.
# (Or really just somewhere you can keep track of the downloaded files.)
laravel@server$ cd

# Download the Composer installer and save it to the file `composer-setup.php`
laravel@server$ curl https://getcomposer.org/installer -o composer-setup.php
```

We'll then perform a cryptographic verification of the installer's integrity (to ensure the installer hasn't been corrupted or tampered with):

```bash
# Retrieve the latest Composer installer hash.
# You use this hash to verify the integrity of the Composer installer
laravel@server$ HASH=`curl -sS https://composer.github.io/installer.sig`

# Verify installer's hash before actually installing Composer.
laravel@server$ php -r "if (hash_file('SHA384', 'composer-setup.php') === '${HASH}') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
```

Assuming the installer was verified, you're safe to run the installer:

```bash
# Assuming the hash is verified, install Composer (in `/usr/local/bin` to avoid
# conflicting with packages managed by your package manager)
laravel@server$ sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
```

## Use Composer to install PHP packages

Then change into the directory from which your app is served and use Composer to install your Laravel app's PHP dependencies.

```bash
# Install Composer packages
laravel@server$ cd /srv/www/project
laravel@server$ composer install --optimize-autoloader --no-dev
```

{{< deploy-laravel/navbar >}}
