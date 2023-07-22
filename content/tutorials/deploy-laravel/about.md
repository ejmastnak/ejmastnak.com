---
title: "Deploy a Laravel and Vue web app"
date: 2023-07-17
---

# Deploy a Laravel and Vue.js web app

**What you're reading:** A guide to deploying a web application with a [Laravel](https://laravel.com/) backend and [Vue.js](https://vuejs.org/) frontend on a virtual private server.
The guide should be applicable, with minor adjustments, to other frontend frameworks.

**Purpose:** document the process for future reference; help anyone else doing the same thing.

**Tech stack:**

- Server: either a [virtual private server](https://en.wikipedia.org/wiki/Virtual_private_server) (e.g. a Digital Ocean droplet) or a physical server, running a Debian-based Linux distro (e.g. Debian, Ubuntu)
- Backend: [Laravel](https://laravel.com/)
- Frontend: [Vue.js](https://vuejs.org/) (using [Vite](https://vitejs.dev/) as a build tool)
- Web server: [Nginx](https://www.nginx.com/)
- Database: your choice of [MySQL](https://www.mysql.com/) (well, [MariaDB](https://mariadb.org/)), [PostgreSQL](https://www.postgresql.org/), [SQLite](https://www.sqlite.org/index.html)

**Prerequisite**:
- You willing and able to operate in a Linux command line environment.
- You have root access to a Linux machine to use as a web server.
- In the very likely case you are logging into the server over SSH, you should have basic SSH knowledge (generating a public/private keypair; copying your public key to the `authorized_keys` file on the server; logging in over SSH).

**Conventions**:

```bash
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

## Overview

Click on an individual article for details.

1. [Preliminary server setup]({{< relref "server-setup" >}}): install latest software, create a non-root user, set up a firewall.
1. [Install PHP]({{< relref "php" >}}): install PHP and required PHP extensions for running Laravel.
1. [Set up database]({{< relref "db" >}}): install a database management system (MySQL, PostgreSQL, or SQLite) and create a database and database user if required by your DBMS.
1. [Set up Git on server]({{< relref "git-server" >}})
1. [Set up Git on development machine]({{< relref "git-dev" >}}), configure a Git remote point to server, push code to server 
1. [Set Laravel directory permissions]({{< relref "permissions" >}})
1. [Install and configure Nginx]({{< relref "nginx" >}})
1. [Set up Composer]({{< relref "composer" >}}): install Composer and use it install PHP packages
1. [Set up NPM]({{< relref "npm" >}}): install NPM and use it install NodeJS packages
1. [Set up Laravel environment]({{< relref "env" >}}): create and configure `.env` file; cache routes and config; migrate and seed database.
1. [Set up a maintenance mode]({{< relref "maintenance-mode" >}}): display a custom message during mainteance mode when deploying new code
1. [Double check post-receive hooks]({{< relref "double-check" >}}) work (checkout, package installation, artisan commands...)
1. [Set a custom domain name]({{< relref "dns" >}}): set DNS records to point a domain name to your server's IP address
1. [Set up HTTPS]({{< relref "https" >}})

## Credit to

- https://devmarketer.io/learn/deploy-laravel-5-app-lemp-stack-ubuntu-nginx/
- https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers

Another decent guide: https://mhmdomer.com/the-ultimate-laravel-deployment-guide
