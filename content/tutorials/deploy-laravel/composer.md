---
title: "Install Composer for deploying a Laravel web application"
prevFilename: "git-dev"
nextFilename: "npm"
date: 2023-07-18
---

# Install Composer for deploying a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article shows how to install [Composer](https://getcomposer.org/), the standard package manager for PHP, and how to install the PHP packages required for serving a Laravel application.

You might also like [this guide from Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-composer-on-debian-11) on the same topic.

## Possibly create a swap file {#swap}

Rumor has it you need about 2 GB of RAM to comfortably install Composer packages.
If your server has less than 2 GB RAM, consider creating and activating a swap file (which lets the server use hard disk space to supplement RAM):

```bash
# Create a 1 GB swap file (adjust as needed to get about 2 GB total swap + RAM)
laravel@server$ sudo dd if=/dev/zero of=/swapfile bs=1M count=1024 status=progress
laravel@server$ sudo chmod 0600 /swapfile
laravel@server$ sudo mkswap /swapfile
laravel@server$ sudo swapon /swapfile
```

If you want to permanently keep the swap file, you need to add an entry in the `/etc/fstab` file.
To do this, open `/etc/fstab` and at the bottom (carefully!) place the following line:

```bash
# Place this line at the bottom of /etc/fstab
/swapfile none swap defaults 0 0
```

If you won't need the swap file after installing Composer, you can disable the swap file with `swapoff` (after installing Composer!), remove any relevant entries from `/etc/fstab`, and delete the swap file.

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

The last step installs Composer at `/usr/local/bin/composer`.
You can safely delete the `composer-setup.php` script after completing the installation.

## Use Composer to install PHP packages

Then change into the directory from which your app is served and use Composer to install your Laravel app's PHP dependencies.

```bash
# Install Composer packages
laravel@server$ cd /srv/www/laravel-project
laravel@server$ composer install --optimize-autoloader --no-dev
```

This command looks in your Laravel project's `composer.json` file and installs the project's PHP dependencies into a `vendor` directory in your project's root.
The options are [recommended by Laravel](https://laravel.com/docs/10.x/deployment#autoloader-optimization); `--optimize-autoloader` speeds up autoloading and `--no-dev` ignores development dependencies that won't be needed in production.

(Note that `optimize-autoloader` is probably turned on by default in the `config` section of your `composer.json` file, but it can't hurt to specify it explicitly.)

{{< deploy-laravel/navbar >}}
