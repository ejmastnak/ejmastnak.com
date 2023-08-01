---
title: "Set up a server for deploying a Laravel web application"
prevFilename: "about"
nextFilename: "php"
date: 2023-07-17
---

# Set up a server for deploying a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article covers a few administrative steps on a new server used to host a web app.
You might also benefit from Digital Ocean's [guide to setting up an Ubuntu server]( https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04), which covers similar material.

## What I'm expecting from you

**Your responsibility:** get SSH access to either a VPS or a dedicated physical server to host your web app.

Also: I'll be assuming a Debian-based Linux distribution that uses `apt` for package management, since this what most readers are probably using.
It's on you to adapt package installation as necessary if you're using a Linux distro with a different package managers.

**My responsibility:** take you from you first SSH into your server to deploying your Laravel application.
How you get your hands on the server is up to you, but not covered in this guide.

With that out of the way, let's begin with your first login to a fresh server.

## Update package lists and upgrade software

I suggest first updating your package lists and upgrading your system packages:

```bash
# Update package lists and upgrade packages
root@server$ apt update
root@server$ apt upgrade
```

This is to ensure you're starting off with up-to-date software.

## Set up a non-root user to manage the web app

Then create a non-root user to manage your web app.
I'll create and use a non-root user called `laravel` in this guide, but the name "laravel" is completely arbitrary. Feel to use something else.

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

# Optional: you might want to also explicitly set the *root* user's password 
root@server$ passwd
```

{{< details summary="Why a non-root user?" >}}
Best practice.
The root user (likely the only user present on a freshly server) has privileges to access/delete/overwrite basically anything on the server without any prompts or confirmation, and can easily cause destructive changes---often by accident.

This is more firepower than you need for day-to-day tasks of managing and serving a web app, and it is best to delegate those tasks to a dedicated non-root user instead.
You'll both avoid potential root-related footguns and have a (IMO) more organized setup---one dedicated user per web app feels "cleaner" than just using blundering around as root for everything.

Note that you can still give the non-root user `sudo` privileges to use for one-off tasks that require them; the point is not to perform *everything* as root.
{{< /details >}}


From here forward we'll work as the `laravel` user.
Here's how to change users:

```bash
# Change to the non-root user for the remainder of the guide
root@server$ su laravel
```

## SSH configuration

Two things to do here: (1) allow the `laravel` user to log in to the server over SSH and (2) a bit of standard SSH hardening to better secure the server.

1. There are many ways to complete this step.
   The end goal (i.e. what will allow SSH login as the `laravel` user) is to copy the appropriate public SSH key from your development machine into the `/home/laravel/.ssh/authorized_keys` file on the server.

   If you've done this before and have a preferred method, go ahead.
   Here's an example shell session with a few options:

   ```bash
   # Change into laravel user's home directory and create an SSH directory
   laravel@server$ cd ~
   laravel@server:~$ mkdir .ssh

   # Option 1
   # Manually open (or create) the laravel user's authorized_keys file.
   # Inside manually type out or paste the relevant public SSH key from your
   # development machine.
   laravel@server:~$ vim .ssh/authorized_keys

   # Option 2
   # Your cloud provider (e.g. Digital Ocean) may have already created an
   # authorized_keys file for the root user when provisioning your server.
   # In this case you can just copy the root user's authorized_keys file---
   # ---but make sure to update permissions (below).
   laravel@server:~$ sudo cp /root/.ssh/authorized_keys .ssh/authorized_keys

   # Option 3
   # Use ssh-copy-id from your development machine (I'm assuming you know how)
   ```

   In all three cases you'll want to set correct SSH-related permissions:

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

1. And two technically optional, but strongly suggested SSH hardening steps: open `/etc/ssh/sshd_config` (you'll need root privileges) and disable both (1) SSH password-based authentication and (2) root user login.

   ```bash
   # Both settings should be changed from "yes" to "no"
   PasswordAuthentication no
   PermitRootLogin no
   ```
   
   These steps are standard SSH best practice---I'm assuming you've seen this a million times before and won't go into long explanations.
   (New to SSH? I'd recommend [this Digital Ocean SSH guide](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server) to learn the basics.)

### Tip: easier SSH access from your dev machine

And an optional tip for SSH easer access to your server from your development machine:
create an alias in the SSH config on your dev machine.

In `~/.ssh/config` on your development machine add:

```bash
# Update "laravel_project" to any nickname of your choice
Host laravel_project
  # Update to your server's IP address
  HostName 1.2.3.4
  # This should be the non-root user on the server
  User laravel
  # Update to the full path to the private SSH key used to access your server
  IdentityFile ~/.ssh/LaravelApp_id_ed25519
