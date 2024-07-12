---
title: "Server set-up to host a Laravel web application"
date: 2023-07-18
prevFilename: "server-setup-once"
nextFilename: "deployment"
---

# App-specific server set-up for hosting a Laravel web application

{{< deploy-laravel/header >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

This article covers application-specific steps needed to prepare your machine for hosting a Laravel application.
You'll need to go through these steps for every Laravel application you place on your server.

*Before beginning, you should have performed the one-time software installation covered [in the previous article]({{< relref "server-setup-once" >}}).*

## User setup

Create a non-root user to manage your Laravel application;
covered in a [dedicated article on setting up a user]({{< relref "user" >}}).

## Directory structure {#directory-structure}

{{< details summary="Preview: the Git workflow and directory structure used in this tutorial" >}}
For orientation, here's the Git and deployment workflow we'll use in this guide:

1. You develop your app on your dev machine.
1. You push code from your dev machine to a dedicated Git repo on your server at `/home/laravel/repo/laravel.gi`.
1. A post-receive Git hook automatically copies your app's code to the `/srv/www/` directory from which Nginx will serve your app to the public Web.

We'll create the necessary directory structure in this step, and defer the post-receive Git hook to a later article on automating deployment.

Note: The Git workflow used in this guide is originally inspired by [Farhan Hasin Chowdhury's guide to deploying a Laravel web app on a VPS](https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers) (which in turn seems to be based on [J. Alexander Curtis's guide to deploying a Laravel 5.3 app on a LEMP stack](https://devmarketer.io/learn/deploy-laravel-5-app-lemp-stack-ubuntu-nginx/)).
I encourage you to read both guides.
{{< /details >}}

First create a bare Git repository to which you'll push production code:

```bash
# Create directory for your server-side Git repo.
# The ~/repo/ directory is just convention—use whatever you like.
laravel@server$ mkdir -p ~/repo/laravel.git

# Initialize a bare Git repository
laravel@server$ cd ~/repo/laravel.git
laravel@server$ git init --bare
```

Note that we created a *bare* Git repo.

{{< details summary="What is a bare Git repo?" >}}
For our purposes, a bare Git repo is a repo without a working tree.
In fact, a bare repo contains the same files and directory structure you would normally find *inside* the `.git` folder of a standard Git repo.

Why use a bare repo?
Our motivation is simple: since we won't be doing any development work on the server, there is no reason to keep a working tree on the server (you should be editing your app's source code only on your development machine).
There is one more minor convenience: we'll be working with Git hook files as part of our deployment workflow; while a normal Git repo hides these hook files away in the hidden `.git` folder, a bare Git repo keeps them in plain sight, and thus easier to access.

Using bare repos is common practice on servers to which you will push code from a development machine (particularly in collaborative workflows involving many people), but not develop any code on the server itself.
See [this section of the Git Book](https://git-scm.com/book/en/v2/Git-on-the-Server-Getting-Git-on-a-Server) and [this StackOverflow question](https://stackoverflow.com/questions/5540883/whats-the-practical-difference-between-a-bare-and-non-bare-repository) for more on using bare repos;
a deeper appreciation of bare repos requires some familiarity with Git concepts like the working tree, `git checkout`, and remote-tracking branches.

(There would also be nothing terribly wrong with using a standard Git repo on the server---you'd just have an unnecessary working tree taking up space and getting in your way, and Git hook scripts hidden away in the `.git` folder.)
{{< /details >}}

Then create the directories in `/srv/www/` from which you'll serve the app:

```bash
# Create server-side directory structure for deployment.
laravel@server$ sudo mkdir -p /srv/www/laravel
laravel@server$ sudo mkdir -p /srv/www/laravel/releases
laravel@server$ sudo mkdir -p /srv/www/laravel/shared/storage
laravel@server$ sudo mkdir -p /srv/www/laravel/shared/storage/framework
laravel@server$ sudo mkdir -p /srv/www/laravel/shared/storage/framework/sessions
laravel@server$ sudo mkdir -p /srv/www/laravel/shared/storage/framework/views
laravel@server$ sudo mkdir -p /srv/www/laravel/shared/storage/framework/cache
```

The directory structure probably looks weird.
For now just trust me—the directory structure is intentional, and we'll explain the structure and motivation behind it in detail when covering deployment.

{{< details summary="Why serve out of `/srv/www`?" >}}
I'm using `/srv/www/` because the [Linux filesystem hierarchy standard](https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html#srvDataForServicesProvidedBySystem) (a standard for how to organize your filesystem on a Linux machine) recommends `/srv` for storing data served by your computer, and the `/srv/www/` subdirectory for web sites and applications served over the World Wide Web.

Note that `/var/www/` is also a common location from which to serve web apps and web sites, and indeed you'll find `/var/www/` used in many tutorials online.
Use whichever you prefer.
{{< /details >}}

## Set up your app's database {#db}

Set up a MySQL, PostgreSQL, or SQLite database;
covered in a [dedicated article on setting up a database]({{< relref "db" >}}).

## Prepare your app's `.env` file {#env}

Create a `.env` file to configure your app's production environment;
covered in a [dedicated article on creating a `.env` file]({{< relref "env" >}}).

## Correct ownership and permissions {#permissions}

Apply a few ownership and permission settings needed to run a Laravel app;
covered in a [dedicated article on permissions]({{< relref "permissions" >}}).

## Nginx {#nginx}

Create an Nginx config file for your app;
covered in a [dedicated article on Nginx]({{< relref "nginx" >}}).

## Set up a custom domain name {#dns}

Make the DNS changes to server your app from a custom domain name;
covered in a [dedicated article on setting up a domain name]({{< relref "dns" >}}).

## Serve your app over HTTPS {#https}

Use Certbot to configure HTTPS connections to your website;
covered in a [dedicated article on setting up HTTPS]({{< relref "https" >}}).

## Next

The next phase of the tutorial covers app deployment.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>

