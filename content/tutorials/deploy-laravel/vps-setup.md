---
title: "Set up a VPS for deploying a Laravel web application"
prevFilename: "about"
nextFilename: "lemp"
date: 2023-07-17
---

{{< deploy-laravel/navbar >}}

# Set up a VPS for deploying a Laravel web application

{{< deploy-laravel/header >}}

(This will also work with a dedicated server.)

I'm assuming a Debian-based Linux distribution that uses `apt` for package management.
Adapt package installation as necessary for different Linux distros.

Update package lists and upgrade software

```bash
# Update package lists and upgrade packages
apt update
apt upgrade
```

## Set up a non-root user to manage the web app

```bash
# Create a non-root user
adduser laravel

# Give user a password
password laravel

# Change default shell to bash (to make sure you're not stuck with `sh`)
chsh -s /usr/bin/bash laravel

# Give user sudo privileges
usermod -aG sudo laravel
```

## SSH setup

1. Disable SSH password-based authentication and remote user login in `/etc/ssh/sshd_config`.

1. Allow SSH login to VPS directly as the `laravel` user, e.g. `ssh laravel@vps` instead of `ssh root@vps`:

   ```bash
   # Create an SSH directory for the Laravel user
   mkdir /home/laravel/.ssh

   # Assuming you'll use the same SSH to log in as root and laravel user
   cp /home/root/.ssh/authorized_keys /home/laravel/.ssh/authorized_keys

   # Ensure laravel user owns their SSH directory and all files within
   chown -R laravel:laravel /home/laravel/.ssh

   # Give laravel user read, write, and execute permissions on their SSH directory
   chmod 700 /home/laravel/.ssh

   # Give laravel user read and write permissions 
   chmod 600 /home/laravel/.ssh/authorized_keys
   ```

   See the `FILES` section of `man ssh` for suggested permissions of SSH-related files and directories.
