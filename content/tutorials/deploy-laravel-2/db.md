---
title: "Set up MySQL, PostgreSQL, or SQLite for a Laravel web application"
date: 2023-07-17
prevFilename: "server-setup-app#directory-structure"
nextFilename: "server-setup-app#env"
---

# Set up MySQL, PostgreSQL, or SQLite for a Laravel web application

{{< deploy-laravel/header2 >}}
<div class="mt-4 mb-10">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

This article covers the basic set up of a database management system.

I've included sections on three common DBMs---use whichever you prefer out of:

1. [MySQL (MariaDB)](#mysql)
1. [PostgreSQL](#psql)
1. [SQLite](#sqlite)

If you're using MySQL, you might also like [Digital Ocean's guide to setting up MySQL on an Ubuntu machine](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04), which covers similar material.

## MySQL {#mysql}

You should already have MySQL installed and running if you've been following along with the guide.

You then need to create a database to store your web app's data and a database user to interact with the database.
To do this, first log in to the MySQL shell using the root DB account:

```bash
# Log in to the MySQL shell using the root MySQL account
root@server$ sudo mysql
```

Then create a dedicated database and DB account for your web app.

{{< details summary="Disclaimer: I'm showing a simple setup" >}}
I'm showing only a basic setup in this guide, encompassing:

- Password-based authentication using MySQL's default authentication plugin ([`caching_sha2_password`](https://dev.mysql.com/doc/refman/8.0/en/caching-sha2-pluggable-authentication.html) at the time of writing).
- Granting all privileges on the web app's DB to the non-root account.
  Note: we're intentionally restricting the non-root account's privileges to only the web app's database (i.e. using `GRANT ALL PRIVILEGES ON laraveldb.*`) and not granting privilege for *all* databases on the server (which would be `GRANT ALL PRIVILEGES ON *.*`).

This is all you need to run a Laravel web app and should work well for most users, but keep in mind that there are many more possible authentication methods and privilege grants to choose from.
Consider reading through [these](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04) [two](https://www.digitalocean.com/community/tutorials/how-to-create-a-new-user-and-grant-permissions-in-mysql) Digital Ocean guides if you're new to managing MySQL databases.
{{< /details >}}

```sql
-- Create a database for your web app.
-- (Update the database name as desired.)
CREATE DATABASE laraveldb;

-- Create a dedicated DB account to manage the app's DB.
-- (Update the account's username and password as desired.)
CREATE USER 'laravel'@'localhost' IDENTIFIED BY 'supersecretpassword';

-- Grant the DB user all privileges on the app's database
GRANT ALL PRIVILEGES ON laraveldb.* TO 'laravel'@'localhost';
```

{{< details summary="Hardening your MySQL installation with `mysql_secure_installation`" >}}
**TLDR:** read the warning about `mysql_secure_installation` in [this Digital Ocean article](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04#step-2-configuring-mysql), perform the suggested temporary change of `root@localhost`'s authentication method to `mysql_native_password`, then run:

```bash
# ASSUMING you've allowed password authentication for the root account, just
# follow the prompts and use common sense.
laravel@server$ sudo mysql_secure_installation
```
**End TLDR**

It's best practice to secure your MySQL install using the `mysql_secure_installation` tool.

But at the time of writing, this is complicated by a clash between `mysql_secure_installation` and Ubuntu's default MySQL settings: namely, `mysql_secure_installation` attempts to set a password for the root database account, but by default this account is only allowed to authenticate using Unix socket authentication (i.e. [MySQL's `auth_socket` method](https://dev.mysql.com/doc/mysql-secure-deployment-guide/8.0/en/secure-deployment-configure-authentication.html)).

You can get around this by tweaking some MySQL config settings, but it takes manual intervention on your part.
Digital Ocean has already covered this, so I refer to their guide ([here you go](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-20-04#step-2-configuring-mysql)) and see no reason to repeat the same information here.
{{< /details >}}

You should then be able to log in to a MySQL shell:

```bash
# Log in to MySQL shell; connect to just-created database with just-created account.
# Specify password when prompted.
laravel@server$ mysql -D laraveldb -u laravel -p
```

## PostgreSQL {#psql}

You should already have PostgreSQL installed and running if you've been following along with the guide.

You then need to create a database to store your web app's data and a database user to interact with the database.
To do this, first log in to the PostgreSQL shell:

```bash
# Log in to the PostgreSQL shell using the `postgres` PostgreSQL account.
# We do this by first switching to the `postgres` Linux user,
# then running the `psql` command as the `postgres` Linux user
laravel@server$ sudo --login --user=postgres
postgres@server$ psql

# Note: you could also do that in one shot with:
root@server$ sudo -u postgres psql
```

{{< details summary="About logging in to PostgreSQL and why we switch to the `postgres` user" >}}
Logging in to PostgreSQL can (understandably) be a bit confusing for new users. 

Here's everything involved in a PostgreSQL connection:

- A PostgreSQL database
- A PostgreSQL user account
- A host and port number
- A [connection type](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)
- An [authentication method](https://www.postgresql.org/docs/current/auth-methods.html)

(Most of these are set implicitly, so beginner users are not aware of them---this causes confusion upon encountering problems that require knowing what's going on under the hood.)

First some background: the PostgreSQL installation, among other things, creates:

- A Linux user called `postgres` (you can confirm this by checking the bottom of the `/etc/passwd` file, which keeps track of Linux users, after installing PostgreSQL).
- A PostgreSQL account, also called `postgres`.
- A PostgreSQL database, *also* called `postgres`.
- A `psql` binary, often in `/usr/bin/psql`.

When you run `psql` without explicitly specifying a database, PostgreSQL user, host, or port, `psql` will try to log you into the PostgreSQL shell:

- as the PostgreSQL user whose username matches the username of the *Linux* user who ran the `psql` command (using [peer-based authentication](https://www.postgresql.org/docs/current/auth-peer.html), which relies precisely on the Linux user's and PostgreSQL user's names matching),
- connected to the database whose name matches the username of the *Linux* user who ran the `psql` command,
- on port 5432, the default PostgreSQL [port number](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers),
- using a Unix domain socket connection (the `local` connection type in the [`pg_hba.conf` file](https://www.postgresql.org/docs/current/auth-pg-hba-conf.html)) on the local host.

(The last two bullet points fall beyond the scope of this tutorial and require some networking background, so don't worry if you don't understand them.)
My goal here is mainly for you to understand why we switch to the `postgres` Linux user before running `psql`.

Well, our goal is to log in to the PostgreSQL shell as the `postgres` PostgreSQL user, connected to the default `postgres` database.
We've mentioned that, by default, `psql` will connect you to the database and PostgreSQL account matching the name of the *Linux* user who ran the `psql` command, so running `psql` as the `postgres` Linux user ensures we connect to the `postgres` database as the `postgres` PostgreSQL user.

(And why connect with the `postgres` PostgreSQL account in the first place? Answer: `postgres` is the PostgreSQL superuser account (like the `root` Linux account) that is used to create new databases and other users.)
{{< /details >}}

{{< details summary="Some helpful tools and documentation" >}}

- You can show `psql` connection info by running `\conninfo` after connecting to a PostgreSQL shell.
- `psql`'s `-U` option lets you log in to the PostgreSQL shell as a custom user (but will need appropriate permissions/authentication).
- `psql`'s `-d` option lets you connect to a custom database
- `psql`'s `-h` option lets you connect to a specific host, and can be used to attempt a host-based connection.
- The comments in the `pg_hba.conf` file nicely summarize practical use of various authentication methods and connection types (you can locate the file by running `SHOW hba_file;` as a superuser from a PostgreSQL shell).
  (The `pg_hba.conf` file is where you configure PostgreSQL authentication, but you should know what you're doing before editing it.)
- [Chapter 21 of the PostgreSQL manual](https://www.postgresql.org/docs/current/client-authentication.html) thoroughly covers authentication in PostgreSQL.
  This is where to go if you're curious about things like connection types and authentication methods beyond the cursory info in this article.
{{< /details >}}

Then create a dedicated database and DB account for your web app (remember the semicolons---the PostgreSQL shell is picky).

```sql
-- Create a database for your web app.
-- (Update the database name as desired.)
postgres=# CREATE DATABASE laraveldb;

-- Create a dedicated DB account to manage the app's DB.
-- (Update the account's username and password as desired.)
postgres=# CREATE USER laravel WITH ENCRYPTED PASSWORD 'supersecretpassword';

-- A simple way of granting the DB user privileges on the app's database---we
-- just make the user the owner of the database.
postgres=# ALTER DATABASE laraveldb OWNER TO laravel;
```

{{< details summary="Disclaimer: this setup is simple" >}}
I'm showing only a basic setup in this guide, encompassing:

- Password-based authentication (that will only work with local host-based connections on the server).
  This means you'll need to add an `-h` flag when using `psql`.
- Giving the PostgreSQL user permissions to interact with the app's database by simply making the user the owner of the database.

This is all you need to run a Laravel web app and should work well for most users, but keep in mind that there are many more possible authentication methods and privilege grants to choose from.
If inspired consider reading through the PostgreSQL docs on [client authentication](https://www.postgresql.org/docs/current/client-authentication.html) and [available privileges](https://www.postgresql.org/docs/current/sql-grant.html), as well as [this StackOverflow answer](https://stackoverflow.com/a/24923877) and the references therein.
{{< /details >}}

You should then be able to log in to a PostgreSQL shell as follows:

```bash
# Log in to PostgreSQL shell and connect to just-created DB.
# IMPORTANT: you need the `-h` flag to initiate a host-based connection.
# Specify password when prompted.
laravel@server$ psql -U laravel -d laraveldb -h localhost
```

{{< details-warning summary="You need the `--host` flag!" >}}
Assuming you're following along with the guide, you need the `-h` flag (short for `--host`) to initiate a local host-based connection;
`psql` would otherwise attempt a socket-based connection using `peer` authentication, which will fail because of how we've set up the PostgreSQL user combined with the default settings in `pg_hba.conf`.
(Although explaining the details of PostgreSQL authentication modes falls beyond the scope of this article.)
{{< /details-warning >}}

## SQLite {#sqlite}

SQLite is straightforward compared to MySQL and PostgreSQL---since SQLite doesn't use a database server, we don't have to deal with account and privilege management.

You just need to create a `*.sqlite` database file and a directory to hold it:

```bash
# Create a directory to hold your database file
laravel@server$ sudo mkdir -p /srv/www/laravel/shared/sqlite

# Create a blank database file
laravel@server$ cd /srv/www/laravel/shared/sqlite
laravel@server$ sudo touch database.sqlite
```

**Next:** The next article covers a few ownership and permission settings needed to run a Laravel app.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/deploy-laravel-2" index="about" >}}
</div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>
