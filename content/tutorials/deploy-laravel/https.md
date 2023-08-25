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

You have set a DNS Type A record that points a custom domain name to your app server's IP address, and have verified the DNS record with a DNS lookup tool like `dig`.
See the [previous article]({{< relref "dns" >}}) if you haven't done this yet.

## Install Snap and Certbot

The de facto tool for setting up and maintaining HTTPS certificates is Certbot.
It seems the [preferred way](https://certbot.eff.org/instructions) to install Certbot is using Snap.
This might cause some controversy---I know Snap is disliked by many in the Linux community---but I'm not going to fight it here and will use Snap to install Certbot in this article.

### Install Snap (so that you can then install Certbot)

We'll first install Snap, then use Snap to install Certbot.
I'll be following the [official instructions from Snapcraft](https://snapcraft.io/docs/installing-snapd).

You might already have Snap installed; if not, you can install it on Debian-based systems as follows:

```bash
# Install Snap (you'll probably already have Snap on Ubuntu and can skip this step.)
laravel@server$ sudo apt install snapd

# If you needed to installed Snap, reboot your machine after the installation.
laravel@server$ reboot
```

Then update to the latest Snap:

```bash
# Install the core Snap to get the latest snapd
laravel@server$ sudo snap install core

# Then update the core Snap
laravel@server$ sudo snap refresh core
```

### Remove non-Snap versions of Certbot, if needed

Because we'll be installing the Snap version of Certbot, you should remove any version of Certbot managed by APT (or whatever other package manager you might be using):

```bash
# Remove any Certbot packages managed by APT (you probably won't have any)
laravel@server$ sudo apt remove certbot
```

### Install Certbot

You can finally install Certbot:

```bash
# Install Certbot using Snap
laravel@server$ sudo snap install --classic certbot
```

You should then put the Certbot executable somewhere on your `PATH`.
The choice is up to you; I would suggest using `/usr/local/bin` to avoid any ambiguity with the APT-managed packages in `/usr/bin`:

```bash
# Link Certbot to /usr/local/bin
laravel@server$ sudo ln -s /snap/bin/certbot /usr/local/bin/certbot
```

## Set up an HTTPS certificate

You can then run the `certbot` program to set up an HTTPS certificate.
This opens an interactive session with a few prompts for you to answer.

```bash
# Run Certbot with Nginx-specific features
laravel@server$ sudo certbot --nginx
```

The `--nginx` flag is important---it lets Certbot know you're using Nginx as your web server, which makes Certbot take care of updating your site's Nginx config to work with HTTPS.

Here's how to answer the prompts:

- Add an email (where you'll receive expiration notices---don't worry, you won't be spammed unless you opt in).
- Agree to the terms of service.
- Opt out of (or opt in to) [EFF](https://en.wikipedia.org/wiki/Electronic_Frontier_Foundation) emails---your choice.
- Confirm the domain name (e.g. `mylaravelproject.com`) for the HTTPS certificate.
  If you used the `--nginx` option, Certbot should have picked the domain name up from your Nginx config.

Certbot will take care of renewing your HTTPS certificate for you, but I suggest checking that auto-renew works:

```bash
# Check if auto-renewal of your HTTPS certificate works
laravel@server$ sudo certbot renew --dry-run
```

That's it!
After a minute or so your app should be available at its domain name over HTTPS.

## Update your `APP_URL`

Open your Laravel app's `.env` file and set the `APP_URL` variable to use HTTPS:

```bash
APP_URL=https://mylaravelproject.com
```

Then recache your app's config settings by running `php artisan config:cache` from your Laravel project root directory.

And that wraps up this guide. Thanks for reading!

{{< deploy-laravel/navbar >}}
