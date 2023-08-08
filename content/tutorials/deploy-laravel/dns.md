---
title: "Set up a custom domain name for a Laravel web application"
prevFilename: "deploy-simple"
nextFilename: "https"
date: 2023-07-18
---


# Set up a custom domain name for a Laravel web application

{{< deploy-laravel/header >}}
{{< deploy-laravel/navbar >}}

This article covers setting up a custom domain name for your web app.

## Prerequisite

You own a domain, e.g. `foobar.com`, and can edit DNS records for the domain.

## Create a DNS A record

Log in to your DNS provider and create a DNS A Record for your domain name with the following content:

```bash
Host: foobar.com
Answer: 1.2.3.4
```

The `Host` field is your domain name; the `Answer` field is your server's IP address.

### Redirect subdomains to your root domain (Optional)

You might also want to redirect subdomains (`*.foobar.com`) to your root domain (`foobar.com`).

You can either redirect *all* subdomains to your root domain---in this case create a CNAME record with the following content:

```bash
Host: *.foobar.com
Answer: foobar.com
```

Or to redirect only specific subdomains create a CNAME record with `Host` set to the specific subdomain:

```bash
Host: baz.foobar.com
Answer: foobar.com
```

## Update config files

You need to update a few server-side config files to use your domain name.

### Nginx

In your site's Nginx config (`/etc/nginx/sites-available/laravel-project` if you're following along with the guide) add your domain name to the `servername` directive:

```bash
# All domain names and IP addresses that should point to your app
servername: 1.2.3.4 foobar.com;
```

Test the syntax of the updated Nginx config, then reload Nginx:

```bash
# Test syntax is ok, then reload Nginx config
sudo nginx -t
sudo nginx -s reload
```

### Laravel .env file

In your app's `.env` file (i.e. `/srv/www/laravel-project/.env`) set the `APP_URL` variable to your app's domain name:

```bash
APP_URL=foobar.com
```

## Moment of truth

Test your domain name with the DNS lookup tool of your choice.
You want the lookup to return an A record with your server's IP address.

I suggest using `dig`, in which case a successful test would look something like this:

```bash
# Perform a DNS lookup on your app's domain name
you@dev$ dig foobar.com
# A succesful lookup will include an ANSWER section with your server's IP address
;; ANSWER SECTION:
nutrianutrition.app. 600 IN A 1.2.3.4
```

If you've setup subdomain redirection you'll also want to see a corresponding CNAME record:

```bash
# Optional: DNS lookup to test subdomain redirection to your root domain
you@dev$ dig bar.foobar.com

# A succesful lookup will include an ANSWER section with a CNAME record with
# your app's root domain.
;; ANSWER SECTION:
bar.foobar.app. 600 IN CNAME foobar.com.
foobar.com. 600 IN A 1.2.3.4
```

{{< details summary="Your browser is not the best way to check DNS records." >}}
You might be tempted to test your domain name configuration by just pointing a web browser to your app's domain name.

But this can produce false negatives because most modern browsers will try to updgrade your connection to HTTPS and refuse to connect over plain HTTP.
In other words, your DNS records might be perfectly set up (i.e. your app's domain name redirects to the IP address of your app's server) and your browser reports a connection error only because you have not yet set up HTTPS (we'll do this in [the next article]({{< relref "https" >}})).

A dedicated DNS lookup utility like `dig` is, suprise, suprise, the best way to test DNS settings.
{{< /details >}}

{{< deploy-laravel/navbar >}}
