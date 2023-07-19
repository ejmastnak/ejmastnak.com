---
title: "Set up a custom domain name for a Laravel web application"
prevFilename: "double-check"
nextFilename: "https"
date: 2023-07-18
---

{{< deploy-laravel/navbar >}}

# Set up a custom domain name for a Laravel web application

{{< deploy-laravel/header >}}

About: how to set up a custom domain for your web app.

Reference: [Configuring a Domain Name With HTTPS](https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers)

Prerequisites:

- You own a domain and can edit DNS records for the domain.
  foobar.com
- (Optionally) you've decided on a subdomain for the app.
  baz.foobar.com
- You have a VPS/server with an IP(v4) address on which you host the app.
  111.222.111.222

## Root domain

### DNS record

Create an A Record for `foobar.com` with:

```bash
Host: foobar.com
Answer: 111.222.111.222
```

Optionally add a CNAME redirecting subdomains to root domain

```bash
# CNAME, if desired
Host: *.foobar.com
Answer: foobar.com
```

### Update config files

In `/etc/nginx/sites-available/landmarks` update:

```bash
servername: foobar.com;
```

And then:

```bash
# Test syntax is ok, then reload Nginx config
sudo nginx -t
sudo nginx -s reload
```

In `/var/www/landmarks/.env` update:

```bash
APP_URL=http://foobar.com
```

## Sub-domain

If using a subdomain, e.g. `baz.foobar.com`

### DNS

Create an A Record for `foobar.com` with:

```bash
Host: baz.foobar.com
Answer: 111.222.111.222
```

### Update config files

In `/etc/nginx/sites-available/landmarks` update:

```bash
servername: baz.foobar.com;
```

And then:

```bash
# Test syntax is ok, then reload Nginx config
sudo nginx -t
sudo nginx -s reload
```

In `/var/www/landmarks/.env` update:

```bash
APP_URL=http://baz.foobar.com
```
