---
title: Adjust volume with keyboard keys on Arch Linux
date: 2022-05-11
---

# Keyboard-based volume adjustment

{{< arch/arch-notes-header >}}

{{< date-last-mod >}}

**Goal:** understand how to programmatically adjust audio playback volume from the command line either through ALSA or PulseAudio, then create convenient key bindings to do this for you.
Best served with this series's [media player control]({{< relref "/tutorials/arch/playerctl" >}}).

**Read this if:** your laptop has keyboard functions keys for increasing and decreasing audio volume, but these keys have no effect on your volume after a standard install of Arch.
If your volume keys already work (perhaps your window manager or desktop environment configured them for you), you probably don't need this guide.

**References:**
- [ArchWiki: ALSA](https://wiki.archlinux.org/title/Advanced_Linux_Sound_Architecture)
- [ArchWiki: acpid](https://wiki.archlinux.org/title/Acpid)
- [Wikipedia: Sound server](https://en.wikipedia.org/wiki/Sound_server)

<!-- (Note: this page closely parallels my guide to [controlling a laptop's backlight brightness]({{< relref "/tutorials/arch/backlight" >}}), since both rely `acpid` to set key bindings.) -->

## Procedure

There are two independent tasks in this article: (1) learning the shell commands to control volume and (2) binding these commands to keyboard keys using `xbindkeys`.

<!-- vim-markdown-toc GFM -->

* [Adjust volume from a shell](#adjust-volume-from-a-shell)
  * [Kernel-level drivers and sound servers](#kernel-level-drivers-and-sound-servers)
  * [Your choices](#your-choices)
  * [Control volume with ALSA and `amixer`](#control-volume-with-alsa-and-amixer)
  * [Control volume with PulseAudio and `pactl`](#control-volume-with-pulseaudio-and-pactl)
  * [Shell script for volume control](#shell-script-for-volume-control)
* [Convenient key mappings for volume control](#convenient-key-mappings-for-volume-control)
    * [Detect key symbols](#detect-key-symbols)
    * [Define key bindings in `.xbindkeysrc`](#define-key-bindings-in-xbindkeysrc)
    * [Activate key bindings](#activate-key-bindings)
* [Bonus: Cap PulseAudio volume at 100%](#bonus-cap-pulseaudio-volume-at-100)

<!-- vim-markdown-toc -->

## Adjust volume from a shell

### Kernel-level drivers and sound servers

You're blessed (cursed?) with multiple choices.
Here's the problem: The Arch Linux sound system has multiple levels (see e.g. [ArchWiki: Sound System/General information](https://wiki.archlinux.org/title/sound_system#General_information)).
These include:

- Low-level drivers and APIs (*required* for sound to work).
  <br>
  Examples: [ALSA](https://wiki.archlinux.org/title/Advanced_Linux_Sound_Architecture) (ships with Arch by default, already installed, and by far the most common); [OSS](https://wiki.archlinux.org/title/Open_Sound_System) (an ALSA alternative you'd have to install manually from the AUR).
  
- A sound server (*optional*, but most users end up installing one).
  <br>
  Examples: PulseAudio (`pulseaudio` package), PipeWire (`pipewire` package), and JACK (`jack2` package).
A sound server, among other things, makes it possible for different applications play audio at different volumes, and is a typical component of a modern desktop computing setup.

You can read more about a typical sound system stack at [Wikipedia: Sound server/Layers](https://en.wikipedia.org/wiki/Sound_server#Layers).

**What this guide covers:** I'll only cover ALSA and the PulseAudio sound server in this guide.
Reasoning: everyone has ALSA, and PulseAudio is (as far as I know) the most common sound server.
You'll have to look elsewhere to adjust volume using a different sound server.

### Your choices

You have two common ways to control volume:

- Through ALSA, using the `amixer` program provided by the [`alsa-utils` package](https://archlinux.org/packages/extra/x86_64/alsa-utils/) (which you'll have to explicitly install).

- Through PulseAudio, using the `pactl` program provided by the [`libpulse` package](https://archlinux.org/packages/extra/x86_64/libpulse/) (a dependency of `pulseaudio`, so you should have `pactl` if you have `pulseaudio`).

The best choice depends on whether or not you have PulseAudio installed (check `pacman -Q pulseaudio`) and running (check `systemctl --user status pulseaudio.service`).

Here are my suggestions:

- If you only have ALSA and aren't running PulseAudio: use `amixer`
- If you're running PulseAudio: use PulseAudio's `pactl` (alternatively, if you *really* want to use `amixer`, you can install the `pulseaudio-alsa` package and use ALSA's `amixer`).

Loosely, PulseAudio can get confused if you adjust volume through the low-level ALSA while the higher-level PulseAudio server is running (unmuting might not work, for example).
This is why you'd need to install `pulseaudio-alsa` if you want to control volume with ALSA's `amixer` while simultaneously running PulseAudio.

### Control volume with ALSA and `amixer`

The `amixer` utility uses the concept of "controls" (which correspond to physical controls on your soundcard) and "simple controls"---a software abstraction of hardware controls.

We will work exclusively with the main simple control, which is named `Master` (you can list all available simple controls with `amixer scontrols`).
Controlling the `Master` playback volume with `amixer` is as simple as:

```bash
amixer set Master 50%     # set volume to 50% of max
amixer set Master 5%+     # increase current volume by 5%
amixer set Master 5%-     # decrease current volume by 5%

amixer set Master mute    # mute audio
amixer set Master unmute  # unmute audio
amixer set Master toggle  # toggle between mute and unmute
```

Try playing around with these commands yourself and listening for physical changes in audio.
(And take a look through `man amixer`, which is clear and concise.)

Worth noting: in theory, `amixer` can distinguish between percentages in raw hardware volume and human-perceived volume based on the use of the `-R` or `-M` flags---see the `OPTIONS` section of `man amixer` for details.
In practice, I haven't noticed a difference between the two, at least when using `amixer` while simultaneously running PulseAudio.

**Check-in point:** At this point you should be able to change/mute/unmute the `MASTER` control's volume level by issuing `amixer set Master` commands from a shell, and you should be able to hear the corresponding change in physical volume.

### Control volume with PulseAudio and `pactl`

PulseAudio uses a concept of "sources" and "sinks"---PulseAudio receives audio from sources and sends audio to sinks.
If you're familiar with engineering or physics, PulseAudio's naming of sources and sinks might make sense from a vector calculus perspective of sound energy flow into the computer.
But for all practical purposes, you can ignore that and just think of microphones as sources and speakers as sinks.

<!-- You can list sinks with `pactl list sinks` -->

You can control master volume through the `@DEFAULT_SINK@`, which, as far as I can tell, seems to be the `pactl` equivalent of `amixer`'s `Master` control in this context.

```bash
pactl set-sink-volume @DEFAULT_SINK@ 50%  # set volume to 50% of maximum
pactl set-sink-volume @DEFAULT_SINK@ +5%  # increase current volume by 5%
pactl set-sink-volume @DEFAULT_SINK@ -5%  # decrease current volume by 5%
pactl get-sink-volume @DEFAULT_SINK@      # get current volume

pactl set-sink-mute @DEFAULT_SINK@ 1       # mute speakers
pactl set-sink-mute @DEFAULT_SINK@ 0       # unmute speakers
pactl set-sink-mute @DEFAULT_SINK@ toggle  # toggle between mute and unmute
```

**Check-in point:** At this point you should be able to change/mute/unmute the default audio sink's volume level by issuing `pactl` commands from a shell, and you should be able to hear the corresponding change in physical volume.

### Shell script for volume control

In preparation for creating key bindings, we'll wrap the above commands in a shell script.
In this guide I'll name the script `volume.sh` and place it at `~/scripts/volume.sh`, but in principle any readable location on your file system should work.

You should choose *either* the `pactl` commands (if using PulseAudio) *or* the `amixer` commands (if using only ALSA).

```bash
#!/bin/sh
# NAME
#     volume.sh - Increase/decrease/mute volume
# SYNOPSIS 
#     volume.sh <raise|lower|mute>
# Suggested location: ~/scripts/volume.sh

step=5   # number of percentage points to increase/decrease volume

# Select EITHER the `amixer` or the `pactl` command in each case
if [ $1 == "raise" ]; then
  # pactl set-sink-volume @DEFAULT_SINK@ "+${step}%"
  # amixer set Master ${step}%+ > /dev/null
elif [ $1 == "lower" ]; then
  # pactl set-sink-volume @DEFAULT_SINK@ "-${step}%"
  # amixer set Master ${step}%- > /dev/null
elif [ $1 == "mute" ]; then
  # pactl set-sink-mute @DEFAULT_SINK@ toggle
  # amixer set Master toggle > /dev/null
else
  echo "Unrecognized parameter: ${1}"
  echo "Usage should be: volume.sh <raise|lower|mute>"
fi
```

(The `> /dev/null` lines redirects the `amixer` commands' noisy standard output to `/dev/null`, but this isn't strictly necessary.)

Then make the script executable:

```bash
chmod +x ~/scripts/volume.sh
```

**Check-in point:** the script works when run manually with the `raise`, `lower`, and `mute` arguments, e.g. `~/scripts/volume.sh raise` increases audio volume by the value of `step`, running `~/scripts/volume.sh mute` toggles mute, etc.

## Convenient key mappings for volume control

We'll set up volume key bindings using `xbindkeys`, just like in the article on [media player control]({{< relref "/tutorials/arch/playerctl" >}}).

{{< details summary="Why use `xbindkeys` and not `acpid`?" >}}
To ensure we’re on the same page: there are *many* different ways to set key bindings on Linux, including through
`acpid` events (like in the [laptop backlight article]({{< relref "/tutorials/arch/backlight" >}})),
using `xbindkeys` (like in this article)
or through your window manager (for example i3 offers `bindsym XF86AudioRaiseVolume <shell-command>`).

Shell scripts triggered by `acpid` keys run as `root` and don’t work well when using PulseAudio, which runs as a user service.
See e.g. [[pulseaudio-discuss] Change sound via acpid ](https://pulseaudio-discuss.freedesktop.narkive.com/2KTkaiRo/change-sound-via-acpid) for context.
I choose to use `xbindkeys` in this guide as a compromise that will work for all X users, regardless of window manager and choice of `amixer` vs. `pactl`.
{{< /details >}}

Following the recipe from the [media player control article]({{< relref "/tutorials/arch/playerctl" >}}), you'll need two pieces of information to define a key binding with `xbindkeys`:

1. The X11 key symbol (keysym) of the key you want to bind.
   (`xbindkeys` identifies keyboard keys by their X11 keysym, which is, loosely, just a short code name for the key.)

1. The program you want to run when the key is pressed (e.g. `volume.sh raise` to increase volume using the `volume.sh` script).
   You can then use `xbindkeys` to bind the program to the keysym.

#### Detect key symbols

You can identify X11 keysyms with the `xev` (X events) utility:
open a shell and run `xev`, type the key you wish to bind, and record the keysym.
Below is an example `xev` output when pressing my mute, lower-volume, and raise-volume keys (`F1`, `F2`, and `F3` on my computer).
I've highlighted the keysyms.

<div class="highlight"><pre tabindex="0" class="chroma"><code class="language-bash" data-lang="bash"><span class="line"><span class="cl"><span class="c1"># The keysym for the mute key is &#34;XF86AudioMute&#34;</span>
</span></span><span class="line"><span class="cl">KeyPress event, serial 34, synthetic NO, window 0x3e00001,
</span></span><span class="line"><span class="cl">    root 0x79b, subw 0x0, <span class="nb">time</span> 54529285, <span class="o">(</span>-54,515<span class="o">)</span>, root:<span class="o">(</span>913,527<span class="o">)</span>,
</span></span><span class="line"><span class="cl">    state 0x0, keycode <span class="m">121</span> <span class="o">(</span>keysym 0x1008ff12, <span class="ga">XF86AudioMute</span><span class="o">)</span>, same_screen YES,
</span></span><span class="line"><span class="cl">    <span class="c1"># (additional irrelevant output omitted)</span>
</span></span><span class="line"><span class="cl">
</span></span><span class="line"><span class="cl"><span class="c1"># The keysym for the lower-volume key is “XF86AudioLowerVolume”</span>
</span></span><span class="line"><span class="cl">KeyPress event, serial 34, synthetic NO, window 0x3e00001,
</span></span><span class="line"><span class="cl">root 0x79b, subw 0x0, <span class="nb">time</span> 54526872, <span class="o">(</span>-54,515<span class="o">)</span>, root:<span class="o">(</span>913,527<span class="o">)</span>,
</span></span><span class="line"><span class="cl">state 0x0, keycode <span class="m">122</span> <span class="o">(</span>keysym 0x1008ff11, <span class="ga">XF86AudioLowerVolume</span><span class="o">)</span>, same_screen YES,
</span></span><span class="line"><span class="cl"><span class="c1"># (additional irrelevant output omitted)</span>
</span></span><span class="line"><span class="cl">
</span></span><span class="line"><span class="cl"><span class="c1"># The keysym for the raise-volume key is “XF86AudioRaiseVolume”</span>
</span></span><span class="line"><span class="cl">KeyPress event, serial 34, synthetic NO, window 0x3e00001,
</span></span><span class="line"><span class="cl">root 0x79b, subw 0x0, <span class="nb">time</span> 54524981, <span class="o">(</span>-54,515<span class="o">)</span>, root:<span class="o">(</span>913,527<span class="o">)</span>,
</span></span><span class="line"><span class="cl">state 0x0, keycode <span class="m">123</span> <span class="o">(</span>keysym 0x1008ff13, <span class="ga">XF86AudioRaiseVolume</span><span class="o">)</span>, same_screen YES,
</span></span><span class="line"><span class="cl"><span class="c1"># (additional irrelevant output omitted)</span>
</span></span></code></pre></div>

The keysyms for the mute, lower-volume, and raise-volume keys are `XF86AudioMute`, `XF86AudioLowerVolume`, `XF86AudioRaiseVolume`---they'll very likely be the same on your system, too.
You have to do a bit of digging through `xev`'s verbose output here; alternatively you could run `xev | grep keysym` to only print the keysym line.

#### Define key bindings in `.xbindkeysrc`

It's easy: first (if needed) create the `~/.xbindkeysrc` config file; you can do this manually or run:

```bash
# Generate a default xbindkeys config file with commented-out examples
xbindkeys --defaults > ~/.xbindkeysrc

# ...or just manually create an empty file with your favorite editor
[nano | vim | nvim] ~/.xbindkeysrc
```

Then define key bindings in `xbindkeysrc` file with the general syntax:

```bash
# Place shell command in quotes and keysym on a new line
"SHELL-COMMAND"
  KEYSYM
```

Here are concrete examples relevant to this guide:

```bash
# Use XF86AudioMute to mute volume
"${HOME}/scripts/volume-pulse.sh mute"
   XF86AudioMute

# Use XF86AudioRaiseVolume to raise volume
"${HOME}/scripts/volume-pulse.sh raise"
   XF86AudioRaiseVolume

# Use XF86AudioLowerVolume to lower volume
"${HOME}/scripts/volume-pulse.sh lower"
   XF86AudioLowerVolume
```

These key bindings will run the shell script `volume.sh` (with arguments depending on the key) whenever the keys with X11 keysyms `XF86AudioMute`, `XF86AudioLowerVolume`, or `XF86AudioRaiseVolume` are pressed.

For more information and examples using `xbindkeys` see [ArchWiki: Xbindkeys](https://wiki.archlinux.org/title/Xbindkeys).

#### Activate key bindings

1. Run `xbindkeys` in a shell to activate the just-defined key bindings.

1. To make changes permanent, place the line `xbindkeys` above the line that starts your window manager or DE in your `~/.xinitrc` file, which will load key bindings each time you start X.
   Here is an example:

   ```bash
   # Activate X key bindings
   xbindkeys
 
   # Start the i3 window manager (or whatever WM or DE you use)
   exec i3
   ```

   See [ArchWiki: Xbindkeys/Making changes permanent](https://wiki.archlinux.org/title/Xbindkeys#Making_changes_permanent) for more information.

That's it!
The volume keys should now run the `volume.sh` script, which (if you've met the earlier check-in points) should adjust your audio volume.

## Bonus: Cap PulseAudio volume at 100%

Context: PulseAudio will happily increase volume above the nominal hardware maximum.
I prefer to disable this behavior and cap volume at the hardware 100% level;
I you'd prefer this too, here's a modified `volume.sh` script that caps volume at the level of the `max` variable:

```bash
#!/bin/sh
# NAME
#     volume.sh - Increase/decrease/mute volume using PulseAudio pactl
# SYNOPSIS 
#     volume.sh <raise|lower|mute>
# Suggested location: ~/scripts/volume.sh

step=5   # number of percentage points to increase/decrease volume
max=100  # do not increase volume above this percentage

# Prints current volume percentage, e.g. `60`, `95`, `20`, etc.
function get_current_volume() {
  pactl get-sink-volume @DEFAULT_SINK@ | awk -F '/' '{print $2}' | grep -o '[0-9]\+'
}

if [ $1 == "raise" ]; then

  # Modification: only increase volume if current volume is less than `max`
  if [ `get_current_volume` -lt ${max} ]; then
    pactl set-sink-volume @DEFAULT_SINK@ "+${step}%"
  fi

# The rest of the script is identical to the original `volume.sh`
elif [ $1 == "lower" ]; then
  pactl set-sink-volume @DEFAULT_SINK@ "-${step}%"
elif [ $1 == "mute" ]; then
  pactl set-sink-mute @DEFAULT_SINK@ toggle
else
  echo "Unrecognized parameter: ${1}"
  echo "Usage should be: volume.sh <raise|lower|mute>"
fi
```

{{< arch/arch-notes-footer >}}
