---
title: "Arch Linux Post-Installation Configuration"
date: 2022-04-29
---

# Find Your Footing After Installing Arch Linux

**What you're reading:** Bite-sized, actionable tutorials to help you set up a functional work environment after a minimal install of Arch Linux.
The material should be applicable, with adjustments to package installation, to most `systemd`-based Linux distros.

**Purpose:** improve the transition and onboarding experience for new users.

{{< details summary="**What about the ArchWiki** (click to expand)" >}}
I’ve tried to address the following issue:
the ArchWiki, kind of like the Unix `man` pages, is the best place to go when you know what you’re doing and what you’re looking for,
but can be intimidating to new users because of the sheer amount of information, the lack of strong opinions on how to approach a given topic, and the need to read multiple cross-linked articles before fully understanding a concept.

This series is *intentionally* opinionated, and leans towards a minimalistic setup of the i3 window manager with the X Window System.
It aims to make you quickly functional by teaching atomic tasks in self-contained, immediately actionable articles.

Spending hours hopping through the ArchWiki’s cross-referenced articles is great---that’s how I learned myself---but in hindsight I’d argue that it’s not excessive hand-holding to first walk a new user through reliably connecting to the Internet, using their monitor, copying and pasting text, and confidently performing the handful of other basic, generally taken-for-granted tasks needed to find your footing on Arch Linux.
{{< /details >}}

**X11 Warning:** most of these tutorials involve the X Window System in one form or another, so Wayland users may have to look elsewhere.

## Useful basics

[**Make Caps Lock useful**]({{< relref "caps2esc" >}})
<br>
Remap your Caps Lock key to Escape when pressed alone and Control when pressed in combination with other keys.
Your pinky will thank you.

[**Network**]({{< relref "network-manager" >}})
<br>
Connect to the Internet via WiFi or Ethernet using NetworkManager.

[**X Window System**]({{< relref "startx" >}})
<br>
Set up a minimal graphical environment using the Xorg display server and the i3 window manager.

[**USB**]({{< relref "usb" >}})
<br>
Read from, write to, and safely eject external USB drives.

[**Battery alert**]({{< relref "battery-alert" >}})
<br>
Get a desktop notification to *Charge your battery!* for low battery levels.

[**Copy and paste**]({{< relref "copy-paste" >}})
<br>
A unified clipboard experience across your GUI applications, the Alacritty terminal, and Vim.

[**Type faster**]({{< relref "typematic-rate" >}})
<br>
Change your typematic rate and typematic delay---basically make pressed-down keys repeat faster---in X and in the console.

## Graphics

[**Control laptop backlight brightness**]({{< relref "backlight" >}})
<br>
Change your laptop's backlight brightness with your keyboard function keys.

[**External monitor I: First steps**]({{< relref "displays" >}})
<br>
Make your display appear on an external monitor.

[**External monitor II: Hotplugging**]({{< relref "monitor-hotplug" >}}) <br>
Automatically switch display to an external monitor after plugging in an HDMI or DisplayPort cable.

## Media

[**Media player control**]({{< relref "playerctl" >}})
<br>
Play, pause, and skip music/videos system-wide with a single press of your keyboard.

[**Control volume**]({{< relref "volume" >}})
<br>
Change audio volume with your keyboard function keys.

## Eye candy

[**Background wallpaper**]({{< relref "wallpaper" >}})
<br>
Set your background wallpaper to an image of your choice, or to a slideshow of images.
Best served with transparent windows and `i3gaps`.

[**Transparent windows**]({{< relref "picom" >}})
<br>
Use the `picom` compositor to make unfocused window backgrounds slightly transparent, so you can enjoy your background wallpaper.
