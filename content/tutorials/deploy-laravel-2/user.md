---
title: "Create a user to administer a Laravel application"
date: 2023-07-18
prevFilename: "server-setup-app"
nextFilename: "server-setup-app#directory-structure"
---

# Create a user to administer a Laravel application

{{< deploy-laravel/header >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

This article walks you through creating a non-root user to manage your Laravel application.
I'll create and use a non-root user called `laravel` in this guide, but the name `laravel` is completely arbitrary.
Feel to use a different name---but be sure to stay consistent throughout the guide.

{{< details summary="Why a dedicated non-root user?" >}}
Best practice.
The root user (likely the only user present on a fresh server) has privileges to access/delete/overwrite basically anything on the server without any prompts or confirmation, and can easily cause destructive changes---often by accident.

This is more firepower than you need for day-to-day tasks of managing and serving a web app, and it is best to delegate those tasks to a dedicated non-root user instead.
You'll both avoid potential root-related footguns and have a (IMO) more organized setup---one dedicated user per web app feels "cleaner" than just using blundering around as root for everything.

Note that you can still give the non-root user `sudo` privileges to use for one-off tasks that require them; the point is not to perform *everything* as root.
{{< /details >}}

## Create a user

```bash
# Create a non-root user
root@server$ adduser laravel

# Give the non-root user a password
root@server$ passwd laravel

# Give user sudo privileges
root@server$ usermod -aG sudo laravel

# Optional: change default shell to bash.
# (Otherwise you might be stuck with `sh` on some systems.)
root@server$ chsh -s /usr/bin/bash laravel
```

From here forward we'll work as the `laravel` user.
Here's how to change users:

```bash
# Change to the non-root user for the remainder of the guide
root@server$ su laravel
```

## Set up SSH access for the user

You'll need to be able to SSH into your server as the non-root `laravel` user.

Under the hood, this amounts to placing the public key ID of the SSH key pair you'll use from your dev machine to access the server into the serverside file `/home/laravel/.ssh/authorized_keys`.

There are a few ways to do this---choose whichever you prefer:

1. Option 1: use `ssh-copy-id` from your development machine (I'm assuming you've done this before) to copy 
1. Option 2: create an `~/.ssh/authorized_keys` serverside and manually type out or paste in the ID of the public SSH key you'll use to access your server from your development machine.

   ```bash
   # Manually open (or create) the laravel user's authorized_keys file and
   # place the appropriate public SSH key inside
   laravel@server:~$ nano .ssh/authorized_keys
   ```

1. Option 3: copy the root user's `authorized_keys` file into the `laravel` user's `~/.ssh/` folder (assuming you already have SSH access for the root user set up and you'll use the same SSH key for both users).

I've intentionally gone through this process quickly, assuming you've uploaded SSH keys to a remote server before.
If not, this [Digital Ocean tutorial](https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/to-existing-droplet/) goes through the process in more detail.

### Set SSH-related permissions

You'll then want to set correct SSH-related permissions:

```bash
# Change into laravel user's home directory
laravel@server$ cd ~

# Ensure laravel user owns their SSH directory and all files within
laravel@server$ sudo chown -R laravel:laravel .ssh

# Give the owning user (i.e. laravel) read, write, and execute permissions
# on their SSH directory
laravel@server$ chmod 700 .ssh

# Give the owning user (i.e. laravel) read and write permissions 
laravel@server$ chmod 600 .ssh/authorized_keys
```

The permissions I've used for `.ssh/` and `authorized_keys` are standard best practice---see e.g. the `FILES` section of `man ssh` for an authoritative source.

*Ensure you can SSH into your server from your dev machine before continuing.*

**Next:** The next section sets up the serverside directory structure to hold your project.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>

