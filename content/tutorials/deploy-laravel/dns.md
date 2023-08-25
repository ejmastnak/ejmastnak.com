---
title: "Set up a custom domain name for a Laravel web application"
prevFilename: "deploy"
nextFilename: "https"
date: 2023-07-18
---


# Set up a custom domain name for a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article covers setting up a custom domain name for your web app.
I'll use `mylaravelproject.com` as an example in this guide, but you should of course change this to whatever domain name you'll be using.

## Prerequisites

1. You have registered a domain name with a domain name registrar (Namecheap, Porkbun (my favorite!), etc.) and can edit DNS records for the domain.
1. Your app is live when you visit your server's IP address from a web browser (see [the previous article]({{< relref "deploy" >}}) in the series if not).

## Create a DNS A record

Log in to whatever domain name registrar you're using and create a DNS A Record for your domain name with the following content:

```bash
Host: mylaravelproject.com
Answer: 1.2.3.4
```

The `Host` field is your domain name; the `Answer` field is your server's IP address.

{{< details summary="Redirecting subdomains to your root domain (optional)" >}}
You might also want to redirect subdomains (`*.mylaravelproject.com`) to your root domain (`mylaravelproject.com`).

You can either redirect *all* subdomains to your root domain---in this case create a CNAME record with the following content:

```bash
Host: *.mylaravelproject.com
Answer: mylaravelproject.com
```

Or to redirect only specific subdomains create a CNAME record with `Host` set to the specific subdomain, for example:

```bash
Host: foo.mylaravelproject.com
Answer: mylaravelproject.com

Host: bar.mylaravelproject.com
Answer: mylaravelproject.com
```
{{< /details >}}

## Update your app's Nginx config file

You need to update your app's Nginx config file before you can visit your app at your domain name.

Open your site's Nginx config (`/etc/nginx/sites-available/laravel-project` if you're following along with the guide) and add your domain name to the `servername` directive:

```bash
# All domain names and IP addresses that should point to your app
servername: 1.2.3.4 mylaravelproject.com;
```

Test the syntax of the updated Nginx config, then reload Nginx:

```bash
# Test Nginx config syntax is ok, then reload config
laravel@server$ sudo nginx -t
laravel@server$ sudo nginx -s reload
```

## Update your `APP_URL`

Open your Laravel app's `.env` file and set the `APP_URL` variable to your app's domain name:

```bash
APP_URL=http://mylaravelproject.com
```

Then recache your app's config settings by running `php artisan config:cache` from your Laravel project root directory.

## Moment of truth

Test your domain name with the DNS lookup tool of your choice.
You want the lookup to return an A record with your server's IP address.
I suggest using `dig`, in which case a successful test would look something like this:

```bash
# Perform a DNS lookup on your app's domain name
you@dev$ dig mylaravelproject.com
# A succesful lookup will include an ANSWER section with your server's IP address
;; ANSWER SECTION:
nutrianutrition.app. 600 IN A 1.2.3.4
```

{{< details-warning summary="Your web browser is not the best way to check DNS records." >}}
You might be tempted to test your domain name configuration by just pointing a web browser to your app's domain name.
But a dedicated DNS lookup utility like `dig` is a better choice.

The problem with a browser is the risk false negatives: many modern browsers will try to upgrade your connection to HTTPS and refuse to connect over plain HTTP.
In other words, your DNS records might be perfectly set up, but your browser will report a connection error because you have not yet set up HTTPS (we'll do this in [the next article]({{< relref "https" >}})).

A dedicated DNS lookup utility like `dig` is, suprise, suprise, the best way to test DNS settings.
{{< /details-warning >}}

{{< details summary="If you're also testing subdomain redirection..." >}}
...you'll also want to see a corresponding CNAME record, for example:

```bash
# Optional: DNS lookup to test subdomain redirection to your root domain
you@dev$ dig bar.mylaravelproject.com

# A succesful lookup will include an ANSWER section with a CNAME record with
# your app's root domain.
;; ANSWER SECTION:
bar.mylaravelproject.app. 600 IN CNAME mylaravelproject.com.
mylaravelproject.com. 600 IN A 1.2.3.4
```

You can of course ignore this you haven't created any subdomain DNS settings for your site.
{{< /details >}}



{{< deploy-laravel/navbar >}}
