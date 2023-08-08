---
title: "Deploy a Laravel and Vue web app"
date: 2023-07-17
---

# Deploy a Laravel and Vue.js web app

This is a guide to deploying a web application with a [Laravel](https://laravel.com/) backend and a Javascript-based frontend on a dedicated or virtual private server.

You can read more about the guide [below](#about), or [jump right in]({{< relref "server-setup" >}}).

**TODO:** here are some web apps I deployed using the process in this guide.

## Contents

1. [Preliminary server setup]({{< relref "server-setup" >}}): standard first steps on a fresh Linux server.
1. [Install PHP]({{< relref "php" >}}): install PHP and required PHP extensions for running Laravel.
1. [Database setup]({{< relref "db" >}}): install a database management system (MySQL, PostgreSQL, or SQLite) and create a database and database user if required by your DBMS.
1. [Server-side Git setup]({{< relref "git-server" >}}): set up a Git repo and create a post-receive hook.
1. [Development-side Git setup]({{< relref "git-dev" >}}): connect Git on your dev machine and server.
1. [Composer]({{< relref "composer" >}}): install Composer and use it to install PHP packages.
1. [NPM]({{< relref "npm" >}}): install NPM and use it to install NodeJS packages.
1. [Laravel environment setup]({{< relref "env" >}}): take care of your `.env` file, database migrations, and a few predeployment optimizations.
1. [Set Laravel directory permissions]({{< relref "permissions" >}}): a few permission tweaks for Laravel to run.
1. [Nginx]({{< relref "nginx" >}}): instal Nginx; create and activate your app's Nginx config.
1. [Automated redeployment]({{< relref "deploy" >}}): three options for automated redeployment.
1. [Custom domain name]({{< relref "dns" >}}): set up DNS records needed for a custom domain name.
1. [HTTPS]({{< relref "https" >}}): set up a free, autorenewing HTTPS certificate with Certbot.

## About {#about}

### What's this?

A guide to deploying a web application with a [Laravel](https://laravel.com/) backend and Javascript-based frontend (e.g. Vue.js, React, etc.) on a dedicated or virtual private server.
My goal in writing this was to document the process for future reference and help anyone else doing the same thing.
The guide should be applicable, with minor adjustments, to other frontend frameworks.

### Tech stack

- Server: either a [virtual private server](https://en.wikipedia.org/wiki/Virtual_private_server) (e.g. a Digital Ocean droplet) or a physical server, running a Debian-based Linux distro (e.g. Debian, Ubuntu)
- Backend: [Laravel](https://laravel.com/)
- Web server: [Nginx](https://www.nginx.com/)
- Database: your choice of [MySQL](https://www.mysql.com/) (well, [MariaDB](https://mariadb.org/)), [PostgreSQL](https://www.postgresql.org/), [SQLite](https://www.sqlite.org/index.html)
- Frontend: Any Javascript-based framework (e.g. [Vue.js](https://vuejs.org/), [React](https://react.dev/), etc.) for which you could reasonably define an `npm run build` script.
  The frontend has a relatively minor role in this guide.

## Prerequisites

- You willing and able to operate in a Linux command line environment.
- You have root access to a Linux server.
- You can access the server over SSH and have the basic SSH knowledge (e.g. generating a public/private keypair; copying your public key to the `authorized_keys` file on the server; logging in over SSH) required to do so.

## Conventions

I'm using `vim` to edit files. Replace with your editor of choice!
Actually kiddo just change this to `nano`---experiences users will know to change this to their editor of choice.

```bash
# You on your development machine
you@dev$ whoami
you

# A shell command issued as root user on the server
root@server$ whoami
root

# A shell command issued as laravel user on the server
laravel@server$ whoami
laravel

# A shell command issued as laravel user from home directory
laravel@server:~$ pwd
/home/laravel

# A shell command issued as laravel user from /var/www
laravel@server:/var/www$ pwd
/var/www
```


## Credit to

- https://devmarketer.io/learn/deploy-laravel-5-app-lemp-stack-ubuntu-nginx/
- https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers

Another decent guide: https://mhmdomer.com/the-ultimate-laravel-deployment-guide

And another really nice one: https://lorisleiva.com/deploy-your-laravel-app-from-scratch/deploy-with-zero-downtime

<div class="text-center mx-auto mt-6 mb-8 bg-blue-50 font-semibold dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
<a href="/tutorials/deploy-laravel/server-setup" class="block py-2">Begin the series!</a>
</div>

