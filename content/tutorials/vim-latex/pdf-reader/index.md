---
title: PDF Reader for LaTeX and Vim | Vim and LaTeX Series Part 6
prevFilename: "compilation"
prevDisplayName: "« 5. Compilation"
nextFilename: "vimscript"
nextDisplayName: "7. Vimscript »"
date: 2021-10-08
---

# 6. Setting Up a PDF Reader for Writing LaTeX with Vim

{{< vim-latex/header part="six" >}}
{{< vim-latex/navbar >}}

This article explains, for both Linux and macOS, how to set up a PDF reader for displaying the PDF file associated with the LaTeX source file being edited in Vim.
The article was last modified on {{< date-last-mod-span >}}.

{{< vim-latex/toc level="2" title="Contents of this article" >}}

**Background knowledge:** 

- This article will make regular references to the `ftplugin` and `plugin` directories, which we will use to implement LaTeX-specific Vim configuration.
  To get the most out of this article, you should understand the purpose of these directories.
  In case you are just dropping in now and words like "plugin", "ftplugin", and "runtimepath" sound unfamiliar, consider first reading through the [third article in this series]({{< relref "/tutorials/vim-latex/ftplugin" >}}), which covers what you need to know.

- We will also define some Vim key mappings in this article---if Vim keywords like `:map`, `<leader>`, `<localleader>`, and `<Plug>` are unfamiliar to you, consider taking a detour and reading through the final article in this series, [7. A Vim Configuration Primer for Filetype-Specific Workflows]({{< relref "/tutorials/vim-latex/vimscript" >}}), which explains everything you need to know about Vim key mappings to understand this series (the same concepts apply if you use Neovim and Lua).

## Choosing a PDF Reader

A PDF reader used in a LaTeX workflow should meet two important requirements:

- In the background, the PDF reader constantly listens for changes to the PDF document and automatically updates its display when the document’s contents change after compilation.
  (The alternative: manually switch applications to the PDF reader, refresh the document, and switch back to Vim after *every single compilation*.
  You would tire of this pretty quickly.
  Or I guess you could hack together a shell script to do this for you, but why bother?)
  
- The PDF reader integrates with a program called SyncTeX, which makes it easy for Vim and the PDF reader to communicate with each other---SyncTeX makes forward and inverse search possible.

### A PDF reader on Linux

