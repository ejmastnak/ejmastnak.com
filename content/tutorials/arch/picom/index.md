---
title: Transparent windows backgrounds with picom on Arch Linux
date: 2022-05-28
---

# Transparent windows with `picom`

{{< arch/arch-notes-header >}}

{{< date-last-mod >}}

**Goal:** Use the `picom` compositor to make unfocused window backgrounds slightly transparent, so you can enjoy [your background wallpaper]({{< relref "/tutorials/arch/wallpaper" >}}).

**Dependencies:** This guide works on the X Window System.
You should first [set up X]({{< relref "/tutorials/arch/startx" >}}) if you have not yet done so.

**References:**

- [ArchWiki: picom](https://wiki.archlinux.org/title/Picom)
- `man picom`

**Example:** Here's my own computer screen while writing this web page:

{{< img-centered src="transparent-windows.jpg" width="100%" alt="Screenshot of laptop display with transparent unfocused windows revealing background wallpaper." >}}

The window manager is [i3-gaps](https://github.com/Airblader/i3); you can find the wallpaper [on r/wallpaper](https://www.reddit.com/r/wallpaper/comments/tvu1c6/cherry_blossoms_1920x1200/) at the time of writing.

## Procedure
<!-- vim-markdown-toc GFM -->

* [Transparent windows](#transparent-windows)
  * [Targeted transparency by window class](#targeted-transparency-by-window-class)
  * [Launch and autostart `picom`](#launch-and-autostart-picom)
* [Appendix: other `picom` features](#appendix-other-picom-features)
  * [Rendering backends](#rendering-backends)
  * [Just disable everything except opacity](#just-disable-everything-except-opacity)

<!-- vim-markdown-toc -->

## Transparent windows

You can set window transparency (and many other "eye candy" features like blurring, shadows, rounded corners, etc.) using a tool called a *compositor*.
This guide will use the popular [`picom` compositor](https://wiki.archlinux.org/title/Picom) and covers only transparency.

First install the [`picom` package](https://archlinux.org/packages/community/x86_64/picom/), then make a copy of the default config file as a starting point for your own configuration:

```bash
sudo pacman -S picom
cp /etc/xdg/picom.conf ~/.config/picom/picom.conf
```

The default `picom.conf` is quite verbose, with a lot of explanatory comments.
You can locate the transparency part by searching for `Transparency` (this begins on line 100 at the time of writing); the relevant lines are

```bash
# Default opacity of active windows.
active-opacity = 1.0;

# Default opacity of inactive windows.
inactive-opacity = 1.0;

# Opacity of window titlebars and borders.
frame-opacity = 1.0;

# Application-specific settings; these override the default `active-opacity`
opacity-rule = [
    "95:class_g = 'Alacritty' && focused",
    "80:class_g = 'Alacritty' && !focused"
];
```

Note that `picom` works in terms of opacity instead of transparency; `1.0` is complete opacity (and no transparency); `0.0` is zero opacity (and complete transparency).

Setting a global opacity for all windows is as simple as tweaking the values of `active-opacity`, `inactive-opacity`, and `frame-opacity` to your liking.
You can try something close to `1.0` for active windows, and something more transparent, perhaps `0.5`, for inactive windows.

If you want more customizability, the next section shows how to set specific opacities for specific window classes (read: applications).

### Targeted transparency by window class

Use case: make your terminal emulator more transparent than your web browser (for example).

The application-specific opacity syntax in the `picom.conf` file looks like this:

```bash
# Application-specific settings; these override the default `active-opacity`
opacity-rule = [
  # Makes Alacritty 95% opaque when focused...
  "95:class_g = 'Alacritty' && focused",
  # ... and 40% opaque when not focused.
  "40:class_g = 'Alacritty' && !focused",
];
```

The numbers (e.g. `95`, `40`, `100`) are opacity percentages; these are associated with a global X Window System class name `class_g` and a focus state (`focused` or `!focused`).

You can find a window's class name by running `xprop` from the command line and clicking on clicking on target window (`xprop` displays the window's X properties);
then search the `xprop` output for the `WM_CLASS(STRING)` property, which will show the window class name you should use with `picom`.

Here is an example `xprop` output on my computer for Alacritty terminal windows:

```bash
$ xprop
# *clicks on an Alacritty terminal window*
WM_HINTS(WM_HINTS):
_NET_WM_DESKTOP(CARDINAL) = 1
# ...irrelevant output omitted...
_NET_WM_PID(CARDINAL) = 34016
WM_CLASS(STRING) = "Alacritty", "Alacritty"
# ...irrelevant output omitted...
```

Tips:
- Use `xprop | grep "WM_CLASS"` instead of `xprop` to show only the window class name.
- Speaking anecdotally, if the two values of `WM_CLASS(STRING)` are different, use the second one.

Once you know a window's class name, you can then assign custom opacity settings using the `opacity-rule` key in `picom.conf`.
Here are some more examples:

```bash
# Application-specific settings; these override the default `active-opacity`
opacity-rule = [
  "100:class_g = 'Zathura' && focused",
  "80:class_g = 'Zathura' && !focused",
  "100:class_g = 'firefox' && focused",
  "80:class_g = 'firefox' && !focused",
];
```

For the transparency features to take effect, you just have to launch `picom`.

### Launch and autostart `picom`

Once your `picom.conf` is set up, I suggest launching `picom` from the command line using the command

```bash
# Start picom as a daemon process
picom -b
```

Using the `-b` flag starts `picom` as a daemon process that forks to the background after initialization.
This has two practical benefits: the `picom` process won't freeze up the shell you ran it from, and the process will survive (i.e. `picom` will continue running) even if you close the shell.

**Tip:** `picom` performs live updates when you write changes to your `picom.conf` file, so you can experiment with tweaks to your config without having to manually restart `picom`.

You can use the same `picom -b` command to autostart `picom` when you launch a new X session (i.e. to avoid having to open up a terminal and typing `picom -b` manually).
I recommend placing the autostart command in your window manager or desktop environment's config file.
The details depend on your WM or DE; for the i3 window manager, for example, you would place the following line in your `~/.config/i3/config` file:

```bash
# Autostart picom when starting the i3 window manager
exec_always --no-startup-id picom -b
```

See [ArchWiki: Autostarting](https://wiki.archlinux.org/title/Autostarting) for how to autostart processes on other WMs and DEs.

## Appendix: other `picom` features

The `picom` compositor offers window background blurring, shadows, fading, and rounded corners in addition to opacity settings.

I have intentionally covered only opacity in this guide, but wanted to at least give some pointers to anyone interested in other features.
For...

- background blurring: search the default `picom.conf` for "Background-Blurring";
- shadows: search the default `picom.conf` for "Shadows";
- fading: search the default `picom.conf` for "Fading";
- rounded corners: search the default `picom.conf` for "Corners".

### Rendering backends

You can set `picom`'s rendering backend using the `backend` setting in `picom.conf`; your options are `xrender` (the default) and `glx`.

- `xrender` uses the X Render extension, which is built-in to the X Window System.
It is stable and reliable for transparency, but not suitable for rendering blurred windows.

- `glx` uses OpenGL.
  It handles blur, color inversion, and other "fancy" compositing features much better than `xrender`, but requires (quoting from `man picom`) proper OpenGL 2.0 support from your driver and hardware.

I suggest sticking with the default `backend = xrender` if you only need window transparency, and setting `backend = glx` only if you have OpenGL set up and want blurred windows.
If you *are* using `glx` and window blurring, here are some potentially useful `picom.conf` settings:

```bash
# Search picom.conf for "General Settings"
backend         = "glx";
glx-no-stencil  = true;

# Search picom.conf for "Background-Blurring"
blur-background = true;
blur-method     = "dual_kawase";
# Set blur-size, blur-strength, and other settings as needed.
```

Blur settings are documented in the `BLUR` section of `man picom`;
using `glx-no-stencil` may increase performance; search `man picom` for `glx-no-stencil` for details.

### Just disable everything except opacity

For better performance and a more minimalistic setup you can disable all features except window opacity by placing the following in your `picom.conf`:

```bash
# Disable background blur; search picom.conf for "Background-Blurring" for details
blur-background = false;

# Disable background blur; search picom.conf for "Shadows" for details
shadow = false

# Disable window fading; search picom.conf for "Fading" for details
fading = false

# Disable rounded window corners; search picom.conf for "Corners" for details
corner-radius = 0
```

{{< arch/arch-notes-footer >}}
