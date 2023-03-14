---
title: The Vim ftplugin system | Vim and LaTeX Series Part 3
prevFilename: "ultisnips"
prevDisplayName: "« 2. Snippets"
nextFilename: "vimtex"
nextDisplayName: "4. The VimTeX plugin »"
date: 2022-03-20
---

{{< vim-latex/navbar >}}

# 3. Vim's ftplugin system

{{< date-last-mod >}}

This is part three in a [seven-part series]({{< relref "/tutorials/vim-latex/intro" >}}) explaining how to use the Vim or Neovim text editors to efficiently write LaTeX documents.
This is a short article covers a few concepts related to Vim plugins and file-type plugins; the goal is to help you better understand how the VimTeX plugin works and to show you how to write LaTeX-specific Vim configuration.

{{< toc level="2" title="Contents of this article" >}}

## The goal of this article...

...is to briefly explain a few Vim concepts that will help you better understand the VimTeX plugin (covered in the [next article]({{< relref "/tutorials/vim-latex/vimtex" >}})).

This article covers:

- What is a Vim plugin?
- What is Vim's runtimepath?
- What is a filetype specific Vim plugin?

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

1. Vimscript works for both Vim and Neovim users and 
2. the VimTeX plugin uses Vimscript.

You can mostly replace any `.vim` with a `.lua` equivalent (e.g. replace the Vimscript file `ftplugin/tex.vim` with a Lua file `ftplugin/tex.lua`) and (assuming your Neovim is relatively up to date, e.g. 0.7+) Neovim should recognize and source the `.lua` file out of the box.
{{< /details >}}

## Runtimepath: where Vim looks for files to load

Vim's `runtimepath` is a list of directories, both in your home directory and system-wide, that Vim searches for files to load at runtime, i.e. when opening Vim.
Below is a list of some directories on Vim's default `runtimepath`, taken from `:help runtimepath`---you will probably recognize some of them from your own Vim setup.

| Directory or File | Description |
| ----------------- | ----------- |
| `filetype.vim` |	Used to set a file's Vim filetype |
| `autoload/` |	Scripts loaded dynamically using Vim's `autoload` feature |
| `colors/` | Vim colorscheme files conventionally go here | 
| `compiler/` | Contains files related to compilation and `make` functionality | 
| `doc/` | Contains documentation and help files | 
| `ftplugin/` | Filetype-specific configurations go here | 
| `indent/` | Contains scripts related to indentation | 
| `pack/` | Vim's default location for third-party plugins | 
| `spell/` | Files related to spell-checking | 
| `syntax/` | Contains scripts related to syntax highlighting | 

For the purposes of this series, the most important directory in your `runtimepath` is the `ftplugin/` directory in your Vim config folder, i.e. the directory `~/.vim/ftplugin/` on Vim and `~/.config/nvim/ftplugin/` on Neovim---this is where you place filetype-specific configuration.

You can view your current `runtimepath` with `:echo &runtimepath`.
If you want a plugin to load automatically when you open Vim, you must place the plugin in a directory in your `runtimepath`.

## Vim's filetype plugin system

Use case: you use Vim's filetype plugin (`ftplugin`) system for Vim configuration that you want to apply only to a single filetype.

### Filetype plugin basic recipe

Say you want to write a plugin that applies only to LaTeX files.
Here's what to do:

