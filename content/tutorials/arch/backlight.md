---
title: Adjust laptop backlight on Arch Linux
date: 2022-05-07
---

# Adjust laptop backlight

{{< arch/arch-notes-header >}}

{{< date-last-mod >}}

**Goal:** understand how to programmatically adjust your laptop's backlight brightness from the command line, then create convenient key bindings to do this for you.

**Read this if:** your laptop has two keyboard functions keys for increasing and decreasing backlight brightness, but these keys have no effect after a standard install of Arch (so you find yourself unable to adjust your backlight brightness).

If your backlight keys *are* working properly (perhaps your desktop environment set them up for you), congratulations.
You're welcome to read this anyway, and perhaps you'll learn something useful about `udev` rules or `acpid` events, but this guide might not be directly relevant to you.

**References:**

- [ArchWiki: Backlight](https://wiki.archlinux.org/title/backlight)
- [ArchWiki: acpid](https://wiki.archlinux.org/title/Acpid)

{{< toc level="2" title="Contents of this article" >}}

## Adjust backlight brightness from a shell

Plan: first show how to adjust laptop brightness manually from a command-line shell, then set up key bindings to do this with a single key press.

You can interact with your backlight through the Linux `sysfs` file system, using the contents of the directory `/sys/class/backlight`.

(`sysfs` is pseudo file system located in the `/sys` directory, and provides an interface for interacting with harware devices, drivers, kernel modules, and all sorts of other goodies using virtual files.
I suggest taking 10 minutes and browsing through [Wikipedia: Sysfs](https://en.wikipedia.org/wiki/Sysfs) and `man 5 sysfs` if you haven't heard of `sysfs` yet---it's a really neat feature of the Linux kernel.)

### Identify your backlight directory

Every computer should have a backlight interface directory inside of `/sys/class/backlight`, but the name depends on the graphics card's manufacturer and model.
Standard names I've seen in the wild are:

- Intel graphics: `/sys/class/backlight/intel_backlight`
- ATI/AMD/Nvidia graphics: `/sys/class/backlight/acpi_video0`

I'll use `/sys/class/backlight/intel_backlight` in this guide, but adjust this to `/sys/class/backlight/acpi_video0` (or perhaps something else) if that's what you have inside `/sys/class/backlight`.

The backlight directory contains the files used to control your backlight.
Here's a look inside mine:

```bash
$ ls /sys/class/backlight/intel_backlight
device/
power/
subsystem/
actual_brightness
bl_power
brightness      # useful for this guide!
max_brightness  # useful for this guide!
scale
type
uevent
```

We'll be using the files `brightness` and `max_brightness` in this guide.

### Using backlight brightness files

The `max_brightness` and `brightness` files each contain a single integer number.
The number in `brightness` represents you current backlight brightness on a scale from `0` (backlight turned off) to the value in `max_brightness` (maximum brightness).
*If you change the value in the* `brightness` *file, your physical backlight brightness will change accordingly.*

The value of `max_brightness` varies from manufacturer to manufacturer.
I think (but cannot confirm) that the max brightness values are arbitrary, i.e. they do not correspond directly to any physical quantity.

Do two things:

- Identify the value in `max_brightness` on your computer (e.g. `cat max_brightness`)
- Experiment with changing the value of `brightness`, and observe how your backlight brightness changes accordingly.

For example, from my laptop:

```bash
$ cd /sys/class/brightness/intel_backlight
$ cat max_brightness
852  # (on my laptop; might be different on yours)

# IMPORTANT: You need root privileges to change brightness
$ su

# Playing around with brightness as a root user
echo 400 > brightness   # half of maximum brightness
echo 50 > brightness    # low brightness
echo 852 > brightness   # max brightness
```

Note: you *must* fully elevate to a root shell using e.g. `su` or `sudo -s`.
A command like `sudo echo 42 > brightness` will fail,
because the `sudo` privilege applies to the `echo` command only, and the subsequent output redirection using `>` runs in a regular (unprivileged) shell.
See [this Stack Overflow answer](https://stackoverflow.com/a/82278) for more information.

Instead of using `su` to elevate to a root shell, you could also combine `tee` with plain `sudo` as a temporary solution, e.g.

```bash
# Another way to elevate privileges
$ echo 42 | sudo tee /sys/class/backlight/intel_backlight/brightness 
```

**Check-in point:** At this point you should be able to adjust your backlight brightness, albeit tediously, by writing to `/sys/class/backlight/*/brightness` from a root shell.
  
### Allow regular users to modify backlight brightness

**Problem:** by default, only root users can write to the backlight's `brightness` file,
and it's supremely inconvenient to elevate to root privileges for a task as simple and frequent as adjusting your backlight brightness.

**Solution:** as suggested in [ArchWiki: Backlight/ACPI](https://wiki.archlinux.org/title/backlight#ACPI), add backlight-privileged users to the `video` user group,
then create a `udev` rule that allows unprivileged users in the `video` group to adjust backlight brightness.

To give regular users backlight permissions...

#### Add users to the `video` group

First add any users who should get backlight-adjusting privileges to the `video` group:

```bash
# Replace <username> with the target username(s)
sudo usermod -aG video <username>
# Example: add user foo to the video group
sudo usermod -aG video foo
```

The `video` group should exist on your system by default, and is described briefly in [ArchWiki: Users and groups/Pre-systemd groups](https://wiki.archlinux.org/title/users_and_groups#Pre-systemd_groups).
(If words like "permissions", "file ownership", "user group", and `chgrp` sound unfamiliar, take 15 minutes and read through [ArchWiki: Users and groups](https://wiki.archlinux.org/title/users_and_groups).)

#### Create a `udev` rule

Now create a `udev` rule to give the `video` group permissions to write to the backlight `sysfs` interface.
This step depends on your backlight manufacturer.
Both options below come from suggestions in [ArchWiki: Backlight/ACPI](https://wiki.archlinux.org/title/backlight#ACPI);
I have tested both and can confirm they both worked, at least on the hardware I tested (ThinkPad T460 with integrated Intel graphics; MacBookPro 11.5 with discrete AMD graphics).
Here's what to do.

First create the file `/etc/udev/rules.d/backlight.rules`.
Then, depending on your backlight directory, paste in the following line(s):

- For `intel_backlight`:

  ```bash
  # This code would go inside `/etc/udev/rules.d/backlight.rules`

  # Set `video` as the owning group for the `/sys/class/backlight/intel_backlight/brightness` file
  RUN+="/bin/chgrp video /sys/class/backlight/intel_backlight/brightness"

  # Give write permisssions to the owning group of the `brightness` file
  RUN+="/bin/chmod g+w /sys/class/backlight/intel_backlight/brightness"
  ```

- For `acpi_video0`:

  ```bash
  # This code would go inside `/etc/udev/rules.d/backlight.rules`

  # Set `video` as the owning group for the device with kernel name
  # `acpi_video0` and subsystem `backlight` (i.e. your backlight);
  # give the device's owning user and group read and write permissions
  # and give only read permissions to other users (i.e. 0664).
  ACTION=="add", SUBSYSTEM=="backlight", KERNEL=="acpi_video0", GROUP="video", MODE="0664"
  ```

The two `udev` rules look so different because the `intel_backlight` version applies permission changes directly to the `brightness` *file*, while the `acpi_video0` version applies permissions to the backlight *device*.
But I do not have a good explanation of *why* this difference is necessary---perhaps because of differences in how the OS kernel and backlight interact on Intel integrated graphics compared to discrete AMD/Nvidia GPUs?

Reboot to ensure changes take effect.
You should then be able to write to `sys/class/backlight/*/brightness` as an otherwise unprivileged member of the `video` user group.

**Check-in point:** Before moving on, ensure you can change the backlight brightness by writing to the `/sys/class/backlight/*/brightness` file as a regular user in the `video` group.

## Convenient key mappings for backlight control

We'll set up backlight key bindings using the [`acpid` daemon](https://wiki.archlinux.org/title/Acpid).
If you're a new user, I've just introduced two potentially unfamiliar bits of jargon.
For our purposes, here is what they mean:

- ACPI (which stands for Advanced Configuration and Power Interface) is a standard interface that gives your operating system a way to interact with your hardware (e.g. your backlight and function keys in our context).
  Reference: [Wikipedia: ACPI](https://en.wikipedia.org/wiki/Advanced_Configuration_and_Power_Interface).

- A *daemon* is a name for a computer program that runs as a background process, and typically listens for and responds to events, e.g. network requests or hardware activity.
  In our context, we'll use the `acpid` daemon to detect and respond to ACPI events resulting from brightness key presses.
  References: [Wikipedia: Daemon (computing)](https://en.wikipedia.org/wiki/Daemon_(computing)) in general; [ArchWiki: acpid](https://wiki.archlinux.org/title/Acpid) and `man 8 acpid` in our context.

### Installation

First install the `acpid` package and enable `acpid.service`:

```bash
# Install the acpid package
sudo pacman -S acpid

# Enable and start the acpid daemon
systemctl enable --now acpid.service
```

The `acpid` service will then listen for ACPI events.

### The ACPI event workflow

ACPI events (e.g. function key presses, closing your laptop lid, plugging in a computer charger, etc.) are managed using text files in the directory `/etc/acpi/events/`.
Each event file must define an ACPI event and an action to take in response to the event.
These event files use a key value syntax of the form:

```bash
# Comments are allowed on new lines
event=<ACPI-event-regex>
action=<shell-command>
```

The `event` key's value should be a regular expression matching the name(s) of ACPI event(s),
and the `action` key's value should be a valid shell command, which will be invoked by `/bin/sh` whenever an ACPI event matching the `event` key's value occurs.

By default, the directory `/etc/acpi/events/` contains a single file, called `anything`, with the following contents:

```bash
# Pass all events to the ACPI handler script
event=.*
action=/etc/acpi/handler.sh %e
```

This generic `anything` file catches all ACPI events using the `event=.*` (note the `.*` catch-all regex).
The event's name, accessed using the `%e` macro, is then passed as an argument to the default event handler script `/etc/acpi/handler.sh`.

### Key bindings and event handler for backlight control

Here's the recipe we'll use:

- Identify the name and label of a targeted ACPI event (e.g. pressing your brightness keys)
- Create a shell script in `/etc/acpi/handlers` to perform an action in response to the ACPI event (e.g. adjust your backlight brightness)
- Create a text file in `/etc/acpi/events` to register the ACPI event and run the handling shell script in response.

Reference: [ArchWiki: Acpid > Enabling backlight control](https://wiki.archlinux.org/title/Acpid#Enabling_backlight_control).

#### Identify event names

First run the `acpi_listen` event listener from a command line and identify its output in response to brightness key presses.
In my case:

```bash
$ acpi_listen
# *presses brightness up and brightness down keys* (F5 and F6 on my laptop)
video/brightnessup BRTUP 00000086 00000000
video/brightnessdown BRTDN 00000087 00000000
```
Record the event names (`video/brightnessup` and `video/brightnessdown`) and corresponding labels (`BRTUP` and `BRTDN`).

#### Create an event handler script

Create the following shell script to handle `brightnessup` and `brightnessdown` events.
I've named it `backlight.sh` and placed it in the conventional location `/etc/acpi/handlers`, but you could name it anything you like and probably place it in any readable location on your file system.

```bash
#!/bin/sh
# Location: /etc/acpi/handlers/backlight.sh
# A script to control backlight brightness with ACPI events
# Argument $1: either '-' for brightness up or '+' for brightness down

# Path to the sysfs file controlling backlight brightness
brightness_file="/sys/class/backlight/intel_backlight/brightness"

# Step size for increasing/decreasing brightness.
# Adjust this to a reasonable value based on the value of the file
# `/sys/class/backlight/intel_backlight/max_brightness` on your computer.
step=20

# Some scary-looking but straightforward Bash arithmetic and input/output redirection
case $1 in
  # Increase current brightness by `step` when `+` is passed to the script
  +) echo $(($(< "${brightness_file}") + ${step})) > "${brightness_file}";;

  # Decrease current brightness by `step` when `-` is passed to the script
  -) echo $(($(< "${brightness_file}") - ${step})) > "${brightness_file}";;
esac
```

This script (taken from [ArchWiki: Acpid > Enabling backlight control](https://wikiarchlinux.org/title/Acpid#Enabling_backlight_control)) takes one parameter, which should be either `+` or `-`, and either increases (if `+` is passed) or decreases (if `-` is passed) the current backlight brightness by the value of the `step` variable.

Make the handler script executable:

```bash
sudo chmod +x /etc/acpi/handlers/backlight.sh
```

#### Create event-matching files

Create the event files `/etc/acpi/events/BRTUP` and `/etc/acpi/events/BRTDN` (using the event labels `BRTUP` and `BRTDN` is not necessary; you can use whatever alphanumeric characters you want that obey the naming conventions in the second paragraph of `man acpid`).
Inside the files place:

```bash
# (Adjust path to the `backlight.sh` script as needed)

# Inside /etc/acpi/events/BRTUP
event=video/brightnessup
action=/etc/acpi/handlers/backlight.sh +

# Inside /etc/acpi/events/BRTDN
event=video/brightnessdown
action=/etc/acpi/handlers/backlight.sh -
```

Reboot. The backlight keys should then change backlight brightness.

Speaking from personal experience: if the backlight keys aren't working after a reboot, double-check the handler script and event files for typos and ensure the handler script is executable (and make sure you've passed both "Check-in points" in the previous section).
There's a lot of moving parts here and even a small typo can prevent things from working.

## Troubleshooting: fix failed loading of `acpi_video0` with dual graphics

(Probably irrelevant to most users, but I thought I'd include it after going through the problem myself.)

Context: after installing Arch on a MacBookPro with dual graphics (integrated Intel graphics and discrete AMD GPU), the `acpi_video0/` directory initially failed to appear inside `/sys/class/backlight`.
Also relevant: my start-up log when booting into Arch included the message:

```txt
[FAILED] Failed to start `Load/Save Screen Backlight Brightness of backlight:acpi_video0.`
See `systemctl status systemd-backlight@backlight:acpi_video0.service` for details.
```

Solution: I got the `acpi_video0` directory to appear in `/sys/class/backlight` (and also eliminated the boot-up error message), by adding the kernel parameter `acpi_backlight=video` (as suggested in [ArchWiki: Backlight/Kernel command-line options](https://wiki.archlinux.org/title/backlight#Kernel_command-line_options)) to my boot configuration.

To add pass the `acpi_backlight=video` parameter to the Linux kernel, *assuming you are using* [`systemd-boot`](https://wiki.archlinux.org/title/systemd-boot) *as your boot loader*, edit the file `/boot/loader/arch.conf`, and make the following change:

```bash
# To your current kernel parameters, for example...
options root=/dev/sdaXYZ rw                          # before

# ...append `acpi_backlight=video`
options root=/dev/sdaXYZ rw acpi_backlight=video     # after
```

(Or, for a one-time test, type `e` in the `systemd-boot` boot screen when logging in, and add `acpi_backlight=video` to the kernel parameters.) 

For adding kernel parameters with other boot loaders, consult [ArchWiki: Kernel parameters](https://wiki.archlinux.org/title/Kernel_parameters).

{{< arch/arch-notes-footer >}}
