---
title: "Set up MySQL for a Laravel web application"
prevFilename: "lemp"
nextFilename: "git-server"
date: 2023-07-17
---

{{< deploy-laravel/navbar >}}

# Set up MySQL for a Laravel web application

{{< deploy-laravel/header >}}

This guide is opinionated and uses a LEMP stack.

## MySQL setup

```bash
# Secure the MySQL install---follow prompts and use common sense
sudo mysql_secure_installation

# Create a database and user for project
# (For unknown reason mysql -u root -p fails with root password specified in mysql_secure_installation)
sudo mysql
```

Create a database and user for project:

```sql
-- Create a database
CREATE DATABASE foo;

-- Create a password-protected user
CREATE USER 'foouser'@'localhost' IDENTIFIED BY 'supersecretpassword';

-- Grant user privileges on database
GRANT ALL PRIVILEGES ON foo.* TO 'foouser'@'localhost';
```
