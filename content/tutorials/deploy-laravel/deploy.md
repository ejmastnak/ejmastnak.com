---
title: "Automated Git deployment for a Laravel web application"
prevFilename: "nginx"
nextFilename: "dns"
date: 2023-07-18
---

# Automated deployment of a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

I have three options for you.

## Option 1: Super simple redeployment

Article: [Super simple redeployment]({{< relref "deploy-simple" >}})

Description: deployment is triggered by a Git push to the server's Git repo and managed with a server-side Git hook.
The app is rebuilt and updated in the same directory from which you serve it.

Features: the app goes down for a minute or so during each redeployment, and a failed redeploy will keep your app down until you perform manual intervention.

Use case: as an introduction to Git hooks and automated redeployment. I would recommend this as a learning exercise but would not use this in a production app.

## Option 2: Zero-downtime redeployment using Git hooks

Article: [Zero-downtime redeployment using Git hooks]({{< relref "deploy-zero-downtime" >}})

Description: deployment is triggered by a Git push to the server's Git repo and managed by a server-side Git hook.
The app is built in an offline directory and only published if the build completes successfully.

Features: redeployment is practically instant (the time it takes to create a symlink).
A failed redeploy won't bring your app down---you'll just continue serving the previous version and your users will be none the wiser.
You can also roll back to previous releases, but this requires manual intervention.

Use case: primarily as an introduction to zero-downtime deployment.
But, despite its simplicity, you could probably use this in production for a low-stakes application (that doesn't require a staging server, say).

## Option 3: Zero-downtime deployment using [Deployer](https://github.com/deployphp/deployer) {#deployer}

[Deployer](https://github.com/deployphp/deployer) is an open source tool for deploying PHP applications and is more robust and probably a more appropriate choice for serious projects than the roll-your-own workflows in options 1 and 2.
The downside is additional complexity---instead of writing a shell script you have to learn to use a new tool.

Article: I have a whole series for you here---Loris Leiva has written an excellent guide to [deploying a Laravel application](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/) that uses Deployer (and also covers two other payable deployment tools---Ploi and Laravel Forge).

Instead of trying to reinvent the wheel I'll refer you to [his series](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/) instead
(which would be good reading even if you don't end up using Deployer, just to see the content of this guide from a new angle.)

{{< deploy-laravel/navbar >}}
