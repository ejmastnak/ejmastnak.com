---
title: "Set up HTTPS for a Laravel web application"
prevFilename: "dns"
nextFilename: "about"
date: 2023-07-18
---

{{< deploy-laravel/navbar >}}

# Set up HTTPS for a Laravel web application

{{< deploy-laravel/header >}}

About: how to set up HTTPS connections to you web app.

References:

- [Configuring a Domain Name With HTTPS](https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers)
- [7. Install a Let's Encrypt Certificate](https://www.vultr.com/docs/how-to-install-nginx-mariadb--php-lemp-on-debian-11-99568/)
- [Install certbot on Ubuntu running Nginx](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal)
- [Installing snap](https://snapcraft.io/docs/installing-snapd)

Prerequisite: you have set up a custom domain for your website with a DNS A record along the lines of

```bash
# You first need a DNS A record along the lines of
Host: baz.foobar.com
Answer: 111.222.111.222

# Or, if using a subdomian,
Host: landmarks.foobar.com
Answer: 111.222.111.222
```

## Certbot and HTTPS

It seems the convention is you install certbot with snap; I know that snap is disliked by many in the Linux community, but I'm not going to fight it.

```bash
# BTW: skip this block if snap is already installed (it is likely already
# installed on Ubuntu servers)
# If you needed to installed snapd, reboot your machine after installing
sudo apt install snapd
```

Then:

```bash
# Install the core Snap to get the latest snapd
sudo snap install core

# Update core Snap
sudo snap refresh core

# Ensure there are no Certbot packages installed with apt
sudo apt remove certbot

# Install Certbot with snap
sudo snap install --classic certbot

# Link Certbot to /usr/bin
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# You'll be prompted a few times.
# - Request a certificate
# - Agree to TOS and add an email for expiration notices
# - If prompted, probably redirect HTTP traffic to HTTPS
# The --nginx flag automatically updates your nginx config to work with HTTPS
sudo certbot --nginx

# Check if auto-renew works
sudo certbot renew --dry-run

# If you're curious
systemctl show certbot.timer
```

**TODO:** check what actually happens to the nginx config when using `--nginx`. Which file (enabled, available?) is updated? Probably the file pointed to by enabled?