I recommend and will cover [Zathura](https://pwmt.org/projects/zathura/), under the assumption that anyone reading a multi-article Vim series will appreciate Zathura's Vim-like key bindings and text-based configurability.
The VimTeX plugin also makes configuration between Zathura and Vim very easy.
Note, however, that many more Linux-compatible PDF readers exist---see the VimTeX plugin's documentation at `:help g:vimtex_view_method` if curious.

### A PDF reader on macOS

Use [Skim](https://skim-app.sourceforge.io/), which you can download as a macOS `dmg` file from its [homepage](https://skim-app.sourceforge.io/) or from [SourceForge](https://sourceforge.net/projects/skim-app/).
(The default macOS PDF reader, Preview, does not listen for document changes, nor, to the best of my knowledge, does it integrate nicely with SyncTeX.)

{{< details summary="You *might* also have success using Zathura on macOS..." >}}
...thanks to the Homebrew formula provided by [`homebrew-zathura` project](https://github.com/zegervdv/homebrew-zathura) and the instructions in `:help vimtex-faq-zathura-macos`.
I've personally managed to get Zathura and VimTeX working on an Intel MacBook Pro (and have included a section at the end of this article explaining how), but many VimTeX users have reported issues following the same produced I used, particularly with Apple Silicon Macs.

TLDR: Zathura *might* work on macOS, but seems to be very finicky; 
unless you really know your way around Homebrew and macOS you should probably use Skim, which should "just work".
Use Zathura on macOS at your own risk and know you might be unsuccessful.
{{< /details >}}


### A PDF reader on Windows

I have not tested PDF readers on Windows (reminder of the [series prerequisites for operating systems]({{< relref "/tutorials/vim-latex/prerequisites" >}})),
but you can find an overview of PDF reader possibilities on Windows in the VimTeX documentation section `:help g:vimtex_view_method`.

## Summary: What works on what platform

I tested 9 combinations of editor, OS, and PDF reader when preparing this article, and the results are summarized in the table below---the more check marks the better.

**Recommendations based on my testing:**

- **If you have a choice of OS, use some flavor of Linux**---everything works on both Vim and Neovim, potentially with a few manual tweaks.

- **If you have a choice of editor, use Neovim**---everything works on every OS, potentially with a few small workarounds.
  This is largely because Neovim's built-in implementation of the remote procedure call (RPC) protocol ensures inverse search works reliably on all platforms.
  Vim has a different implementation of RPC and must be specially compiled with the `+clientserver` option to ensure inverse search works.
  
  It turns out that getting a functional `+clientserver` Vim is non-trivial on macOS; 
  if you currently use terminal Vim on macOS, you will either have to sacrifice inverse search or perform some compiling-from-source wizardry beyond the scope of this series.

### Zathura on Linux (tested with i3 on Arch using Zathura 0.4.8)

| Editor | Forward search works | Inverse search works | Editor keeps focus after forward search | Focus returns to editor after inverse search |
| - | - | - | - | - |
| Neovim | ✅ | ✅ | ✅[^1] | ✅ |
| Vim | ✅ | ✅ | ✅[^1] | ✅ |
| gVim | ✅ | ✅ | ✅[^2] | ✅[^2] |

[^1]: If you use the `xdotool windowfocus` solution described in [Optional tip: Return focus to Vim/Neovim after forward search](#refocus-vim-after-forward-search).
[^2]: If you use the `xdotool windowfocus` solution described in [Optional tip: Return focus to gVim after forward and inverse search](#refocus-gvim).

### Skim on macOS (tested on macOS 12.1 using Skim 1.6.9)

| Editor | Forward search works | Inverse search works | Editor keeps focus after forward search | Focus returns to editor after inverse search |
| - | - | - | - | - |
| Neovim | ✅ | ✅ | ✅ | ✅[^3] |
| Vim | ✅ | ❌ | ✅ | ❌ |
| MacVim | ✅ | ✅ | ✅ | ✅ |

### Zathura on macOS (Intel-based MacBook Pro 11,5; macOS 12.1; Zathura 0.4.9 built from [`homebrew-zathura`](https://github.com/zegervdv/homebrew-zathura))

*Zathura on macOS is unreliable; use at your own risk and know things might not work properly.*

| Editor | Forward search works | Inverse search works | Editor keeps focus after forward search | Focus returns to editor after inverse search |
| - | - | - | - | - |
| Neovim | ✅ | ✅ | ✅ | ✅[^3] |
| Vim | ✅ | ❌ | ✅ | ❌ |
| MacVim | ✅ | ✅ | ✅ | ✅[^4] |

[^3]: If you use the `open -a TERMINAL` solution described in [Optional tip: Return focus to Neovim after inverse search](#refocus-nvim-macos-inverse).
[^4]: If you use the `open -a MacVim` solution described in [Optional tip: Return focus to MacVim after inverse search](#refocus-macvim).

## Cross-platform concepts

Many of the same ideas apply on both macOS and Linux.
To avoid repetition I will list the cross-platform concepts here,
and leave OS-specific implementation details for later in the article.

### Forward search and inverse search

You will hear two bits of jargon throughout this article:

#### Forward search

*Forward search* is the process of jumping from the current cursor position in the LaTeX source file to the corresponding position in the PDF reader displaying the compiled document.
In everyday language, forward search is a text editor telling a PDF reader: "hey, PDF reader, display the position in the PDF file corresponding to my current position in the LaTeX file".

The following GIF demonstrates forward search.
Here's what you're seeing:

- I first move in the LaTeX source code (left) from "Section I don't want to see" to the section "Hello, forward search!".
- I then use the VimTeX command `:VimtexView` to move the PDF reader (right) to the "Hello, forward search!" section, without ever leaving Vim.

{{< img-centered src="forward-search.gif" width="100%" alt="GIF demonstrating forward search." >}}

#### Inverse search

*Inverse search* (also called *backward search*) is the process of switching focus from a line in the PDF document to the corresponding line in the LaTeX source file. 
Informally, inverse search is like the user asking, "hey, PDF viewer, please take me to the position in the LaTeX source file corresponding to my current position in the PDF file".

The following GIF demonstrates inverse search.
Here's what you're seeing:

- Both Vim (left) and the PDF reader (right) begin at "Section I don't want to see".

- I scroll in the PDF viewer from "Section I don't want to see" to the colored box showing "Hello, inverse search!". 
  The bottom-left screenkey bar shows mouse actions.

- I then trigger inverse search with `<Ctrl>-<Click>` (a Zathura-specific binding that differs on different PDF readers), to move to the LaTeX source code generating the "Hello, inverse search!" box.
  Notice how focus automatically switches from the PDF reader to Vim.

{{< img-centered src="inverse-search.gif" width="100%" alt="GIF demonstrating inverse search." >}}

### Compiling with SyncTeX

Positions in the PDF file are linked to positions in the LaTeX source file thanks to a utility called SyncTeX, which is implemented in a binary program called `synctex` that should ship by default with a standard TeX installation.

For forward and backward search to work properly, your LaTeX documents must be compiled with `synctex` enabled.
This is as simple as passing the `-synctex=1` option to the `pdflatex` or `latexmk` programs when compiling your LaTeX files.
VimTeX's compiler backends do this by default, and doing so manually was covered in the [previous article in this series]({{< relref "/tutorials/vim-latex/compilation" >}}).
If you are curious, you can find more `synctex` documentation at `man synctex` or by searching `man pdflatex` or `man latexmk` for `'synctex'`.

### Inter-process communication requires a server

Here is the big picture: inverse search requires one program---the PDF reader---to be able to access and open a second program---Vim---and ideally open Vim at a specific line.
This type of inter-program communication is possible because of Vim's built-in [remote procedure call (RPC) protocol](https://en.wikipedia.org/wiki/Remote_procedure_call).
The details of implementation vary between Vim and Neovim 
(see `:help remote.txt` for Vim and `:help RPC` for Neovim),
but in both cases Vim or Neovim must run a *server* that listens for and processes requests from other programs (such as a PDF reader).

In this article and in the Vim and VimTeX documentation you will hear talk about a server---what we are referring to is the server Vim/Neovim must run to communicate with a PDF reader.

### Vim users: ensure you have a clientserver-enabled Vim {#vim-clientserver}

*Neovim, gVim, and MacVim come with client-server functionality by default; if you use any of these programs, lucky you.
You can [skip to the next section.](#zathura)*

If you use terminal Vim, run `vim --version`.
If the output includes `+clientserver`, your Vim version is compiled with client-server functionality and ~~can~~ might be able to perform inverse search---see the [macOS caveat below](#caveat-macvim).
If the output instead includes `-clientserver`, your Vim version does not have client-server functionality.
You will need to install a new version of Vim to use inverse search.
Getting a `+clientserver` version of terminal Vim is easy on Linux but beyond the scope of this article on macOS:

- **On Linux:** Use your package manager of choice to install `gvim`, which will include both the GUI program gVim *and* a regular command-line version of Vim compiled with client-server functionality---you will be able to keep using regular terminal `vim` as usual.
  After installing `gvim`, check the output of `vim --version` again;
  you should now see `+clientserver`.

  Note that your package manager may notify you that `gvim` and `vim` are in conflict.
  That's normal---in this case just follow the prompts to remove `vim` and install `gvim`, which will also include a version of regular terminal `vim`.

- **On macOS:** You're out of luck unless you're comfortable compiling Vim from source code and finding the correct compilation options, but this falls beyond the scope of this article.
  Use Neovim or MacVim if you want inverse search to work, and read the caveat below for more information.

*The rest of this article assumes you have a version of Vim with `+clientserver`*.

#### Caveat: MacVim's terminal Vim cannot perform inverse search {#caveat-macvim}

If you install MacVim (e.g. `brew install --cask macvim` or by downloading MacVim from the [MacVim website](https://macvim-dev.github.io/macvim/)), the output of `vim --version` may well show `+clientserver`.
But (at least at the time of writing) this is false advertising, and confused me for quite some time while writing this guide!
Click below for details.

{{< details summary="Here is my understanding of the issue:" >}}
Because of how MacVim's version of terminal Vim handles servers, even if MacVim's terminal Vim is started with a server (using e.g. `vim --servername VIM myfile.tex`) and `:echo v:servername` returns `VIM`, the server is useless because programs other than MacVim won't be aware of it.
Quoting from `:help macvim-clientserver` (only available if you use MacVim's version of `vim`; emphasis mine):
> Server listings are made possible by the frontend (MacVim) keeping a list of all currently running servers. *Thus servers are not aware of each other directly; only MacVim know which servers are running.*

You can easily test this for yourself on macOS:
1. Install MacVim with `brew install --cask macvim`.
1. Run `vim --version` and note that the output includes `+clientserver`
1. Start Vim with `vim --servername VIM myfile.tex` and note that `:echo v:servername` returns `VIM`, suggesting client-server functionality will work.
1. Now here is the catch: open another terminal, run `vim --listservers`, and notice that the result is blank!
   In other words, even though the Vim instance editing `myfile.tex` is running a server, this server is not visible to the outside world, and effectively useful for the purposes of inverse search.

See the GitHub issue [Client Server mode does not work in non-GUI macvim #657](https://github.com/macvim-dev/macvim/issues/657) for a longer discussion of this problem.

Note that Homebrew used to offer `brew install vim --with-client-server` (and you might still see this floating aroud on the Internet), but this option is no longer available.
It may well be possible to compile a version of terminal Vim from source that includes `+clientserver`, and, in combination with XQuartz, get inverse search to work on macOS using terminal Vim, but that falls beyond the scope of this tutorial.
{{< /details >}}

### Vim users: ensure Vim starts a server (for terminal Vim on Linux) {#ensure-vim-server}

Neovim, gVim, and MacVim start a server on startup automatically; if you use any of these programs, lucky you---feel free to [skip to the next section](#zathura).

If you use a [`+clientserver`-enabled terminal Vim](#vim-clientserver) on Linux, place the following code snippet in your `vimrc`:

```vim
" This will only work if `vim --version` includes `+clientserver`!
if empty(v:servername) && exists('*remote_startserver')
  call remote_startserver('VIM')
endif
```

This code checks the built-in `v:servername` variable to see if Vim has started a server, and if it hasn't, starts a server named `VIM` if Vim's `remote_startserver` function is available (which it should be on a reasonably up-to-date version of Vim).
Starting the server makes inverse search possible.
The above code snippet was taken from the VimTeX documentation at `:help vimtex-clientserver`, which will give you more background on starting a server for inverse search.

After adding the above code snippet to your Vim config, restart Vim and check the output of `echo v:servername`---it should output `VIM`.
Then open a LaTeX file and check the output of `:VimtexInfo`; the output should look something like this:

```bash
# If a server is successfully running:
Has clientserver: true
Servername: VIM

# If a server is not running---inverse search won't work
Has clientserver: true
Servername: undefined (vim started without --servername)
```

Reminder: on macOS, MacVim's version of terminal Vim can misleadingly display both `Has clientserver: true` and `Servername: VIM`, but inverse search still won't work---[see the caveat above](#caveat-macvim).

*That's all for the cross-platform concepts. Let's set up a PDF reader!*

## Zathura (read this on Linux) {#zathura}

*If you use macOS, see the section on [configuring Skim](#skim).*

*Note: At one point, Zathura and VimTeX would work well together only on the X Window System (and not Wayland; see [VimTeX issue #2046](https://github.com/lervag/vimtex/issues/2046) for details). But this should now be resolved following [PR #2639](https://github.com/lervag/vimtex/pull/2639), and it seems that Zathura and VimTeX now work well together on Wayland, too.*

VimTeX makes connecting Zathura and Vim/Neovim/gVim very easy.
Here's what to do:

- You will, obviously, need Zathura installed---do this with the package manager of your choice.
  Then double check that your version of Zathura supports SyncTeX---which I explain below in the dedicated section [Ensure your Zathura is SyncTeX-enabled](#ensure-zathura-synctex).

- You will need the VimTeX plugin installed. 
  Double-check that VimTeX's PDF viewer interface is enabled by entering `:echo g:vimtex_view_enabled` in Vim.

  ```bash
  # Enter this in Vim's command mode
  :echo g:vimtex_view_enabled  
  > 1  # VimTeX's PDF viewer interface is enabled!
  > 0  # VimTeX's PDF viewer interface is disabled---you'll have to enable it.
  ```

  Note that VimTeX's PDF viewer interface is enabled by default; if `:echo g:vimtex_view_enabled` prints `0`, you have probably manually set `let g:vimtex_view_enabled = 0` somewhere in your Vim config and will have to track that down and remove it before proceeding.
  
- Install the [`xdotool`](https://github.com/jordansissel/xdotool) program using the Linux package manager of your choice.
  (VimTeX uses `xdotool` to make forward search work properly; see `:help vimtex-view-zathura` for reference.
  And to reiterate from the beginning of this section, you'll need to use the X Window System and not Wayland for `xdotool` to work.)
  
- Place the following code in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

  ```vim
  " Use Zathura as the VimTeX PDF viewer
  let g:vimtex_view_method = 'zathura'
  ```

  This line of code lets VimTeX know that you plan on using Zathura as your PDF reader.

- Use the `:VimtexView` command in Vim/Neovim to trigger forward search.
  You can either type this command manually, use the default VimTeX shortcut `<localleader>lv`, or define your own shortcut, e.g. by placing the following code in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

  ```vim
  " Define a custom shortcut to trigger VimtexView
  nmap <localleader>v <plug>(vimtex-view)
  ```

  You could then use `<localleader>v` to trigger forward search---of course you could replace `<localleader>v` with whatever shortcut you prefer.

  Tip: depending on your window manager, Vim might lose focus after forward search.
  For an easy way to keep focus in Vim, scroll down to the section [Optional tip: Return focus to Vim/Neovim after forward search](#refocus-vim-after-forward-search).

- At the risk of belaboring the point, double-check your Vim is running a server by calling `:VimtexInfo` and scrolling to the `Servername` line.
  The output should read

  ```bash
  # If a server is successfully running:
  Has clientserver: true
  Servername: /tmp/nvimQb417s/0  # typical Neovim output
  Servername: VIM                # typical Vim output
  Servername: GVIM               # typical gVim output

  # If a server is not running---inverse search won't work
  Servername: undefined (vim started without --servername)
  ```

  If Vim is not running a server (which will probably only occur on terminal Vim), inverse search won't work---you may want to double check [this section on macOS](#caveat-macvim) or [this section on Linux](#ensure-vim-server).

- In Zathura, use `<Ctrl>-<Left-Mouse-Click>` (i.e. a left mouse click while holding the control key) to trigger inverse search, which should open Vim and switch focus to the correct line in the LaTeX source file.
  Inverse search should "just work"---this is because Zathura implements SyncTeX integration in a way (using Zathura's `--synctex-forward` and `--syntex-editor-command` options) that lets VimTeX launch Zathura with the relevant synchronization steps taken care of under the hood.

### Ensure your Zathura is SyncTeX-enabled {#ensure-zathura-synctex}

*Zathura must be compiled with `libsynctex` for forward and inverse search to work properly.*

Most Linux distributions should ship a Zathura version with `libsynctex` support and this shouldn't be a problem for you, but it isn't 100% guaranteed---see the note towards the bottom of `:help vimtex-view-zathura` for more information.
You can check that your version of Zathura has SyncTeX support using the `ldd` program, which checks for shared dependencies;
just issue the following command on the command line:

```bash
# List all of Zathura's shared dependencies and search the output for libsynctex
ldd $(which zathura) | grep libsynctex
```

If the output returns something like `libsynctex.so.2 => /usr/lib/libsynctex.so.2 (0x00007fda66e50000)`, your Zathura has SyncTeX support.
If the output is blank, your Zathura does not have SyncTeX support, and forward and inverse search will not work---you will need a new version of Zathura or a different PDF reader.

Note that VimTeX performs this check automatically and will warn you if your Zathura version lacks SyncTeX support;
for the curious, this check is implemented in the VimTeX source code in the file `vimtex/autoload/vimtex/view/zathura.vim`, on [line 19](https://github.com/lervag/vimtex/blob/master/autoload/vimtex/view/zathura.vim#L19) at the time of writing.
See `:help g:vimtex_view_zathura_check_libsynctex` for reference.

### Optional tip: Return focus to Vim/Neovim after forward search {#refocus-vim-after-forward-search}

**Relevant editors:** Vim and Neovim used with Zathura on Linux (for resolving gVim focus problems [scroll down](#refocus-gvim)).
You'll also need the X Window System (and not Wayland) for `xdotool` to work.

Depending on your window manager and/or desktop environment, Vim may lose focus after performing forward search (this happens for me on i3 with both Vim and Neovim; YMMV).
If you prefer to keep focus in Vim, you can use `xdotool` and some VimTeX autocommands to solve the problem.
Here's what to do:

1. Place the following line in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

   ```vim
   " Get Vim's window ID for switching focus from Zathura to Vim using xdotool.
   " Only set this variable once for the current Vim instance.
   if !exists("g:vim_window_id")
     let g:vim_window_id = system("xdotool getactivewindow")
   endif
   ```

   Whenever you open a LaTeX file, this code will use `xdotool` to query for an 8-digit window ID identifying the window running Vim (which is presumably the active window) and store this ID in the global Vimscript variable `g:vim_window_id`.
   The `if !exists()` block only sets the `g:vim_window_id` variable if it has not yet been set for the current Vim instance.

1. Then define the following Vimscript function in the same config file:

   ```vim
   function! s:TexFocusVim() abort
     " Give window manager time to recognize focus moved to Zathura;
     " tweak the 200m (200 ms) as needed for your hardware and window manager.
     sleep 200m  

     " Refocus Vim and redraw the screen
     silent execute "!xdotool windowfocus " . expand(g:vim_window_id)
     redraw!
   endfunction
   ```

   This function calls `VimtexView` to execute forward search, waits a few hundred milliseconds to let the window manager recognize focus has moved to Zathura,
   then uses `xdotool`'s `windowfocus` command to immediately refocus the window holding Vim.
   Using `silent execute` instead of just `execute` suppresses `Press ENTER or type command to continue` messages, although you may want to start with just `execute` for debugging purposes.
   
   Although it is hacky, I have empirically found a 200 millisecond wait ensures the subsequent window focus executes properly (you may want to tweak the exact sleep time for your hardware and window manager).
   The `redraw!` command refreshes Vim's screen.
   If interested, you can read more about writing Vimscript functions in this series's [Vim configuration article]({{< relref "/tutorials/vim-latex/vimscript" >}}), which is the next and final article in the series.

1. Finally, define the following Vimscript autocommand group in the same config file used above:

   ```vim
   augroup vimtex_event_focus
     au!
     au User VimtexEventView call s:TexFocusVim()
   augroup END
   ```

   The above autocommand runs the above-defined refocus function `s:TexFocusVim()` in response to the VimTeX event `VimtexEventView`, which triggers whenever `VimtexView` completes (see `:help VimtexEventView` for documentation.).
   In practice, this refocuses Vim after every forward search.

### Optional tip: Return focus to gVim after forward and inverse search {#refocus-gvim}

**Relevant editor:** gVim used with Zathura on Linux.
You'll also need the X Window System (and not Wayland) for `xdotool` to work.

From my testing (using the i3 window manager; YMMV) gVim lost focus after forward search and failed to regain focus after inverse search.
Here is how to fix both problems (some steps are the same as for terminal Vim/Neovim above, in which case I will refer to the above descriptions to avoid repetition):

1. Place the following line in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

   ```vim
   " Get Vim's window ID for switching focus from Zathura to Vim using xdotool.
   " Only set this variable once for the current Vim instance.
   if !exists("g:vim_window_id")
     let g:vim_window_id = system("xdotool getactivewindow")
   endif
   ```

   For an explanation, see the analogous step for Vim/Neovim above.

1. Then define the following Vimscript function in the same config file:

   ```vim
   function! s:TexFocusVim(delay_ms) abort
     " Give window manager time to recognize focus 
     " moved to PDF viewer before focusing Vim.
     let delay = a:delay_ms . "m"
     execute 'sleep ' . delay
     execute "!xdotool windowfocus " . expand(g:vim_window_id)
     redraw!
   endfunction
   ```

   This function plays as similar role to the one in the analogous step for Vim/Neovim (see above for an explanation), but allows for a variable sleep time using the `delay_ms` argument, which is the number of milliseconds passed to Vim's `sleep` command.
   The function uses a variable sleep time because (at least in my testing) post-inverse-search refocus does not require any delay to work properly, while post-forward-search refocus does.

1. Finally, define the following Vimscript autocommand group in the config file used above:

   ```vim
   augroup vimtex_event_focus
     au!
     " Post-forward-search refocus with 200ms delay---tweak as needed
     au User VimtexEventView call s:TexFocusVim(200)

     " Only perform post-inverse-search refocus on gVim; delay unnecessary
     if has("gui_running")
       au User VimtexEventViewReverse call s:TexFocusVim(0)
     endif
   augroup END
   ```

   The events `VimtexEventView` and `VimtexEventViewReverse`, conveniently provided by VimTeX, trigger whenever `VimtexView` and `VimtexInverseSearch` complete, respectively.
   The above autocommands run the above-defined refocus function `s:TexFocusVim()` after every execution of forward search using `VimtexView` or inverse search using `VimtexInverseSearch`.
   See `:help VimtexEventView` and `:help VimtexEventViewReverse` for documentation.

   Again, you may want to tweak the forward search delay time (somewhere from from 50ms to 300ms should suit most users) until refocus works properly on your window manager and hardware.

## Skim (read this on macOS) {#skim}

*Power users: you can also try your luck with [Zathura on macOS](#zathura-macos), but it is unreliable and you should know what you're doing if you attempt this.*

Here is how to set up Skim to work with Vim/Neovim running VimTeX.
Some of the steps are the same as for Zathura on Linux, so excuse the repetition:

- You will, of course, need Skim installed---you can download Skim as a macOS `dmg` file either from [the Skim homepage](https://skim-app.sourceforge.io/) or from [SourceForge](https://sourceforge.net/projects/skim-app/).
  *If you already have Skim installed, upgrade to the latest version,* which will ensure forward search works properly.

- After making sure your Skim version is up to date, enable automatic document refreshing (so Skim will automatically update the displayed PDF after each compilation) by opening Skim and navigating to `Preference` > `Sync`.
  Then select `Check for file changes` and `Reload automatically`.

- You will need the VimTeX plugin installed. 
  Double-check that VimTeX's PDF viewer interface is enabled by entering `:echo g:vimtex_view_enabled` in Vim.

  ```bash
  # Enter this in Vim's command mode
  :echo g:vimtex_view_enabled  
  > 1  # VimTeX's PDF viewer interface is enabled!
  > 0  # VimTeX's PDF viewer interface is disabled---you'll have to enable it.
  ```

  Note that VimTeX's PDF viewer interface is enabled by default; if `:echo g:vimtex_view_enabled` prints `0`, you have probably manually set `let g:vimtex_view_enabled = 0` somewhere in your Vim config and will have to track that down and remove it before proceeding.

- Place the following code in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

  ```vim
  " Use Skim as the VimTeX PDF viewer
  let g:vimtex_view_method = 'skim'
  ```

  If interested, see `:help vimtex-view-skim` for more information.

- Use the `:VimtexView` command in Vim/Neovim to trigger forward search.
  You can either type this command manually, use the default VimTeX shortcut `<localleader>lv`, or define your own shortcut;
  to define your own shortcut place the following code in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

  ```vim
  " Define a custom shortcut to trigger VimtexView
  nmap <localleader>v <plug>(vimtex-view)
  ```

  You could then use `<localleader>v` to trigger forward search---of course you could replace `<localleader>v` with whatever shortcut you prefer.

  *If forward search is not working, ensure Skim is fully up to date.*
  VimTeX switched to a new forward search implementation at the end of 2021 (see [VimTeX pull request #2289](https://github.com/lervag/vimtex/pull/2289)) that requires an up-to-date Skim version to work properly.
  <!-- - [Skim forward search not working on macOS 12.1 #2279](https://github.com/lervag/vimtex/issues/2279) -->
  <!-- - [#1438 Crash when calling displayline: Internal table overflow](https://sourceforge.net/p/skim-app/bugs/1438/) -->

- Configure inverse search:
  first open Skim and navigate to `Preferences > Sync ` and select `PDF-TeX Sync Support`.
  Then, depending on your editor, proceed as follows:
  
  - **MacVim:** select `MacVim` in the `Preset` field, which will automatically populate the `Command` and `Arguments` fields with correct values.

  - **Neovim:** set the `Preset` field to `Custom`, set the `Command` field to `nvim`, and the `Arguments` field to

    ```bash
    --headless -c "VimtexInverseSearch %line '%file'"
    ```

    The above command comes from `:help vimtex-synctex-inverse-search`;
    here is a short explanation:

    - `%file` and `%line` are macros provided by Skim that expand to the PDF file name and line number where inverse search was triggered, respectively.
    - When you trigger inverse search, Skim will run the command in the `Command` field using the arguments in the `Arguments` field.
    - The `Arguments` field is just a sophisticated way to launch Neovim and call VimTeX's `VimtexInverseSearch` function with the PDF line number and file name as parameters (the `-c` option runs a command when starting Neovim).

  - **Vim:** Inverse search won't work on macOS, at least as far as I have been able to figure out---for details, scroll back up to [Caveat: MacVim's terminal Vim cannot perform inverse search](#caveat-macvim).
    
- In Skim, use `<Cmd>-<Shift>-<Left-Mouse-Click>` (i.e. a left mouse click while holding the command and shift keys) in Skim to trigger inverse search.
  
  Note: during my testing, Neovim failed to regain focus after inverse search;
  if you would prefer for Neovim to focus after inverse search, scroll down to [Returning focus to Neovim after inverse search on macOS](#refocus-nvim-macos-inverse).

## Zathura on macOS {#zathura-macos}

You *might* have luck with Zathura and VimTeX on macOS using to the Homebrew formulae provided by [github.com/zegervdv/homebrew-zathura](https://github.com/zegervdv/homebrew-zathura).

{{< details summary="*I'm repeating myself here, but Zathura and macOS don't seem to play nicely together; try this at your own risk or [use Skim](#skim), which should \"just work\".*" >}}
See e.g. VimTeX issues [#2424](https://github.com/lervag/vimtex/issues/2424) and [#2581](https://github.com/lervag/vimtex/issues/2581) for details of macOS-Zathura troubles.
More specifically, Macs seem to have difficulty activating the `dbus` service, which is required for forward search and inverse search.
You can still build Zathura on a Macs without much difficulty, but there is a chance it won’t support forward and inverse search, won’t work with VimTeX, and thus won’t be useful as a LaTeX PDF reader.
{{< /details >}}

### Building Zathura and dependencies on macOS

**For Intel Macs**, building Zathura is described in the VimTeX documentation at `:help vimtex-faq-zathura-macos`---I have tested this successfully on an Intel CPU MacBook Pro 11,5 running macOS 12.1, but your mileage may vary.

**For Apple Silicon Macs**, a slightly more complicated process setting up Zathura is described in [Homebrew Zathura issue 99](https://github.com/zegervdv/homebrew-zathura/issues/99#issuecomment-1356384136).

Quoting more or less directly from `:help vimtex-faq-zathura-macos`, here is how to build Zathura on macOS (see [Homebrew Zathura issue 99](https://github.com/zegervdv/homebrew-zathura/issues/99#issuecomment-1356384136) if you have an Apple Silicon chip):

1. Check if you already have Zathura installed using e.g. `which zathura`.
   If you have Zathura installed, I recommend uninstalling it and repeating from scratch to ensure all dependencies are correctly sorted out.

1. If needed, uninstall your existing Zathura and related libraries with the following code:

   ```bash
   # Remove symlinks
   brew unlink zathura-pdf-poppler
   # or use `brew unlink zathura-pdf-mupdf` if you have mupdf installed
   brew unlink zathura
   brew unlink girara

   # Uninstall
   brew uninstall zathura-pdf-poppler
   # or use `brew uninstall zathura-pdf-mupdf` if you have mupdf installed
   brew uninstall zathura
   brew uninstall girara
    ```

1. Zathura needs `dbus` to work properly;
   install it with `brew install dbus`. 
   If you already have `dbus` installed, [rumor has it](https://github.com/lervag/vimtex/issues/1737#issuecomment-759953886) that you should reinstall it with `brew reinstall dbus`, although I have not checked if this is necessary myself.

1. Set a bus address for `dbus` sessions with the following environment variable:
   
   ```bash
   DBUS_SESSION_BUS_ADDRESS="unix:path=$DBUS_LAUNCHD_SESSION_BUS_SOCKET" 
   ```

   You should then make this change permanent by placing the following code in one of your shell's start-up files:

   ```bash
   export DBUS_SESSION_BUS_ADDRESS="unix:path=$DBUS_LAUNCHD_SESSION_BUS_SOCKET" 
   ```

   You could place this in your `~/.bash_profile` (Bash), `~/.zprofile` (ZSH), or perhaps an `rc` file, depending on your shell and personal shell start-up configuration.

   If you are new to setting environment variables and the shell environment, you might want to read through the discussion [VimTeX issue #2391](https://github.com/lervag/vimtex/issues/2391#issuecomment-1127129402), which solves a Zathura issue by properly setting `DBUS_SESSION_BUS_ADDRESS`---thanks to [@liamd101](https://github.com/liamd101) on this one!
   (This issue involves a Bash shell, but would work for ZSH by replacing `~/.bash_profile` with `~/.zprofile`.)
   
1. Change the value of `<auth><\auth>` in
  `/usr/local/opt/dbus/share/dbus-1/session.conf` from `EXTERNAL` to `DBUS_COOKIE_SHA1`:

   ```bash
   # Before
   <auth>EXTERNAL<\auth>

   # After
   <auth>DBUS_COOKIE_SHA1<\auth>
   ```
  
1. Run `brew services start dbus` to start `dbus`.
   You can double-check `dbus` is running with `brew services info dbus`, which should output something like this (potentially after a reboot):

   ```bash
   $ brew services info dbus
   dbus (org.freedesktop.dbus-session)
   Running: ✔
   Loaded: ✔
   ```
   

1. Install the most recent version of Zathura (i.e. HEAD):

   ```bash
   brew tap zegervdv/zathura
   brew install girara --HEAD
   brew install zathura --HEAD --with-synctex
   brew install zathura-pdf-poppler
   mkdir -p $(brew --prefix zathura)/lib/zathura
   ln -s $(brew --prefix zathura-pdf-poppler)/libpdf-poppler.dylib $(brew --prefix zathura)/lib/zathura/libpdf-poppler.dylib
   ```

   Notes:

   - You might be prompted by Homebrew to install the Apple Command Line Tools before you can complete `brew install girara --HEAD`.
     If so, just follow Homebrew's suggestion (which will probably be something along the lines of `xcode-select --install`), then retry  `brew install girara --HEAD`.
   - Ensure you use `brew install zathura --HEAD --with-synctex` to get a Zathura with SyncTeX support;
   the `homebrew-zathura` GitHub page only suggests `brew install zathura --HEAD`.
   
1. Reboot and test if Zathura starts and SyncTeX works.

For the original GitHub discussion that produced the instructions in `:help vimtex-faq-zathura-macos`, see the VimTeX issue [Viewer cannot find Zathura window ID on macOS #1737](https://github.com/lervag/vimtex/issues/1737).

### Setting up Zathura on macOS

Assuming your build succeeded, here is how to set up Zathura on macOS (many steps are similar to those for [setting up Zathura on Linux](#zathura); please excuse any repetition):

- Install the [`xdotool`](https://github.com/jordansissel/xdotool) program with `brew install xdotool`.
  (VimTeX uses `xdotool` to make forward search work properly; see `:help vimtex-view-zathura` for reference.)
  
- Place the following code in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

  ```vim
  " Use Zathura as the VimTeX PDF viewer
  let g:vimtex_view_method = 'zathura'
  ```

  This line of code lets VimTeX know that you plan on using Zathura as your PDF reader.

- Use the `:VimtexView` command in Vim/Neovim to trigger forward search.
  You can either type this command manually, use the default VimTeX shortcut `<localleader>lv`, or define your own shortcut.
  To define your own shortcut place the following code in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

  ```vim
  " Define a custom shortcut to trigger VimtexView
  nmap <localleader>v <plug>(vimtex-view)
  ```

  You could then use `<localleader>v` to trigger forward search---of course you could replace `<localleader>v` with whatever shortcut you prefer.

- In Zathura, use `<Ctrl>-<Left-Mouse-Click>` (i.e. a left mouse click while holding the control key) to trigger inverse search, which should open Vim and switch focus to the correct line in the LaTeX source file.
  
  Note: during my testing, I found that focus failed to return to both Neovim and MacVim after inverse search on Zathura.
  To fix these issues, depending on your editor, scroll down to one of:

  - [Returning focus to Neovim after inverse search on macOS](#refocus-nvim-macos-inverse)
  - [Returning focus to MacVim after inverse search on macOS](#refocus-macvim)

## Fixing focus loss problems on macOS

This section gives two fixes for returning focus to your text editor following inverse search on macOS.

### Returning focus to Neovim after inverse search on macOS {#refocus-nvim-macos-inverse}

**Relevant editor:** Neovim used with Skim or Zathura on macOS.

From my testing (on macOS 12.1) Neovim failed to regain focus after inverse search from both Skim and Zathura.
Here is how to fix this problem (some steps are similar to refocusing solutions on Linux, so please excuse the repetition):

- Identify the name of your terminal (e.g. `iTerm`, `Alacritty`, `Terminal`, etc.);
  this is just the name of the macOS application for your terminal.
  Then define the following Vimscript function in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

  ```vim
  function! s:TexFocusVim() abort
    " Replace `TERMINAL` with the name of your terminal application
    " Example: execute "!open -a iTerm"  
    " Example: execute "!open -a Alacritty"
    silent execute "!open -a TERMINAL"
    redraw!
  endfunction
  ```
  
  ...where you should replace `TERMINAL` with the name of your terminal application.
  The above code snippet runs the macOS `open` utility with the `-a` flag, which specifies an application, to refocus to your terminal, then redraws Vim's screen.
  Using `silent execute` instead of just `execute` suppresses `Press ENTER or type command to continue` messages, although you may want to start with just `execute` for debugging purposes.

- Then define the following Vimscript autocommand group in the same config file:

  ```vim
  augroup vimtex_event_focus
    au!
    au User VimtexEventViewReverse call s:TexFocusVim()
  augroup END
  ```
  The event `VimtexEventViewReverse`, conveniently provided by VimTeX, triggers whenever `VimtexInverseSearch` completes.
  The above autocommand runs the above-defined refocus function `s:TexFocusVim()` after every execution of inverse search.
  See `:help VimtexEventViewReverse` for documentation if interested.

### Returning focus to MacVim after inverse search on macOS {#refocus-macvim}

**Relevant editor:** MacVim used with Zathura on macOS.

From my testing (on macOS 12.1) Neovim failed to regain focus after inverse search from Zathura (but *did* regain inverse search from Skim).
Here is how to fix the problem (the steps are similar to those for Neovim just above, so please excuse any repetition):

- Identify the name of your terminal (e.g. `iTerm`, `Alacritty`, `Terminal`, etc.);
  this is name of the macOS application for your terminal.
  Then define the following Vimscript function in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

  ```vim
  function! s:TexFocusVim() abort
    if has("gui_running")  " for MacVim
      silent execute "!open -a MacVim"
    else                   " for terminal Vim
      " Replace `TERMINAL` with the name of your terminal application
      " Example: execute "!open -a iTerm"  
      " Example: execute "!open -a Alacritty"
      silent execute "!open -a TERMINAL"
    endif
    redraw!
  endfunction
  ```

  This code snippet uses macOS's `open` utility to refocus MacVim if you are running MacVim and your terminal application if you are running terminal Vim (just in case you happen to get inverse search working with terminal Vim on macOS).

  **Important:** you must have MacVim installed as a macOS application for `open -a MacVim` to work.
  If you installed MacVim with `brew install macvim` (instead of `brew install --cask macvim`) it is quite possible that you have a version MacVim for which `open -a MacVim` will not work.
  Here is what to do:

  - If you don't yet have MacVim on your system, run `brew install --cask macvim` (using `--cask` installs packages as a macOS application), and you'll be good to go.
  - If you already have MacVim installed, try running `open -a MacVim` from the command line.
    If this opens MacVim, you're good to go---you probably either downloaded MacVim from the MacVim website or used `brew install --cask macvim` originally.
  - If you have MacVim installed and `open -a MacVim` fails when run from the command line, you'll have to uninstall your MacVim and reinstall a macOS application version.
    If you installed your current MacVim with Homebrew, you can use the following three commands to uninstall and reinstall a correct MacVim (if you used some other installation method, you're on your own for this uninstalling step).

    ```bash
    brew unlink macvim          # remove symlinks to your current MacVim
    brew uninstall macvim       # uninstall your current MacVim
    ```

    Then reinstall MacVim as a macOS application (i.e. as a Homebrew cask):

    ```bash
    brew install --cask macvim  # install a macOS application version of MacVim
    ```

  After this, `open -a MacVim` should work correctly, and you can continue with the post-inverse-search refocus solution.

- Finally, define the following Vimscript autocommand group to the above config file:

  ```vim
  augroup vimtex_event_focus
    au!
    au User VimtexEventViewReverse call s:TexFocusVim()
  augroup END
  ```

  This autocommand runs the above-defined refocus function `s:TexFocusVim()` after every execution of inverse search using VimTeX's `VimtexEventViewReverse` event, which fires whenever `VimtexInverseSearch` completes.
  See `:help VimtexEventViewReverse` for documentation.

## Further reading

I suggest you read through the VimTeX documentation beginning at `:help g:vimtex_view_enabled` and ending at `:help g:vimtex_view_zathura_check_libsynctex`.
Although not all of the material will be relevant to your operating system or PDF reader, you will still find plenty of interesting information and configuration options.

Here is an example: VimTeX automatically opens your PDF reader when you first compile a document, even if you have not called `:VimtexView`.
If you prefer to disable this behavior, place the following code in [an appropriate config file]({{< relref "/tutorials/vim-latex/vimtex#configuration" >}}):

```vim
" Don't automatically open PDF viewer after first compilation
let g:vimtex_view_automatic = 0
```

{{< vim-latex/navbar >}}

{{< vim-latex/thank-you >}}

{{< vim-latex/license >}}
