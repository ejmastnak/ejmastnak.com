---
title: "Deploy a Laravel and Vue web app"
date: 2023-07-17
---

# Deploy a Laravel and Vue.js web app

This is a guide to deploying a web application with a [Laravel](https://laravel.com/) backend and a JavaScript-based frontend on a dedicated or virtual private server.

The articles are listed in order below;
you can read more meta-information about the guide [below the table of contents](#about).

## Contents

1. [Preliminary server setup]({{< relref "server-setup" >}}): standard first steps on a fresh Linux server.
1. [Install PHP]({{< relref "php" >}}): install PHP and required PHP extensions for running Laravel.
1. [Database setup]({{< relref "db" >}}): install a database management system (MySQL, PostgreSQL, or SQLite) and create a database and database user if required by your DBMS.
1. [Server-side Git setup]({{< relref "git-server" >}}): set up a Git repo and create a post-receive hook.
1. [Development-side Git setup]({{< relref "git-dev" >}}): connect Git on your dev machine and server.
1. [Composer]({{< relref "composer" >}}): install Composer and use it to install PHP packages.
1. [Node.js]({{< relref "nodejs" >}}): install Node.js and install your app's Node.js dependencies.
1. [Laravel environment setup]({{< relref "env" >}}): take care of your `.env` file, database migrations, and a few pre-deployment optimizations.
1. [Directory permissions]({{< relref "permissions" >}}): a few ownership and permission tweaks for Laravel to run.
1. [Nginx]({{< relref "nginx" >}}): install Nginx; create and activate your app's Nginx config.
1. [Automating deployment]({{< relref "deploy" >}}): three options for automated redeployment.
1. [Custom domain name]({{< relref "dns" >}}): set up DNS records needed for a custom domain name.
1. [HTTPS]({{< relref "https" >}}): set up a free, autorenewing HTTPS certificate with Certbot.

## About {#about}

### What's this?

A guide to deploying a web application with a [Laravel](https://laravel.com/) backend and JavaScript-based frontend (e.g. Vue, React, etc.) on a dedicated or virtual private server.
My goal in writing this was to document the process for future reference and help anyone else doing the same thing.

### Tech stack

- Server: either a [virtual private server](https://en.wikipedia.org/wiki/Virtual_private_server) (e.g. a Digital Ocean droplet) or a physical server, running a Debian-based Linux distro (e.g. Debian, Ubuntu).
- Backend: [Laravel](https://laravel.com/)
- Web server: [Nginx](https://www.nginx.com/)
- Database: your choice of [MySQL](https://www.mysql.com/)/[MariaDB](https://mariadb.org/), [PostgreSQL](https://www.postgresql.org/), [SQLite](https://www.sqlite.org/index.html)
- Frontend: Any JavaScript-based framework (e.g. [Vue](https://vuejs.org/), [React](https://react.dev/), etc.) for which you could reasonably define an `npm run build` script.
  The frontend has a relatively minor role in this guide.

## Prerequisites

- You are willing and able to operate in a Linux command line environment.
- You have root access to a Linux server.
- You can access the server over SSH and have the basic SSH knowledge required to do so (e.g. generating a public/private keypair; copying your public key to the `authorized_keys` file on the server; logging in over SSH).

## Conventions {#conventions}

I'll generally show shell prompts in `username@host$` format, and sometimes append the current working directory `username@host:cwd$` for clarity:

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

Other conventions:

- I'll use `1.2.3.4` as a server IP address.
- I'll use `laravel` as the name of the non-root user on your app's server.
- I'll use `laravel-project` as the name of your project's root server-side directory.

### Feedback, suggestions, etc. {#feedback}

If you have ideas for improving the series, I will quite likely implement them, appreciate your input, and give you a shoutout for your contributions.
Feedback is welcome and appreciated.

Shoutouts to readers: many thanks to [Nicola Pugliese](http://www.nicolapugliese.com/) and [Kai Breucker](https://bonfireatnight.github.io/index.html) for offering good ideas on how improve this series.

You can reach me by email at [elijan@ejmastnak.com](mailto:elijan@ejmastnak.com) or by opening an issue or pull request at [github.com/ejmastnak/ejmastnak.com](https://github.com/ejmastnak/ejmastnak.com)).

### Want to say thank you? {#thank-you}

You could:

- [Send me an email!]({{< relref "/contact" >}})
  Seriously, if this material helped you, it will make my day to know.
  I love hearing from readers, and you'll almost certainly get a message back from me.

- [Contribute financially.](https://www.buymeacoffee.com/ejmastnak)
  Based on reader input, there are in fact people out there interested in compensating me financially for this guide.
  That's awesome---thank you!
  You can [Buy Me a Coffee here.](https://www.buymeacoffee.com/ejmastnak)

## Other guides

Below is a list of other great guides to deploying a Laravel app that I've found online and taken inspiration from.
Each covers the material from a slightly different angle, so you'll probably get something out of reading all of them.

- [Loris Leiva's guide to zero-downtime redeployment](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/deploy-with-zero-downtime)
- [Farhan Hasin Chowdhury's guide to deploying a Laravel web app on a VPS](https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers)
- [J. Alexander Curtis's guide to deploying a Laravel 5.3 app on a LEMP stack](https://devmarketer.io/learn/deploy-laravel-5-app-lemp-stack-ubuntu-nginx/)).

<div class="my-8">
{{< tutorials/begin href="/tutorials/deploy-laravel/server-setup" >}}
</div>

<div class="mt-6">
  {{< tutorials/license >}}
<div>
