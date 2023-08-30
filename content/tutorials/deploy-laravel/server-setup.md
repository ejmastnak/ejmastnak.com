---
title: "Set up a server for deploying a Laravel web application"
prevFilename: "about"
nextFilename: "php"
date: 2023-07-17
---

# Set up a server for deploying a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article takes you through setting up the server used to host and serve your web app.
You might also benefit from Digital Ocean's [guide to setting up an Ubuntu server]( https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-22-04), which covers similar material.

## Prerequisites

To follow this guide, you'll need SSH access to either a virtual private server (VPS) or a dedicated physical server to host your web app.
You should also read through the [conventions]({{< relref "about" >}}#conventions) used in this guide if you haven't yet.

## Log in to your server over SSH

```bash
# Log in to your server over SSH.
# Do this however you like, e.g. something along the lines of:
you@dev$ ssh root@1.2.3.4 -i ~/path/to/your/ssh-key
```

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
I'll create and use a non-root user called `laravel` in this guide, but the name "laravel" is completely arbitrary. Feel to use a different name---but be sure to stay consistent throughout the guide.

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

### Register your SSH key in the non-root user's `authorized_keys` file

**TLDR:** Register the public SSH key you use to access your server in the `laravel` user's `authorized_keys` file on your server.
Then set appropriate SSH file permissions.
You can now [jump to the next section](#ssh-hardening).
**End TLDR.**

There are a few ways to do this---choose whichever you prefer:

1. Option 1: use `ssh-copy-id` from your development machine (I'm assuming you've done this before).
1. Option 2: copy the root user's `authorized_keys` file.
   Your cloud provider (e.g. Digital Ocean) may have already created an `authorized_keys` file for the root user when provisioning your server.
   In this case you can just copy the root user's authorized_keys file---but make sure to update permissions:

   ```sh
   # Create an SSH directory for the laravel user, if needed
   laravel@server:~$ mkdir .shh

   # Copy the root user's authorized_keys file, which should already have your
   # public SSH key
   laravel@server:~$ sudo cp /root/.ssh/authorized_keys .ssh/authorized_keys

   # Make sure the laravel user owns their SSH directory and its contents!
   laravel@server:~$ sudo chown -R laravel:laravel .ssh
   ```

1. Option 3: create an `authorized_keys` and manually type out or paste the appropriate SSH key from your development machine.

   ```bash
   # Manually open (or create) the laravel user's authorized_keys file and
   # place the appropriate public SSH key inside
   laravel@server:~$ vim .ssh/authorized_keys
   ```

### Set SSH-related permissions

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

### Basic SSH hardening {#ssh-hardening}

First confirm you can log in to your server from your dev machine as the `laravel` user over SSH using public-key authentication. (Otherwise you run the risk of locking yourself out of your server!)

Assuming you can indeed access your server as the `laravel` user, you can now complete the two classic SSH hardening steps everyone (rightly) nags you about: open `/etc/ssh/sshd_config` (you'll need root privileges) and

- disable SSH password-based authentication
- disable root user login.

The updated settings in your server-side `sshd_config` should look like this:

```bash
# Both settings should be changed from "yes" to "no"
PasswordAuthentication no
PermitRootLogin no
```

These steps are standard SSH best practice---I'm assuming you've seen this a million times before and won't go into long explanations.
(New to SSH? I'd recommend [this Digital Ocean SSH guide](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server) to learn the basics.)

{{< details-danger summary="Possible footgun: locking yourself out of your server." >}}
If you disable password-based authentication, you (obviously) won't be able to log in to your server over SSH using a user's password.
This is why you should confirm you can access your server with public-key authentication before setting `PasswordAuthentication no`.

If you disable root login, you won't be able to log in to your server over SSH as the root user, even using public key authentication.
This is why you should confirm you can access your server as the `laravel` user before setting `PermitRootLogin no`.

You'll be safe as long as you double check you can access your server from your dev machine as the non-root user using public key authentication:

```bash
# Confirm you can log in to your server as the `laravel` user over SSH using
# public-key authentication.
you@dev$ ssh laravel@1.2.3.4 -i ~/path/to/your/ssh-key
```
{{< /details-danger >}}


### Tip: easier SSH access from your dev machine

Here's an optional tip for easer SSH access to your server from your development machine:
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

I'd suggest first resetting your UFW configuration to a clean slate, so that we're all starting with the same configuration:

```bash
# Reset UFW to clean slate: deny all incoming and allow all outgoing traffic
laravel@server$ sudo ufw default deny incoming
laravel@server$ sudo ufw default allow outgoing
```

I would suggest the following for a basic web application:

```bash
# Allow OpenSSH and Web traffic
laravel@server$ sudo ufw allow 22    # OpenSSH
laravel@server$ sudo ufw allow 80    # HTTP
laravel@server$ sudo ufw allow 443   # HTTPS
```

{{< details-danger summary="Possible footgun: locking yourself out of your server." >}}
If you run `ufw default deny incoming` and don't subsequently allow any incoming services, you'll lock yourself out of your server.
Make sure you leave yourself at least one way to reach your server (e.g. allowing incoming OpenSSH traffic over port 22).
{{< /details-danger >}}

Finally, enable the firewall:

```bash
# Enable firewall
sudo ufw enable

# If you're interested, check firewall status
sudo ufw status
```

{{< details summary="PSA: Digital Ocean firewalls are different from UFW firewalls" >}}
I imagine many readers will be using Digital Ocean, so I wanted to mention this (because it confused me when I was starting out!).

Digital Ocean provides a free service called [Cloud Firewalls](https://docs.digitalocean.com/products/networking/firewalls/) that you can easily apply to any Digital Ocean droplet (you do this from the "Networking" section of the admin panel on Digital Ocean's website; here is a [quickstart guide](https://docs.digitalocean.com/products/networking/firewalls/quickstart/) and here are [full docs](https://docs.digitalocean.com/products/networking/firewalls/)).

Digital Ocean's Cloud Firewalls are *separate* from `ufw` firewalls (Cloud Firewalls are more Internet-facing, i.e. incoming IP packets first hit the Digital Ocean firewall, then the `ufw` firewall.)
I'd suggest setting up both on a new droplet.
{{< /details >}}

**Next:** The next article covers the installation of PHP and the PHP extensions needed for Laravel to run.


{{< deploy-laravel/navbar >}}
