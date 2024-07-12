---
title: "Deploy a Laravel and Vue web app"
date: 2023-07-17
---

# A guide to deploying a Laravel and Vue.js web app

This is a guide to deploying a [Laravel](https://laravel.com/) web application with a JavaScript-based frontend.
The guide will take you from a fresh Linux server to a fully-functioning Laravel application served over HTTPS from a custom domain name with automated redeployment.

## Before you start... {#prerequisites}

This tutorial is written with the expectation that:

- You're prepared to operate in a Linux command line environment.
- You have root access to a Linux server on which you will host your app.
- You can access the server over SSH and have the basic SSH knowledge required to do so (e.g. generating a public/private keypair; copying your public key to the `authorized_keys` file on the server; logging in over SSH).

## The guide

This guide is divided into four parts, which you should read through in sequence, beginning with part 1.

- Part 1: [Steps taken on your server *once per server* ]({{< relref "server-setup-once" >}}) (start here)
- Part 2: [Steps taken on your server *once per Laravel application*]({{< relref "server-setup-app" >}})
- Part 3: [Deploying your application for the first time]({{< relref "deployment" >}})
- Part 4: [Automating redeployment]({{< relref "redeployment" >}})

## More about the tutorial {#about}

### Why write this?

My goal in writing this was to document the process for my future reference and hopefully help anyone else doing the same thing along the way.

### Tech stack used in this tutorial

- Server: either a [virtual private server](https://en.wikipedia.org/wiki/Virtual_private_server) (e.g. a Digital Ocean droplet) or a physical server, running a Debian-based Linux distro (e.g. Debian, Ubuntu).
- Backend: [Laravel](https://laravel.com/)
- Web server: [Nginx](https://www.nginx.com/)
- Database: your choice of [MySQL](https://www.mysql.com/)/[MariaDB](https://mariadb.org/), [PostgreSQL](https://www.postgresql.org/), [SQLite](https://www.sqlite.org/index.html)
- Frontend: Any JavaScript-based framework (e.g. [Vue](https://vuejs.org/), [React](https://react.dev/), etc.) for which you could reasonably define an `npm run build` script.
  The frontend has a relatively minor role in this guide.

### Conventions {#conventions}

I'll generally show shell prompts in `username@host$` format, and sometimes append the current working directory `username@host:cwd$` for clarity:

```bash
# You on your development machine
you@dev$ whoami
you

# A shell command issued as root user on the server
root@server$ whoami
root

# A shell command issued as laravel user on the server
laravel@server$ whoami
laravel

# A shell command issued as laravel user from home directory
laravel@server:~$ pwd
/home/laravel

# A shell command issued as laravel user from /var/www
laravel@server:/var/www$ pwd
/var/www
```

Other conventions:

- I'll use `1.2.3.4` as a server IP address.
- I'll use `laravel` as the name of the non-root user on your app's server and as the name of your project's root serverside directory.

### Feedback, suggestions, etc. {#feedback}

If you have ideas for improving the series, I will quite likely implement them, appreciate your input, and give you a shoutout for your contributions.
Feedback is welcome and appreciated.

Shoutouts to readers: many thanks to [Nicola Pugliese](http://www.nicolapugliese.com/) and [Kai Breucker](https://bonfireatnight.github.io/index.html) for catching mistakes and offering good ideas on how improve this series.

You can reach me by email at [elijan@ejmastnak.com](mailto:elijan@ejmastnak.com) or by opening an issue or pull request at [github.com/ejmastnak/ejmastnak.com](https://github.com/ejmastnak/ejmastnak.com)).

### Want to say thank you? {#thank-you}

You could:

- [Send me an email!]({{< relref "/contact" >}})
  Seriously, if this material helped you, it will make my day to know.
  I love hearing from readers, and you'll almost certainly get a message back from me.

- [Contribute financially.](https://www.buymeacoffee.com/ejmastnak)
  Based on reader input, there are in fact people out there interested in compensating me financially for this guide.
  That's awesome---thank you!
  You can [Buy Me a Coffee here.](https://www.buymeacoffee.com/ejmastnak)

## Other guides

Below is a list of other great guides to deploying a Laravel app that I've found online and taken inspiration from.
Each covers the material from a slightly different angle, so you'll probably get something out of reading all of them.

- [Loris Leiva's guide to zero-downtime redeployment](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/deploy-with-zero-downtime)
- [Farhan Hasin Chowdhury's guide to deploying a Laravel web app on a VPS](https://adevait.com/laravel/deploying-laravel-applications-virtual-private-servers)
- [J. Alexander Curtis's guide to deploying a Laravel 5.3 app on a LEMP stack](https://devmarketer.io/learn/deploy-laravel-5-app-lemp-stack-ubuntu-nginx/)).

## Historical note

Full disclosure: this guide is a rewrite of an older version I had published in the summer of 2023, which I replaced in the summer of 2024 with the current version, which you are reading now.
[Here is the old version, if you are curious]({{< relref "/tutorials/deploy-laravel/about" >}}).

The old version covered the same material, but presented it in an order I later realized was scattered and unstructured, jumping around from dev machine to app-specific server settings to global server settings and back in a rather chaotic way, sometimes overwriting steps taken earlier in the tutorial.

The current version is more streamlined and follows a logical progression from global server settings to app-specific server settings to deployment, which also reflects how I currently deploy my Laravel apps after a few years' experience.

<div class="my-8">
{{< tutorials/begin href="/tutorials/deploy-laravel-2/server-setup-once" >}}
</div>

<div class="mt-6">
  {{< tutorials/license >}}
<div>
