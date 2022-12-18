---
title: USB drives on Arch Linux
date: 2022-04-29
---

# Using USB drives on Arch

{{< arch/arch-notes-header >}}

{{< date-last-mod >}}

**Goal:** Explain how to read from, write to, and safely eject external USB drives.

**References:**

- [ArchWiki: USB storage devices](https://wiki.archlinux.org/title/USB_storage_devices)
- [ArchWiki: Udisks](https://wiki.archlinux.org/title/Udisks)
- [ArchWiki: File systems](https://wiki.archlinux.org/title/file_systems)
- The `man` pages for `lsblk`, `mount`, `umount`, `udisksctl`, and `udisks`.

### Contents

<!-- vim-markdown-toc GFM -->

* [Mounting a USB drive](#mounting-a-usb-drive)
  * [Detect the USB drive's block device name](#detect-the-usb-drives-block-device-name)
  * [Mount the USB drive](#mount-the-usb-drive)
* [Ejecting a USB drive](#ejecting-a-usb-drive)
* [Modern alternative: udisks2](#modern-alternative-udisks2)
* [Automounting with udiskie](#automounting-with-udiskie)

<!-- vim-markdown-toc -->

**Drives must be mounted:** to interact with the files on a USB drive from your computer, you have to mount the file system stored on the USB drive's data partition onto a dedicated *mount point* on your computer's file system (Windows/macOS and most desktop environments usually do this for you).

You can mount drives manually or automate the process with an auxiliary program.
In practice most people will automount (I show how to do this with `udiskie` at the end of the article), but you'll probably learn something if you go through the manual process at least a few times first.

## Mounting a USB drive

Here's how to mount a USB drive manually:

### Detect the USB drive's block device name

**TLDR:** plug in the USB drive and use `lsblk` to identify (1) the USB drive and (2) its data partition, which might look something like (1) `sdb` and (2) `sdb1`.
You can now [jump to mounting the USB drive](#mount-the-usb-drive).

First some terminology: the Linux kernel classifies a USB drive as a *block device* 
(because data is written to and read from the drive in fixed-sized blocks).
In general a USB drive is divided into multiple [*partitions*](https://en.wikipedia.org/wiki/Disk_partitioning); the USB drive partition holding useful files and data is called the *data partition*.

Here's how to identify a USB drive's device name and data partition name:

1. Before plugging your USB drive into your computer, run the `lsblk` ("list block devices") command from a shell to list the names of currently available block devices.
   The idea is to get a picture of available block devices *before* inserting your USB drive to make it easy to see the changes that occur *after* plugging the USB drive in.

1. Plug in your USB drive and wait a moment or so for your OS to detect it.
1. Run `lsblk` again.
   You should see a new entry (often `sdb`), which identifies your USB drive,
   and some numbered entries (e.g. `sdb1`, `sdb2`) below it---the numbered entries identify partitions on the USB drive.
   (It might help to orient yourself using the size of each block device and partition, since you presumably know beforehand how large your USB drive is.)

   ```bash
   $ lsblk 
   # Before             # After
   NAME                 NAME
   sda                  sda
   ├─sda1               ├─sda1
   ├─sda2     ---->     ├─sda2
   ├─sda3               ├─sda3
   └─sda4               └─sda4
                        sdb       <-- USB drive
                        └─sdb1    <-- USB drive data partition
   ```

   Troubleshooting: if the drive does not appear in `lsblk` try rebooting your computer---I've sometimes had this problem when I forgot to reboot after updating the operating system kernel.
   
You'll want to **identify two things**:

1. The USB drive's identifier (e.g. `sdb` or `nvme0n1`).
   I'll use `sdx` to avoid the risk of you blindly copying `sdb`, which could be something different on your computer---replace the `x` with the appropriate letter on your system (which might still be `b`).

1. The identifier of the drive's data partition, which will be the drive identifier followed by an integer number (e.g. `sdb1` or `nvme0n1p1`).
   The data partition should be the partition whose size roughly matches your USB drive's memory capacity.
   I'll use `sdxN`---replace the `N` with the number on your computer.

Remember these two identifiers for later.

### Mount the USB drive

**TLDR:** create a mount directory and then mount the drive to the mount directory with `mount`:

```bash
# TLDR: create a mount point and mount the drive
sudo mkdir /mnt/usbdrive            # create a mount point (if needed)
sudo mount /dev/sdxN /mnt/usbdrive  # mount the drive's data partition
```

You can now [jump to ejecting the USB drive](#ejecting-a-usb-drive).

In more detail: a mount point is a location on one file system from which you interact with a second file system;
in our context, a mount point is the directory on your computer's file system from which you can interact with the files on the USB drive's file system.
(Note that the USB drive's files are not copied to the mount directory---the directory only serves as an access point.)

Mount points are conventionally located inside the `/mnt` directory---you should first **create a directory inside `/mnt` to use as a USB mount point**.
You can name it whatever you want; I'll use the generic name `/mnt/usbdrive`

```bash
# Create a mount point for the USB drive.
# You'll need sudo privileges because /mnt is on the root partition.
sudo mkdir /mnt/usbdrive  # replace 'usbdrive' with whatever you like
```

You only need to create the mount directory once---it will stay on your file system and you can reuse it later as a mount point whenever you use a USB drive.

You can then **mount the drive's data partition to the mount directory** using the `mount` command:

```bash
# Mount the USB drive by specifying its entry in the `/dev` directory.
# Replace `sdxN` with the data partition identifier shown by `lsblk`, e.g. `sdb1`
sudo mount /dev/sdxN /mnt/usbdrive
```

Note that you mount the drive's data partition (e.g. `sdb1`) and not the root drive device (e.g. `sdb`).
Check that the drive is properly mounted using `lsblk`---the `MOUNTPOINTS` column for the drive's data partition entry should now show `/mnt/usbdrive`, and the USB drive's files should appear in `/mnt/usbdrive` (or whatever mountpoint you used).

At this point you can **interact with the files on the USB drive from the mount directory on your computer's file system**, reading/writing/copying just like with any other directory (but note that you'll need root privileges to write to the drive if it's mounted in `/mnt`).

{{< details summary="Troubleshooting: if reading or writing fails (even when using root privileges)..." >}}
Your USB drive may be using a file system that requires an additional package before you can read to/write from it.
Check the USB drive's file system (use e.g. `lsblk -f` and check the `FSTYPE` column), and then install the corresponding package listed in the 'Userspace utilities' of the [ArchWiki file system table](https://wiki.archlinux.org/title/file_systems#Types_of_file_systems).
Most commonly you'll run into problems with drives using Microsoft's [NTFS file system](https://en.wikipedia.org/wiki/NTFS) and will need to install the [`ntfs-3g` package](https://archlinux.org/packages/extra/x86_64/ntfs-3g/).
{{< /details >}}

## Ejecting a USB drive

Safely ejecting a USB drive requires two steps:
(1) unmounting the drive's data partition and 
(2) powering off the drive.
First **unmount the drive's data partition** with the `umount` command:

```bash
# Unmount the drive's partitions---choose one option.

# Option 1
umount /mnt/usbdrive  # by specifying mount point (preferred)

# Option 2
umount /dev/sdxN      # by specifying the device partition (not preferred)
```

<!-- From `man umount`, specifying the mount directory is preferred, in case the physical device is mounted to multiple directories. -->

You can check the drive is unmounted using `lsblk`---the `MOUNTPOINTS` column for the drive's data partition entry should now be blank.

At this point it's probably safe to remove the drive, but it's best practice to first **power off the drive**.
This is probably easier with `udisksctl`'s `power-off` command, described in the [next section](#modern-alternative-udisks2).
But without third-party tools, you can power off a drive by writing directly to the USB drive's device files [(more info on Linux device files)](https://wiki.archlinux.org/title/Device_file) using root privileges:

```bash
# Option 1: works from a normal user shell using sudo
echo 1 | sudo tee /sys/block/sdx/device/delete

# Option 2: works only from a root shell
echo 1 > /sys/block/sdx/device/delete
```

Note that you target the root drive device (e.g. `sdb`) and not the data partition (e.g. `sdb1`).

Note that you can't just `sudo echo 1 >` as a regular user because the sudo privileges aren't transfered through the `>` redirection operation, but you can get around this with `tee`.
For more discussion of the power-off line see [this StackExchange answer](https://unix.stackexchange.com/a/43450) and/or [ArchWiki: USB storage/Device not shutting down after unmounting all partitions](https://wiki.archlinux.org/title/USB_storage_devices#Device_not_shutting_down_after_unmounting_all_partitions).



## Modern alternative: udisks2

At this point the article has covered everything you need to know to interact with USB drives.
You can safely stop reading.

Or, if you're interested, here is a **more modern way to mount, unmount, and eject drives** using the [`udisks2` package](https://archlinux.org/packages/extra/x86_64/udisks2/);
it is similar, but perhaps a bit cleaner, than the traditional `mount` and `umount` workflow described above.
I'll assume **you're familiar with the mount/unmount/eject material earlier in the article** and continue using `/dev/sdx` to identify a USB drive and `/dev/sdxN` to identify the drive's data partition.

Here is the basic operation mount/unmount/power-off workflow with `udisks2`.
You perform all commands with the CLI tool `udisksctl`:

1. If needed, **install** `udisks2` with `sudo pacman -S udisks2`

2. Plug in a USB drive and use `udisksctl` to **mount the drive's data partition**:
   
   ```bash
   # Mount a drive's data partition
   udisksctl mount -b /dev/sdxN
   ```

   You'll **find the drive's files** in the directory `/run/media/$USER/$DEVICE_UUID`.

3. To eject a drive, **unmount its data partition and power off the drive**:

   ```bash
   # Unmount a drive's data partition
   udisksctl unmount -b /dev/sdxN

   # Power off a drive
   udisksctl power-off -b /dev/sdx
   ```

A few comments:

- You don't need `sudo` privileges to use USB drives with `udisks2`, which is nice.
  (`udisks2` gets around sudo privileges using access control lists, but I don't know the details.)
- The `-b` flag is used to specify a block device.
- By default `udisks2` mounts removable drives at `/run/media/$USER/$DEVICE_UUID` and creates a mount point with the drive's alphanumeric UUID (which you can see with e.g. `lsblk -f`).
  <!-- https://wiki.archlinux.org/title/persistent_block_device_naming -->
  This behavior can be customized as described in [ArchWiki: Udisks/Mount to `/media`](https://wiki.archlinux.org/title/Udisks#Mount_to_/media).
- `udisksctl` uses `unmount` instead of `umount` to unmount drives.
- Powering off a drive is much cleaner with `udisks2` than writing to a drive's `device/delete` file.

## Automounting with udiskie

If you don't mind manually issuing `mount` commands to mount USB drives, this article has nothing more for you---feel free to stop reading. 

And for those that find manually calling `mount` to be tedious, you can combine `udisks2` with a program that detects when you physically plug in a USB drive and then mounts the drive for you---this is called *automounting*, and basically saves you a manually-typed `mount` command.
(You should be familiar with the [`udisks2` section](#modern-alternative-udisks2) first.)

<!-- Automounting: run a program that listens for USB drives being plugged in. -->
<!-- When the drive is plugged in, mount it. -->

If you want to try automounting, I suggest using [`udiskie`](https://github.com/coldfix/udiskie) (but see the ArchWiki for a [full list of mount helpers](https://wiki.archlinux.org/title/Udisks#Mount_helpers)).
Here's how to automount USB drives with `udiskie`:

- Install the [`udiskie` package](https://archlinux.org/packages/community/any/udiskie/) with `pacman -S udiskie`.
  See the [`udiskie` wiki](https://github.com/coldfix/udiskie/wiki) for documentation.

- Run the `udiskie` program and forget about it---it's probably easiest to autostart `udiskie` as a background process from your `~/.xinitrc`, `~/.xprofile`, window manager, or desktop environment, whichever is appropriate for your setup.
  If you're new to autostarting programs, I suggest taking a detour and looking through these [three](https://wiki.archlinux.org/title/autostarting#On_Xorg_startup) [ArchWiki](https://wiki.archlinux.org/title/autostarting#On_desktop_environment_startup) [sections](https://wiki.archlinux.org/title/autostarting#On_window_manager_startup), then checking the [`udiskie` wiki](https://github.com/coldfix/udiskie/wiki/Usage).

- As long as `udiskie` is running, it will detect plugged-in drives and automount them using using `udisksctl` (i.e. `udiskie` mounts to `/run/media/$USER/$DEVICE_UUID` just like `udisksctl`).
  You'll probably also get some desktop notifications if you [have a notification server running]({{< relref "tutorials/arch/battery-alert" >}}).

- Interact with and eject the drive as described earlier in the [`udisks2` section](#modern-alternative-udisks2), i.e. you still manually eject the drive with `umount` and `power-off`.

{{< arch/arch-notes-footer >}}
