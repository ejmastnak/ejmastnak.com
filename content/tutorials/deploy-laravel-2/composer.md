---
title: "Install Composer for deploying a Laravel web application"
date: 2023-07-18
prevFilename: "server-setup-once#db"
nextFilename: "server-setup-once#nodejs"
---

# Install Composer for deploying a Laravel web application

{{< deploy-laravel/header >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

This article shows how to install [Composer](https://getcomposer.org/), the standard package manager for PHP, and how to install the PHP packages required for serving a Laravel application.

You might also like [this guide from Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-composer-on-debian-11) on the same topic.

## Possibly create a swap file {#swap}

You need about 2 GB of RAM to comfortably install Composer packages.
If your server has less than 2 GB RAM, consider creating and activating a swap file to make up for the missing RAM (the swap file lets the server use hard disk space to supplement RAM):

```bash
# Create a 1 GB swap file (adjust as needed to get about 2 GB total swap + RAM)
root@server$ dd if=/dev/zero of=/swapfile bs=1M count=1024 status=progress
root@server$ chmod 0600 /swapfile
root@server$ mkswap /swapfile
root@server$ swapon /swapfile
```

If you want to permanently keep the swap file, you need to add an entry in the `/etc/fstab` file.
To do this, open `/etc/fstab` and at the bottom (carefully!) place the following line:

```bash
# Place this line at the bottom of /etc/fstab
/swapfile none swap defaults 0 0
```

You can then confirm the swap file is active and in use with e.g. `free -h`.

## Install Composer
 
First install dependencies for installing Composer (which you should have installed earlier, but I'm listing them here just in case):

```bash
# Dependencies for installing Composer 
# (curl downloads Composer, unzip unpackages it, and php-cli is needed to run it)
root@server$ apt install curl unzip php-cli 
```

We'll perform the installation with Composer's official installer.
I'm essentially following the [official instructions](https://getcomposer.org/download/); here is what to do:

```bash
# Change into your home directory.
# (Or really just somewhere you can keep track of the downloaded files.)
root@server$ cd

# Download the Composer installer and save it to the file `composer-setup.php`
root@server$ curl https://getcomposer.org/installer -o composer-setup.php
```

We'll then perform a cryptographic verification of the installer's integrity (to ensure the installer hasn't been corrupted or tampered with):

```bash
# Retrieve the latest Composer installer hash.
# You use this hash to verify the integrity of the Composer installer
root@server$ HASH=`curl -sS https://composer.github.io/installer.sig`

# Verify installer's hash before actually installing Composer.
root@server$ php -r "if (hash_file('SHA384', 'composer-setup.php') === '${HASH}') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
```

Assuming the installer was verified, you're safe to run the installer:

```bash
# Assuming the hash is verified, install Composer (in `/usr/local/bin` to avoid
# conflicting with packages managed by your package manager)
root@server$ php composer-setup.php --install-dir=/usr/local/bin --filename=composer
```

The last step installs Composer at `/usr/local/bin/composer`.
You can safely delete the `composer-setup.php` script after completing the installation.

**Next:** The next article shows how to install Node.js and NPM.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>

