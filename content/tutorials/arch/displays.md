---
title: Connect laptop to an external monitor on Linux on X
date: 2022-05-07
---

# Connect laptop to an external monitor on X

{{< arch/header-with-comment >}}
and part 1 in a two-part monitor sequence. Read [part 2]({{< relref "/tutorials/arch/monitor-hotplug" >}}) for monitor hot-plugging.
{{< /arch/header-with-comment >}}

{{< date-last-mod >}}

**Goal:** understand how to make an X Window System display appear on an external monitor using `xrandr`, then write a shell script that does this for you.

**Read this if:** you've just installed Arch, start up an X session, connect your laptop to an external monitor, and... nothing happens---blank monitor screen.
I only cover a single-monitor set-up here;
see [ArchWiki: Multihead](https://wiki.archlinux.org/title/Multihead) for multi-monitor set-ups.

**Dependencies:** This guide works on the X Window System.
You should first [set up X]({{< relref "tutorials/arch/startx" >}}) if you have not yet done so.

**References:**

- [ArchWiki: xrandr](https://wiki.archlinux.org/title/xrandr): the de-facto tool for controlling displays on the X Window System.
- [GitHub: autorandr](https://github.com/phillipberndt/autorandr): a well-received, automated alternative to `xrandr` (not covered here).

{{< toc level="2" title="Contents of this article" >}}

First make sure you have the [`xorg-xrandr` package](https://archlinux.org/packages/extra/x86_64/xorg-xrandr/) installed (the `xorg-xrandr` package ships with the commonly-installed `xorg` group, so you might already have it on your system).
We'll need this package to access the `xrandr` utility.

## Explanation of what's involved

The X Window System manages the graphical display (the rectangular grid of pixels representing windows, menus, status bars, etc.) that you probably see on your laptop screen.

The `xrandr` utility can send the X display to a physical screen (your laptop's built-in screen, an external monitor, a TV, etc.) via what `xrandr` calls a *video output*,
which is a software abstraction of either a physical video port (e.g. HDMI, DisplayPort, etc.) or the ribbon cables and other hardware connecting your laptop's monitor to its built-in LED/LCD screen.

Very loosely, here is what happens under the hood when you properly connect a monitor:

1. The `xrandr` utility sends the X display to one of your computer's video ports.
1. The X display travels from the video port into the monitor as an electrical signal carried by a physical cable (e.g. HDMI).
1. The circuitry inside the monitor converts the signal into the visible pixel display you see when you use the monitor.

This guide covers step 1, i.e. making `xrandr` send the X display to a physical video output port.
Your computer's graphics card and the monitor itself should take care of the rest.

## Identifying video output names

The `xrandr` utility identifies video outputs with a short name;
simply run `xrandr` in a command-line shell to show information about all available video outputs.
Here's an example on my laptop:

```bash
$ xrandr

# The laptop's screen (always connected)
eDP-1 connected primary (normal left inverted right x axis y axis)
  1920x1080     60.01 +  60.01    59.97    59.96    59.93
  1680x1050     59.95    59.88
  # and a long list of more available resolutions...

# The laptop's DisplayPort output (currently disconnected)
DP-1 disconnected (normal left inverted right x axis y axis)

# The laptop's HDMI output (currently discconnected)
HDMI-1 disconnected (normal left inverted right x axis y axis)
```

The video output names here are `eDP-1`, `DP-1`, and `HDMI-1`.
The output names should match a physical video port (HDMI, DisplayPort, etc.) on your laptop, 
and you might have multiple versions, for example `HDMI-1`, `HDMI-2` if you have multiple HDMI ports.

You'll need to identify the `xrandr` output name for the video port you'll use to connect your monitor.
Here's a straightforward way to do so:

1. Run `xrandr` with no cables connected, and remember which video outputs are `disconnected`.
1. Pick the physical video port you plan on using for connecting your monitor, and plug in a connection cable (HDMI, DisplayPort, etc.)
1. Run `xrandr` again, with the video cable connected, and record which output changed from `disconnected` to `connected`.

Here's an example from my laptop after connecting an HDMI cable:

```bash
HDMI-1 connected 1920x1080+0+0 (normal left inverted right x axis y axis) 527mm x 296mm
   1920x1080     60.00*   50.00    59.94
   1920x1080i    60.00    50.00    59.94
   # and many other available resolutions
```

Note that graphics devices (e.g. the `eDP-1` outputed by `xrandr`) should also be listed in the `sysfs` file system directory `/sys/class/drm/`.

**Check-in point:** you should know the `xrandr` name (e.g. `HDMI-1`, `DP-1`, etc.) of the video output you plan on using to connect your monitor.

## Toggling displays

You can send the X display to a video output using `xrandr`'s `--output` option.

- **Turn on:** to send the X display to a video output using the output's preferred resolution:

  ```bash
  # Send display to `{output-name}` and set resolution/DPI automatically
  xrandr --output {output-name} --auto

  # Send output to first HDMI port and set resolution/DPI automatically
  xrandr --output HDMI-1 --auto
  ```

  You should generally use the above `--auto` option, but can also specify a specific resolution:

  ```bash
  # Send display to `{output-name}` and set resolution to 1920x1080 px
  xrandr --output {name} --mode 1920x1080
  ```
  
- **Turn off:** to stop sending X display to a video output:

  ```bash
    # Turn off display to `{output-name}`
    xrandr --output {name} --off

    # Turn off laptop's built-in LED/LCD display
    xrandr --output eDP-1 --off

    # Cut off display sent to HDMI port
    xrandr --output HDMI-1 --off
  ```

Multiple commands can be combined into one line:

```bash
# Send display to `HDMI-1` and cut off internal display `eDP-1`
xrandr --output HDMI-1 --auto --output eDP-1 --off
```

## Example single-monitor workflow

At this point you have all the tools you need---use `xrandr` to identify output names, `xrandr --ouput {name} --auto` to send the X display to an output, and `xrandr --ouput {name} --off` to turn off outputs.

Here is an example workflow, but feel free to create your own:

- Connect laptop to monitor via e.g. HDMI cable 
  (hot-plugging is fine---both the laptop and monitor may be powered on).

- Run `xrandr --output HDMI-1 --auto` to send your laptop's display to the monitor via the laptop's HDMI port.
  
- Optionally run `xrandr --output eDP-1 --off` to turn the laptop's display off (to save battery).
  Caution: this turns off the laptop's screen completely, and you'll have to run `xrandr --output eDP-1 --auto` (e.g. using the monitor display for visual feedback) before you can use the laptop's screen again.
  (At worst, you can always reboot by pressing the power button, and the laptop's screen will turn back on.)
  
- When ready to disconnect the laptop from the monitor:

  ```bash
  # Send display back to laptop's built-in screen (if needed)
  xrandr --output eDP-1 --auto

  # Stop sending display to monitor
  xrandr --output HDMI-1 --off
  ```
  You can then turn the monitor off.

## Example script for toggling displays

You'll probably want to wrap the above `xrandr` commands in an executable shell script for convenience.
Following are some examples; assuming a little bit of shell script literacy, you can adjust them as you like.

Adapted from [ArchWiki: Toggle external monitor](https://wiki.archlinux.org/title/xrandr#Toggle_external_monitor):

```bash
#!/bin/sh

# Useful for a laptop: checks if the output to external monitor is
# connected/disconnected, and toggles internal/external display accordingly.

# Names of `xrandr` outputs for internal and external displays; change as needed
internal=eDP-1
external=HDMI-1

# Send display to external monitor when it is physically connected
if xrandr | grep "${external} connected"; then
    xrandr --output "${external}" --auto
    # Optionally turn off laptop screen to save battery while connected to monitor
    # xrandr --output "${internal}" --off  

# Turn off display to external monitor when it is physically disconnected
else
    xrandr --output "${external}" --off
    # Turn laptop screen back on (if needed)
    xrandr--output "${internal}" --auto
fi
```

You can also just write two scripts: one for connecting the laptop to a monitor and one for disconnecting.

```bash
#!/bin/sh
# Very simple script to turn external display on and internal display off
# Use case: when connecting laptop to external monitor

internal=eDP-1
external=HDMI-1

# Turn external display on
xrandr --output ${external} --auto

# Turn internal display off
xrandr --output ${internal} --off
```

```bash
#!/bin/sh
# Very simple script to turn external display off and internal display on
# Use case: just before disconnecting laptop from monitor

internal=eDP-1
external=HDMI-1

# Turn internal display on
xrandr --output ${internal} --auto

# Turn external display off
xrandr --output ${external} --off
```

<div class="mt-10">
{{< tutorials/backhome homehref="/tutorials/arch/about" >}}
</div>

<div class="mt-8">
    {{< tutorials/thank-you >}}
<div>

<div class="mt-6">
    {{< tutorials/license >}}
<div>
