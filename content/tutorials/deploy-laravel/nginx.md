---
title: "Configure Nginx for serving a Laravel web application"
prevFilename: "env"
nextFilename: "deploy"
date: 2023-07-18
---

# Configure Nginx for serving a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article shows how to configure Nginx for serving a Laravel web app.
We'll be using [Laravel's example Nginx config](https://laravel.com/docs/10.x/deployment#nginx)---it works well in my experience and I see no reason to reinvent the wheel here.
This article is basically walking through Laravel's example Nginx config with short explanations of what each line does.

## Install Nginx

Your VPS might be using Apache as the default web server.
If so, you should disable Apache to avoid conflicts with Nginx.

```bash
# Stop and disable Apache
laravel@server$ sudo systemctl stop apache2.service
laravel@server$ sudo systemctl disable apache2.service
```

You might also want to uninstall Apache entirely, since you probably won't need it going forward now that you are using Nginx:

```bash
# Remove all Apache-related packages
laravel@server$ sudo apt purge apache2*
laravel@server$ sudo apt autoremove
```

You can then install and start Nginx:

```bash
# Install, enable, and start Nginx
laravel@server$ sudo apt install nginx
laravel@server$ sudo systemctl enable --now nginx.service
```


You can then test that Nginx is up and running by pasting your app's IP address into a web browser's address bar.
You should see the default "Welcome to nginx!" page.

## Make an Nginx config

Create an Nginx config file for your Laravel app:

```bash
# Create an Nginx config for your Laravel app
laravel@server$ sudoedit /etc/nginx/sites-available/laravel-project
```

{{< details summary="More on Nginx config files" >}}
Two directories are relevant for Nginx configuration (at least on Debian and Ubuntu systems):

- `/etc/nginx/sites-available/` contains a dedicated config file for every website (or, more precisely, virtual host) hosted on your server, whether the site is currently enabled or not.
- `/etc/nginx/sites-enabled/` contains symlinks to files in the `sites-available/` folder.

The idea is to "activate" the site(s) you want Nginx to serve by creating a symlink in `sites-enabled/` linking to the site's config file in `sites/available/`.

**But there is a twist to the story...**

The `sites-available/` and `sites-enabled/` convention is specific to the version of Nginx packaged specifically for Debian and Ubuntu systems (supposedly the goal is to parallel the `a2ensite`/`a2dissite` workflow used with Apache).
Upstream versions of Nginx prefer using the `/etc/nginx/conf.d/` directory for configuring your virtual hosts, and indeed `sites-enabled/` and `sites-available/` is said to be deprecated in [Chapter 1.5 of the Nginx cookbook](https://www.oreilly.com/library/view/nginx-cookbook/9781492078470/ch01.html).

I'm sticking with `sites-enabled/` and `sites-available/` in this guide, since that's what you'll find in most online guides and what you'll probably have set up on your VPS out of the box.

See [this StackOverflow thread](https://serverfault.com/questions/527630/difference-in-sites-available-vs-sites-enabled-vs-conf-d-directories-nginx) for further reading.
{{< /details >}}

Inside `/etc/nginx/sites-available/laravel-project` paste [Laravel's example Nginx config](https://laravel.com/docs/10.x/deployment#nginx) (I've added some comments---feel free to remove them).

Make sure to update the `server_name` and `root` directives, and possibly the PHP version and/or file path in `fastcgi_pass`.
The rest can be left as is.

```nginx
server {
  # Listen for connections on port 80 (HTTP)
  listen 80;
  # Add this if using IPv6 on your server
  # listen [::]:80;

  # IP addresses and domain names that should point to your app.
  # Set this to your server's IP address (and/or domain name, if you've set up DNS).
  server_name 1.2.3.4;
  # server_name 1.2.3.4 example.com;  # if using a domain name

  # The root directory for incoming web requests.
  # Set this to the full path to your Laravel app's `public` subdirectory,
  # which is the entry point to Laravel applications.
  root /srv/www/laravel-project/public;

  # This sets the X-Frame-Options HTTP response header such that your site can
  # be embedded in a frame only if the site including it is the same as the one
  # serving the page.
  # This supposedly serves to prevent click-jacking attacks; for details see
  # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  add_header X-Frame-Options "SAMEORIGIN";

  # This sets the X-Content-Type-Options HTTP response header to help revent
  # MIME type sniffing. For details see
  # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  add_header X-Content-Type-Options "nosniff";

  # Use PHP (and not HTML) index files (because Laravel is PHP-based).
  index index.php;

  # Specify UTF-8 character encoding in Content-Type HTTP response header fields.
  charset utf-8;

  # The order recommended by Laravel for Nginx to check for the existence of
  # files based on a URI or query string.
  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }

  # Disable logging related to favicon and robots.txt files.
  location = /favicon.ico { access_log off; log_not_found off; }
  location = /robots.txt  { access_log off; log_not_found off; }

  # Redirect to the home page (i.e. /index.php) on 404 errors.
  error_page 404 /index.php;

  # Laravel's recommended for handling requests for PHP files.
  location ~ \.php$ {
    # The `fastcgi_pass` directive should point to the address of the FastCGI
    # Process Manager (FPM) on your server. The value below should be correct,
    # but you might need to tweak the PHP version (from e.g. 8.1 to 8.2)
    # depending on the PHP version installed on your server
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
  }

  # Denies all attempts to access hidden files that are not associated with
  # well-known services. See e.g. https://en.wikipedia.org/wiki/Well-known_URI
  location ~ /\.(?!well-known).* {
    deny all;
  }
}
```

Here is the official documentation of [Nginx directives](http://nginx.org/en/docs/dirindex.html), if you're interested.

### Enable the Laravel site's Nginx config

Create a symlink to enable your Laravel site:

```bash
# Create a symlink enabling your Laravel app
laravel@server$ cd /etc/nginx/sites-enabled
laravel@server:sites-enabled$ sudo ln -s ../sites-available/laravel-project laravel-project

# Remove the active link to the default Nginx splash page
laravel@server:sites-enabled$ sudo rm default
```

Then test the syntax of the active Nginx config file:

```bash
# Test syntax of Nginx config file for errors/misconfiguration
laravel@server$ sudo nginx -t
```

Assuming the test succeeded, you can restart Nginx.

```bash
# Restart Nginx
laravel@server$ sudo systemctl restart nginx.service
```

The new `sites-enabled` link will take effect after restarting Nginx, and Nginx will begin serving your Laravel application.

### Moment of truth

Point a web browser to your server's IP address.
Assuming you've correctly followed the steps so far, your web app should be live and working properly.

{{< details summary="Ran into problems?" >}}
There are, of course, a lot of moving parts here---far more than I could fully cover---but here are two common problems:

- An error along the lines of "File not found" means that Nginx cannot find your app's root directory, and you'll have to fix something with your Nginx setup.
  At the risk of being annoying, read through this article and double-check you've followed each step---ensure you've removed Apache, that all paths and addresses in your Nginx config are correct, and that your app's Nginx config is properly symlinked into place in `sites-enabled`.

- A "HTTP 500 Internal Server Error" means that Nginx is properly set up and serving your Laravel app, but that there is a problem with the app itself.

  The best advice I can offer (besides the annoying suggestion to double check the past few articles) is to temporarily reenable debug mode to help diagnose the problem:

  1. Open your app's server-side `.env` file.
  1. Set `APP_DEBUG=true` and exit the `.env` file.
  1. Run `php artisan config:cache` to update your config cache.
  1. Refresh your app in the web browser. You should see a more detailed error trace, which should have useful debugging information.

  Common problems include errors when appending to your application log (you'll need to give the `www-data` group write permissions on your app's `storage/log` directory---revisit the [permissions article]({{< relref "permissions" >}})) or failure to connect to your database (make sure the database connection settings in your app's `.env` file (covered in the [environment configuration article]({{< relref "env" >}})) match the database created in the [database article]({{< relref "db" >}})).

   Even if these common issues don't apply to you, Laravel's debug messages can hopefully give you a lead. In any case, you should disable debug mode when you diagnose and fix the problem.

And if you're sure you've exactly followed the guide so far and your app is still down, please [let me know](/contact)---I've done my best to battle-test this guide and triple-check everything works, but there could still be mistakes or unexpected failure modes, which I would want to address.
{{< /details >}}

**Next:** The next article covers automated redeployment of your Laravel app.

{{< deploy-laravel/navbar >}}
