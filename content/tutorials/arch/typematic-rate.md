---
title: Key delay and repeat rate on X11 on Arch Linux
date: 2022-04-29
---

# Key delay and repeat rate on X11

{{< arch/arch-notes-header >}}

{{< date-last-mod >}}

**Goal:** Understand and control your typematic rate and typematic delay.
You'll usually do this to make pressed-down keys repeat faster.

**Dependencies:** This guide works on the X Window System.
You should first [set up X]({{< relref "/tutorials/arch/startx" >}}) if you have not yet done so.

**References:**

- [ArchWiki: Xorg/Keyboard configuration](https://wiki.archlinux.org/title/Xorg/Keyboard_configuration)
- [ArchWiki: Linux console/Keyboard configuration](https://wiki.archlinux.org/title/Linux_console/Keyboard_configuration)

### Typematic rate and delay

Go to the browser's URL bar, then press and hold down a key.
After an initial delay, the key begins to repeat at a fixed rate.
The initial delay between key press and the onset of repetition is called *typematic delay*, and the time between key repeats once repetition begins is called *typematic rate*.

A typical typematic delay is a few hundred milliseconds.
Typematic rates tend to be faster, and are usually measured in hertz; 20 to 30 Hz (20 to 30 key repetitions per second) are common values.

### Set rate and delay in X11

You can set the X11 typematic delay and repeat using the `xset` program, as suggested in [ArchWiki: Xorg/Keyboard configuration/Using xset](https://wiki.archlinux.org/title/Xorg/Keyboard_configuration#Using_xset).
To set a 200 ms delay and 30 Hz repeat rate (for example), run the following in shell:

```bash
xset r rate 200 30
```

The default values (according to the ArchWiki) are 660 ms and 25 Hz; experiment to find what works for you.

To make this change permanent, add the `xset` command to your `~/.xinitrc` before starting your window manager or desktop environment.

```bash
# Place in ~/.xinitrc to set for all X sessions
xset r rate 200 30

# Then start your window manager, e.g.
exec i3
```

### Set rate and delay in the Linux console

Scope: the console you see immediately after booting and logging in, but before starting X.
If you use a display manager to start X, you may never interact with the Linux console at all, and can probably skip this step.

You use `kbdrate` instead of `xset` to set typematic delay and rate for the Linux console.
The equivalent of `xset -r rate 200 30` is

```bash
sudo kbdrate -d 200 -r 30
```

You can use a `systemd` unit to make the change permanent at every boot.
I suggest following the ArchWiki's clear instructions at [ArchWiki: Linux console/Keyboard configuration/Systemd service](https://wiki.archlinux.org/title/Linux_console/Keyboard_configuration#Systemd_service).

{{< arch/arch-notes-footer >}}
