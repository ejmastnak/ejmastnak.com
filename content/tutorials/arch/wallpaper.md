---
title: Background wallpaper with feh on Arch Linux
date: 2022-05-07
---

# Set wallpaper with feh

{{< arch/arch-notes-header >}}

{{< date-last-mod >}}

**Goal:** learn how to programmatically set an image as your background wallpaper in the X window system, then (optionally) create a slideshow to cycle the wallpaper through a set of images.

**Dependencies:** This guide works on the X Window System.
You should first [set up X]({{< relref "/tutorials/arch/startx" >}}) if you have not yet done so.

**References:**

- [ArchWiki: feh](https://wiki.archlinux.org/title/feh)
- `man feh`

## Set wallpaper to an arbitrary image file

You can set your background wallpaper using the `feh` image viewer.
First install the [`feh` package](https://archlinux.org/packages/extra/x86_64/feh/).
You can then set the background to an arbitrary image file with the command:

```bash
feh --bg-fill 'path/to/image.jpg' 
```

**Details**

- Using `--bg-fill` fills the image into your background without repeating it or using borders, and preserves the image's aspect ratio.
  You could also experiment with related `feh` commands like `--bg-center`, `--bg-scale`, and `--bg-tile`; see the `BACKGROUND SETTING` section of `man feh` for details.

- Supported formats: `feh` supports the JPEG, PNG, and TIFF (among others), which should cover most use cases.
  See the `SUPPORTED FORMATS` section in `man feh` for more on supported formats.

## Make wallpaper persist after reboot

Context: a wallpaper set with `feh` will disappear after exiting your X session (e.g. after rebooting).
This section shows how to make your wallpaper persist between reboots.

The `feh` background setting commands (e.g. `--bg-fill` above) save the exact `feh` command needed to reproduce the last-set wallpaper in the simple shell script file `~/.fehbg`.
You can then run `~/.fehbg` when starting X to reproduce the last set background.

You'll probably want to run `~/.fehbg` automatically from an X startup file.
Simply place the line `~/.fehbg &` in your `~/.xinitrc` file (if you start X with the `startx` program) or your `~/.xprofile` file (if you start X with a display/login manager) before the line that starts your window manager or desktop environment, i.e.

```bash
# This code would go in your ~/.xinitrc or ~/.xprofile

# Set wallpaper with feh
~/.fehbg &
```

The appending `&` character ensures that `~/.fehbg` runs as a background process to avoid halting the X start-up.

**Check-in point:** first, you should be able to set your wallpaper with some variant of `feh --bg-fill image.jpg`, and this command should create an executable `.fehbg` script in your home directory.
Second, placing the line in your X startup file should make the last-set wallpaper persist after restarting X.

## Create a random slideshow from a set of image files

Goal: create a "wallpaper slideshow" that changes the background wallpaper every few minutes, which the background image chosen at random from a directory of image files.

(Of course, using a slideshow only makes sense when you can see your desktop background, e.g. if using transparent windows, gaps, or floating windows.)

### Shell command

First create a dedicated wallpaper directory and fill it with images you would like to use as wallpapers.
I'll use the location `~/Pictures/wallpapers` in this guide, but any readable location on your file system should work fine.

The relevant wallpaper-setting command here is:

```bash
DISPLAY=:0 feh --no-fehbg --bg-fill --randomize ~/Pictures/wallpapers/*.jpg
```

This command sets the background to an image chosen randomly from all files with the `jpg` extension inside the `wallpapers` directory.
Some comments:

- You can of course update the glob matching pattern as needed, e.g. `*.png` to match PNG files, `*.{png,jpg}` for both PNG and JPEG files, `*` to match all files, etc.
- `--randomize` is a randomization flag documented in the `OPTIONS` section of `man feh`.
- `DISPLAY=:0` ensures the `feh` command applies to the primary X display on the local computer.
  You could adjust the value of `DISPLAY` to also set the wallpaper on multi-monitor setups.

Try repeatedly running the script manually and checking that your background updates accordingly.
You then just need to wrap the above command in a `systemd` timer and you have a working slideshow.

### systemd timer

Goal: create a `systemd` service/timer pair to periodically run the above wallpaper-setting command over a time interval of your choice.
Note that the rest of this guide closely parallels this series's [battery alert guide]({{< relref "/tutorials/arch/battery-alert" >}}), since both use a `systemd` timer to run a `Type=oneshot` user service.

First create the shell script `~/scripts/change-wallpaper.sh` (or use any other readable location on your file system), make the script executable, and inside place the wallpaper-setting command:

```bash
#!/bin/sh
# This file lives at `~/scripts/change-wallpaper.sh`
# Sets background wallpaper of X display :0 to a random JPG file chosen from
# the directory `~/Pictures/wallpapers`
DISPLAY=:0 feh --no-fehbg --bg-fill --randomize ~/Pictures/wallpapers/*.jpg
```

Then create the `systemd` user service `~/.config/systemd/user/change-wallpaper.service`, and inside it place the following:

```systemd
[Unit]
Description=Change the wallpaper on X display :0
Wants=change-wallpaper.timer

[Service]
Type=oneshot
# Adjust path to script as needed
ExecStart=/bin/sh ~/scripts/change-wallpaper.sh

[Install]
WantedBy=graphical.target
```

This service unit runs the `change-wallpaper.sh` script; setting the unit's `Type` to `oneshot` ensures the battery alert service completes before any other `systemd` units run; `Type=oneshot` is standard practice for units that start short-running shell scripts.
The `~/.config/systemd/user` directory is the standard location for user units.

Next create the corresponding `systemd` user timer `~/.config/systemd/user/change-wallpaper.timer`, and inside it place the following:

```systemd
[Unit]
Description=Change the wallpaper on X display :0 every few minutes
Requires=change-wallpaper.service

[Timer]
# Changes wallpaper every 5 minutes; adjusts as needed
OnActiveSec=5m
OnUnitActiveSec=5m

[Install]
WantedBy=timers.target
```

This timer will run the `change-wallpaper` service 5 minutes after the timer first activates (from `OnActiveSec`), and then periodically every 5 minutes after that (from `OnUnitActiveSec`).
You may want to set short intervals (e.g. ten seconds `10s`) when testing that the timer works properly, then set a longer time after that.

Use `deamon-reload` to tell `systemd` you've created new unit files, then start and enable the timer service:

```bash
systemctl --user daemon-reload
systemctl --user enable --now change-wallpaper.timer

# Optionally check that the timer is active
systemctl --user list-timers
```

Note that you only enable and start the `change-wallpaper.timer` unit and not the `.service` unit.
The wallpaper slideshow should be ready after this step.

{{< arch/arch-notes-footer >}}
