---
title: Prerequisites for Vim-LaTeX Workflows \| Vim and LaTeX Series Part 1
prevFilename: "intro"
prevDisplayName: ""
nextFilename: "ultisnips"
nextDisplayName: "2. Snippets »"
date: 2022-01-24
---

{{< vim-latex/navbar >}}

# 1. Suggested Prerequisites for Writing LaTeX in Vim

{{< date-last-mod >}}


This is part one in a [seven-part series]({{< relref "/tutorials/arch/about" >}}) explaining how to use the Vim or Neovim text editors to efficiently write LaTeX documents.
I wrote this series with beginners in mind, but some prerequisite knowledge is unavoidable.
Each prerequisites is listed below and includes a suggestion or mini-tutorial for getting up to speed.
You should be comfortable with the material below to get the most out of this series.

{{< toc level="2" title="Contents of this article" >}}

## LaTeX knowledge

**Prerequisite:** you know what LaTeX is, have a working LaTeX distribution installed locally on your computer, and know how to use it, at least for creating basic documents.
Among other things, this means you should have the `pdflatex` and `latexmk` programs installed on your system and available from a command line.

{{< details summary="**Suggestion** (click arrow to expand)" >}}
- See the [LaTeX project’s official installation instructions](https://www.latex-project.org/get/) for installing LaTeX on various operating systems.

- I recommend the [tutorial at learnlatex.org](https://www.learnlatex.org/en/) as a starting point for learning LaTeX.
    Another decent option, despite the clickbait title, is [Overleaf’s *Learn LaTeX in 30 minutes*](https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes).
      Note that you can find hundreds of other LaTeX guides on the Web, but this can be just as overwhelming as it is helpful.
      Be wary of poorly written or non-comprehensive tutorials, of which there are unfortunately plenty.
      The [LaTeX project’s list of helpful links](https://www.latex-project.org/help/links/) is a good place to find high-quality documentation and tutorials.

{{< /details >}}

## Vim knowledge

**Prerequisite:** you know what Vim is, have a working local installation of Vim/Neovim (or gVim/MacVim) on your computer, and know how to use it, at least for basic text editing (for example at the level of `vimtutor`).
At the risk of belaboring the obvious, this means you must have either the `vim` or `nvim` programs (or their GUI variants) installed and available on a command line.

{{< details summary="**Suggestion** (click arrow to expand)" >}}
- Installation: Vim should come installed on most of the Unix-based systems this series is written for.
  Unfortunately the [official instructions for installing Vim](https://github.com/vim/vim#installation) aren’t particularly inviting to beginners;
  for installation I suggest [using Homebrew](https://formulae.brew.sh/formula/vim) on macOS or consulting your distribution’s package manager on Linux.
- And here are the [official instructions for installing Neovim](https://github.com/neovim/neovim/wiki/Installing-Neovim) (which are much friendlier to beginners than Vim’s instructions).
  *If you are choosing between Vim and Neovim specifically for the purpose of this series, I encourage you to choose Neovim*:
  connecting Neovim to your PDF reader will be easier because of Neovim’s implementation of the remote procedure call protocol.
- To get started with Vim/Neovim, try the interactive Vim tutorial (usually called the “Vim tutor”) that ships with Vim.
  You access the Vim tutor differently depending on your choice of Vim and Neovim.

  - If you have Vim (or gVim or MacVim) installed: open a terminal emulator and enter `vimtutor`.
  - If you have Neovim installed: open Neovim by typing `nvim` in a terminal.
  Then, from inside Neovim, type `:Tutor` and press the Enter key to open the Vim tutor.

  After (or in place of) the Vim tutor, consider reading through [Learn Vim the Smart Way](https://github.com/iggredible/Learn-Vim).

{{< /details >}}

## Literacy in basic Vim/Neovim differences

**Prerequisite:** if you use Neovim, you should know how to navigate the small differences between Neovim and Vim, for example Neovim's `init.vim` file replacing Vim's `vimrc` or the user's Neovim configuration files living at `~/.config/nvim` as opposed Vim's `~/.vim`.

(Nontrivial differences, such as the server configuration required to set up inverse search with a PDF reader, are explained separately for both editors.)

{{< details summary="**Suggestion** (click arrow to expand)" >}}
Read through Neovim’s `:help vim-differences` or [read the equivalent online version](https://neovim.io/doc/user/vim_diff.html).
{{< /details >}}

## Vim plugins

**Prerequisite:** you have installed Vim plugins before,
have a preferred plugin installation method (e.g. Vim 8+/Neovim's built-in plugin system, [`vim-plug`](https://github.com/junegunn/vim-plug), [`packer`](https://github.com/wbthomason/packer.nvim), etc...),
and will know what to do when told to install a Vim plugin.

{{< details summary="**Suggestion** (click arrow to expand)" >}}
- For most users, I suggest using the well-regarded [Vim-Plug plugin](https://github.com/junegunn/vim-plug) to manage your plugins (yes, this is a plugin that manages other plugins).
  The [Vim-Plug GitHub page](https://github.com/junegunn/vim-plug) contains everything you need to get started.
- If you prefer to manage your plugins manually, without third-party tools, use Vim/Neovim’s built-in plugin management system.
  The relevant documentation lives at `:help packages` but is unnecessarily complicated for a beginner’s purposes.
  When getting started with the built-in plugin system, it is enough to perform the following:

  1. Create the folder `pack` inside your root Vim configuration folder (i.e. create `~/.vim/pack/` if using Vim and `~/.config/nvim/pack/` if using Neovim).
  1. Inside `pack/`, create an arbitrary number of directories used to organize your plugins by category (e.g. create `pack/global/`, `pack/file-specific/`, etc.).
  These names can be anything you like and give you the freedom to organize your plugins as you see fit.
  You probably just want to start with one plugin directory, e.g. `pack/plugins/`, and create more if needed as you plugin collection grows.
  1. Inside each of the just-created organizational directories, create a directory named `start/` (you will end up with e.g. `pack/plugins/start/`).
  1. Clone a plugin repository from GitHub into a `start/` directory.

  Since that might sound abstract, an example shell session used to install the [VimTeX](https://github.com/lervag/vimtex), [UltiSnips](https://github.com/SirVer/ultisnips), and [Vim-Dispatch](https://github.com/tpope/vim-dispatch) plugins (all used later in this series) using Vim/Neovim’s built-in plugin system would look like this:

  ```bash
  # Change directories to the root Vim config directory
  cd ~/.vim         # for Vim
  cd ~/.config/nvim  # for Neovim

  # Create the required package directory structure
  mkdir -p pack/plugins/start
  cd pack/plugins/start

  # Clone the plugins' GitHub repos from inside `start/`
  git clone https://github.com/lervag/vimtex
  git clone https://github.com/SirVer/ultisnips
  git clone https://github.com/tpope/vim-dispatch
  ```

  For orientation, the resulting file structure would be:

  ```txt
  ~/.vim/
  └── pack/
      └── plugins/
          └── start/
              ├── vimtex/
              ├── ultisnips/
              └── vim-dispatch/
  ```

  The VimTeX, UltiSnips, and Vim-Dispatch plugins would then automatically load whenever Vim starts up.

  If you install a plugin manually, its documentation will not be automatically available with Vim’s `:help` command.
  To generate the plugin documentation, first ensure the plugin has a `doc` directory, which is where documentation should be stored.
If a plugin `doc` directory exists, you can generate its documentation with the Vim command:

  ```vim
  :helptags /path/to/plugin/doc
  ```

  You can also just use `:helptags ALL` to generate documentation for all plugins with a `doc` directory;
  see `:help helptags` for background.

{{< /details >}}

## Navigating the Vim help

**Prerequisite:** You should be comfortable using Vim/Neovim's excellent built-in documentation, which you access with the `:help` command.

{{< details summary="**Quick crash course** (click arrow to expand)" >}}
The Vim documentation is hyperlinked, and if you have syntax highlighting enabled, clickable hyperlinks to help chapters and sections should be clearly highlighted.
The following two key combinations will help you navigate the Vim help files:

- Press `<Ctrl>]` (i.e. the control key and the right square bracket) with your cursor over a highlighted documentation section to jump to that section.
- Press `<Ctrl>o` (the control key and the lowercase `o`) to jump backward through your navigation history (e.g. to return to your original position before pressing `<Ctrl>]`).

For more information, read `:help 01.1`, which explains the basics of the Vim documentation, and `:help notation`, which explains the notation used in the Vim documentation.

{{< /details >}}

## Operating system

*If you're only interested in the snippet and VimTeX articles you can ignore this prerequisite; it applies mainly to PDF reader integration.*

**Prerequisite:** you are working on Linux, macOS, or some other Unix variant.

{{< details summary="**Suggestion** (click arrow to expand)" >}}
If you use Windows, I suggest you follow along with the series as is; you will still find plenty of helpful techniques and ideas, and if XYZ doesn't work as expected, search the Internet for “how to use XYZ Vim/LaTeX/shell feature on Windows”. I do not have formal experience with Windows and cannot offer advice at the level of detail required for this series, but there should be plenty of Windows users on the Internet more knowledgeable than I am who have figured out a solution or workaround.

If you use some exotic flavor of Unix, I assume you know enough of what you are doing to adapt this series’s Linux-based suggestions to your platform.
{{< /details >}}


## Python 3 installation

*Python is only required if you plan on using UltiSnips for snippets.
You can ignore this Python dependency if you plan on using Luasnip as a snippet plugin (described later in the series).*

**Prerequisite:** you have a working Python 3+ installation and are able to use `pip/pip3` to install Python packages.

{{< details summary="**Suggestion** (click arrow to expand)" >}}
I suggest installing Python using your distribution's package manager on Linux and using Homebrew on macOS.
Both of these options should give you a reliable, up-to-date version of Python that includes `pip`.
If you discover that you have multiple, conflicting installations of Python on your system (this is risk on macOS in particular, which ships an outdated version by default), refer to one of the many guides on the Internet for cleaning up a Python 3 installation on your operating system.

In any case, you should end up with the `python`/`python3` and `pip`/`pip3` commands available from a command line.
{{< /details >}}

## Command line usage

**Prerequisite:** You are comfortable with the concept of calling simple command line programs from a terminal emulator, for example using `pdflatex myfile.tex` to compile the LaTeX file `myfile.tex`, using `python3 myscript.py` to run a Python script, or even something as simple as `echo "Hello world!"` to write text to standard output.

{{< details summary="**Suggestion** (click arrow to expand)" >}}
I tentatively assume that someone interested in using a command line editor like Vim is already familiar with the command line.
But in case you need practice, search YouTube or the wider Internet for one of the many guides on getting started with the command line.
{{< /details >}}

## Installing system packages

**Prerequisite:** you have a preferred method for installing new software onto your computer and know yow to use it.

{{< details summary="**Suggestion** (click arrow to expand)" >}}
Use your distribution’s package manager on Linux and the [Homebrew package manager](https://brew.sh/) on macOS.
{{< /details >}}

## Shell scripting abbreviations

**Prerequisite:** You are familiar with the more common abbreviations and macros used in shell scripting.

{{< details summary="**Quick crash course** (click arrow to expand)" >}}
The abbreviations you should know for this series are:

- `~` (the tilde) is shorthand for the home directory
- `.` is shorthand for the current working directory
- `..` is shorthand for one directory above the current working directory
- `*` is the match-all wildcard character used in [glob patterns](https://en.wikipedia.org/wiki/Glob_(programming)).
{{< /details >}}

## The abbreviations e.g. and i.e.

**Prerequisite:** You know what "e.g." and "i.e." mean---I will use both throughout this series.
(While these abbreviations might be obvious to some people, they could very well be exotic to others, for example non-native English speakers or anyone previously unfamiliar with technical or academic writing.)

{{< details summary="**Quick crash course** (click arrow to expand)" >}}
- “e.g.” means “for example”; it is an abbreviation of the Latin phrase *exemplī grātiā*, which means “for the sake of an example”.
  For more information consult [Wiktionary](https://en.wiktionary.org/wiki/e.g.) or the Internet.

  Example:

  > The VimTeX function `vimtex#syntax#in_mathzone()` returns `1` if the cursor is inside a LaTeX math zone (**e.g.** inside an `equation` environment or between inline math `$ $` symbols) and `0` otherwise.

  Equivalent meaning, using “for example”:

  > The VimTeX function `vimtex#syntax#in_mathzone()` returns `1` if the cursor is inside a LaTeX math zone (**for example** inside an `equation` environment or between inline math `$ $` symbols) and `0` otherwise.

- “i.e.” means “that is” and is usually used as a clarification of a previous statement; it is an abbreviation of the Latin phrase *id est*, which, surprise surprise, means “that is”.
  For more information consult [Wiktionary](https://en.wiktionary.org/wiki/i.e.) or search the Internet.

  Example:

  > The VimTeX shortcuts `[*` and `]*` let you move between the boundaries of LaTeX comments (**i.e.** any text beginning with `%`)
  
  Equivalent meaning, using “that is”:

  > The VimTeX shortcuts `[*` and `]*` let you move between the boundaries of LaTeX comments (**that is** any text beginning with `%`)

{{< /details >}}

{{< vim-latex/navbar >}}

{{< vim-latex/license >}}
