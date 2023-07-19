---
title: "Set up a maintenance mode splash page for a Laravel web app"
prevFilename: "env"
nextFilename: "double-check"
date: 2023-07-18
---

{{< deploy-laravel/navbar >}}

# Set up a maintenance mode splash page for a Laravel web app

{{< deploy-laravel/header >}}

**Context:**
Whenever you redeploy your website, your site will be temporarily unavailable and display a generic 503 error.

We will replace this with a more descriptive a message along the lines of "Updating website, check back soon." that displays in Laravel maintenance mode (i.e. during `php artisan down` when deploying new code).

This step is completely optional and is only meant to give users a better experience if they happen to visit your site in maintenance mode.

References

- https://laravel.com/docs/10.x/configuration#maintenance-mode
- https://5balloons.info/artisan-down-and-maintenance-page-customisation-in-laravel

On development machine, copy default Laravel error pages from the `vendor` directory to `resources/views/errors` so that you can customize them.

```bash
# Copies error pages from Laravel framework vendor directory
# to resources/views/errors, where you can customize them.
php artisan vendor:publish --tag=laravel-errors
```

Then customize `/resources/views/errors/503.blade.php` to your liking.

The error pages uses the Blade templating engine; it's probably best to continue working in Blade, but it should also be possible to use vanilla HTML.
**TODO:**  confirm plain HTML works.

I made this change to 503 error template:

```php
<?php
// 503.blade.php
@extends('errors::minimal')
@section('title', __('Check Back Soon!'))
@section('code', '503')
@section('message', __('Unavailable due to maintenance'))
@section('details', __('Check back soon—the website is being updated and should be live within a few minutes.'))
```

And made this tweak in `minimal.blade.php` to accept the `details` parameter.

```html
<!-- minimal.blade.php -->
<div class="max-w-xl mx-auto sm:px-6 lg:px-8">
    <div class="flex items-center pt-8 sm:justify-start sm:pt-0">
        <div class="px-4 text-lg text-gray-500 border-r border-gray-400 tracking-wider">
            @yield('code')
        </div>

        <div class="ml-4 text-lg text-gray-500 uppercase tracking-wider">
            @yield('message')
        </div>
    </div>

    <div class="mt-2 ml-4 text-sm text-gray-500">
        @yield('details')
    </div>
</div>
```

The updated 503 error page should then display during `php artisan down` and disappears after `php artisan up` (you can test this either on your development machine or on the server after pushing the updated code).

Consider also prerendering the 503 error message template before running `artisan down`:

**TODO:** add source and what this does (precompiles for more reliable/efficient display?)

```bash
php artisan down --render="errors::503"
```
