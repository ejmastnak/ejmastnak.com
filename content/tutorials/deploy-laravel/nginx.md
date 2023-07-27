---
title: "Configure Nginx for serving a Laravel web application"
prevFilename: "permissions"
nextFilename: "composer"
date: 2023-07-18
---

# Configure Nginx for serving a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article shows how to configure Nginx for serving a Laravel web app.
We'll be using [Laravel's example Nginx config](https://laravel.com/docs/10.x/deployment#nginx)---it works great and I see no reason to reinvent the wheel here.
This article is basically walking through Laravel's example nginx config with short explanations of what each line does.

First install and start Nginx:

```bash
# Install, enable and start Nginx
laravel@server$ sudo apt install nginx
laravel@server$ sudo systemctl enable --now nginx.service
```

<!-- File locations: -->
<!---->
<!-- - `/etc/nginx/sites-available` contains config files for all sites. -->
<!-- - `/etc/nginx/sites-enabled` contains a symlink to the config in `sites-available` corresponding to the site you want Nginx to serve. -->

Create an Nginx config file for your web app:

```bash
# Create an Nginx config:
laravel@server$ sudoedit /etc/nginx/sites-available/project
```

Inside paste [Laravel's example Nginx config](https://laravel.com/docs/10.x/deployment#nginx) (I've added some comments)

```bash
# Inside /etc/nginx/sites-available/project
server {
  # Listen for connections on port 80 (HTTP)
  listen 80;
  # Add this if using IPv6
  # listen [::]:80;

  # IP address (or domain name) of your server.
  # Set this to your server's IP address (or domain name, if you've set up DNS).
  server_name 1.2.3.4;
  # server_name example.com;  # if using a domain name

  # The root directory for incoming web requests.
  # Set this to your Laravel app's `public` subdirectory, which is the entry
  # point to Laravel application from the public web.
  root /srv/www/project/public;

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

  # Use PHP (and not HTML) index files (likely because Laravel is PHP-based)
  index index.php;

  # Specify UTF-8 character encoding in Content-Type HTTP response header fields.
  charset utf-8;

  # The order in which Nginx translates URIs to files on the server
  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }

  # Disable logging related to favicon and robots.txt files.
  location = /favicon.ico { access_log off; log_not_found off; }
  location = /robots.txt  { access_log off; log_not_found off; }

  # Redirect to the home page (i.e. /index.php) on 404 errors
  error_page 404 /index.php;

  # Settings for handling requrests for PHP files.
  # IMPORTANT: set the correct version of PHP (e.g. 8.1, 8.2, etc., depending
  # on the PHP version you have installed on your server).
  location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
  }

  # Denies all attempts to access hidden files that are not associated with
  # well-known services.
  # See e.g. https://en.wikipedia.org/wiki/Well-known_URI
  location ~ /\.(?!well-known).* {
    deny all;
  }
}
```

Helpful: [Nginx directives](http://nginx.org/en/docs/dirindex.html)

Use the Laravel config as the active nginx config file:

```bash
# Make nginx serve the Laravel app
# Specify full path when creating the symlink
sudo ln -s /etc/nginx/sites-available/project /etc/nginx/sites-enabled/project

# Remove the active link to the default nginx splash page
sudo rm /etc/nginx/sites-enabled/default
```

Test the syntax of the active nginx config file:

```bash
# Test syntax of nginx config file
sudo nginx -t
```

Assumming the test succeeded, you can restart nginx.
The new `sites-enabled` link will then take effect, and nginx will begin serving your Laravel application.

```bash
# Restart nginx
sudo systemctl restart nginx.service
```

## Disable and remove Apache {#remove-apache}

Your VPS might be using Apache as the default web server.
You should disable Apache (and optionally uninstall it) if you're using nginx.

```bash
# Stop the apache daemon
systemctl stop apache2.service

# Optionally, remove all apache related packages
apt purge apache2*
apt autoremove
```
