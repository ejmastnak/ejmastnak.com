---
title: First steps with NetworkManager on Linux
date: 2022-04-29
---

# First steps with NetworkManager

{{< arch/arch-notes-header >}}

{{< date-last-mod >}}

**Goal:** Connect to the Internet via Wi-Fi or Ethernet using NetworkManager from the command line.

**About:** For our current purposes, NetworkManager is a network management tool that provides easy automatic connection to the Internet.
NetworkManager manages your network interfaces, detects available connections and automatically connects network devices when connections for the device become available.
In practice, NM provides "set it and forget it" functionality---after connecting to a network on a given network interface, NM remembers the connection and will automatically connect you in the future (unless you disable automatic connection, of course).

**References:**

- For a comprehensive Linux networking guide, I recommend the Fedora documentation project's [Networking Guide](https://docs.fedoraproject.org/en-US/Fedora/25/html/Networking_Guide/part-Networking.html).
  For NetworkManager in particular, see the section on [Using the NetworkManager Command Line Tool, nmcli](https://docs.fedoraproject.org/en-US/Fedora/25/html/Networking_Guide/sec-Using_the_NetworkManager_Command_Line_Tool_nmcli.html).
- Of course there is always `man NetworkManager` and `man nmcli` and the references therein.
- Also consider [ArchWiki: NetworkManager](https://wiki.archlinux.org/title/NetworkManager), but the coverage of relevant topics is somewhat patchy at the time of writing.
- [Arch Wiki: Network Configuration](https://wiki.archlinux.org/title/Network_configuration) has useful general networking information for Arch Linux


## Contents
<!-- vim-markdown-toc GFM -->

* [Installation](#installation)
  * [Use `systemd-resolved` for DNS resolution](#use-systemd-resolved-for-dns-resolution)
  * [Disable currently running network daemons (if needed)](#disable-currently-running-network-daemons-if-needed)
  * [Start NetworkManager](#start-networkmanager)
* [Hello world network connection](#hello-world-network-connection)
  * [Check network interfaces](#check-network-interfaces)
  * [Ethernet](#ethernet)
  * [Wi-Fi](#wi-fi)
* [Checking basic network status](#checking-basic-network-status)

<!-- vim-markdown-toc -->

## Installation

Install the [`networkmanager` package](https://archlinux.org/packages/extra/x86_64/networkmanager/):

```bash
sudo pacman -S networkmanager
```

The `networkmanager` package contains a few things: the `NetworkManager` daemon itself, the `nmcli` command line interface, and the `nmtui` and a text user interface.

### Use `systemd-resolved` for DNS resolution

I recommend using the [`systemd-resolved`](https://wiki.archlinux.org/title/Systemd-resolved) service, which NetworkManager can then use for DNS resolution, i.e. converting human-readable domain names into computer-friendly IP addresses.

- You probably won't need to install anything---`systemd-resolved` is part of the `systemd` package, which is installed by default on an Arch system [(Source)](https://wiki.archlinux.org/title/Systemd-resolved#Installation).

- Start and enable the `systemd-resolved` service if necessary:

  ```bash
  # Check service status
  systemctl status systemd-resolved.service

  # If the service is not active (running), enable and start it
  systemctl enable --now systemd-resolved.service
  ```

### Disable currently running network daemons (if needed)

Context: if you had previously enabled other services for network configuration (e.g. `dhcpcd`), these would conflict with NetworkManager.
See [ArchWiki: NetworkManager/Installation](https://wiki.archlinux.org/title/NetworkManager#Installation) for a discussion of this issue.

If you're on a fresh install of Arch Linux you should have nothing to worry about,
but if you've been using Arch for a while you should double check for other network services and stop them.
Common network configuration services include `dhcpcd` and `systemd-networkd`; here is how you could check their status and disable them if necessary:

```bash
# Check the service is inactive (dead) or not found
systemctl status dhcpcd.service
systemctl disable dhcpcd.service  # disable if (active)

# And so on for other services...
systemctl status systemd-networkd.service
systemctl disable systemd-networkd.service
```

### Start NetworkManager

Finally enable and start the NetworkManager service:

```bash
systemctl enable --now NetworkManager.service
```

Reboot to ensure all changes take effect.

## Hello world network connection

### Check network interfaces

{{< details summary="What is a network interface?" >}}
Briefly, a network interface is the connection point between your computer and a computer network.
A typical computer has a wireless, Ethernet, and loopback interface;
the loopback is virtual interface used by your computer to communicate with itself.
{{< /details >}}

You *must* have an available wireless interface to use Wi-Fi and an Ethernet interface to use wired Ethernet, so you should first check you have these network interfaces available.

You can list network interfaces with the `ip link` command:

```bash
# List network interfaces
ip link       
ip -c link    # the `-c` flag gives better-readable colored output
```

You should expect a loopback, Ethernet, and wireless interface; here is an example `ip link` output on my computer:

```bash
$ ip link
1: lo         # ...additional output ommitted...
2: enp0s31f6  # ...additional output ommitted...
3: wlp4s0     # ...additional output ommitted...
```

Wired network interfaces are conventionally prefixed with `en` and wireless interfaces with `wl`,
in the above example `lo` is my loopback interface, `enp0s31f6` is my Ethernet interface, and `wlp4s0` is my wireless interface.

**Troubleshooting**

- If `ip link` does not show a wireless interface, your wireless network card probably requires a kernel driver that does not ship by default with Arch, and you will have to install this kernel driver and load the corresponding kernel module.

  This falls beyond the scope of this guide---you will need to know the manufacturer and model of your wireless network card (use `lspci -v` (or `lsusb -v` if the wireless device is connected via USB) and search the output for "Network controller") and what kernel driver is currently handling the network card device (use `lspci -k` or `lsusb -k`).
  Then consult [ArchWiki: Network configuration/Wireless](https://wiki.archlinux.org/title/Network_configuration/Wireless) and the references therein to see if your network card should be using a different kernel driver.

- If `ip link` shows a wireless interface, but its status shows `status DOWN`, your Wi-Fi might be blocked.
  You can unblock it with `rfkill unblock wifi`; see `man rfkill` for more information.

**Check-in point:** The `ip link` command lists both a wireless and Ethernet network interface (in addition to the loopback interface `lo`).

### Ethernet

Ethernet should be plug and play (assuming `NetworkManager.service` is enabled)---just plug a working Ethernet cable into your computer (potentially via a USB adapter) and NetworkManager should take care of the rest.
You can verify your connection with `nmcli general status` or `nmcli device status`, which should show a `connected` state.

Your mileage may vary, of course, but Ethernet network connections have always worked automatically for me when using NetworkManager.

### Wi-Fi

First enable Wi-Fi and list available wireless networks:

```bash
# Ensure Wi-Fi is enabled---verify status with `nmcli radio wifi`
nmcli radio wifi on
```

```bash
# List available Wi-Fi networks
$ nmcli device wifi list

# Example output of `nmcli device wifi list`:
BSSID              SSID            MODE   CHAN  RATE        SIGNAL  BARS  SECURITY
AA:11:BB:22:CC:33  MyCoolNetwork   Infra  6     230 Mbit/s  95      ▂▄▆_  WPA2
DD:44:EE:55:FF:66  AnotherNetork   Infra  6     195 Mbit/s  90      ▂▄▆_  WPA1 WPA2
GG:77:HH:88:II:99  FooBarNetwork   Infra  6     175 Mbit/s  85      ▂▄▆_  --
```

Identify your desired network's SSID, and connect as follows:

```bash
# Specify network SSID and password (for secured networks)
nmcli device wifi connect {SSID} password [password]

# Example: connecting to MyCoolNetwork
nmcli device wifi connect 'MyCoolNetwork' password 'my_secure_password'

# Unsecured networks don't need a password
nmcli device wifi connect 'FooBarNetwork'
```

**Special characters:** you may want to place `[password]` in literal (single) quotes, as in the above example, to ensure password with special characters are interpreted literally.
<br>
Example problem: something like `password foo!bar` or `password foo$bar` would cause problems with history or variable expansion, assuming the passwords contain the literal characters `!` and `$`.
<br>
Solution: use `password 'foo!bar'` or `password 'foo$bar'` instead.

## Checking basic network status

Here are a few basic commands to help you check your network status when using NetworkManager.

**Connection status**

Use `nmcli general status` to show general NetworkManager status.
Here is an example output for an active wireless connection

```bash
# Example output of `nmcli general status`
$ nmcli general status
STATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN
connected  full          enabled  enabled  enabled  enabled
```

See the `GENERAL COMMANDS` section of `man nmcli` for more information.

Use `nmcli device status` to see the connection status of each of your network interfaces.
Here is example output for an active wireless connection on a wireless network with the SSID `FooBarNetwork`:

```bash
# Example output of `nmcli device status`
$ nmcli device status
DEVICE  TYPE      STATE         CONNECTION
wlan0   wifi      connected     FooBarNetwork
enp0s1  ethernet  unavailable   --
lo      loopback  unmanaged     --
```

Use `nmcli device show` for more detailed information than `nmcli device status`.
See the `DEVICE MANAGEMENT COMMANDS` section of `man nmcli` for more information.

**Configured connections**

Use `nmcli connection show` to show the human-readable name, UUID, and interface of all previously configured network connections (e.g. to see Wi-Fi networks you have connected to in the past).
Use `nmcli connection show --active` to show only current connections.

NetworkManager stores connection files in `/etc/NetworkManager/system-connections/`---note that Wi-Fi passwords are stored in plain text and are protected only with root access permissions.
See [ArchWiki: NetworkManager/Encrypted Wi-Fi passwords](https://wiki.archlinux.org/title/NetworkManager#Encrypted_Wi-Fi_passwords) for ways to encrypt Wi-Fi passwords.

**IP addresses**

You can list the IP address associated with each of your network interfaces with the `ip address` command:

```bash
# List network interfaces and their corresponding IP addresses
ip address       # `ip addr` or even `ip a` should work, too
ip -c addresses  # use the `-c` flag for colored output
```

The output of `ip address` is a bit verbose---check the `inet` field of each interface for an IPv4 address and the `inet6` field for an IPv6 address.

{{< arch/arch-notes-footer >}}
