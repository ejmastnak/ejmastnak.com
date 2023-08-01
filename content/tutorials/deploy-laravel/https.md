---
title: "Set up HTTPS for a Laravel web application"
prevFilename: "dns"
nextFilename: "about"
date: 2023-07-18
---

# Set up HTTPS for a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article shows how to set up HTTPS connections to your Laravel web app.

References:

- [Configuring a Domain Name With HTTPS](https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers)
- [7. Install a Let's Encrypt Certificate](https://www.vultr.com/docs/how-to-install-nginx-mariadb--php-lemp-on-debian-11-99568/)
- [Install certbot on Ubuntu running Nginx](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal)
- [Installing snap](https://snapcraft.io/docs/installing-snapd)

## Prerequisite

You have set a DNS A record that points a custom domain name to your web server's IP address, i.e. something along the lines of

```bash
Host: foobar.com
Answer: 1.2.3.4
```

See the [previous article]({{< relref "dns" >}}) if you haven't done this yet.

## Install Snap and Certbot

The de facto tool for setting up and maintaining HTTPS certificates is Certbot.
It seems the [preferred way](https://certbot.eff.org/instructions) to install Certbot is using Snap; I know Snap is disliked by many in the Linux community, but I'm not going to fight it here.

### Install Snap

We'll first install Snap, then use Snap to install Certbot:

```bash
# Install Snap (you can very likely skip this step on Ubuntu systems,  where
# Snap is usually installed by default.)
laravel@server$ sudo apt install snapd

# If you needed to installed snapd, reboot your machine after installing.
laravel@server$ reboot
```

Then update to the latest Snap:

```bash
# Install the core Snap to get the latest snapd
sudo snap install core

# Update core Snap
sudo snap refresh core
```

Because we'll use the Snap version of Certbot, you should remove any version of Certbot managed by APT:

```bash
# Remove Certbot packages managed by APT (you probably won't have any)
sudo apt remove certbot
```

### Install Certbot

You can finally install Certbot:

```bash
# Install Certbot with snap
sudo snap install --classic certbot
```

You should then put the Certbot executable somewhere on your `PATH`.
I suggest `/usr/local/bin` or `/usr/bin`:

```bash
# Link Certbot to /usr/local/bin
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

## Set up an HTTPS certificate

You can then run the `certbot` program to set up an HTTPS certificate.
This opens an interactive session with a few prompts for you to answer.

```bash
# Run Certbot with Nginx-specific features
sudo certbot --nginx
```

The `--nginx` flag is important---it makes Certbot take care of updating your site's Nginx config to work with HTTPS.

Here's how to answer the prompts:

- Add an email (where you'll receive expiration notices---don't worry, you won't be spammed unless you opt in).
- Agree to the terms of service.
- Opt out of (or in to) EFF emails.
- Confirm the domain name (e.g. `foobar.com`) for the HTTPS certificate. If you used the `--nginx` option, Certbot should have picked the domain name up from your Nginx config.
- If prompted, you might want to redirect HTTP traffic to HTTPS.

Certbot takes care of renewing your HTTPS certificate for you.
I suggest checking that auto-renew works:

```bash
# Check if auto-renewal of your HTTPS certificate works
sudo certbot renew --dry-run
```

That's it! After a minute or so your app should be available at its domain name over HTTPS. And that wraps up this guide. Thanks for reading!

{{< deploy-laravel/navbar >}}
