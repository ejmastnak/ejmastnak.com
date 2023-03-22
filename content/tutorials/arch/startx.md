---
title: Install and start Xorg on Arch Linux
date: 2022-05-03
---

# Install and start Xorg

{{< arch/arch-notes-header >}}

{{< date-last-mod >}}

**Goal:** Set up a minimal working graphical environment using the X Window System, the i3 window manager, and a terminal emulator of your choice;
and help you understand and navigate the choices between window managers, desktop environments, and display managers.

**Context:** After installing of Arch and logging in, you'll find yourself in a Linux console running a command-line shell, in which you can interact with your operating system using text-based commands.
You'll need a *[window system](https://en.wikipedia.org/wiki/Windowing_system)* to do much more than that (e.g. run a web browser, use a standard terminal emulator, read PDFs, have windows appear on your screen, etc.).
Most anything associated with modern desktop computing requires a window system.

**References:**

- [ArchWiki: Xorg](https://wiki.archlinux.org/title/Xorg): the server for the X Window System
- [ArchWiki: xinit](https://wiki.archlinux.org/title/Xinit): used to start an X session from the login shell after a text-based login
- [ArchWiki: Display manager](https://wiki.archlinux.org/title/display_manager): a GUI alternative to a text-based login that can also start X
- [ArchWiki: Window manager](https://wiki.archlinux.org/title/Window_manager): manages appearance of windows within a window system
- [ArchWiki: Desktop environment](https://wiki.archlinux.org/title/desktop_environment): a bundle of desktop-related software that includes a window manager

{{< toc level="2" title="Contents of this article" >}}

## What's involved

*Feel free to skip the introductory theory and [skip directly to installing stuff]({{< relref "#install" >}}).*

### Making sense of all the Xs

Note: for most users the technical details in this section don't matter much once you actually begin using a window system, and you usually won't think about them or need them from the perspective of an everyday user.
But I'm including this section because it might help to have a general idea of what's going on.

Confusingly, the X Window System, display server, and display server communication protocol are all called X in everyday usage.
[Wikipedia](https://en.wikipedia.org/wiki/Windowing_system) [does](https://en.wikipedia.org/wiki/X_Window_System) [a good job](https://en.wikipedia.org/wiki/X.Org_Server) of explaining what's involved;
here's my everyday-language summary:

- **What's involved:**

  A *window system* makes it possible for windows, icons, menus, mouse pointers, and other graphical elements to appear on a computer screen and interact with the user.
  The main component of a window system is a *display server*.

  The display server is the connection point between the user and all graphical applications that display their content in a window (e.g. browsers, word processors, terminal emulators, and any other GUI application); these graphical applications are called *clients* of the display server.
  The display server and its clients communicate using a display server *communication protocol*.

- **What happens:**
  The user, via physical input devices (keyboard, mouse, touchscreen, etc.), sends input to the operating system kernel.
  The display server receives this input from the operating system kernel, processes the information, and transmits it to the correct client application.

  The display server also receives information from its client applications, processes it, and outputs this information as pixels to the computer screen for the user to see.

- **How this relates to X:** 
  The X Window System is a type of window system;
  Xorg is the current implementation of the display server used in the X Windows System;
  Xorg communicates with client applications using the X display server protocol.
  All of these things are colloquially called X :)

  Note: the only established alternative to the X Window System is [Wayland](https://wiki.archlinux.org/title/Wayland).
  Wayland may well replace X in the future, but at the time of writing X is still the de-facto standard for a window system, and the tutorials in thes series all use X.

### Choices: Standalone window manager vs. desktop environment

To get a working window system, you'll need to install both a display server and a [window manager](https://wiki.archlinux.org/title/Window_manager).
A window manager controls the appearance, placement, stacking, tiling, etc. of windows, and will usually also provide multiple workspaces.
The two common choices are:

1. install a standalone window manager, or
1. install a desktop environment, which will include a window manager.

A [desktop environment](https://wiki.archlinux.org/title/desktop_environment) (DE) is a bundle of well-integrated desktop-related software.
A DE always includes a (potentially boring) window manager, and might also include toolbars, a dock, status bar, widgets, icons, an application launcher, a terminal emulator, a file browser, etc.

Common DEs include [GNOME](https://wiki.archlinux.org/title/GNOME), [KDE Plasma](https://wiki.archlinux.org/title/KDE), and [Xfce](https://wiki.archlinux.org/title/Xfce) (there are [many more](https://wiki.archlinux.org/title/desktop_environment#List_of_desktop_environments));
common standalone window managers include [Bspwm](https://wiki.archlinux.org/title/Bspwm), [i3](https://wiki.archlinux.org/title/I3), and [dwm](https://wiki.archlinux.org/title/Dwm)
(there are [*many, many* more](https://wiki.archlinux.org/title/Window_manager#List_of_window_managers)).

I lied above.
You really have three choices, not two:

1. Install a DE and use its default window manager, which will do the job but might be boring. (Every DE will have a built-in window manager.)
   Desktop-related bells and whistles will be set up for you without requiring much work on your part.
   <br>
   Typical DE use case: you don't want to install and configure its components individually, and don't mind potentially less customizability, a larger memory footprint, and (\*shudder\*) a bit more "bloat".

1. Install a standalone window manager, then install any desired tool bars, widgets, etc. individually.
   You get a cool window manager and maximum customizability.
   This is what I'll do in this tutorial.

1. Install a DE *and* a separate stand-alone window manager, and use the stand-alone window manager instead of the default DE version.
   In principle you get the convenience of a DE and the full functionality of a cool window manager, 
   but in practice getting a DE and separate window manager to play nicely together is often difficult and best left to more advanced users.

Need help choosing a desktop environment or window manager?
You can browse through a bunch of options on Ermanno Ferrari's excellent [desktop customization playlist](https://www.youtube.com/playlist?list=PL-odKaUzOz3Knbk8vs_T1pItsTZtkO6ZL).

### Choices, choices: Display manager or not?

It depends on how you want to log in.
After a standard Arch install you log in by typing your username and password into a text-based console prompt displayed at the end of the boot process.
After logging in, you enter a command line shell, and can then issue the `startx` command to start the X Window System.

A *display manager* (DM) is a graphical alternative to the login process---it's basically graphical eye candy.
A DM will display a graphical login window at the end of the boot process instead of a text-based console prompt.
You'll usually get a window with GUI text fields for your username and password, and will have the option to customize colors, background wallpaper, etc.
You can also configure most DMs to start Xorg automatically after logging in. 

My suggestion for beginners: log in using the text-based console and leave a display manager for later---you'll have fewer things to set up and potentially misconfigure.
You can always install a DM after setting up your window manager and/or desktop environment.

## Installing Xorg and i3 {#install}

Here's the minimal and opinionated window setup I'll cover on this page:

- Display server: Xorg
- Display server initialization: `xinit`
- Window manager: i3
- Status bar: `i3bar`
- Desktop environment? No, just i3.
- Display manager? No, just `xinit`.

### Installation

Install the following packages:

```bash
sudo pacman -S xorg xorg-xinit i3-wm i3status i3blocks
```

Explanation: `xorg` is a package group---it contains the Xorg display server and a collection of other useful X-related packages; `xorg-init` is used to start the X Window System; `i3-wm` is the i3 window manager; `i3status` and `i3blocks` provide the i3 status bar.

### Starting X

You installed X; now you need to start it---we'll use the `startx` program (provided by the `xorg-xinit` package) to start the X Window System and launch a window manager.

You configure `startx`'s behavior through the `~/.xinitrc` file.
We'll use the default `xinitrc` file in `/etc/X11/xinit/` as a starting point, and then change it slightly to start the window manager or desktop environment of your choice.

1. First make a copy of the default `xinitrc` in your home directory:

   ```bash
   # Copy the default xinitrc from /etc/X11/xinit into your home directory
   cp /etc/X11/xinit/xinitrc ~/.xinitrc
   ```

1. Open the just-copied `~/.xinitrc` in a text editor,
   and you'll see some boilerplate code interspersed with a mountain of empty lines.
   You can delete the empty lines if you like; supposedly they come from the pre-processor used to programmatically generate the `xinitrc` file---see this [Arch forum discussion](https://bbs.archlinux.org/viewtopic.php?id=24580) and this [GitLab issue](https://gitlab.freedesktop.org/xorg/app/xinit/-/issues/20) for a discussion of the empty lines.

   Scroll to the bottom of the `~/.xinitrc` and (at the time of writing) you'll see the following code:

   ```bash
   # At the bottom of the default xinitrc
   twm &
   xclock -geometry 50x50-1+1 &
   xterm -geometry 80x50+494+51 &
   xterm -geometry 80x20+494-0 &
   exec xterm -geometry 80x66+0+0 -name login
   ```

   This code starts the default [Tab Window Manager](https://en.wikipedia.org/wiki/Twm) (`twm`), a clock (`xclock`), and a few instances of `xterm`, which is the default X terminal emulator.
   The numbers just specify the screen coordinates where the clock and terminals should open.
   
   You'll want to replace the Tab Window Manager code block with the executable of the desktop environment or window manager you have installed and plan on using.
   Example: to start the i3 window manager, delete the block beginning with `twm &` and replace it with the single line:

   ```bash
   # At the bottom of the default xinitrc
   exec i3
   ```

   (But make sure to keep all of the default `xinitrc` code from above the `twm &` block.)
 
   As a general rule, you should start long-running processes in the background by appending `&`, and start the last process in the `xinitrc` using `exec`, which replaces the shell process running the `xinitrc` script with the process you start with `exec`, which is usually your window manager, desktop environment, or a terminal emulator.
   See [ArchWiki: Xinit/xinitrc](https://wiki.archlinux.org/title/Xinit#xinitrc) and [this StackExchange answer](https://unix.stackexchange.com/a/504210) for more information about the `xinitrc` file.

1. Install a terminal emulator.
   I suggest [Alacritty](https://wiki.archlinux.org/title/Alacritty) if you want to follow along with this series
   or [xterm](https://wiki.archlinux.org/title/Xterm) (the default X terminal) if you want to decide later.

   ```bash
   sudo pacman -S alacritty  # to install Alacritty
   sudo pacman -S xterm      # to install xterm
   ```

   You should install a terminal emulator now to ensure you'll have one available after you start your first X window session.
   You *don't* want to start X and then realize you don't have a graphical terminal emulator available.

1. After creating an `xinitrc` file, you can **start the X Window System** by running `startx` from the Linux console.
   This will place you in a new X session with the window manager or desktop environment of your choice.

   If you've followed along with this tutorial and installed i3, you'll probably be prompted to set your i3 modifier key (`Alt` by default), and then you'll see a blank screen with a spinning cursor.
   Don't worry, nothing's wrong---you just don't have any windows open yet.
   You can start a terminal with the key combination `<Mod>-<Enter>`, where `Mod` is the key you chose as your i3 modifier.

### Next steps

- Must-do: learn the basic key bindings for controlling your window manager
  (if you installed i3, the [official User's Guide](https://i3wm.org/docs/userguide.html) is a great resource).

- Install more packages: consider installing a web browser ([Firefox](https://wiki.archlinux.org/title/firefox) and [Chromium](https://wiki.archlinux.org/title/chromium) are popular choices),
  an application launcher (e.g. [`dmenu`](https://wiki.archlinux.org/title/dmenu) or [`rofi`](https://wiki.archlinux.org/title/Rofi)),
  a media player (e.g. [mpv](https://wiki.archlinux.org/title/mpv) or [VLC](https://wiki.archlinux.org/title/VLC_media_player)),
  and a PDF/document viewer (e.g. [Zathura](https://wiki.archlinux.org/title/Zathura) or [Okular](https://okular.kde.org/)).

- Eye candy: install a nice-looking terminal font ([Iosevka](https://archlinux.org/packages/community/any/ttc-iosevka/) and [Source Code Pro](https://archlinux.org/packages/extra/any/adobe-source-code-pro-fonts/) are popular choices),
  install and/or customize a status bar,
  [set a background wallpaper]({{< relref "/tutorials/arch/wallpaper" >}});
  customize your shell prompt, etc.

{{< arch/arch-notes-footer >}}
