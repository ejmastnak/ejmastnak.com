---
title: "Development-side Git setup for deploying a Laravel web application"
prevFilename: "git-server"
nextFilename: "permissions"
date: 2023-07-17
---


# Dev-side Git setup for deploying a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This short article shows how to configure Git on your development machine to push code to your app's server.

## SSH config for Git push {#ssh-config}

We'll first create a dedicated SSH alias on your dev machine to use for pushing code to your app's server.
This step is part of making Git use the correct SSH key for authenticating to your app's server.

Open the `~/.ssh/config` file on your development machine, and inside add:

```bash
# Update Host (an alias of your choice---although you probably want to note
# the alias is used for Git), HostName (server's IP address), and
# IdentityFile (full path to private SSH key used to access server) as neeed.
Host landmarks_git
  HostName 111.222.111.222
  IdentityFile ~/.ssh/LaravelApp_id_ed25519
  IdentitiesOnly yes
```

## Configure a Git remote on development machine

You then need to tell Git on your development machine about the remote Git repository located on your app's server. We'll do this with the `git remote` command.

(You'll need to have your Laravel project (on the dev machine) in a Git repo for this workflow to work; take care of this now if you haven't already.)

Configure the remote from somewhere in your dev-side Laravel project as follows:

```bash
# Change into your Laravel project on your dev machine
you@dev$ cd /path/to/your/laravel-project

# Create a Git remote, called "production", linked to your app's server
you@dev:laravel-project$ git remote add production ssh://laravel@landmarks_git:/home/laravel/repo/landmarks.git
```

Here's a breakdown of `git remote` command:

- `add` is a subcommand used to, well, add a new remote.
- `production` is the name for the remote. The name is your choice; I chose `proudction` because the remote server hosts your app in production.
- `ssh` is the protocol used to connect to the server. This should stay as is.
- `laravel` is the name of the non-root user on the app's server and must match, well, the name of whatever non-root user you're using on the server.
- `landmarks_git` is the SSH alias used in the SSH config on your dev machine to identify your app's server.
  It must exactly match the `Host` field used in [the previous section](#ssh-config).

- `/home/laravel/repo/landmarks.git` is the path, on the server, to the server-side Git repo storing the web app.

{{< details summary="Need to update the remote's URL?" >}}
You can use `git remote set-url` anytime you need to update or edit the `production` remote's URL on your development machine:

```bash
# Update the URL used for the production remote
you@dev:laravel-project$ git remote set-url production ssh://laravel@landmarks_git:/home/laravel/repo/landmarks.git
```

{{< /details >}}


## Moment of truth

Time to test if Git setup from the last two articles is working properly.

```bash
# Push your app's main branch to the production server
# You should be prompted for the password  
you@dev:laravel-project$ git push production main
```

Here's what should happen:

- Git on your dev machine recognizes which SSH key to use to connect to the server (you might be prompted for the SSH key's password or `ssh-agent` might take of this for you under the hood, depending on your SSH setup).
- Your app is pushed to the server-side Git repo (SSH into the server and check the contents of `/home/laravel/repo/landmarks.git`).
- Pushing code to the server triggered the `post-receive` hook in the server-side Git repo, which copied your app into the `/srv/www/landmarks` directory on the server. (Again, check this manually by SSHing into the server and inspecting `/srv/www/landmarks`.)

{{< details summary="Ran into problems?" >}}
- Errors with Git's SSH connection to the server are probably due to an SSH or Git misconfiguration on your dev machine.
  Double check that the alias in `~/.ssh/config` and the Git remote URL match what's in this article.
- Server-side errors are probably file permission misconfigurations.
  Make sure:

  - that the non-root user owns the `/srv/www/landmarks` directory on the server (the directory is not writable otherwise);
  - that the `post-receive` and `checkout` scripts on the server are executable;
  - and that the username in the SSH aliases in `~/.ssh/config` on your dev machine match the non-root user on the server.

Give this and the previous article a reread just be sure, and please [let me know](/contact) if you're still having problems pushing code to the server---it might be a mistake in this guide.
{{< /details >}}

{{< deploy-laravel/navbar >}}
