---
title: "Deploy a Laravel and Vue web app"
date: 2023-07-17
---

# Deploy a Laravel and Vue.js web app

**What you're reading:** A guide to deploying a web application with a [Laravel](https://laravel.com/) backend and [Vue.js](https://vuejs.org/) frontend on a virtual private server.
The guide should be applicable, with minor adjustments, to other frontend frameworks.

**Purpose:** document the process for future reference; help anyone else doing the same thing.

**Relevant tech stack:**

- backend: Laravel
- frontend: Vue.js
- frontend build system: Vite
- web server: nginx
- database: your choice of MySQL, PostgreSQL, SQLite
- server: a Digital Ocean VPS (a "droplet" in DO lingo) running the latest Ubuntu.

Prerequisite: you have root SSH access to a Linux machine to use as a web server.

**TODO:** I should add to each article a "test that you've followed along correctly and are ready to move on to the next article" test to go along with the vibe of "small, actionable, bite-sized" pieces.

## Overview

Click on an individual article for details.

1. [VPS preliminary setup]({{< relref "vps-setup" >}}): install latest software, create a non-root user, set up a firewall.
1. [Install a LEMP stack]({{< relref "lemp" >}}): install the nginx web server, MySQL, and PHP.
1. [Set up database]({{< relref "db" >}}): create a database, MySQL user, and grant the MySQL user privileges on the database.
1. [Set up Git on server]({{< relref "git-server" >}})
1. [Set up Git on development machine]({{< relref "git-dev" >}}), configure a Git remote point to server, push code to server 
1. [Set Laravel directory permissions]({{< relref "permissions" >}})
1. [Configure Nginx]({{< relref "nginx" >}})
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
