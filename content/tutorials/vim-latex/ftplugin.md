---
title: The Vim ftplugin system | Vim and LaTeX Series Part 3
prevFilename: "ultisnips"
prevDisplayName: "« 2. Snippets"
nextFilename: "vimtex"
nextDisplayName: "4. The VimTeX plugin »"
date: 2022-03-20
---

# Vim's ftplugin system

{{< vim-latex/header part="three" >}}

<div class="mb-10">
    {{< tutorials/navbar baseurl="/tutorials/vim-latex" index="intro" >}}
</div>


This article covers a few concepts related to Vim plugins and file-type plugins and was last modified on {{< date-last-mod-span >}}.

{{< toc level="2" title="Contents of this article" >}}

## The goal of this article...

...is to briefly explain a few Vim concepts that will help you better understand how to configure the VimTeX plugin (covered in the [next article]({{< relref "/tutorials/vim-latex/vimtex" >}})) and how to write filetype-specific Vim configuration.

This article covers:

- What is a Vim plugin?
- Vim's runtimepath
- Filetype-specific Vim plugins

If these terms are familiar to you, you can probably skip to the [next article]({{< relref "/tutorials/vim-latex/vimtex" >}}).

## What is a plugin?

Officially, using the definitions in the Vim docs:

- A *plugin* is the name for a Vimscript (or Lua) file that is loaded when you start Vim (source: see `:help plugin`).
  If you have ever created a `vimrc`, `init.vim`, or `init.lua` file, you have technically written a Vim plugin.
  The purpose of a plugin is to extend Vim's default functionality to meet your personal needs.

- A *package* is a set of Vimscript (or Lua) files (source: see `:help packages`).

In practice, most people (myself included) use the word "plugin" for both single Vimscript files (which are *officially* plugins) and collections of Vimscript files (which are officially packages).

Terminology aside, the point here is that plugins and packages are just Vimscript files used to extend Vim's default functionality, and, if you have ever written a `vimrc` or `init.vim`, it is within your means to write more advanced plugins, too.

{{< details summary="I use Neovim and write my config in Lua. Where does Lua fit into this discussion?" >}}
Basically everything Vimscript-themed in this article also works with Lua, I just focused on Vimscript in this article because 

1. the VimTeX plugin is written in Vimscript and is a bit easier to configure in Vimscript, and
1. Vimscript works for both Vim and Neovim users.

You can mostly replace any `.vim` with a `.lua` equivalent (e.g. replace the Vimscript file `ftplugin/tex.vim` with a Lua file `ftplugin/tex.lua`) and (assuming your Neovim is relatively up to date, e.g. 0.7+) Neovim should recognize and source the `.lua` file out of the box.
{{< /details >}}

## Runtimepath: where Vim looks for files to load

Vim's `runtimepath` is a list of directories, both in your home directory and system-wide, that Vim searches for files to load at runtime, i.e. when opening Vim.
If you want a plugin to load automatically when you open Vim, you must place the plugin in an appropriate directory in your `runtimepath`.

Below is a selection of some directories on Vim's default `runtimepath`---you will probably recognize some of them from your own Vim setup.

| Directory or File | Description |
| ----------------- | ----------- |
| `filetype.vim` |	Used to set a file's Vim filetype |
| `autoload/` |	Scripts loaded dynamically using Vim's `autoload` feature |
| `colors/` | Vim colorscheme files conventionally go here | 
| `doc/` | Contains documentation and help files | 
| `plugin/` | Global plugins go here | 
| `ftplugin/` | Filetype-specific plugins go here | 
| `pack/` | Vim's default location for third-party plugins | 
| `syntax/` | Contains scripts related to syntax highlighting | 

You can find a full list of runtimepath directories in `:help runtimepath`, and you can view your current `runtimepath` with `:echo &runtimepath` (warning: it is probably long and hard to parse).

## `plugin` and `ftplugin`

