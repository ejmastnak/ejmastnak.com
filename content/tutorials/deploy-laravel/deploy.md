---
title: "Automated Git deployment for a Laravel web application"
prevFilename: "nginx"
nextFilename: "dns"
date: 2023-07-18
---

# Automated deployment of a Laravel web application

{{< deploy-laravel/header >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel" index="about" >}}
</div>


This guide covers three workflows for (re)deployment of your app.
Read through the summaries below and pick the best one for you.

## Option 1: Super simple redeployment

**Article:** [Super simple redeployment]({{< relref "deploy-simple" >}})

**Summary:** deployment is triggered by a Git push to the server's Git repo and managed with a server-side Git hook.
The app is rebuilt and updated in the same directory from which you serve it.

**Features:** simplicity; but the app goes down for a minute or so during each redeployment, and a failed redeploy will keep your app down until you perform manual intervention.

**Use case:** as an introduction to Git hooks and automated redeployment.
Use this as a learning exercise but not for a production app.

## Option 2: Zero-downtime redeployment using Git hooks

**Article:** [Zero-downtime redeployment using Git hooks]({{< relref "deploy-zero-downtime" >}})

**Summary:** deployment is triggered by a Git push to the server's Git repo and managed by a server-side Git hook.
The app is built in an offline directory and only published if the build completes successfully.

**Features:** redeployment is practically instant (the time it takes to create a symlink).
A failed redeploy won't bring your app down---you'll just continue serving the previous version and your users will be none the wiser.
You can also roll back to previous releases, but this requires manual intervention.

**Use case:** primarily as an introduction to zero-downtime deployment.
But, despite its simplicity, you could probably use this in production for a low-stakes application (that doesn't require a staging server, say).

## Option 3: Zero-downtime deployment using Deployer {#deployer}

**TLDR:** [here is the article](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/deploy-with-zero-downtime)---it's by Loris Leiva and super cool.

**Summary:** [Deployer](https://github.com/deployphp/deployer) is an open source tool for deploying PHP applications; it's more powerful and probably a more appropriate choice for serious projects than the roll-your-own workflows in options 1 and 2.
The downside is additional complexity---you have to learn to use a new tool.

**Article:** I actually have a whole series for you here, but it's not mine---Loris Leiva has written an excellent guide to [deploying a Laravel application](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/) using Deployer (and also covers two other payable deployment tools---Ploi and Laravel Forge).
Instead of trying to reinvent the wheel I'll refer you to his guide instead:
you can either read [the whole series](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/) or just the [zero-downtime redeployment article](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/deploy-with-zero-downtime).
This would be good reading even if you don't end up using Deployer, just to see the content of my guide from a different perspective.

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>
