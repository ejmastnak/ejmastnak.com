---
title: "Server set-up to host a Laravel web application"
date: 2023-07-18
prevFilename: "about"
nextFilename: "server-setup-app"
---

# One-time server set-up for hosting a Laravel web application

{{< deploy-laravel/header >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

This article covers general steps needed to prepare your machine for hosting a Laravel application.
These steps only need to be taken once per server, no matter how many Laravel apps you end up hosting on the server.

## Before starting...

You'll need root access to a Linux server on which you will host your Laravel app.
I use Digital Ocean droplets to serve my Laravel apps; use whatever VPS/cloud provider you like.

## Update package lists and upgrade software

SSH or otherwise connect to your server as a user with root access.

I suggest first updating your package lists and upgrading your system packages:

```bash
# Update package lists and upgrade packages
root@server$ apt update
root@server$ apt upgrade
```

This is to ensure you're starting off with up-to-date software.

## Install basic infrastructure

This installs Git, OpenSSL, Curl, and UnZip, some or all of which you might already have installed:

```bash
# A few foundational packages we'll need later in the tutorial.
# You might have all of these installed arleady.
root@server$ apt install git-all openssl curl unzip
```

## Set up a firewall {#firewall}

Every Internet-facing server should have a firewall configured---yours is no exception.

{{< details summary="What is a firewall?" >}}
For our purposes, a firewall is a program running on your server that filters incoming and outgoing Internet traffic, usually to secure your server (there are other uses, too) from malicious traffic.
Setting up a firewall is a basic part of server administration.

We will use a firewall to improve your server's security by restricting the Internet connections that can reach your server to a few well-known services (SSH, HTTP and HTTPS via the Nginx web server) and dropping all other incoming Internet traffic.
The idea is to restrict the (all-too-often malicious) traffic that can reach your server from the public Internet.

A thorough discussion of firewalls falls beyond the scope of this article; you should first be familiar with the [TCP/IP stack](https://en.wikipedia.org/wiki/Internet_protocol_suite), then read [Wikipedia's article on firewalls](https://en.wikipedia.org/wiki/Firewall_(computing)).
You might also benefit from Digital Ocean's [guide to setting up a firewall on an Ubuntu machine](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-22-04), which covers similar material to this article.
{{< /details >}}

We'll use [UFW](https://en.wikipedia.org/wiki/Uncomplicated_Firewall) to manage firewalls.
You'll likely have UFW preinstalled on a new server, but can always install it with `apt install ufw`.

I'd suggest first resetting your UFW configuration to a clean slate, so that we're all starting with the same configuration:

```bash
# Reset UFW to clean slate: deny all incoming and allow all outgoing traffic
root@server$ ufw default deny incoming
root@server$ ufw default allow outgoing
```

I would suggest the following for a basic web application:

```bash
# Allow OpenSSH and Web traffic
root@server$ ufw allow 22    # OpenSSH
root@server$ ufw allow 80    # HTTP
root@server$ ufw allow 443   # HTTPS
```

{{< details-danger summary="Possible footgun: locking yourself out of your server." >}}
If you run `ufw default deny incoming` and don't subsequently allow any incoming services, you'll lock yourself out of your server.
Make sure you leave yourself at least one way to reach your server (e.g. allowing incoming OpenSSH traffic over port 22).
{{< /details-danger >}}

Finally, enable the firewall:

```bash
# Enable firewall
root@server$ ufw enable

# If you're interested, check firewall status
root@server$ ufw status
```

{{< details summary="PSA: Digital Ocean firewalls are different from UFW firewalls" >}}
I imagine many readers will be using Digital Ocean, so I wanted to mention this (because it also confused me when I was starting out!).

Digital Ocean provides a free service called [Cloud Firewalls](https://docs.digitalocean.com/products/networking/firewalls/) that you can easily apply to any Digital Ocean droplet (you do this from the "Networking" section of the admin panel on Digital Ocean's website; here is a [quickstart guide](https://docs.digitalocean.com/products/networking/firewalls/quickstart/) and here are [full docs](https://docs.digitalocean.com/products/networking/firewalls/)).

Digital Ocean's Cloud Firewalls are *separate* from `ufw` firewalls (Cloud Firewalls are more Internet-facing, i.e. incoming IP packets first hit the Digital Ocean firewall, then the `ufw` firewall.)
I'd suggest setting up both on a new droplet.
{{< /details >}}

## Install PHP and extensions

Covered in a [dedicated article on installing PHP]({{< relref "php" >}}).

## Install a database management system {#db}

I've included sections on three common DBMs---use whichever you prefer out of:

1. [MySQL (MariaDB)](#mysql)
1. [PostgreSQL](#psql)
1. [SQLite](#sqlite)

### MySQL {#mysql}

Install MySQL. (Technically we're installing MariaDB, which is a drop-in, open source replacement for MySQL. The two are interchangeable for our purposes).

```bash
# Install MariaDB (MariaDB is an open source, drop-in MySQL replacement).
# It might be preinstalled on your server, but it can't hurt to reinstall.
root@server$ apt install mariadb-server 
```

Then enable and start the MySQL server:

```bash
# Enable and start the MySQL server
root@server$ systemctl enable --now mariadb.service
```

### PostgreSQL {#psql}

First install PostgreSQL:

```bash
# Install PostgreSQL
root@server$ apt install postgresql
```

Then enable and start the PostgreSQL server:

```bash
# Enable and start the PostgreSQL server
root@server$ systemctl enable --now postgresql.service
```

### SQLite {#sqlite}

Simply install SQLite:

```bash
# Install SQLite
root@server$ apt install sqlite3
```

Since SQLite doesn't use a database server, you don't need to start the server service.

## Install Composer

Covered in a [dedicated article on installing Composer]({{< relref "composer" >}}).

## Install Node.js and NPM {#nodejs}

*(You can skip this step if your Laravel app has no JavaScript dependencies.)*

Node.js is a JavaScript runtime environment and NPM is the standard package manager for the Node.js.
We'll use NPM later on to install your application's Node.js dependencies.

In principle, you can install Node.js and NPM with:

```bash
# Install Node.js and NPM
root@server$ apt install nodejs npm
```

In practice, you might have problems with outdated Node.js versions—read the warning below.

{{< details-danger summary="Warning: problems with outdated Node.js on Ubuntu LTS and Debian stable" >}}
The version of Node.js shipped with Ubuntu LTS and stable Debian (which I imagine many readers are using) tends to be quite outdated.
This could cause problems later down the road when running `npm install` if your app requires a recent version of Node---in this case NPM will warn you that your Node.js is outdated.

You can solve this by first uninstalling your outdated version of Node.js (e.g. using `apt purge nodejs && apt autoremove`), then following the [instructions for installing an up-to-date version of Node.js](https://github.com/nodesource/distributions#installation-instructions) on the Nodesource GitHub page (follow the installation instructions for your distro).

**My suggestion:** At the time of writing, I recommend installing Node version 20 or later—if the version that ships with you package manager (check with `node --version`) is much below this, I suggest installing an up-to-date version manually using the above-linked instructions.
{{< /details-danger >}}

## Install Nginx

We'll use Nginx to server your web app.

Your server might be using Apache as the default web server instead.
If so, you should disable Apache to avoid conflicts with Nginx.

```bash
# Stop and disable Apache
root@server$ systemctl stop apache2.service
root@server$ systemctl disable apache2.service
```

You might also want to uninstall Apache entirely, since you probably won't need it going forward now that you are using Nginx:

```bash
# Remove all Apache-related packages
root@server$ apt purge apache2*
root@server$ apt autoremove
```

You can then install and start Nginx:

```bash
# Install, enable, and start Nginx
root@server$ apt install nginx
root@server$ systemctl enable --now nginx.service
```

You can then test that Nginx is up and running by pasting your app's IP address into a web browser's address bar.
You should see the default "Welcome to nginx!" page.

This completes one-time server setup.

**Next:** The next article covers serverside steps taken once per Laravel application.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>