The `plugin` and `ftplugin` directories are the most important directories in your `runtimepath` for the purposes of this series---(we will use these directories for LaTeX-specific Vim configuration.)

Here are the important practical differences between `plugin` and `ftplugin`:

- `plugin` is intended for global Vim configuration (i.e. config that applies to *all* filetypes),
   while `ftplugin` is intended for filetype-specific configuration.
- Files in `plugin` load before files in `ftplugin`.
- Files in `plugin` load once per Vim session; files in `ftplugin` load every time you switch to a new buffer (and thus can load multiple times per Vim session if you switch between multiple buffers).

For thorough documentation see `:help plugin` and `:help ftplugin`.

## Vim's filetype plugin system

You use Vim's filetype plugin (`ftplugin`) system for Vim configuration that you want to apply only to a single filetype (e.g. only to LaTeX files, only to Python files, only to Markdown files, etc.).

### How to use ftplugin

Here's how to use the `ftplugin` directory for filetype-specific configuration (I'll use LaTeX files for concreteness, but this same recipe works for any filetype):

1. Vim users: add the following lines to your `vimrc`
   (these settings are enabled by default in Neovim---see `:help nvim-defaults`---so Neovim users can skip this step):

   ```vim
   " This is enabled by default in Neovim by the way
   filetype on             " enable filetype detection
   filetype plugin on      " load file-specific plugins
   filetype indent on      " load file-specific indentation
   ```

   These lines enable filetype detection, and filetype-specific plugins and indentation.
   To get an overview of your current filetype status, use the `:filetype` command; you want an output that reads:

   ```vim
   " With Vim's filetype-specific functionality enabled, the output looks like this
   filetype detection:ON  plugin:ON  indent:ON
   ```

   See `:help filetype` for more information on filetype plugins.

1. Identify the Vim `filetype` keyword for your desired filetype.
   For LaTeX files the Vim `filetype` is "`tex`".
   
   {{< details summary="Vim `filetype`? What's this?" >}}
   Vim keeps track of file types using short names (e.g. `tex` for LaTeX files, `lua` for Lua files, `python` for Python files).
   A file's Vim `filetype` is stored in the `filetype` option; you can view the current value with `:echo &filetype`.
   See `:help filetype` for relevant documentation.

   Be careful: a file's extension and Vim `filetype` are separate things, and Vim `filetypes` do not always agree with the conventional file extension (e.g. `python` for Python files, which have the conventional extension `.py`).
   {{< /details >}}

1. Create the file `ftplugin/tex.vim` and place any LaTeX-specific configuration in this file.
   That's it!
   The contents of `tex.vim` will be loaded only when editing files with the `tex` filetype, and not interfere with other filetypes.

#### Tip: use subdirectories for better organization

You can also split up your `tex` customizations among multiple files (instead of having a single, cluttered `tex.vim` file).
To do this, use the file structure `ftplugin/tex/*.vim`.
Any Vimscript files inside `ftplugin/tex/` will then load automatically when editing files with the `tex` filetype.
As a concrete example, your `ftplugin` directory might look like this:

```bash
# You can split up filetype configuration into filetype-specific
# subdirectories of ftplugin
ftplugin/
├── markdown.vim
├── python.vim
└── tex
   ├── foo.vim
   ├── bar.vim
   └── main.vim
```

In this example the files `foo.vim`, `bar.vim`, and `main.vim` will all be loaded when you edit a `tex` file.

## Optional: how Vim detects file types

If you're curious, the following sections explain how Vim detects file types and loads filetype plugins.
Feel free to skip this section.

### Automatic filetype detection

- Vim keeps track of a file's type by associating each file (well, technically each *buffer*, but that is another story) with a `filetype` option.
  Both `:echo &filetype` and `:set filetype?` will show you the value of a file's Vim `filetype`.

