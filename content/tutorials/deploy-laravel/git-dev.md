---
title: "Development-side Git setup for deploying a Laravel web application"
prevFilename: "git-server"
nextFilename: "composer"
date: 2023-07-17
---


# Dev-side Git setup for deploying a Laravel web application

{{< deploy-laravel/header >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel" index="about" >}}
</div>

This short article shows how to configure Git on your development machine.
You should have read and implemented [the previous article]({{< relref "git-server" >}}) on server-side Git setup before beginning this article.

## SSH config for Git push {#ssh-config}

We'll first create a dedicated SSH alias on your dev machine to use for pushing code to your app's server.

Open the `~/.ssh/config` file on your development machine, and inside add:

```bash
# Update Host to a nickname of your choice---although you probably want to note
# the Host is used for Git 
Host laravel_project_git
  # Update to your server's IP address
  HostName 1.2.3.4
  # Update to the full path to the private SSH key used to access your server
  IdentityFile ~/.ssh/LaravelApp_id_ed25519
  # Leave this line as is
  IdentitiesOnly yes
```

## Configure a Git remote on development machine

You then need to tell Git on your development machine about the remote Git repository located on your app's server. We'll do this with the `git remote` command.

You'll need to have your Laravel project (on the dev machine) in a Git repo for this workflow to work; take care of this now if you haven't already.
Then configure the remote from somewhere in your dev-side Laravel project as follows:

```bash
# Change into your Laravel project on your dev machine
you@dev$ cd /path/to/your/laravel-project

# Create a Git remote, called "production", linked to your app's server
you@dev:laravel-project$ git remote add production ssh://laravel@laravel_project_git:/home/laravel/repo/laravel-project.git
```

Here's a breakdown of `git remote` command:

- `add` is a subcommand used to, well, add a new remote.
- `production` is the name for the remote. The name is your choice; I chose `proudction` because the remote server hosts your app in production.
- `ssh` is the protocol used to connect to the server. This should stay as is.
- `laravel` is the name of the non-root user on the app's server and must match, well, the name of whatever non-root user you're using on the server.
- `laravel_project_git` is the SSH alias used in the SSH config on your dev machine to identify your app's server.
  It must exactly match the `Host` field used in [the previous section](#ssh-config).

- `/home/laravel/repo/laravel-project.git` is the path, on the server, to the server-side Git repo storing your web app.

{{< details summary="Need to update the remote's URL?" >}}
You can use `git remote set-url` anytime you need to update or edit the `production` remote's URL on your development machine:

```bash
# Update the URL used for the production remote
you@dev:laravel-project$ git remote set-url production ssh://laravel@laravel_project_git:/home/laravel/repo/laravel-project.git
```

{{< /details >}}


## Moment of truth {#push}

Time to test if Git setup from the last two articles is working properly.

```bash
# Push your app's main branch to the production server. (Assuming you're using
# a main branch; update branch name (to e.g. master) as necessary.)
you@dev:laravel-project$ git push production main
```

{{< details-warning summary="Warning: your server and dev Git branch names must match!" >}}
The name of the branch in your server-side Git repo must match the name of the branch you're pushing from your development machine (e.g. *both* server and dev branches should be `main`, or both should be `master`, etc.), or the checkout part of the `post-receive` hook will fail.

The most likely way you'd run into problems is having a `master` branch on your server (by default most Git distributions will use `master` as the default name) and a `main` branch on your dev machine.
As long as you give both branches the same name (e.g. both `main`, both `master`, or whatever else you prefer) you should be fine.
{{< /details-warning >}}


Here's what should happen:

- Git on your dev machine recognizes which SSH key to use to connect to the server (you might be prompted for the SSH key's password, or `ssh-agent` might take of this for you under the hood, depending on your SSH setup).
- Your app is pushed to the server-side Git repo (SSH into the server and check the contents of `/home/laravel/repo/laravel-project.git`).
- Pushing code to the server triggers the `post-receive` hook in the server-side Git repo, which copied your app into the `/srv/www/laravel-project` directory on the server. (Again, check this manually by SSHing into the server and inspecting `/srv/www/laravel-project`.)

{{< details summary="Ran into problems?" >}}
- Errors with Git's SSH connection to the server are probably due to an SSH or Git misconfiguration on your dev machine.
  Double check that the alias in `~/.ssh/config` and the Git remote URL match on your dev machine what's in this article.
- Server-side errors are probably file permission misconfigurations.
  Make sure:

  - that the non-root user owns the `/srv/www/laravel-project` directory on the server (the directory is not writable otherwise);
  - that the `post-receive` Git hook in the server-side Git repo is executable;
  - and that the username in the SSH aliases in `~/.ssh/config` on your dev machine match the non-root user on the server.

Give this and the previous article a reread just be sure, and then please [let me know](/contact) if you're still having problems pushing code to the server---it might be a mistake in this guide.
{{< /details >}}

**Next:** The next article shows how to install Composer and how to use Composer to install your Laravel project's PHP dependencies.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>

