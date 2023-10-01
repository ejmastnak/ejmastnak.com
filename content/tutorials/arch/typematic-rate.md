---
title: Key delay and repeat rate on X11 on Arch Linux
date: 2022-04-29
---

# Key delay and repeat rate on X11

{{< arch/header >}}

{{< date-last-mod >}}

**Goal:** Understand and control your typematic rate and typematic delay.
You'll usually do this to make pressed-down keys repeat faster.

**Dependencies:** This guide works on the X Window System.
You should first [set up X]({{< relref "/tutorials/arch/startx" >}}) if you have not yet done so.

**References:**

- [ArchWiki: Xorg/Keyboard configuration](https://wiki.archlinux.org/title/Xorg/Keyboard_configuration)
- [ArchWiki: Linux console/Keyboard configuration](https://wiki.archlinux.org/title/Linux_console/Keyboard_configuration)

### Typematic rate and delay

Context: Go to any location you can type text (a text editor, your web browser's search bar, etc.), then press and hold down a key.
After an initial delay, the key begins to repeat at a fixed rate.
The initial delay between key press and the onset of repetition is called *typematic delay*, and the time between key repeats once repetition begins is called *typematic rate*.

A typical typematic delay is around 500 milliseconds, and typical typematic rates are on the order of 20 to 30 hertz (20 to 30 key repetitions per second).

Problem: these default values are *too sluggish* for most power users;
this article shows how to speed them up.

### Set rate and delay in X11

You can set the X11 typematic delay and repeat using the `xset` program, as suggested in [ArchWiki: Xorg/Keyboard configuration/Using xset](https://wiki.archlinux.org/title/Xorg/Keyboard_configuration#Using_xset).
To set a 200 ms delay and 30 Hz repeat rate (for example), run the following in shell:

```bash
xset r rate 200 30
```

The default values (according to the ArchWiki) are 660 ms and 25 Hz; experiment to find what works for you.

To make you custom typematic settings permanent, you need to run the `xset` command at the start of every graphical session.
The exact way to do this depends on your setup;
on the X Window System, you place the line `xset r rate 200 30` in your `~/.xinitrc` (if you do *not* use a display manager for login) or your `~/.xprofile` (if you *do* use a display manager for login) before the line that starts your window manager or desktop environment.

```bash
# Place in ~/.xinitrc or ~/.xprofile to set for all X sessions
xset r rate 200 30

# Then start your window manager, e.g.
exec i3
```

(If you're new to running configuration commands on X startup, [check out the ArchWiki](https://wiki.archlinux.org/title/autostarting#On_Xorg_startup).

### Set rate and delay in the Linux console

This section applies to the console you see immediately after booting and logging in, but before starting a graphical session.
If you use a display manager to start X, you may never interact with the Linux console at all, and can probably skip this step.

You use `kbdrate` instead of `xset` to set typematic delay and rate for the Linux console.
The equivalent of `xset -r rate 200 30` is

```bash
sudo kbdrate -d 200 -r 30
```

You can use a `systemd` unit to make the change permanent at every boot.
I suggest following the ArchWiki's clear instructions at [ArchWiki: Linux console/Keyboard configuration/Systemd service](https://wiki.archlinux.org/title/Linux_console/Keyboard_configuration#Systemd_service).

<div class="mt-10">
{{< tutorials/backhome homehref="/tutorials/arch/about" >}}
</div>

<div class="mt-8">
    {{< tutorials/thank-you >}}
<div>

<div class="mt-6">
    {{< tutorials/license >}}
<div>
