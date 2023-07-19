---
title: "Double check Git hooks for deploying a Laravel web application"
prevFilename: "maintenance-mode"
nextFilename: "dns"
date: 2023-07-18
---

{{< deploy-laravel/navbar >}}

# Double check Git hooks for deploying a Laravel web application

{{< deploy-laravel/header >}}

Push code from dev machine to server:

```bash
# Push main local branch to the production remote
git push production main
```

SSHing into server and check:

- Files from `/var/repo/site.git` were indeed copied into `/var/www/landmarks` 
- Composer installed PHP packages
- NPM installed NodeJS packages
- NPM built your app's JavaScript assets
- Artisan updated your Laravel config and route cache
- Any 

Basically check the `checkout` and `post-checkout` scripts completed successfully.

You should see the standard output from the server in the SSH session on the dev machine.
Just pay attention to the script output and look for unusual output or error messages; make fixes as needed.
