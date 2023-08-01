---
title: "Install NPM for deploying a Laravel and Vue web application"
prevFilename: "composer"
nextFilename: "env"
date: 2023-07-18
---

# Install NPM for deploying a Laravel and Vue.js web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

*(You can skip this article if your Laravel app has no Javascript dependencies.)*

This short article shows how to install NPM, the standard package manager for the Node.js Javascript runtime environment.
We'll use NPM to install your application's Javascript depedencies.

(This is trivial if you've done it before, and I feel a bit silly for making a dedicated article for this. But I want to make sure to document every step so everyone can follow along.)

## Install NPM

```bash
# Install npm
laravel@server$ sudo apt install npm
```

## Install Node.js packages

Then change into the directory from which your app is served and use NPM to install your app's Javascript dependencies:

```bash
# Install your app's Node.js dependencies
# (They should be installed in your project's `node_modules` directory.)
laravel@server$ cd /srv/www/laravel-project
laravel@server:laravel-project$ npm install
```

This command looks in your Laravel project's `package.json` file and installs the project's Node.js dependencies into a `node_modules` directory in your project's root.

## Build your app

Finally build your app for production (this assumes you have a `build` script defined in your project's `package.json` file, which a Laravel-Vue or Laravel-React project should come with by default):

```bash
# Build your app for production.
# (Assets should be outputted to your project's `public/build/` directory)
laravel@server:laravel-project$ npm run build
```

## Remove `public/hot`, if necessary

One final detail: double check that there is no `public/hot` directory in your server-side Laravel project; delete it if necessary.

(This directory is used by Vite for hot reloading during development, but will cause problems on a production machine.
It shouldn't end up on your server because it is ignored in Laravel's default `.gitignore`, but check just in case.)

{{< deploy-laravel/navbar >}}
