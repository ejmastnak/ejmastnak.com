---
title: "Automated Git deployment for a Laravel web application"
prevFilename: "nginx"
nextFilename: "dns"
date: 2023-07-18
---

# Automated Git deployment for a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article walks you through a script for automatically redeploying your app after every Git push to the server.

This builds on [Git server-side article]({{< relref "git-server" >}}).

A more sophisticated setup would use zero-downtime redeployment.
And I should do the same.

Basically at the bottom of the `post-receive` hook add more code.

```bash
#!/bin/sh
cd /var/www/landmarks

# Using the `-n` flag to not overwrite an existing `.env` file
cp -n ./.env.example ./.env

# Enter maintenance mode
php artisan down

# Temporarily suppresses warning when composer runs with root privileges
# Otherwise a standard composer install for a Laravel production environment
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader

# Install node packages and build assets
npm install && npm run build

# Caches Laravel routes and configuration settings for efficiency
php artisan route:cache
php artisan config:cache

# # If applicable to your application
# php artisan queue:restart
# php artisan cache:clear

# Force flag is needed for automated deploys to suppress warning prompt
php artisan migrate --force

# Leave maintenance mode
php artisan up
```

{{< deploy-laravel/navbar >}}