1. Add the following lines to your `vimrc`
   (these settings are enabled by default on Neovim---see `:help nvim-defaults`---but it can't hurt to place them in your `init.vim`, too):

   ```vim
   " This is enabled by default in Neovim by the way
   filetype on             " enable filetype detection
   filetype plugin on      " load file-specific plugins
   filetype indent on      " load file-specific indentation
   ```

   These lines enable filetype detection and filetype-specific plugins and indentation.
   To get an overview of your current filetype status, use the `:filetype` command; you want an output that reads:

   ```vim
   " With Vim's filetype-specific functionality enabled, the output looks like this
   filetype detection:ON  plugin:ON  indent:ON
   ```

   See `:help filetype` for more information on filetype plugins.

1. Create the file `~/.vim/ftplugin/tex.vim` (or `~/.config/nvim/ftplugin/tex.vim` on Neovim) and place LaTeX-specific mappings, functions, and other settings in this file.
   That's it!
   Anything in `tex.vim` will be loaded only when editing files with the `tex` filetype (i.e. LaTeX and related files), and will not interfere with your other filetype plugins.

#### Tip: use subdirectories for better organization

You can also split up your `tex` customizations among multiple files (instead of having a single, cluttered `tex.vim` file).
To do this, create the file structure `~/.vim/ftplugin/tex/*.vim`.
Any Vimscript files inside `~/.vim/ftplugin/tex/` will then load automatically when editing files with the `tex` filetype.
As a concrete example, you might design your `ftplugin` directory like this:

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

In this example the the files `foo.vim`, `bar.vim`, and `main.vim` will all be loaded when you edit a `tex` file.
   
The following sections explain how loading filetype plugins works under the hood.
<!-- See `h: add-filetype-plugin` and `h: write-filetype-plugin` for further information. -->

### Automatic filetype detection

- Vim keeps track of a file's type using the `filetype` option.
  You can view Vim's opinion of a file's `filetype` using the commands `:set filetype?` or `:echo &filetype`.

- Once you set `:filetype on` in your `vimrc` (enabled by default on Neovim), Vim automatically detects common filetypes (LaTeX included) based on the file's extension using a Vimscript file called `filetype.vim` that ships with Vim.
  You can view `filetype.vim`'s source code at the path `$VIMRUNTIME/filetype.vim` (first use `:echo $VIMRUNTIME` in Vim to determine `$VIMRUNTIME`).

### Manual filetype detection {#ftdetect}

If Vim's default filetype detection using `filetype.vim` fails (this only happens for exotic filetypes), you can also manually configure Vim to detect the target filetype.
Note that manual detection of exotic filetypes is not needed for this tutorial (Vim detects LaTeX files without any configuration on your part), so feel free to skip ahead.

But if you're curious, here's an example using LilyPond files, which by convention have the extension `.ly`.
([LilyPond](https://lilypond.org/) is a free and open-source text-based system for elegantly typesetting musical notation; as an analogy, LilyPond is for music what LaTeX is for math.)

Here's what to do for manual filetype detection:

1. Identify the extension(s) you expect for the target filetype, e.g. `.ly` for LilyPond.

1. Make up some reasonable value that Vim's `filetype` variable should take for the target filetype.
   This can match the extension, but doesn't have to.
   For LilyPond files I use `filetype=lilypond`.

1. Create the file `~/.vim/ftdetect/lilypond.vim` (the file name, in this case `lilypond.vim`, can technically be anything ending in `.vim`, but by convention should match the value of `filetype`).
   Inside the file add the single line

   ```vim
   autocmd BufNewFile,BufRead *.ly set filetype=lilypond
   ```

   Of course replace `.ly` with your target extension and `lilypond` with the value of `filetype` you chose in step 2.
   
### How Vim loads filetype plugins

The relevant documentation lives at `:help filetype` and `:help ftplugin`, but is rather long.
For our purposes:

- When you open a file with Vim, assuming you have set `:filetype on`, Vim tries to determine the file's type by cross-checking the file's extension against a set of extensions found in `$VIMRUNTIME/filetype.vim`.
  Generally this method works out of the box (`filetype.vim` is over 2300 lines and covers the majority of common files).

  If the file's type is not detected from extension, Vim attempts to guess the file type based on file contents using `$VIMRUNTIME/scripts.vim` (reference: `:help filetype`).
  If both `$VIMRUNTIME/filetype.vim` and `$VIMRUNTIME/scripts.vim` fail, Vim checks the contents of `ftdetect` directories in your `runtimepath`, as described in the section [Manual filetype detection](#ftdetect) a few paragraphs above.

- If Vim successfully detects a file's type, it sets the value of the `filetype` option to indicate the file type.
  Often, but not always, the value of `filetype` matches the file's conventional extension; for LaTeX this value is `filetype=tex`.
  You can check the current value of `filetype` with `echo &filetype` or `:set filetype?`.

- After the `filetype` option is set, Vim checks the contents of your `~/.vim/ftplugin` directory, if you have one.
  If Vim finds either...

  - a file `ftplugin/{filetype}.vim` (e.g. `filetype/tex.vim` for `filetype=tex`), then Vim loads the contents of `{filetype}.vim`, or

  - a directory `ftplugin/{filetype}` (e.g. `ftplugin/tex` for the `filetype=tex`), then Vim loads all `.vim` files inside the `{filetype}` directory.

As a best practice, keep filetype-specific settings in either in a dedicated `{filetype}.vim` file at `ftplugin/{filetype}.vim`,
or split up among multiple files in `ftplugin/{filetype}/*.vim`.
Think of the `ftplugin` files as a `vimrc` for one file type only,
and keep your actual `vimrc` for global settings you want to apply to *all* file types.

{{< vim-latex/navbar >}}

{{< vim-latex/license >}}