```

You can then use `ssh laravel_project` instead of `ssh laravel@1.2.3.4` to connect to the server from your dev machine.

## Set up a firewall

Every Internet-facing server should have a firewall configured---yours is no exception.

{{< details summary="What is a firewall?" >}}
I'm assuming most readers will have previous firewall experiences. But just in case...

For our purposes, a firewall is a program running on your server that filters incoming and outgoing Internet traffic, usually to secure your server (there are other uses, too).
Setting up a firewall is a basic part of server administration.

We will use a firewall to improve your server's security by restricting the Internet connections that can reach your server to a few well-known services (SSH, HTTP and HTTPS via the Nginx web server) and dropping all other incoming Internet traffic.
The idea is to restrict the (all-too-often malicious) traffic that can reach your server from the public Internet.

A thorough discussion of firewalls falls beyond the scope of this article; you should first be familiar with the [TCP/IP stack](https://en.wikipedia.org/wiki/Internet_protocol_suite), then read [Wikipedia's article on firewalls](https://en.wikipedia.org/wiki/Firewall_(computing)).
You might also benefit from Digital Ocean's [guide to setting up a firewall on an Ubuntu machine](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-22-04), which covers similar material to this article.
{{< /details >}}

We'll use [UFW](https://en.wikipedia.org/wiki/Uncomplicated_Firewall) to manage firewalls.
You will very likely have UFW preinstalled on a new server (check with `apt list ufw` or `which ufw`), but can always install it with `apt install ufw`.

I'd suggest first resetting your UFW configuration to a clean slate, so that we're all starting with the safe configuration:

```bash
# Reset UFW to clean slate: deny all incoming and allow all outgoing traffic
laravel@server$ sudo ufw default deny incoming
laravel@server$ sudo ufw default allow outgoing
```

UFW comes with preconfigured firewall rules for common services;
You can check available preconfigured firewall rules with:

```bash
# List "pre-configured" firewall profiles for common applications
laravel@server$ sudo ufw app list

# Example output...
# ...
Nginx HTTP
Nginx HTTPS
Nginx Full  # both HTTP and HTTPS
OpenSSH
# ...
```

I would suggest the following for a basic web application:

```bash
# Allow OpenSSH and Web traffic
laravel@server$ sudo ufw allow 'OpenSSH'
laravel@server$ sudo ufw allow 'Nginx Full'  # includes HTTP and HTTPS

# FYI: you could get the same result by manually specify each application's
# port number
laravel@server$ sudo ufw allow 22    # OpenSSH
laravel@server$ sudo ufw allow 80    # HTTP
laravel@server$ sudo ufw allow 443   # HTTPS
```

Finally, enable the firewall:

```bash
# Enable firewall
sudo ufw enable

# If you're interested, check firewall status
sudo ufw status
```

{{< details summary="PSA: Digital Ocean firewalls are different from UFW firewalls" >}}
I imagine many readers will be using Digital Ocean, so I wanted to drop a note on this (because it confused me when I was starting out!).

Digital Ocean provides a free service called [Cloud Firewalls](https://docs.digitalocean.com/products/networking/firewalls/) that you can easily apply to any Digital Ocean droplet (you do this from the "Networking" section of the admin panel on Digital Ocean's website; here is a [quickstart guide](https://docs.digitalocean.com/products/networking/firewalls/quickstart/) and here are [full docs](https://docs.digitalocean.com/products/networking/firewalls/)).

Digital Ocean's Cloud Firewalls are *separate* from `ufw` firewalls (Cloud Firewalls are more Internet-facing, i.e. incoming IP packets first hit the Digital Ocean firewall, then the `ufw` firewall.)
I'd suggest setting up both on a new droplet.
{{< /details >}}

{{< deploy-laravel/navbar >}}
