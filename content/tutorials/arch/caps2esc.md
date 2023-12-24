---
title: Remap Caps Lock to Escape and Control on Arch Linux
date: 2022-04-29
---

# Remap Caps Lock to Escape and Control

{{< arch/header >}}
{{< date-last-mod >}}

**Goal:** use the `caps2esc` utility to make the Caps Lock key act like the Escape key when pressed alone and act like the Control key when pressed in combination with other keys.

**Motivation:** pleasant, ergonomic, system-wide access to the very useful escape and control keys and a better Vim or Emacs experience.

**References:**
- [The caps2esc GitLab page](https://gitlab.com/interception/linux/plugins/caps2esc)
- [Ask Ubuntu: How do I install caps2esc?](https://askubuntu.com/questions/979359/how-do-i-install-caps2esc)

The `caps2esc` utility allows you to remap Caps Lock to Escape and Control at the level of the `libevdev` library.
Bonus: because `libevdev` is relatively low level---just above the operating system kernel---this solution works in a plain Linux console in addition to graphical environments.

## Procedure

Here's what to do:

### Installation

Install the [`caps2esc` package](https://archlinux.org/packages/community/x86_64/interception-caps2esc/) from the Arch community repo:

```bash
# Install caps2esc
sudo pacman -S interception-caps2esc
```

This should also install the `interception-tools` package as a dependency.
The `interception-tools` package contains an input device monitoring program called `udevmon`, which we will use shortly to capture Caps Lock and Escape key presses.

### Configure `udevmon`

Create the configuration file `/etc/udevmon.yaml` (if necessary) and inside it add the following job:

```yaml
- JOB: "intercept -g $DEVNODE | caps2esc | uinput -d $DEVNODE"
  DEVICE:
    EVENTS:
      EV_KEY: [KEY_CAPSLOCK, KEY_ESC]
```

{{< details summary="**Explanation** (click to expand)" >}}
This `udevmon` job runs the shell command `intercept -g $DEVNODE | caps2esc | uinput -d $DEVNODE` in response to presses of the Caps Lock and Escape keys, which are identified by the names `KEY_CAPSLOCK` and `KEY_ESC`;
`udevmon` will set the `$DEVNODE` variable to the path of the matching device (a virtual file somewhere in the `/dev` directory) as needed.

The shell command uses the `intercept` program to grab the Caps Lock or Escape key’s input device, pipes the key event to the `caps2esc` program (which implements the Caps Lock to Escape/Control logic), and then pipes the processed output back to a virtual key device using `uinput`.
(You can read through [Interception Tools/How it works](https://gitlab.com/interception/linux/tools#how-it-works) for details.)
{{< /details >}}

**Tip:** the above `udevmon` configuration will make Caps Lock work as Escape and Control, and *also* make Escape work as Caps Lock.
If you want the Escape key to still behave as Escape, you can replace `caps2esc` with `caps2esc -m 1`, which uses the `caps2esc` "minimal mode" and leaves the Escape key unaffected (see `caps2esc -h` for documentation).

You now just need to start the `udevmon` program, which we will do using a `systemd` unit.

### A `systemd` unit for `udevmon`

Create the `systemd` unit file `/etc/systemd/system/udevmon.service` (if necessary) and inside it add the contents

```systemd
[Unit]
Description=udevmon
Wants=systemd-udev-settle.service
After=systemd-udev-settle.service

# Use `nice` to start the `udevmon` program with very high priority,
# using `/etc/udevmon.yaml` as the configuration file
[Service]
ExecStart=/usr/bin/nice -n -20 /usr/bin/udevmon -c /etc/udevmon.yaml

[Install]
WantedBy=multi-user.target
```

This service unit starts the `udevmon` program with very high priority (`nice` lets you set a program's scheduling priority; `-20` niceness is the highest possible priority).
Make sure the path to `uvdevmon` in the `ExecStart` line (e.g. `/usr/bin/udevmon`) matches the output of `which udevmon`.

Then enable and start the `udevmon` service:

```bash
# Enable and start the `udevmon` service
sudo systemctl enable --now udevmon.service

# Optionally verify the `udevmon` service is active and running
systemctl status udevmon
```

At this point you should be done---try using e.g. `<CapsLock>-L` to clear the terminal screen (like you would normally do with `<Ctrl>-L`).
If the `udevmon` service is enabled, the `udevmon` program should automatically start at boot in the future.

<div class="mt-10">
    {{< tutorials/backhome homehref="/tutorials/arch/about" >}}
</div>

<div class="mt-8">
    {{< tutorials/thank-you >}}
<div>

<div class="mt-6">
    {{< tutorials/license >}}
<div>
