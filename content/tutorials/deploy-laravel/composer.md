---
title: "Install Composer for deploying a Laravel web application"
prevFilename: "nginx"
nextFilename: "npm"
date: 2023-07-18
---

{{< deploy-laravel/navbar >}}

# Install Composer for deploying a Laravel web application

## Possibly create a swap file

Rumor has it you need about 2 GB of RAM to comfortably install Composer packages.
If your server has less memory, consider creating and activating a swap file:

```bash
dd if=/dev/zero of=/swapfile bs=1M count=1024 status=progress
sudo chmod 0600 /swapfile
mkswap /swapfile
sudo swapon /swapfile
```

Then append the swapfile to `fstab`

```bash
# append to /etc/fstab
/swapfile none swap defaults 0 0
```

## Install Composer
 
Here's a [guide from Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-composer-on-debian-11):

```bash
# Dependencies for installing Composer (you'll probably have many of these
# already installed)
sudo apt install curl php-cli php-mbstring git unzip

# Change into your home directory (not crucial---really you just want to be somewhere where you can keep track of downloaded files)
cd ~

# Download the Composer installer
curl https://getcomposer.org/installer -o composer-setup.php

# Retrieve the latest Composer installer hash
# You'll use this hash to verify the integrity of the Composer installer
HASH=`curl -sS https://composer.github.io/installer.sig`

# Check hash of downloading installer
php -r "if (hash_file('SHA384', 'composer-setup.php') === '$HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"

# Assuming the hash is verified, install Composer globally
sudo php composer-setup.php --install-dir=/usr/local/bin --filename=composer
```

## Install Composer packages

Install Composer packages:

```bash
# Install Composer packages
cd /var/www/landmarks
composer install --optimize-autoloader --no-dev
```

Troubleshooting: double check you've correctly [set Laravel directory ownership and permissions]({{< relref "permissions" >}}).
The owning group should be `www-data`, and the `storage/` and `bootstrap/cache/` directories should have `775` permissions.
