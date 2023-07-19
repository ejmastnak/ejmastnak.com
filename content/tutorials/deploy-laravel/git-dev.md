---
title: "Server-side Git setup for deploying a Laravel web application"
prevFilename: "git-server"
nextFilename: "permissions"
date: 2023-07-17
---

{{< deploy-laravel/navbar >}}

# Server-side Git setup for deploying a Laravel web application

{{< deploy-laravel/header >}}

Goal: connect development machine to server.

## SSH config for Git push

You need a bit of config to have Git recognize correct SSH key to use for accessing remote repo.

```bash
# Open SSH config on development computer for editing
vim ~/.ssh/config
```

In `~/.ssh/config` on development computer add:

```bash
Host landmarks_git
  HostName 111.222.111.222  # server's IP address
  IdentityFile /home/ej/.ssh/DigitalOceanDefault_id_ed25519  # full path to SSH key used to acces the server
  IdentitiesOnly yes
```

## Configure remote on development computer

Change directories into the Laravel project root on development machine

```bash
# Remote should connect to Git repo on server (see notes below)
# User: server's non-root user
# Host: SSH nickname for host
git remote add production ssh://laravel@landmarks_git:/var/repo/landmarks.git
```

Anatomy of url:

```txt
<protocol>://<non-root user on server>@<SSH nickname for server in development machine's SSH config>:<path to server-side Git repo>
```

Summary:

- `production` is the name of the Git remote; the name is arbitrary
- `ssh` is the protocol 
- `laravel` is the name of the non-root user on the server; it must match, well, the name of the non-root user on the server, `laravel` in this tutorial.
- `landmarks_git` is the nickname for the server specified in the development machine's SSH config; it must exactly match the `Host` name identifying the server in the dev machine's `~/.ssh/config` file.
- `/var/repo/landmarks.git` is the path, on the server, to the server-side Git repo storing the web app.

You can use `git remote set-url` to update or edit the Git remote's on the development machine:

```bash
# To change Git remote url on development machine (if you need/want to)
git remote set-url production ssh://laravel@landmarks_git:/var/repo/landmarks.git
```