- Once you set `:filetype on` in your `vimrc` (enabled by default in Neovim), Vim automatically detects common filetypes (LaTeX included) based on the file's extension using a Vimscript file called `filetype.vim` that ships with Vim.
  You can view `filetype.vim`'s source code at the path `$VIMRUNTIME/filetype.vim` (first use `:echo $VIMRUNTIME` in Vim to determine `$VIMRUNTIME`).

### Manual filetype detection {#ftdetect}

If Vim's default filetype detection using `filetype.vim` fails (which can happen for exotic filetypes), you can also manually configure Vim to detect the target filetype.
Note that manual detection of exotic filetypes is not needed for this tutorial (Vim detects LaTeX files without any configuration on your part), so feel free to skip ahead.

You can manually set `filetype` a few ways using the recipes provided in `:help ftdetect`.
Here is one way to do this, using LilyPond (extension `.ly`) as an example.

{{< details summary="What is LilyPond?" >}}
[LilyPond](https://lilypond.org/) is a free and open-source system for elegantly typesetting musical notation using plain-text source files with LaTeX-like commands and macros.
Loosely, LilyPond is for music what LaTeX is for math (although the two programs are not officially related).
{{< /details >}}

Here's how to manually detect and set custom filetypes, using LilyPond as a concrete example:

1. Identify the extension(s) you expect for the target filetype, e.g. `.ly` for LilyPond.

1. Decide on a reasonable value to use for the Vim `filetype` option for this file type (the choice is up to you).
   This can match the conventional extension, but doesn't have to.
   For LilyPond files I use `filetype=lilypond`.

1. Create the file `~/.vim/filetype.vim` (or `~/.config/nvim/filetype.vim`) and inside add the single line

   ```vim
   " When creating or opening new buffers with the .ly extension, set the
   " value of the `filetype` option to "lilypond"
   autocmd BufNewFile,BufRead *.ly set filetype=lilypond
   ```

   Of course replace `.ly` with your target extension and `lilypond` with the value of `filetype` you chose in step 2.

See `:help ftdetect` for other ways to manually set custom filetypes.
   
### How Vim loads filetype plugins

The relevant documentation lives at `:help filetype` and `:help ftplugin`, but is rather long.
For our purposes:

- When you open a file with Vim, assuming you have set `:filetype on`, Vim tries to determine the file's type by cross-checking the file's extension against a set of extensions found in `$VIMRUNTIME/filetype.vim`.
  Generally this method works out of the box (`filetype.vim` is over 2300 lines and covers most common files).

  If the file's type is not detected from its extension, Vim attempts to guess the file type based on file contents using `$VIMRUNTIME/scripts.vim` (see `:help filetype`).
  If both `$VIMRUNTIME/filetype.vim` and `$VIMRUNTIME/scripts.vim` fail, Vim checks the contents of `ftdetect` directories in your `runtimepath`, as described in the section [Manual filetype detection](#ftdetect) a few paragraphs above.

- If Vim successfully detects a file's type, it sets the value of the `filetype` option to indicate the file type.

- After the `filetype` option is set, Vim checks the contents of your `ftplugin/` directory, if you have one.
  If Vim finds either...

  - a file `ftplugin/{filetype}.vim` (e.g. `ftplugin/tex.vim` for `filetype=tex`), then Vim loads the contents of `{filetype}.vim`, or

  - a directory `ftplugin/{filetype}` (e.g. `ftplugin/tex` for the `filetype=tex`), then Vim loads all `.vim` files inside the `{filetype}` directory.

As a best practice, keep filetype-specific settings in either in a dedicated `{filetype}.vim` file at `ftplugin/{filetype}.vim`,
or split up among multiple files in `ftplugin/{filetype}/*.vim`.
Think of the `ftplugin` files as a `vimrc` for one file type only,
and keep your actual `vimrc` for global settings you want to apply to *all* file types.

<div class="mt-8">
{{< tutorials/navbar baseurl="/tutorials/vim-latex" index="intro" >}}
<div>

<div class="mt-8">
{{< tutorials/thank-you >}}
<div>

<div class="mt-6">
{{< tutorials/license >}}
<div>

