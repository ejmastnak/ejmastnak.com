---
title: "Install NPM for deploying a Laravel and Vue web application"
prevFilename: "composer"
nextFilename: "env"
date: 2023-07-18
---

{{< deploy-laravel/navbar >}}

# Install NPM for deploying a Laravel and Vue.js web application

{{< deploy-laravel/header >}}

We'll use NPM to ensure Node JS packages are available to the production application.
This is really simple, but if you've never done it before I guess it might be helpful.

```bash
# Install npm if needed
apt install npm

# Install Node packages
cd /var/www/landmarks
npm install

# Should output ssets to `/public/build/`
npm run build
```

Ensure the `/public/hot` (used by Vite for hot reloading during development) is not on production machine.
(It shouldn't be because it is ignored in Laravel's default `.gitignore`, but check just in case.)
