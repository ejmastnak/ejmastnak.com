---
title: Copy and paste in Alacritty, tmux, and Vim on Arch Linux
date: 2022-04-29
---

# Clipboard on X11, Alacritty, and Vim

{{< arch/arch-notes-header >}}

{{< date-last-mod >}}

**Goal:** Comfortably copy and paste between GUI applications in the X Window System, the Alacritty terminal, and Vim/Neovim.

**Dependencies:** This guide works on the X Window System, and is targetted towards Alacritty and Vim/Neovim users.
You should first [set up X]({{< relref "tutorials/arch/startx" >}}) if you have not yet done so.


**References:**
- [ArchWiki: Clipboard](https://wiki.archlinux.org/title/Clipboard): lists tools for interacting with the clipboard
- Answer to [StackExchange: How to toggle or turn off text selection being sent to the clipboard](https://unix.stackexchange.com/a/213843): how the `PRIMARY` and `CLIPBOARD` selections work in X
- [Official freedesktop.org clipboard specification](https://specifications.freedesktop.org/clipboards-spec/clipboards-latest.txt): quite informative once you get paste the boring plain-text formatting

<!-- For Vim clipboard configuration, see [this StackExchange answer](https://vi.stackexchange.com/a/96). -->

## An X clipboard crash course {#x-clipboard-crash-course}

(To help new users coming from Windows and macOS; feel free to skip.)

**TLDR:** X has two clipboards, called `CLIPBOARD` and `PRIMARY`. Use `CLIPBOARD` for Windows/macOS-style copy and paste and `PRIMARY` for text selected by the mouse.
**End TLDR.**

Windows and macOS have one system-wide clipboard.
The X Window System commonly used on Linux has *two*[^1] standardized system-wide buffers that act as independent clipboards.
Loosely, in macOS/Windows terms, you basically have two clipboards.
Their names are `CLIPBOARD` and `PRIMARY`, and here is what they do:

[^1]: Technically there are three X clipboard-like buffers---`CLIPBOARD`, `PRIMARY`, and `SECONDARY`, but the `SECONDARY` buffer is rarely used.

- `CLIPBOARD`: essentially the equivalent of the macOS or Windows clipboard.
  Copy text into `CLIPBOARD` with GUI menu options or `<Ctrl>-C` (or in rare cases, e.g. Alacritty, a similar keyboard shortcut), and paste from `CLIPBOARD` with GUI menu option, `<Ctrl>-V`, or a similar shortcut.

- `PRIMARY`: used specifically to manipulate text selected with the mouse.
  Any text selected by the mouse in X applications (e.g. highlighted text in a web browser) is automatically stored in `PRIMARY`.
  You paste the contents of `PRIMARY` with a middle mouse click.

Copying text into `CLIPBOARD` requires an explicit action on the user's part (e.g. button press, keyboard shortcut), while mouse-selected text is automatically copied into `PRIMARY` without explicit action on the user's part.
Many users, especially those interested in a Windows/macOS-like experience, will probably use the `CLIPBOARD` buffer more than `PRIMARY`.

The rest of this article shows how to get text into and out of `CLIPBOARD` in various programs, allowing you to copy and paste between programs via the `CLIPBOARD` buffer.

## GUI applications

In most X GUI applications (e.g. a web browser):

- Copy text into `CLIPBOARD` with `<Ctrl>-C` or a "Copy" option in a GUI menu.
- Paste text stored in `CLIPBOARD` with `<Ctrl>-V` or "Paste" menu option.

## Alacritty

(This section assumes haven't changed Alacritty's default copy/paste key bindings, in which case you probably already knew what you were doing.)

- Copy text into `CLIPBOARD` with `<Ctrl>-<Shift>-C` (and not `<Ctrl>-C` like most other X applications).
  Alacritty intentionally avoids `<Ctrl>-C` for copying because `<Ctrl>-C` is nearly universally used to send the interrupt signal `SIGINT` to programs in the shell.

- Paste text stored in `CLIPBOARD` with `<Ctrl>-<Shift>-V` (and not `<Ctrl>-V`)

{{< details summary="**Custom Alacritty key bindings** (click to expand)" >}}

You can change Alacritty’s default `CLIPBOARD` copy/paste keys in the `key_bindings:` section of the `alacritty.yml` config file---you’ll need to bind keys to Alacritty’s `Paste` and `Copy` actions.
Here are the default bindings to give you a feel for the syntax:

```yaml
key_bindings:
    - { key: V, mods: Control|Shift, action: Paste }
    - { key: C, mods: Control|Shift, action: Copy }
```

The `# Key bindings` section in the default `alacritty.yml` file contains all the documentation you need to define your own bindings.
  (You can find the latest `alacritty.yml` file on the [Alacritty GitHub release page](https://github.com/alacritty/alacritty/releases).)
 
{{< /details >}}

**Bonus: Copying with Alacritty Vi mode**

If you're familiar with Vim keybindings, you can also copy text in Alacritty using Alacritty's Vi mode.
Here are the tools you need:

- `<Ctrl>-<Shift>-<Space>` enters Vi mode (you can configure this key binding using the `ToggleViMode` action in `alacritty.yml`).
- Navigate with standard Vim key bindings, e.g. `h`, `j`, `k`, `l`, `w`, `b`, etc.
- `v` enters visual mode, from which you select the text you want to copy (`V` for visual line mode is also supported).
- `y` in visual mode copies selected text to `CLIPBOARD`.
- `<Ctrl>-<Shift>-<Space>` exits Vi mode.

## Vim and Neovim

Goal: Make Vim/Neovim's yank, delete, and change operations copy into system `CLIPBOARD`, and make Neovim's put (paste) operation paste from the `CLIPBOARD`.
Example use case: copy a URL in a web browser with `<Ctrl>-C`, then paste the URL into Neovim with the default `p` action.

### Requirements {#requirements}

Note: Vim and Neovim have different clipboard interfaces.
Here's what a typical user needs to know:

- **Neovim users:** Neovim communicates with the system clipboard via a clipboard provider program (see Neovim's `:help clipboard` for more information).
  For our purposes, this means you should install a third-party clipboard provider; I suggest [`xclip`](https://github.com/astrand/xclip), which you can install with

  ```bash
  sudo pacman -S xclip
  ```

  Neovim will notice `xclip` is installed and take care of the rest.
  To double check, you can use `:checkhealth` in Neovim to test clipboard status;
  an example output if `xclip` is correctly installed might look like this:

  ```txt
  ## Clipboard (optional)
    - OK: Clipboard tool found: xclip
  ```

- **Vim users:** your version of Vim must be compiled with the `+X11` and `+clipboard` features to properly interact with the X `CLIPBOARD` and `PRIMARY` selections.
  You can check this by running `vim --version` on a command line; the output should show `+X11` and `+clipboard`.
  If `vim --version` shows `-X11` or `-clipboard`, you need a new version of Vim.
  You could either compile from source with the desired features or use the following workaround:

  1. Install gVim (a GUI-compatible version of Vim) with `sudo pacman -S gvim`.
  1. Remove `vim` if prompted by `pacman` about conflicting packages.
  1. Use the `vim` command as before; `vim --version` should now show `+X11` and `+clipboard`.

  Why this works: the `gvim` package includes a terminal version of Vim in addition to the gVim GUI, and the terminal `vim` includes GUI features that regular Vim does not have.

### Vim clipboard theory

Suggested prerequisite knowledge:

- The difference between X's `CLIPBOARD` and `PRIMARY` selections (scroll up and read [An X11 clipboard crash course]({{< relref "#x-clipboard-crash-course" >}}) for a refresher.)
- What Vim registers are and how to use them---a sentence like "use `"ayiw` to yank a word into the `a` register"  or "use `"bp` to paste the contents of the `b` register" should make sense to you.
  If needed, I suggest taking a 20-minute detour and learning about registers; a good place to start might be Brian Storti's [Vim registers: The basics and beyond](https://www.brianstorti.com/vim-registers/), then moving on to the official documentation in `:help registers`

Both Vim and Neovim use the `*` register to interact with `PRIMARY` and the `+` register to interact with `CLIPBOARD`.
This means you can use operations like `"+p` to paste the contents of `CLIPBOARD` selection into Vim or `"*` to copy Vim text into the `PRIMARY` selection.
(For documentation, see the `Selection registers "* and "+` section in `:help registers`.)

### Configure the clipboard

You can configure Vim/Neovim to use the `*` and/or `+` registers for copy and paste through the built-in `clipboard` option.
You have three choices---in your `vimrc` or `init.vim`...

1. Set `clipboard=unnamedplus` to make Vim use the `+` register (and thus the `CLIPBOARD` selection) for all yank, delete, change and put operations.

1. Set `clipboard=unnamed` to make Vim use the `*` register (and thus the `PRIMARY` selection) for all yank, delete, change and put operations.

1. Set `clipboard=unnamed,unnamedplus` to make Vim's yank, delete, and change operations copy into both `+` and `*`, and make the put operations paste from `+`.

That should be it---Vim's native yank/delete/change/put operations should now interact with the X `CLIPBOARD` and `PRIMARY` selections.
For documentation of `unnamed` and `unnamedplus` see `:help 'clipboard'` (make sure to include the single quotes!).
For more Vim-related copy/paste documentation than a typical user would ever want to read, check out `:help 'clipboard'`, `:help registers`, `:help quoteplus`, and `:help quotestar`.

Reminder: Neovim users will need a clipboard provider (e.g. `xclip`) and Vim users will need a Vim with the `+X11` and `+clipboard` features.
Scroll back up to the [Requirements]({{< relref "#requirements" >}}) section for a refresher.

<!-- ## tmux -->

<!-- Use case: copy text that was printed to standard output in a shell session (say). -->
<!-- - First enter `<Prefix>-[` to enter Tmux copy mode -->
<!-- - Use Vim keybindings to select text you wish to copy (e.g. `V` to enter visual line mode, then navigate with `hjkl`). -->
<!-- - Press `<Enter>` to copy selected text to the system `CLIPBOARD`. -->

<!-- You can then interact with the just-copied text just like any other text in the system `CLIPBOARD`. -->

<!-- https://www.rockyourcode.com/copy-and-paste-in-tmux/ -->

<!-- https://unix.stackexchange.com/a/349020 -->

<!-- https://github.com/tmux/tmux/wiki/Clipboard -->


{{< arch/arch-notes-footer >}}
