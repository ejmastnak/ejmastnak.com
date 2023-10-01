---
title: "Install a Laravel project's Node.js JavaScript dependencies"
prevFilename: "composer"
nextFilename: "env"
date: 2023-07-18
---

# Install a Laravel project's Node.js dependencies

{{< deploy-laravel/header >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel" index="about" >}}
</div>

*(You can skip this article if your Laravel app has no JavaScript dependencies.)*

This short article shows how to install the Node.js JavaScript runtime environment and NPM, the standard package manager for the Node.js.
We'll use NPM to install your application's Node.js dependencies.

(This is trivial if you've done it before, and it might be overkill to make a dedicated article for this. But I want to document every step so everyone can follow along.)

## Install Node.js

```bash
# Install Node.js and NPM
laravel@server$ sudo apt install nodejs npm
```

## Install Node.js packages

Then change into the directory from which your app is served and use NPM to install your app's Node.js dependencies:

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

You can solve this by first uninstalling your outdated version of Node.js (e.g. using `sudo apt purge nodejs && sudo apt autoremove`), then following the instructions in [this Digital Ocean article on installing Node.js](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04) to install a more up-to-date version---probably the simplest choice is Option 2, "Installing Node.js with Apt Using a NodeSource PPA".
{{< /details-danger >}}

### Fix vulnerabilities in Node.js dependencies (optional)

The `npm install` command may have warned you about vulnerabilities in installed packages.
In this case you should run `npm audit fix`, which will try to (and generally succeed in) fixing these vulnerabilities:

```bash
# If necessary, try to fix vulnerabilities in Node.js packages
laravel@server:laravel-project$ npm audit fix
```

## Build your app

After running `npm install` (and `npm audit fix`, if needed), you can now build your app for production (this assumes you have a `build` script defined in your project's `package.json` file, which a Laravel-Vue or Laravel-React project should come with by default):

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

**Next:** The next article covers the necessary environment configuration for running a Laravel app in production.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>
