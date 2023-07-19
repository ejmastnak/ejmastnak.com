---
title: "Configure nginx for serving a Laravel web application"
prevFilename: "permissions"
nextFilename: "composer"
date: 2023-07-18
---

{{< deploy-laravel/navbar >}}

# Configure nginx for serving a Laravel web application

{{< deploy-laravel/header >}}

[Laravel's example Nginx config](https://laravel.com/docs/10.x/deployment#nginx) works great and I see no reason to change it.
This article is basically walking through Laravel's example nginx config with short explanations of what each line does.

File locations:

- `/etc/nginx/sites-available` contains config files for all sites.
- `/etc/nginx/sites-enabled` contains a symlink to the config in `sites-available` corresponding to the site you want Nginx to serve.

Create an Nginx config:

```bash
# Create an Nginx config:
vim /etc/nginx/sites-available/landmarks
```

Inside paste [Laravel's example Nginx config](https://laravel.com/docs/10.x/deployment#nginx) (I've added some comments)

```bash
# Inside /etc/nginx/sites-available/landmarks
server {
  # Listen for connections on port 80 (HTTP)
  listen 80;
  # Add this if using IPv6
  # listen [::]:80;

  # IP address domain name of your server
  # You'll want to update this to your server's IP address
  server_name 1.2.3.4;

  # You can also use the domain name of your server once you have set up the
  # appropriate DNS records, e.g.
  # server_name example.com;

  # This is the site's root directory and should point to public subdirectory
  # of your Laravel appliation
  root /var/www/landmarks/public;

  # These is a header for HTTP responses
  # This setting supposedly serves to prevent click-jacking attacks.
  # The page can be embedded in a frame only if the site including it in a
  # frame is the same as the one serving the page.
  # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  add_header X-Frame-Options "SAMEORIGIN";

  # These is a header for HTTP responses
  # This setting supposedly serves to prevent MIME type sniffing.
  # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  add_header X-Content-Type-Options "nosniff";

  # Serve the index.php file as the entrypoint to your application,
  # since index.php is entrypoint to Laravel apps
  index index.php;

  # Use UTF-8 character encoding
  charset utf-8;

  # How nginx should respond to URIs
  location / {
    try_files $uri $uri/ /index.php?$query_string;
  }

  # I believe this suppresses nginx logging errors for missing favicon and
  # robots.txt files
  location = /favicon.ico { access_log off; log_not_found off; }
  location = /robots.txt  { access_log off; log_not_found off; }

  # Redirect to the home page (i.e. /index.php) on 404 errors
  # You might or might now want this.
  # This might also be redundant after already using
  # try_files $uri $uri/ /index.php?$query_string;
  error_page 404 /index.php;

  # TODO: what is this?
  # IMPORTANT: set the correct version of PHP (e.g. 8.1, 8.2, etc.)
  location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
  }

  # TODO: what is this?
  location ~ /\.(?!well-known).* {
    deny all;
  }
}
```

Use the Laravel config as the active nginx config file:

```bash
# Make nginx serve the Laravel app
# Specify full path when creating the symlink
sudo ln -s /etc/nginx/sites-available/landmarks /etc/nginx/sites-enabled/landmarks

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

Reminder: You should also have [disabled Apache]({{< relref "lemp#remove-apache" >}}) if it is installed and running by default.
