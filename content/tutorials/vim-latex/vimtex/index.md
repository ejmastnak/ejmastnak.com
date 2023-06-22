---
title: A VimTeX Plugin Guide | Vim and LaTeX Series Part 4
prevFilename: "ftplugin"
prevDisplayName: "« 3. Vim's ftplugin system"
nextFilename: "compilation"
nextDisplayName: "5. Compilation »"
date: 2021-11-24
---

{{< vim-latex/navbar >}}

# 4. Getting started with the VimTeX plugin

{{< date-last-mod >}}

This is part four in a [seven-part series]({{< relref "/tutorials/vim-latex/intro" >}}) explaining how to use the Vim or Neovim text editors to efficiently write LaTeX documents.
This article covers the excellent [VimTeX plugin](https://github.com/lervag/vimtex/), a modular Vim and Neovim plugin with heaps of useful features for writing LaTeX files.

{{< toc level="2" title="Contents of this article" >}}

**Background knowledge:** this article will make regular references to the `ftplugin` and `plugin` directories, which we will use to implement LaTeX-specific Vim configuration.
To get the most out of this article, you should understand the purpose of these directories.
In case you are just dropping in now and words like "plugin", "ftplugin", and "runtimepath" sound unfamiliar, consider first reading through the [previous article in this series]({{< relref "/tutorials/vim-latex/ftplugin" >}}), which covers what you need to know.

{{< details summary="I use Neovim and prefer Lua; can I configure VimTeX with Lua?" >}}
Certainly.
Assuming you [know how to translate Vimscript to Lua](https://github.com/nanotee/nvim-lua-guide) and your Neovim is reasonably up to date (e.g. 0.7+), you can replace the relevant `.vim` files mentioned in this article with their `.lua` equivalents (e.g. replace the Vimscript file `ftplugin/tex.vim` with a Lua file `ftplugin/tex.lua`) and translate the corresponding Vimscript configuration to Lua.
This falls beyond the scope of this article, though.

But because VimTeX (which predates Neovim and Lua) is written in Vimscript, it might be easier to use Vimscript for your VimTeX configuration, too.
In any case, this article is written from a Vimscript perspective (even though I personally use Neovim and Lua) so that both Vim and Neovim users can benefit from it.
{{< /details >}}

You might also want to skim over the [suggested prerequisite knowledge]({{< relref "/tutorials/vim-latex/prerequisites" >}}) for reading this series.

## Two ways to read this article

You could either:

1. Read the administrative material first (e.g. installing and configuring VimTeX and accessing the documentation, and other boring stuff)---in this case just keep going and read the article linearly from start to finish.
1. [Jump directly to examples](#doing-stuff), then come back and fill in the theory later.


## The point of this article

Given VimTeX's superb documentation, what is the point of this guide?
My reasoning is that many new users---I am often guilty of this too---quickly become overwhelmed when reading extensive plain-text documentation as a means of learning new software, and perhaps the Markdown syntax, animated GIFs, highlighted code blocks, and more personal tone in this article will make it easier for new users to digest what VimTeX offers.

My goal is certainly not to replace the VimTeX documentation, which remains essential reading for any serious user.
Instead, I hope to quickly bring new users up to a level of comfort at which the documentation becomes useful rather than overwhelming, and to offer pointers as to where in the VimTeX documentation to look when interested in a given feature.

## Getting started with VimTeX {#getting-started}

Install VimTeX like any other Vim plugin using your plugin installation method of choice ([reminder of series prerequisites]({{< relref "/tutorials/vim-latex/prerequisites" >}})).
The requirements for using VimTeX are mostly straightforward, for example:

- a reasonably up-to-date version of Vim or Neovim
- filetype plugins enabled (place the line `filetype-plugin-on` in your `vimrc` or `init.vim`)
- UTF8 character encoding enabled (enabled by default in Neovim; place the line `set encoding=utf-8`in your `vimrc`).

See `:help vimtex-requirements` for details on requirements for using VimTeX.

Note that you will need a LaTeX compilation program (e.g. `latexmk` and `pdflatex`) installed on your computer to be able use VimTeX's compilation features.
You also need a Vim version compiled with the `+clientserver` feature to use VimTeX's inverse search feature with PDF readers (note that `+clientserver` ships by default with Neovim).
I cover compilation and setting up a PDF reader in the [next]({{< relref "/tutorials/vim-latex/compilation" >}}) [two]({{< relref "/tutorials/vim-latex/pdf-reader" >}}) articles in this series, so you can postpone these requirements until then.

### Some things to keep in mind

As you get started with the VimTeX plugin, here are a few things to keep in mind:

- Once you have installed VimTeX and meet the above-described requirements, you can check that VimTeX has loaded by opening a file with the `.tex` extension and issuing the command `:VimtexInfo`.
  If this opens a window with various system status information, VimTeX has loaded and you're good to go.
  
  If the command `:VimtexInfo` returns `E492: Not an editor command: VimtexInfo`, VimTeX has not loaded.
  Double-check that VimTeX is installed and that you meet the plugin requirements described just above in the section [Getting started with VimTeX](#getting-started).
  If that fails and VimTeX still doesn't load, scroll down to this article's [appendix](#appendix)
  and see if problem of overriding VimTeX with a user-defined filetype plugin applies to you.
  If *that* fails, turn to the Internet for help.

- VimTeX has excellent documentation, which is available with `:help vimtex`.
  (If for some reason `:help vimtex` comes up empty after a manual installation, you probably haven't generated helptags. Run the Vim command `:helptags ALL` after installing VimTeX to generate the VimTeX documentation; see `:help helptags` for background.)

- Most VimTeX features are enabled by default, and in these cases disabling features is up to the user.
  Inversely, VimTeX's folding and text formatting features come disabled by default, and it is up to the user to enable them (see `:help g:vimtex_fold_enabled` and `:help g:vimtex_format_enabled`).
  Disabling and configuring features is described later in this article in the section on [VimTeX's options](#options).

- As described in `:help vimtex-tex-flavor`, VimTeX overrides Vim's internal `ftplugin`, i.e. the one in `$VIMRUNTIME/ftplugin`,
  but respects any user-defined LaTeX configuration in `ftplugin/tex.vim`.

### How to configure VimTeX {#configuration}

This question comes up regularly enough on the VimTeX GitHub page that I feel it deserves its own section (I'll refer back to this section later in this article and series).
Here are my suggestions:

{{< details summary="Option 1: put everything in your vimrc" >}}
You can put all VimTeX- and LaTeX-related Vim configuration in your `vimrc` (or `init.vim` or `init.lua` for Neovim users) and be fine---the main disadvantage is a potentially cluttered `vimrc`.

This is the option I'd suggest if you're not yet familiar with topics like Vim buffers, buffer-local vs. global Vim variables, and the `ftplugin` and `plugin` directories.
By using your `vimrc`, you'll ensure your configuration is loaded and ready to go before VimTeX starts---and thus avoid potential misconfiguration traps caused by incorrect loading order (see the linked issues below for examples).
{{< /details >}}

{{< details summary="Option 2: if you're familiar with `ftplugin`, `plugin`, and Vim buffers" >}}
If you are comfortable with the `plugin` and `ftplugin` directories (see the [previous article in this series]({{< relref "/tutorials/vim-latex/ftplugin" >}})) and the concept of Vim buffers, here is a cleaner setup:

1. Use a file in your `plugin` directory (e.g. `plugin/tex.vim`, `plugin/vimtex.vim`; the name is your choice) to set all global VimTeX options (those that start with `g:`, e.g. `g:vimtex_view_method`, `g:vimtex_delim_toggle_mod_list`, etc.).
   The key idea here is to use the `plugin` directory for all configuration that should be set *before* VimTeX loads.
1. Use the file `ftplugin/tex.vim` for other LaTeX-related configuration that you want to apply only in buffers with the `tex` filetype (e.g. LaTeX-specific keymaps and text objects).

Placing global VimTeX configuration options in `plugin/` ensures that (1) these options load before VimTeX and (2) do not needlessly load multiple times when editing multiple LaTeX files in the same Vim session.
Meanwhile, placing settings like custom keymaps in `ftplugin` ensures these keymaps only apply in LaTeX files and don't interfere with mappings you might have set for other file types.
{{< /details >}}

I would encourage all readers to browse VimTeX issues [#2740](https://github.com/lervag/vimtex/issues/2740), [#2725](https://github.com/lervag/vimtex/issues/2725), and [#2714](https://github.com/lervag/vimtex/issues/2714) to see the importance of setting global VimTeX options *before* VimTeX loads (you'll also find useful discussion on VimTeX configuration in general).

Historical note: I was previously guilty of suggesting `ftplugin` for *all* VimTeX configuration when either `plugin` (or simply the `vimrc`) would have been better options.
You can see mention of this in [#2740](https://github.com/lervag/vimtex/issues/2740#issuecomment-1601687456) and [#2733](https://github.com/lervag/vimtex/issues/2733#issuecomment-1596609694) ;)

## Overview of features

The VimTeX plugin offers more than any one user will probably ever require;
you can view a complete list of features at `:help vimtex-features`, or see an [online version on the VimTeX GitHub page](https://github.com/lervag/vimtex#features).

This article will cover the following features:

- LaTeX-specific text objects (for environments, commands, etc.) and their associated operator-pending motions
- Motion commands through sections, environments, matching delimiters, item lists, etc.
- LaTeX-specific commands for manipulating environments, commands, and delimiters
- Snippet-like insert mode mappings
- Syntax highlighting, including support for common LaTeX packages and the potential for math context detection for snippet triggers

VimTeX also provides a compilation interface and PDF viewer support, which I describe in two [dedicated]({{< relref "/tutorials/vim-latex/compilation" >}}) [articles]({{< relref "/tutorials/vim-latex/pdf-reader" >}}) later in the series.

## How to read VimTeX's documentation of mappings

First, a quick crash course in a very useful part of the VimTeX documentation.

All of the mappings (i.e. keyboard shortcuts for commands and actions)
provided by VimTeX are nicely described in a three-column list you can find at `:help vimtex-default-mappings`.
You will probably return to this list regularly as you learn to use the plugin.
Here is a representative example of what the list looks like:

```txt
---------------------------------------------------------------------
 LHS              RHS                                          MODE
---------------------------------------------------------------------
 <localleader>li  <Plug>(vimtex-info)                           n
 <localleader>ll  <Plug>(vimtex-compile)                        n
 csd              <Plug>(vimtex-delim-change-math)              n
 tse              <Plug>(vimtex-env-toggle-star)                n
 ac               <Plug>(vimtex-ac)                             xo
 id               <Plug>(vimtex-id)                             xo
 ae               <Plug>(vimtex-ae)                             xo
```

To have a clear mental image of what's going on here, you should understand how Vim mappings work,
what the `<leader>` and `<localleader>` keys do, and what the `<Plug>` keyword means.
If you want to learn about these topics now, take a detour and read through the final article in this series, [7. A Vim Configuration Primer for Filetype-Specific Workflows]({{< relref "/tutorials/vim-latex/vimscript" >}}).

For our present purposes, here is how to interpret the table:

- Each entry in the middle (`RHS`) column is a Vim `<Plug>` mapping corresponding to a specific VimTeX feature.
  For example, `<Plug>(vimtex-info)` displays status information about the VimTeX plugin and `<Plug>(vimtex-ac)` corresponds to VimTeX's "a command" text object (analogous to Vim's built-in `aw` for "a word" or `ap` for "a paragraph").
  
  Each entry in the `RHS` column also links to a dedicated section of the VimTeX documentation, which you can jump to by hovering over a `RHS` entry and pressing `<Ctrl>]`.

- By default, VimTeX maps each entry in the `RHS` column to the short key combination in the `LHS` column.
  You are meant to use the convenient `LHS` shortcut to trigger the action in the `RHS`.
  Here's an example:

  ```bash
  LHS              RHS                    MODE
  <localleader>li  <Plug>(vimtex-info)    n
  ac               <Plug>(vimtex-ac)      xo
  ```

  In this example, the key combination `<localleader>li` will call the VimtexInfo command to display status information about VimTeX, and the key combination `ac` maps to VimTeX's "a command" text object.

- Each mapping works only in a given Vim mode;
  this mode is specified in the `MODE` column using Vim's conventional single-letter abbreviations for mode names.

  Consider this example again:

  ```bash
  LHS              RHS                    MODE
  <localleader>li  <Plug>(vimtex-info)    n
  ac               <Plug>(vimtex-ac)      xo
  ```

  In this example, `<localleader>li <Plug>(vimtex-info)` mapping works in normal (`n`) mode, and `ac Plug>(vimtex-ac)` works in works in visual (`x`) and operator-pending (`o`) mode.
  For more information about map modes and key mappings, see the Vim documentation section `:help map-listing` and the [Vim configuration article]({{< relref "/tutorials/vim-latex/vimscript" >}}) later in this series.

The VimTeX documentation sections `COMMANDS` (accessed with `:help vimtex-commands`) and `MAP DEFINITIONS` (accessed with `:help vimtex-mappings`) list and explain the commands and mappings in the `RHS` of the above table.
I recommend skimming through the table in `:help vimtex-default-mappings`, then referring to `:help vimtex-commands` or `:help vimtex-mappings` for more information about any mapping that catches your eye.

## Doing practical stuff with VimTeX {#doing-stuff}

Following is a summary, with examples, of useful functionality provided by VimTeX.

### Change and delete stuff

You can:

- **Delete surrounding environments using `dse`:** Delete the `\begin{}` and `\end{}` declaration surrounding a LaTeX environment without changing the environment contents
  using the default shortcut `dse` (works in normal mode, mapped to `<Plug>(vimtex-env-delete)`).

  For example, using `dse` in a `quote` environment produces:

  ```tex
  \begin{quote}                 dse
  Using VimTeX is lots of fun!  -->  Using VimTeX is lots of fun!
  \end{quote}
  ```

  {{< img-centered src="dse.gif" width="100%" alt="GIF: deleting a surrounding quote environment with dse." >}}

- **Change surrounding environments using `cse`:** Change the type of a LaTeX environment without changing the environment contents
  using the default shortcut `cse` (works in normal mode, mapped to `<Plug>(vimtex-env-change)`).

  For example, one could quickly change an `equation` to an `align` environment as follows:

  ```tex
  \begin{equation*}   cse align   \begin{align*}
      % contents         -->          % contents 
  \end{equation*}                 \end{align*}
  ```

  {{< img-centered src="cse.gif" width="100%" alt="GIF: changing equation to align with cse" >}}

- **Delete surrounding commands using `dsc`:** Delete a LaTeX command while preserving the command's argument(s)
  using the default shortcut `dsc` (works in normal mode, mapped to `<Plug>(vimtex-cmd-delete)`).

  For example, typing `dsc` anywhere inside `\textit{Hello, dsc!}` produces:

  ```tex
                        dsc
  \textit{Hello, dsc!}  -->  Hello, dsc!
  ```

  The `dsc` mapping also recognizes and correctly deletes parameters inside square brackets, for example:

  ```tex
               dsc
  \sqrt[n]{a}  -->  a
  ```
  Here are the above two examples in action:

  {{< img-centered src="dsc.gif" width="100%" alt="GIF: deleting surrounding commands with dsc." >}}

- **Delete surrounding delimiters using `dsd`:** Delete delimiters (e.g. `()`, `[]`, `{}`, *and* any of their `\left \right`, `\big \big` variants) without changing the enclosed content
  using the default shortcut `dsd` (works in normal mode, mapped to `<Plug>(vimtex-delim-delete)`).

  Here are two examples of deleting delimiters with `dsd`:

  ```tex
           dsd
  (x + y)  -->  x + y

                      dsd
  \left(X + Y\right)  -->  X + Y
  ```
  Here are the above two examples in action:

  {{< img-centered src="dsd.gif" width="100%" alt="GIF: deleting surrounding delimiters with dsd." >}}

- **Change surrounding delimiters using `csd`:** Change delimiters (e.g. `()`, `[]`, `{}`, and any of their `\left \right`, `\big \big` variants) without changing the enclosed content
  using the default shortcut `csd` (works in normal mode, mapped to `<Plug>(vimtex-delim-change-math)`).

  For instance, you could change parentheses to square brackets as follows:

  ```tex
           csd [
  (a + b)   -->   [b + b]
  ```

  The `csd` command is "smart"---it recognizes and preserves `\left \right`-style modifiers.
  For example, `csd [` inside `\left( \right)` delimiters produces:

  ```tex
                      csd [
  \left(A + B\right)   -->   \left[A + B\right]  % as opposed to [A + B]
  ```

  Here are the above two examples in a GIF:

  {{< img-centered src="csd.gif" width="100%" alt="GIF: changing surrounding delimiters with csd." >}}

- **Delete surrounding math using `ds$`:** Delete surrounding math environments or the `$` delimiters of LaTeX inline math without changing the math contents 
  using the default shortcut `ds$` (works in normal mode, mapped to `<Plug>(vimtex-env-delete-math)`).

  Here is an example:

  ```tex
                  ds$
  $ 1 + 1 = 2 $   -->  1 + 1 = 2
  ```

  Conveniently, the `ds$` works with all math environments, not just inline math.

  {{< img-centered src="dsm.gif" width="100%" alt="GIF: deleting surrounding math environments with ds$." >}}

- **Change surrounding math using `cs$`:** Change the surrounding math environment without changing the math content
  using the default shortcut `cs$` (works in normal mode, mapped to `<Plug>(vimtex-env-change-math)`).
  When used inside inline math `$` delimiters, changes the inline math to an environment name, enclosed in `\begin{}` and `\end{}` environment tags.
  Use `cs$ $` to change math environments back to inline math.

  For example, you could change between inline math and an `equation` environment as follows:

  ```tex
                 cs$ equation
  $ 1 + 1 = 2 $       -->       \begin{equation}
                                    1 + 1 = 2 
                                \end{equation}
                    cs$ $
  \begin{equation}   -->  $x + y = z$
      x + y = z
  \end{equation}                               
  ```
  Note the correct indentation inside the `equation` environment!

  {{< img-centered src="csm.gif" width="100%" alt="GIF: changing inline math to an equaiton with csm." >}}

- **Change surrounding commands using `csc`:** Change a LaTeX command while preserving the command's argument(s)
  using the default shortcut `csc` (works in normal mode, mapped to `<Plug>(vimtex-cmd-change)`).

  As an example, you could change italic text to boldface text as follows:

  ```tex
                            csc textit
  \textbf{Make me italic!}     -->      \textit{Make me italic!}
  ```

  {{< img-centered src="csc.gif" width="100%" alt="GIF: changing \textbf to \textit with csc." >}}

### Toggle-style mappings {#toggle}

The following commands toggle back and forth between states of various LaTeX environments and commands. 
You can:

- **Toggle starred commands and environments using `tsc` and `tse`**, which both work in normal mode and are mapped to `<Plug>(vimtex-cmd-toggle-star)` and `<Plug>(vimtex-env-toggle-star)`, respectively.

  The following example uses `tsc` in a `\section` command to toggle section numbering and `tse` inside an `equation` environment to toggle equation numbering:

  ```tex
                      tsc                       tsc
  \section{Toggling}  -->  \section*{Toggling}  -->  \section{Toggling}

  \begin{equation}   tse   \begin{equation*}   tse   \begin{equation}
      x + y = z      -->        x + y = z      -->       x + y = z
  \end{equation}           \end{equation*}           \end{equation}
  ```
  Here are the above two examples in a GIF:

  {{< img-centered src="tsc-tse.gif" width="100%" alt="GIF: demonstrating the tsc and tse commands." >}}

- **Toggle between inline and display math `ts$`**, which works in normal mode and is mapped to `<Plug>(vimtex-env-toggle-math)`.
  The following example uses `ts$` to switch between inline math, display math, and an `equation` environment

  ```tex
                ts$  \[              ts$   \begin{equation}
  $1 + 1 = 2$   -->     1 + 1 = 2    -->       x + y = z
                     \]                    \end{equation}
  ```

  Here is the above example in a GIF:

  {{< img-centered src="tsm.gif" width="100%" alt="GIF: toggling between inline and display math with tsm." >}}

- **Toggle surrounding delimiters using `tsd`:** Change between plain and `\left`/`\right` versions of delimiters 
  using the default shortcut `tsd` (works in normal and visual modes, mapped to `<Plug>(vimtex-delim-toggle-modifier)`).

  The following example uses `tsd` to toggle `\left` and `\right` modifiers around parentheses:

  ```tex
            tsd                        tsd  
  (x + y)   -->   \left(x + y\right)   -->   (x + y)
  ```

  Delimiters other than `\left \right` (e.g. `\big`, `\Big`, etc.) can be added to the toggle list by configuring the `g:vimtex_delim_toggle_mod_list` variable; for a concrete example of how to do this, scroll down to the section [Example: Changing the default delimiter toggle list](#example-change-delim).
  Here is an example with both `\left \right` and `\big`:

  {{< img-centered src="tsd.gif" width="100%" alt="GIF: using the tsd action to change delimiters" >}}

  `tsD` `<Plug>(vimtex-delim-toggle-modifier-reverse)` works like `tsd`, but searches in reverse through the delimiter list.
  The observed behavior is identical to `tsd` when the delimiter list stored in `g:vimtex_delim_toggle_mod_list` contains only one entry.

- **Toggle surrounding fractions using `tsf`:** Toggle between inline and `\frac{}{}` versions of fractions 
  using the default shortcut `tsf` (works in normal and visual modes, mapped to `<Plug>(vimtex-cmd-toggle-frac)`).

  Here is an example:

  ```tex
                tsf         tsf 
  \frac{a}{b}   -->   a/b   -->   \frac{a}{b}
  ```

  {{< img-centered src="tsf.gif" width="100%" alt="GIF: toggling between inline and display fractions with tsf." >}}

### Motion mappings

All of the following motions accept a count and work in Vim's normal, operator-pending, and visual modes.
You can:

- **Navigate matching content using `%`:** Move between matching delimiters, inline-math `$` delimiters, and LaTeX environments 
  using the default shortcut `%` (works in normal, visual, and operator-pending modes (henceforth abbreviated `nxo`); mapped to `<Plug>(vimtex-%)`).

  Here are some examples:

  {{< img-centered src="move-matching.gif" width="100%" alt="GIF: demonstrating the VimTeX % motion mapping." >}}
  
- **Navigate sections using `]]` and its variants:** Jump to the beginning of the next `\section`, `\subsection` or `\subsubsection`, whichever comes first, 
  using the default shortcut `]]` (works in Vim's `nxo` modes; mapped to `<Plug>(vimtex-]])`).

  Use `[[` to jump to the beginning of the *current* `\section`, `\subsection` or `\subsubsection` 
  (in practice, this feels like jumping backward---try it yourself and see what I mean).
  See the similar shortcuts `][` and `[]` in the VimTeX documentation at `:help <Plug>(vimtex-][)` and `:help <Plug>(vimtex-[])`.

  Here are the `[[` and `]]` motions in action:

  {{< img-centered src="move-section.gif" width="100%" alt="GIF: moving between LaTeX sections." >}}

- **Navigate environments using `]m` and its variants:** Jump to the next or previous environment `\begin{}` command 
  using the default shortcuts `]m` and `[m` (work in Vim's `nxo` modes; mapped to `<Plug>(vimtex-]m)` and `<Plug>(vimtex-[m)`).

  Check the VimTeX documentation for the similar shortcuts `]M` and `[M`, described in `:help <Plug>(vimtex-]M)` and `:help <Plug>(vimtex-[M)`.
  
  Here are some of the environment motion commands in action:

  {{< img-centered src="move-environment.gif" width="100%" alt="GIF: demonstrating navigation between LaTeX environments." >}}

- **Navigate math zones using `]n` and its variants:** Jump to the beginning of the next or previous math zone
  using the default shortcuts `]n` and `[n` (work in Vim's `nxo` modes; mapped to `<Plug>(vimtex-]n)` and `<Plug>(vimtex-[n)`).
  These motions apply to `$...$`, `\[...\]`, and math environments (including from the `amsmath` package) such as `equation`, `align`, etc.

  Check the VimTeX documentation for the similar shortcuts `]N` and `[N`, described in `:help <Plug>(vimtex-]N)` and `:help <Plug>(vimtex-[N)`.

  Here are some examples of moving through math zones:

  {{< img-centered src="move-math.gif" width="100%" alt="GIF: demonstrating navigation between math environments." >}}

- **Navigate Beamer frames using `]r` and its variants:** Jump to the beginning of the next or previous `frame` environment (useful in slide show documents using the `beamer` document class) 
  using the default shortcuts `]r` and `[r` (work in Vim's `nxo` modes; mapped to `<Plug>(vimtex-]r)` and `<Plug>(vimtex-[r)`).

  Check the VimTeX documentation for the similar shortcuts `]R` and `[R`, described in `:help <Plug>(vimtex-]R)` and `:help <Plug>(vimtex-[R)`.
  
  Here are some of the frame motions in action:

  {{< img-centered src="move-frame.gif" width="100%" alt="GIF: demonstrating navigation between Beamer frames." >}}

<!-- **TODO:** I did not get this motion ot work in testing! -->
<!-- - Jump to the beginning of the next or previous LaTeX comment (i.e. text beginning with `%`) -->
<!--   using `]/` and `<Plug>(vimtex-]/`, and `[/` `<Plug>(vimtex-]star`). -->

  <!-- Check the VimTeX documentation for the similar shortcuts `]*` and `[*`, described in `:help <Plug>(vimtex-]star)` and `:help <Plug>(vimtex-[star)`. -->

### Customization is easy {#customization}

Every shortcut and key binding show above can be easily customized to anything you like.
To define a custom key binding, you need to know three things:

1. The command/text object/motion's `<Plug>` mapping, given above for each action and also shown in the three-column table in `:help vimtex-default-mappings`.
1. The Vim mapping mode (e.g. normal, visual, operator-pending, etc.) the `<Plug>` mapping works in; again from the table at `:help vimtex-default-mappings` or earlier in this article.
1. The action's default shortcut (from `:help vimtex-default-mappings` or earlier in this article) and the custom shortcut you would like to use to replace it.

**Example:** Since that might sound abstract, here is a concrete example of setting a custom shortcut to trigger the "delete surrounding math" action.
Using `:help vimtex-default-mappings` for reference,

1. The action's `<Plug>` map is `<Plug>(vimtex-env-delete-math)`
1. The action works in normal mode, so we will use `nmap` for remapping it (use `xmap` for visual mode, `omap` for operator-pending mode, etc.)
1. We will replace the default mapping, `ds$` (which is a bit difficult to type), with the more convenient `dsm`.

To implement this change, place the following code in [an appropriate config file](#configuration):

```vim
" Use `dsm` to delete surrounding math (replacing the default shorcut `ds$`)
nmap dsm <Plug>(vimtex-env-delete-math)
```

That's it!
You could then use `dsm` in normal mode to delete surrounding math.
VimTeX won't apply the default `LHS` shortcut to any `<Plug>` mapping you map to manually (this behavior is explained in `:help vimtex-default-mappings`), so `dsm` will completely override the default `ds$`.

(For a background of what's going under the hood, check out the final article in this series, [7. A Vim Configuration Primer for Filetype-Specific Workflows]({{< relref "/tutorials/vim-latex/vimscript" >}}).)

## Text objects

VimTeX provides a number of extremely useful LaTeX-specific text objects.

If you don't yet know what text objects are, stop what you're doing and go learn about them.
As suggested in `:help vimtex-text-objects`, a good place to start would be the Vim documentation section `:help text-objects` and the famous Stack Overflow answer [*Your problem with Vim is that you don't grok vi*](https://stackoverflow.com/questions/1218390/what-is-your-most-productive-shortcut-with-vim/1220118#1220118).

VimTeX's text objects are listed in the table at `:help vimtex-default-mappings` and described in more detail in `:help vimtex-mappings`;
the text objects behave exactly like Vim's built-in text objects (which are explained in `:help text-objects`) and work in both operator-pending and visual mode.

### Table of VimTeX text objects

For convenience, here is a table of VimTeX's text-objects, taken directly from `:help vimtex-default-mappings`:

| Mapping | Text object |
| - | - |
| `ac`, `ic` | LaTeX commands |
| `ad`, `id` | Paired delimiters |
| `ae`, `ie` | LaTeX environments |
| `a$`, `i$` | Inline math |
| `aP`, `iP` | Sections |
| `am`, `im` | Items in `itemize` and `enumerate` environments|

The `ad` and `id` delimiter text object covers all of `()`, `[]`, `{}`, etc. *and* their `\left \right`, `\big \big`, etc. variants, which is very nice.
Here is a visual mode example of the delimiter and environment text objects:

{{< img-centered src="text-objects.gif" width="100%" alt="GIF: demonstrating some of VimTeX's text objects." >}}

### Example: Changing a default text object mapping {#example-change-text-obj}

Every default mapping provided by VimTeX can be changed to anything you like, using the exact same procedure described a few sections above in [Customization is easy](#customization).
As an example to get you started with changing default mappings, VimTeX uses `am` and `im` for the item text objects (i.e. items in `itemize` or `enumerate` environments) and `a$` and `i$` for the math objects.

You might prefer to use (say) `ai`/`ii` for items and `am`/`im` for math, and could implement this change by placing the following code in [an appropriate config file](#configuration):

```vim
" Use `ai` and `ii` for the item text object
omap ai <Plug>(vimtex-am)
xmap ai <Plug>(vimtex-am)
omap ii <Plug>(vimtex-im)
xmap ii <Plug>(vimtex-im)

" Use `am` and `im` for the inline math text object
omap am <Plug>(vimtex-a$)
xmap am <Plug>(vimtex-a$)
omap im <Plug>(vimtex-i$)
xmap im <Plug>(vimtex-i$)
```

You could then use the `am` and `im` mapping to access the math text object, or `ai` an `ii` to access items.
Note that the mappings should be defined in both operator-pending and visual mode, so we use both `omap` and `xmap` (you would know this by checking the table at `:help vimtex-default-mappings`).

### Example: Disabling all default mappings and selectively defining your own

VimTeX also makes it easy to disable *all* default mappings, then selectively enable only the mappings you want, using the LHS of your choice.
You might do this, for example, to avoid cluttering the mapping namespace with mappings you won't use.
Quoting from `:help vimtex-default-mappings`:

> If one prefers, one may disable all the default mappings through the option `g:vimtex_mappings_enabled`. Custom mappings for all desired features must then be defined through the listed RHS <Plug>-maps or by mapping the available commands.

To disable all VimTeX default mappings, place `g:vimtex_mappings_enabled = 0` in [an appropriate config file](#configuration), then manually redefine only those mappings you want using the same mapping syntax shown above in the Example section on [Changing a default text object mapping](#example-change-text-obj).
In case that sounds abstract, here is an example to get you started:

```vim
" Disable VimTeX's default mappings
let g:vimtex_mappings_enabled = 0
```

```vim
" Manually redefine only the mappings you wish to use
" --------------------------------------------- "
" Some text objects
omap ac <Plug>(vimtex-ac)
omap id <Plug>(vimtex-id)
omap ae <Plug>(vimtex-ae)
xmap ac <Plug>(vimtex-ac)
xmap id <Plug>(vimtex-id)
xmap ae <Plug>(vimtex-ae)

" Some motions
map %  <Plug>(vimtex-%)
map ]] <Plug>(vimtex-]])
map [[ <Plug>(vimtex-[[)

" A few commands
nmap <localleader>li <Plug>(vimtex-info)
nmap <localleader>ll <Plug>(vimtex-compile)
```

This example, together with the list of default mappings in `:help vimtex-default-mappings`, should be enough to get you on your way towards your own configuration.

## Insert mode mappings

VimTeX provides a number of insert mode mappings, which are described in `:help vimtex-imaps`.
VimTeX mappings provide a similar (but less feature-rich) functionality to snippets, described in an [earlier article in this series]({{< relref "/tutorials/vim-latex/ultisnips" >}}).
If you use a snippets plugin, you can probably safely disable VimTeX's insert mode mappings without any loss of functionality.

VimTeX's insert mode mappings are enabled by default;
disable them by setting `g:vimtex_imaps_enabled = 0` in [an appropriate config file](#configuration).
Although most users following this series will probably end up disabling VimTeX's insert mode mappings, here are a few things to keep in mind:

- Use the command `:VimtexImapsList` (which is only defined if insert mode mappings are enabled) to list all active VimTeX-provided insert mode mappings.
  Insert mode mappings are stored in the global variable in `g:vimtex_imaps_list`.

- VimTeX's insert mode mappings are triggered with the prefix defined in the variable `g:vimtex_imaps_leader`, which is the backtick `` ` `` by default.

- VimTeX offers a lot of room for configuration (e.g. using anonymous expansion functions).
  If you are interested in using its insert mode mappings, read through `:help vimtex-imaps` in detail.

## Options {#options}

VimTeX's options are used to manually enable, disable, or otherwise configure VimTeX features (e.g. the delimiter toggle list, the compilation method, the PDF reader, etc.).
VimTeX's options are controlled by setting the values of global Vim variables somewhere in your Vim `runtimepath` before VimTeX loads (a good place would be your `vimrc` or `plugin/tex.vim` for global VimTeX options and `ftplugin/tex.vim` for buffer-local settings; [more details here](#configuration)).
You disable VimTeX features by un-setting a Vim variable controlling the undesired feature.
Upon loading, VimTeX reads the values of any option variables you set manually and updates its default behavior accordingly.

VimTeX's options are documented at `:help vimtex-options`;
the documentation is clear and largely self-explanatory, and you should skim through it to see which options are available.

### Example: Disabling default features

The most common use case for VimTeX options is disabling a few default VimTeX features that you don't need.
Here is the general workflow:

1. While skimming through the VimTeX documentation, identify a feature you wish to disable.
   (Most of VimTeX's features are enabled by default, and it is up to the user to disable them.)
1. From the documentation, identify the Vim variable controlling a VimTeX feature; the variable is usually clearly listed in the documentation.
1. Set the appropriate variable value (usually this step amounts to setting a `g:vimtex_*_enabled` variable equal to zero) in [an appropriate config file](#configuration).

As a concrete example, one could disable VimTeX's indent, insert mode mapping, completion, and syntax concealment features with the following code:

```vim
" A few examples of disabling default VimTeX features.
let g:vimtex_indent_enabled   = 0      " turn off VimTeX indentation
let g:vimtex_imaps_enabled    = 0      " disable insert mode mappings (e.g. if you use UltiSnips)
let g:vimtex_complete_enabled = 0      " turn off completion
let g:vimtex_syntax_enabled   = 0      " disable syntax conceal
```

These are just examples to get you started;
in practice, you would of course tweak the settings to your liking after identifying the appropriate variables in the VimTeX documentation.

### Example: Changing the default delimiter toggle list {#example-change-delim}

Here is another real-life example: to add `\big \big` to the delimiter toggle list used by VimTeX's "toggle surrounding delimiter" feature (see the earlier section on [Toggle-style mappings](#toggle)), add the following code to [an appropriate config file](#configuration):

```vim
" Example: adding `\big` to VimTeX's delimiter toggle list
let g:vimtex_delim_toggle_mod_list = [
  \ ['\left', '\right'],
  \ ['\big', '\big'],
  \]
```

The `tsd` `<Plug>(vimtex-delim-toggle-modifier)` mapping would then use both `\left \right` and `\big \big`.
The VimTeX documentation explains configuring the delimiter list in more detail at `:help g:vimtex_delim_toggle_mod_list`.

Hopefully the above two examples give you a feel for setting VimTeX options; the VimTeX documentation should be able to take things from here.

## Commands

The VimTeX plugin provides a number of user commands, and these are listed and described in the documentation section `:help vimtex-commands`.
The commands mostly cover compilation, PDF reader integration, and system and plugin status;
we will return to VimTeX's commands when explaining 
[compilation]({{< relref "/tutorials/vim-latex/compilation" >}}) and [PDF reader integration]({{< relref "/tutorials/vim-latex/pdf-reader" >}}) in the next two articles in this series.

There is nothing much I have to say about the commands themselves that the documentation wouldn't say better; I suggest you skim through `:help vimtex-commands` and see if anything strikes your fancy.

As a side note, most but not all VimTeX commands can be triggered by default using a shortcut in the `LHS` of the three-column list in `:help vimtex-default-mappings`.
For those commands without a default shortcut mapping, defining one can be as simple as a single line of Vimscript.
Here is an example (put it in [an appropriate config file](#configuration)) that makes the key combination `<leader>wc` call the VimTeX command `VimtexCountWords`:

```vim
" Example: make `<leader>wc` call the command `VimtexCountWords`;
noremap <leader>wc <Cmd>VimtexCountWords<CR>
```

(This mapping uses the `<Cmd>` keyword, which is a Vimscript best practice when defining mappings that specifically call commands---see `:help map-cmd` for details.)

## Syntax highlighting

VimTeX provides syntax highlighting that improves on Vim's built-in syntax plugin for LaTeX.
For most use cases VimTeX's syntax features should "just work" out of the box, and you won't need to do any configuration yourself (if you're interested in details, see `:help vimtex-syntax`).
I can think of three things worth mentioning:

- VimTeX provides correct syntax highlighting for a number of common LaTeX packages; this means, for example, that the `align` environment provided by the `amsmath` package or code listings using the `minted` package will be correctly highlighted.
  Again, you shouldn't need to configure any of this manually, but you might appreciate knowing the package-highlighting feature exists.
  See `:help vimtex-syntax-packages` and `g:vimtex_syntax_packages` for details.

- VimTeX's syntax engine is "context-aware" (e.g. can distinguish regular text from LaTeX's math mode).
  This feature makes possible math-sensitive snippet expansion, which was explained in the [snippets article]({{< relref "/tutorials/vim-latex/ultisnips" >}}) earlier in this series.

- VimTeX provides a feature called "syntax-concealment", which replaces various commands, such as math-mode commands for Greek letters, with a shorter Unicode equivalent.
  For example, the `\alpha` command would appear as the character `α` in your terminal.
  See `:help vimtex-syntax conceal` if you are interested in this feature.

## Other features

Here are a few more features to look into to learn about once you master the basics:

- VimTeX offers a ready-to-go compilation interface, which I cover in detail in the [next article in the series]({{< relref "/tutorials/vim-latex/compilation" >}}).

- VimTeX also offers ready-to-go PDF viewer integration, which I cover in a [dedicated article]({{< relref "/tutorials/vim-latex/pdf-reader" >}}) later in the series.

- VimTeX provides completion of citations and reference labels, together with integration with common autocompletion plugins.
  See `:help vimtex-completion` for more information.

- VimTeX's provides code folding---see `:help vimtex-folding` and the references therein.
  You have a lot of power here if you like code folding, but you'll probably have to configure a few things yourself before the feature is practically useful.

- VimTeX provides indentation features that improve on Vim's default indentation plugin for LaTeX.
  You can read about VimTeX's indentation at `:help vimtex-indent`, which is just a list of references to associated configuration settings.
  VimTeX's indentation is enabled by default and should "just work" for most use cases, but there are plenty of configuration options for interested users.

- Solutions for linting and grammar checking are described at `:help vimtex-lint` and `:help vimtex-grammar`, respectively;
  I have not used these features myself and cannot offer any advice.

- Finally, VimTeX offers a few useful navigation features, covered in the documentation at `:help vimtex-navigation`.
  Here is a short summary:
  - You can navigate a LaTeX document from within Vim via a table of contents, which VimTeX builds by parsing the document for `\section` commands and their variations.
    You can read more about the table of contents feature at `:help vimtex-toc`.
  - You can jump to the TeX source code of packages, style files, and documents included with `\include{}` and `\input{}` using the `gf` shortcut;
  you can read more about this feature at `:help vimtex-includeexpr`
  - You can access the documentation of LaTeX packages imported with `\usepackage{}` using the `:VimtexDocPackage` command, which is mapped to `K` by default.
    See `:help vimtex-latexdoc` for more information. 

## Appendix: Troubleshooting failed VimTeX loading {#appendix}

*You can safely ignore this section if VimTeX loads without issues.*

Here is the potential problem: the VimTeX plugin respects (and will not override) a user-defined `tex` filetype plugin.
You must be careful though---there is a risk of *your* `tex` filetype plugin overriding VimTeX!
Namely, VimTeX will not load if you set the Vimscript variable `let b:did_ftplugin = 1` in your user-defined `tex` plugin, for example with the common piece of boilerplate code shown below

```vim
" This common piece of boilerplate code would prevent VimTeX from loading if
" placed in a user-defined LaTeX filetype plugin, e.g. `~/.vim/ftplugin/tex.vim`.
if exists("b:did_ftplugin")
  finish
endif
let b:did_ftplugin = 1
" Using a variable like `b:did_my_ftplugin` will solve the problem.
```

Here is the problem: VimTeX *also* uses the variable `b:did_ftplugin` to avoid loading twice in the same Vim buffer.
User-defined filetype plugins load before VimTeX, so if *you* set `let b:did_ftplugin = 1`, then VimTeX will see `b:did_ftplugin = 1` and not load (you can see this behavior for yourself in the VimTeX source code in the file `vimtex/ftplugin/tex.vim`).

If you want to use both VimTeX and your own `tex` filetype plugin and currently have `let b:did_ftplugin = 1` in your own plugin, just change to a variable name like `b:did_my_ftplugin` instead, which won't conflict with VimTeX's use of `b:did_ftplugin`.

(The `let b:did_ftplugin = 1` business is a standard safety mechanism described in the Vim documentation at `:help ftplugin` that gives the user control over loading filetype plugins.)

{{< vim-latex/navbar >}}

{{< vim-latex/thank-you >}}

{{< vim-latex/license >}}
