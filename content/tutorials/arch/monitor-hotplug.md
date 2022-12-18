---
title: Monitor hot-plugging on Linux using X
date: 2022-05-07
---

# Monitor hot-plugging with X

{{< arch/arch-notes-header-with-comment >}}
and part 2 in a two-part monitor sequence. You should be familiar with [part 1]({{< relref "/tutorials/arch/displays" >}}) first.
{{< /arch/arch-notes-header-with-comment >}}

{{< date-last-mod >}}

**Goal:** use `udev` to detect when a monitor cable is physically connected or disconnected, and use `xrandr` to automatically update the monitor display in response.

**References:**

- [ArchWiki: udev](https://wiki.archlinux.org/title/Udev)
- [ArchWiki: xrandr](https://wiki.archlinux.org/title/xrandr)
- [Arch Forums: udev rule doesn't work (hotplug monitor)](https://bbs.archlinux.org/viewtopic.php?id=170294)

<!-- Read connection status from the `sysfs` file system instead of checking `xrandr`'s output. -->

<!-- `/sys/class/drm/card0-HDMI-A-1/status` -->

<!-- So `/run/user/<UID>` is also known as `$XDG_RUNTIME_DIR`. -->
<!-- You can use `id` or `id -u <username>` to show your ID. -->
<!-- Typically normal users begin at user ID `1000`. -->

<!-- Note: you can probably also find  HDMI connection status is listed in `/sys/class/drm/card0-HDMI-A-{1|2|3|...}/status` -->

## Procedure

I'll first concisely describe the steps to get things working, and then explain the reasoning and some of the technicalities at [the end of this guide](#appendix-technicalities).
By the way, the approach used here comes from [Arch Forums: udev rule doesn't work (hotplug monitor)](https://bbs.archlinux.org/viewtopic.php?id=170294).

**TLDR:**

1. Create a shell script that uses `xrandr` to update displays based HDMI/DisplayPort connection status in the `sysfs` file system.
1. Wrap the shell script in a `systemd` service.
1. Create a `udev` rule that runs the `systemd` service in response to video cable hot-plugging.

### Check monitor connection with `sysfs`

**Goal:** learn how to check a video output's `connected`/`disconnected` status using the device files in `/sys/class/drm`.

First make sure you know the `xrandr` name (e.g. `HDMI-1`, `DP-1`, etc.) of the video output from [part 1]({{< relref "/tutorials/arch/displays" >}}) that you plan on using to connect your monitor---I'll use `HDMI-1` in this guide, but change this as needed for your own case.

Then check the contents of the directory `/sys/class/drm`.
Here's what this looks like on my computer:

```bash
$ ls /sys/class/drm
card0-DP-1
card0-DP-2
card0-eDP-1
card0-HDMI-A-1
card0-HDMI-A-2
```

Each directory represents a display device.
The names should match the video outputs shown by `xrandr` in [part 1]({{< relref "/tutorials/arch/displays" >}});
for example, `card0-HDMI-A-1` corresponds to `HDMI-1`.
There should be a `status` file inside `card0` directory that shows the `connected`/`disconnected` state of each device.
For example:

```bash
# *Connects HDMI cable to computer*
$ cat /sys/class/drm/card0-HDMI-A-1
connected

# *Unplugs HDMI cable from computer*
$ cat /sys/class/drm/card0-HDMI-A-1
disconnected
```

**Check-in point:** you should know the `sysfs` directory name (e.g. `card0-HDMI-A-1`, `card0-DP-A-1`) of the device you'll use to connect your monitor.
We'll need this name in the following shell script.

<!-- The value of a device's `status` file should agree with corresponding video output's `connected`/`disconnected` state shown by `xrandr` in [part 1]({{< relref "/tutorials/arch/displays" >}}). -->

### Hotplug script

Here's the shell script to implement hotplug and display-switching logic (explanation follows).

I'd suggest naming the script `hotplug-monitor.sh` and placing it in `/usr/local/bin` (a conventional location for local user programs not controlled by a package manager), but any system-wide readable location should work.

```bash
#!/bin/sh
# File location: /usr/local/bin/hotplug-monitor.sh
# Description: Sends X display to an external monitor and turns internal
# display off when an HDMI cable is physically connected; turns monitor display
# off and internal display back on when HDMI cable is physically disconnected.

# Specify your username and user ID
USER_NAME=<your-username>   # find with `id -un` or `whoami`
USER_ID=<your-user-id>      # find with `id -u`
# Example: `USER_NAME=ejmastnak`
# Example: `USER_NAME=1000`

# Export user's X-related environment variables
export DISPLAY=":0"
export XAUTHORITY="/home/${USER_NAME}/.Xauthority"
export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/${USER_ID}/bus"

# Video output and device names recogized by xrandr/sysfs
internal="eDP-1"         # change as needed
external="HDMI-1"        # change as needed
device="card0-HDMI-A-1"  # change as needed

# If external display was just physically connected, turn external display on
# and (optionally) turn internal display off to save battery.
if [ $(cat /sys/class/drm/${device}/status) == "connected" ];
then
  xrandr --output "${external}" --auto  # sends display to monitor
  xrandr --output "${internal}" --off   # optionally turn internal display off

# If external display was just physically disconnected, turn 
# external display off and turn internal display on.
elif [ $(cat /sys/class/drm/${device}/status) == "disconnected" ];
then
  xrandr --output "${external}" --off   # turn monitor display off
  xrandr --output "${internal}" --auto  # turn internal display on (if needed)
else  # Do nothing if device status is unreadable
  exit
fi
```

Some comments:

- The `internal` and `external` variables store the `xrandr` names of the video outputs for your internal display and HDMI connection.
  This should be clear from [part 1]({{< relref "/tutorials/arch/displays" >}}).

- The `device` variable is the name of `sysfs` graphics device identified above in the section [Check monitor connection with `sysfs`](check-monitor-connection-with-sysfs).
  We use this variable in the `cat /sys/class/drm/${device}/status` calls to check the device's connection status.

- You need to export some X-related environment variables---I'm not satisfied with my understanding of why, but doing so makes the shell script, which runs from a location on the root partition, aware of your user's X session information.

  `DISPLAY=:0` is standard X lingo for the first display on the local computer, and `/home/${USER_NAME}/.Xauthority` is just the path to your `.Xauthority` file.

- You'll also need to know your username and user ID, which you can find with the `id` program:

  ```bash
  # Example: identifying your username
  $ id -un
  ejmastnak
  
  # Example: identifying your user ID
  $ id -u
  1000
  ```
  
  You can run `id` (with no flags) for more information; you should definitely read through `man id` (it's really short!) if you haven't used the `id` program before.
  
### `systemd` unit

We'll run the above shell script from a `systemd` service.

Create a `systemd` unit `/etc/systemd/system/hotplug-monitor.service` with the following contents:

```systemd
[Unit]
Description=Monitor hotplug service

[Service]
Type=simple

# Make the service run as your user and not as root
User=<your-username>  # add your username here

# Change path to hotplug script as needed
ExecStart=/usr/local/bin/hotplug-monitor.sh

[Install]
WantedBy=multi-user.target
```

Make sure to update the `User=<your-username>` field with your username,
then run `systemctl daemon-reload` to make `systemd` register the new service file.
No need to enable or start the service manually---it will started as needed from the following `udev` rule.

### `udev` rule

Create a `udev` rule in `/etc/udev/rules.d/85-drm-hotplug.rules` with the following contents:

```
ACTION=="change", KERNEL=="card0", SUBSYSTEM=="drm", RUN+="/usr/bin/systemctl start hotplug-monitor.service"
```

This rule runs the above `hotplug-monitor` service whenever `udev` detects chages in devices with kernel name `card0` in the `drm` subsystem---basically when you plug/unplug display cables.
(DRM stands for "Direct Rendering Manager"---you can read more at [Wikipedia: DRM](https://en.wikipedia.org/wiki/Direct_Rendering_Manager).)

## Appendix: Technicalities

There are (at least) two fair questions here:

1. Why are we complicating things with a `systemd` service instead of running the hotplug script directly from the `udev` rule, as in e.g. in these [ArchWiki](https://wiki.archlinux.org/title/Udev#Execute_when_HDMI_cable_is_plugged_in_or_unplugged) [examples](https://wiki.archlinux.org/title/Udev#Execute_on_VGA_cable_plug_in)?

1. Why are we checking device connections using the `sysfs` device file `sys/class/drm/*/status` instead of just running `xrandr`, as in [part 1]({{< relref "/tutorials/arch/displays" >}})?

Based on my current understanding of `udev` and `systemd` best practices and some empirical testing, here are my answers:

1. `udev` rules are meant to run only short processes, and will block events from the triggering device until the initial process completes (see e.g. [ArchWiki: udev/Spawning long-running processes](https://wiki.archlinux.org/title/Udev#Spawning_long-running_processes) and the references therein).
   This is why we use a `systemd` service to run the shell script, and then only use the `udev` rule to start the service.

1. From my own testing (and the experience of [at least one other user](https://bbs.archlinux.org/viewtopic.php?pid=1584974#p1584974)), 
   the `udev` rule for hotplugging a display device can be triggered before `xrandr` becomes aware of the corresponding video output's updated `connected`/`disconnected` status.
   As far as I can tell, in such cases `/sys/class/drm/*/status` will show the correct connection status, but `xrandr` will still be lagging behind by a few hundred milliseconds or so.

   For hot-plugging, it is thus more reliable to check a display's connection state from the contents of `/sys/class/drm/*/status` than to use `grep` to parse the output of the `xrandr` command, as in e.g. [part 1]({{< relref "/tutorials/arch/displays" >}}).

{{< arch/arch-notes-footer >}}
