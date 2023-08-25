---
title: "Install NPM for deploying a Laravel and Vue web application"
prevFilename: "composer"
nextFilename: "env"
date: 2023-07-18
---

# Install NPM for deploying a Laravel and Vue.js web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

*(You can skip this article if your Laravel app has no JavaScript dependencies.)*

This short article shows how to install NPM, the standard package manager for the Node.js JavaScript runtime environment.
We'll use NPM to install your application's JavaScript depedencies.

(This is trivial if you've done it before, and it might be overkill to make a dedicated article for this. But I want to document every step so everyone can follow along.)

## Install Node.js

```bash
# Install Node.js, which will also include NPM 
laravel@server$ sudo apt install nodejs
```

## Install Node.js packages

Then change into the directory from which your app is served and use NPM to install your app's JavaScript dependencies:

```bash
# Install your app's Node.js dependencies
# (They should be installed in your project's `node_modules` directory.)
laravel@server$ cd /srv/www/laravel-project
laravel@server:laravel-project$ npm install
```

This command looks in your Laravel project's `package.json` file and installs the project's Node.js dependencies into a `node_modules` directory in your project's root.

{{< details-danger summary="Warning: problems with outdated Node.js on Ubuntu LTS and Debian stable" >}}
The version of Node.js shipped with Ubuntu LTS and stable Debian (which I imagine many readers are using) tends to be quite outdated.
This could cause problems when running `npm install` if your app's `package.json` requires a recent version of Node---in this case NPM will warn you that your Node.js is outdated.

You can solve this by first uninstalling your outdated version of Node.js (e.g. using `apt purge nodejs && apt autoremove`), then following the instructions in [this Digital Ocean article on installing Node.js](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04) to install a more up-to-date version---probably the simplest choice is Option 2, "Installing Node.js with Apt Using a NodeSource PPA".
{{< /details-danger >}}

## Build your app

Finally build your app for production (this assumes you have a `build` script defined in your project's `package.json` file, which a Laravel-Vue or Laravel-React project should come with by default):

```bash
# Build your app for production.
# (Assets should be outputted to your project's `public/build/` directory)
laravel@server:laravel-project$ npm run build
```

{{< details-danger summary="Warning: `npm run build` can fail because of too little RAM" >}}
The `npm run build` command can unexpectedly fail (it will exit with the message `Killed`, and fail to produce a `public/build` directory) if your machine has too little RAM, which might happen on lightweight servers.

The solution is the same as when [installing Composer]({{< relref "composer" >}}#swap)---create a swap file with more RAM (1 GB should be plenty).
See the [Composer article]({{< relref "composer" >}}#swap) for details.
{{< /details-danger >}}

## Remove `public/hot`, if necessary

One final detail: double check that there is no `public/hot` directory in your server-side Laravel project; delete it if necessary.

(This directory is used by Vite for hot reloading during development, but will cause problems on a production machine.
It shouldn't end up on your server because it is ignored in Laravel's default `.gitignore`, but check just in case.)

{{< deploy-laravel/navbar >}}
