---
title: LuaSnip Plugin Guide for LaTeX \| Vim and LaTeX Series Part 2
prev-filename: prerequisites
prev-display-name: "« 1. Prerequisites"
next-filename: ftplugin
next-display-name: "3. Vim's ftplugin system »"
date: 2022-09-27
---

{{< vim-latex/navbar >}}

# 2. A LuaSnip guide for LaTeX workflows

{{< date-last-mod >}}

You might be interested in this article for two reasons:

1. As a standalone guide to writing snippets with the LuaSnip plugin (this article is LaTeX-heavy, but it is applicable to any language).
1. As part two in a [seven-part series]({{< relref "/tutorials/vim-latex/intro" >}}) explaining how to use the Vim or Neovim text editors to efficiently write LaTeX documents.

[There is also an UltiSnips version of this article.]({{< relref "/tutorials/vim-latex/ultisnips" >}})

## Warning: the article is long {#warning}

This article is *long*, which kind of sucks, I know.
To help you out, here's how the article is organized:

1. A [short intro to snippets](#what-snippets-do) for people reading along with the LaTeX series
1. A [TLDR example](#hello-world) of hello world with LuaSnip
1. Boring house-keeping stuff ([installation](#install), [configuration](#config), [file organization](#files), [snippet syntax](#anatomy) etc.)
1. [Actually writing snippets](#writing)---you probably came for this section.
1. [Some practical tips](#tips) from the perspective of a real-life user.

Feel free to **skim or skip the boring stuff** and jump right to [actually writing snippets](#writing).

{{< toc level="2" title="Contents of this article" >}}

## What snippets do {#what-snippets-do}

[I know what snippets do, next section please.](#hello-world)

Snippets are templates of commonly used code (for example the boilerplate code for typical LaTeX environments and commands) inserted into text dynamically using short (e.g. two- or three-character), easy-to-type character sequences called *triggers*.
Without wishing to overstate the case, good use of snippets is the single most important step in the process of writing LaTeX---and any other verbose markup or programming language---efficiently and painlessly. 

Here is a [video demonstrating full-speed, real-life examples](https://www.youtube.com/watch?v=P7iMX1lqGnU).
And here is a simple example using snippets to create and navigate through a LaTeX figure environment, quickly typeset an equation, and easily insert commands for Greek letters.

{{< img-centered src="images/vim-latex/snippets/demo.gif" width="100%" global="1" alt="GIF of writing common LaTeX commands quickly using snippets." >}}

## TLDR hello world example {#hello-world}

I'm beginning with a hello world snippet instead of a bunch of theory.
For now feel free to just copy and paste along with the article, and we'll explain what's going on in much more detail later.
(Or if you prefer to begin with fundamentals, you can skip this hello world example and jump to [getting started with LuaSnip](#getting-started).)

In a very TLDR style, here's a LuaSnip-flavored hello world:

1. Install [LuaSnip](https://github.com/L3MON4D3/LuaSnip)
   (I'm assuming you're comfortable installing Vim plugins.)

1. In your `init.vim`/`init.lua`, set key bindings to trigger and navigate through snippets: 

   {{< details summary="I use an `init.lua`." >}}
   Place this in your `init.lua`:

   ```lua
   -- Yes, we're just executing a bunch of Vimscript using vim.cmd
   vim.cmd[[
   " Use Tab to expand and jump through snippets
   imap <silent><expr> <Tab> luasnip#expand_or_jumpable() ? '<Plug>luasnip-expand-or-jump' : '<Tab>' 
   smap <silent><expr> <Tab> luasnip#jumpable(1) ? '<Plug>luasnip-jump-next' : '<Tab>'

   " Use Shift-Tab to jump backwards through snippets
   imap <silent><expr> <S-Tab> luasnip#jumpable(-1) ? '<Plug>luasnip-jump-prev' : '<S-Tab>'
   smap <silent><expr> <S-Tab> luasnip#jumpable(-1) ? '<Plug>luasnip-jump-prev' : '<S-Tab>'
   ]]
   ```
   {{< /details >}}

   {{< details summary="I use an `init.vim`." >}}
   Place this in your `init.vim`:

   ```vim
   " Use Tab to expand and jump through snippets
   imap <silent><expr> <Tab> luasnip#expand_or_jumpable() ? '<Plug>luasnip-expand-or-jump' : '<Tab>' 
   smap <silent><expr> <Tab> luasnip#jumpable(1) ? '<Plug>luasnip-jump-next' : '<Tab>'

   " Use Shift-Tab to jump backwards through snippets
   imap <silent><expr> <S-Tab> luasnip#jumpable(-1) ? '<Plug>luasnip-jump-prev' : '<S-Tab>'
   smap <silent><expr> <S-Tab> luasnip#jumpable(-1) ? '<Plug>luasnip-jump-prev' : '<S-Tab>'
   ```
   {{< /details >}}

1. Create a snippets directory at `${HOME}/.config/nvim/LuaSnip/`,
   inside it create an empty snippets file called `all.lua`,
   and inside `all.lua` file paste:

   ```lua
   -- Place this in ${HOME}/.config/nvim/LuaSnip/all.lua
   return {
     -- A snippet that expands the trigger "hi" into the string "Hello, world!".
     require("luasnip").snippet(
       { trig = "hi" },
       { t("Hello, world!") }
     ),

     -- To return multiple snippets, use one `return` statement per snippet file
     -- and return a table of Lua snippets.
     require("luasnip").snippet(
       { trig = "foo" },
       { t("Another snippet.") }
     ),
   }
   ```

1. From your `init.vim`/`init.lua`, use the following code to load the snippet files in the just-created snippets directory at `${HOME}/.config/nvim/LuaSnip/`:
   
   {{< details summary="I use an `init.lua`." >}}
   ```lua
   -- Place this in your init.lua
   require("luasnip.loaders.from_lua").load({paths = "~/.config/nvim/LuaSnip/"})
   ```
   {{< /details >}}

   {{< details summary="I use an `init.vim`." >}}
   ```vim
   " Place this in your init.vim
   lua require("luasnip.loaders.from_lua").load({paths = "~/.config/nvim/LuaSnip/"})
   ```
   {{< /details >}}

1. Open a new Neovim instance (any file name/extension will work here because `all.lua` is a special snippet file that applies to all filetypes).

1. Enter insert mode and write `hi` (because we wrote a snippet with trigger `trig="hi"`).
   With your cursor at the end of `hi`, press the Tab key (because the Tab key was mapped to snippet expansion a few steps up).
   The word `hi` should expand into `Hello, world!`.

I glossed over a mountain of details here for the sake of a TLDR example.
For a more thorough introduction to LuaSnip, buckle up and read on.

*Going forward, I'll perform configuration mostly in Lua.
If you use Vimscript, I assume you know how to call Lua from within Vimscript using* `:help :lua` *and* `:help :lua-heredoc`.

## Getting started with LuaSnip {#getting-started}

**Should I use UltiSnips or LuaSnip?**

- Vim users: use UltiSnips---LuaSnip only works with Neovim
- Neovim users: I suggest LuaSnip---it integrates better into the Neovim ecosystem, is free of external dependencies (UltiSnips requires Python), has more features, and is a bit faster (no, I don't have benchmarks).
  That said, UltiSnips still works fine in Neovim, and its syntax is easier to learn.

There is also an  [UltiSnips version of this article]({{< relref "/tutorials/vim-latex/ultisnips" >}}) if you prefer.


### Installation {#install}

Install LuaSnip like any other Neovim plugin using your plugin installation method of choice (e.g. Packer, Vim-Plug, the native package management system, etc.).
I assume you know how to install a plugin---see the [LuaSnip README's installation section](https://github.com/L3MON4D3/LuaSnip#install) for details if needed.
LuaSnip has no external dependencies and should be ready to go immediately after installation.

LuaSnip is a snippet engine only and intentionally **ships without snippets**---you have to write your own or use an existing snippet database.
It is possible to use existing snippet repositories (e.g. [`rafamadriz/friendly-snippets`](https://github.com/rafamadriz/friendly-snippets)) with some additional configuration---see the [LuaSnip README's add snippets section](https://github.com/L3MON4D3/LuaSnip#add-snippets) and `:help luasnip-loaders` if interested.
I encourage you to write your own snippets,
but whether you download someone else's snippets, write your own, or use a mixture of both, you should know:

1. where the text files holding your snippets are stored on your local file system, and
1. how to write, edit, and otherwise tweak snippets to suit your particular needs, so you are not stuck using someone else's without the possibility of customization.

This article answers both questions.

### Two config settings for later {#config}

There are two LuaSnip configuration changes we'll need for later in this guide---one enables autotriggered snippets and the other enables visual selection.
You can make these changes by placing the following code somewhere in your Neovim startup configuration, e.g. in your `init.lua`.

```lua
-- Somewhere in your Neovim startup, e.g. init.lua
require("luasnip").config.set_config({ -- Setting LuaSnip config

  -- Enable autotriggered snippets
  enable_autosnippets = true,

  -- Use Tab (or some other key if you prefer) to trigger visual selection
  store_selection_keys = "<Tab>",
})
```

See the [LuaSnip README's config section](https://github.com/L3MON4D3/LuaSnip#config) for full documentation of configuration options.

### Set snippet trigger and tabstop navigation keys {#keymaps}

After installing LuaSnip you should configure:

1. the key you use to trigger (expand) snippets,
1. the key you use to jump forward through a snippet's tabstops, and
1. the key you use to jump backward through a snippet's tabstops.

<!-- See the [LuaSnip README's keymaps section](https://github.com/L3MON4D3/LuaSnip#keymaps) for official examples. -->

Setting these keymaps is easiest to do in Vimscript (because they use Vimscript's conditional ternary operator), so the examples below are in Vimscript.

**Choose one** of the following two options:

1. Option one: use a single key (e.g. Tab) to both expand snippets and to jump forward through snippet tabstops.
   In this case add something like this to your Neovim config:

   ```vim
   " Expand or jump in insert mode
   imap <silent><expr> <Tab> luasnip#expand_or_jumpable() ? '<Plug>luasnip-expand-or-jump' : '<Tab>' 
 
   " Jump forward through tabstops in visual mode
   smap <silent><expr> <Tab> luasnip#jumpable(1) ? '<Plug>luasnip-jump-next' : '<Tab>'
   ```

   This code would make the Tab key trigger snippets *and* navigate forward through snippet tabstops---the decision whether to expand or jump is made by LuaSnip's `expand_or_jumpable` function.

1. Option two: use two different keys (e.g. Tab and Control-f) to expand snippets and jump forward through snippet tabstops.
   In this case the code looks like this:

   ```vim
   " Expand snippets in insert mode with Tab
   imap <silent><expr> <Tab> luasnip#expandable() ? '<Plug>luasnip-expand-snippet' : '<Tab>'

   " Jump forward in through tabstops in insert and visual mode with Control-f
   imap <silent><expr> <C-f> luasnip#jumpable(1) ? '<Plug>luasnip-jump-next' : '<C-f>'
   smap <silent><expr> <C-f> luasnip#jumpable(1) ? '<Plug>luasnip-jump-next' : '<C-f>'
   ```

**Then, set a backward-jump keymap:**

```vim
" Jump backward through snippet tabstops with Shift-Tab (for example)
imap <silent><expr> <S-Tab> luasnip#jumpable(-1) ? '<Plug>luasnip-jump-prev' : '<S-Tab>'
smap <silent><expr> <S-Tab> luasnip#jumpable(-1) ? '<Plug>luasnip-jump-prev' : '<S-Tab>'
```

<!-- ```vim -->
<!-- " Official recommendation -->
<!-- inoremap <silent> <S-Tab> <cmd>lua require'luasnip'.jump(-1)<Cr> -->
<!-- snoremap <silent> <S-Tab> <cmd>lua require('luasnip').jump(-1)<Cr> -->
<!-- ``` -->

A few notes: (or [skip to the next section](#files))

1. Place the keymap code somewhere in your Neovim startup configuration (e.g. `init.lua`, `init.vim`, etc.).
   If you have a Lua-based config and need help running Vimscript from within Lua files, just enclose the Vimscript within a multiline string and pass it to `vim.cmd`, e.g.

   ```lua
   -- Any Lua config file, e.g. init.lua
   vim.cmd[[
      " Vimscript goes here!
   ]]
   ```
   If needed, see `:help vim.cmd()` for details.

1. In case it's unfamiliar, the conditional ternary operator `condition ? expr1 : expr2 ` executes `expr1` if `condition` is true and executes `expr2` if `condition` is false---it is common in C and [many other languages](https://en.wikipedia.org/wiki/%3F:).
In the first `imap` mapping, for example, the ternary operator is used to map `<Tab>` to `<Plug>luasnip-expand-or-jump` if `luasnip#expand_or_jumpable()` returns `true` and to `<Tab>` if `luasnip#expand_or_jumpable()` returns `false`.

1. You need to apply tabstop navigation in both insert and visual modes, hence the use of both `imap` and `smap` for the forward and backward jump mappings.
   (Well, technically select mode and not visual mode, hence the use of `smap` and not `vmap`, but for a typical end user's purposes select and visual mode look identical.
   See `:help select-mode` for details.)

   Also, `imap` and `smap` are *intentionally* used instead of `inoremap` and `snoremap`---this is standard (and necessary) practice when defining `<Plug>` mappings.
   The `<Plug>` keyword might look unfamiliar---you can ignore it for now, or, if you're curious, take a peek at [the series's final article]({{< relref "/tutorials/vim-latex/vimscript" >}}), which explains foundational Vim configuration, including `<Plug>` mappings.

1. Power users: you can implement custom snippet expansion and navigation behavior by working directly with LuaSnip API functions controlling expand and jump behavior---see `:help luasnip-api-reference` (scroll down to the `jumpable(direction)` entry) for details.
   For most users the example mappings given above should be fine.

Finally, you may want to **set mappings to cycle through choice nodes**:

```vim
" Cycle forward through choice nodes with Control-f (for example)
imap <silent><expr> <C-f> luasnip#choice_active() ? '<Plug>luasnip-next-choice' : '<C-f>'
smap <silent><expr> <C-f> luasnip#choice_active() ? '<Plug>luasnip-next-choice' : '<C-f>'
```

Choice nodes are a more advanced tool that I won't cover in this article, so you can safely skip this step for now.
You can read about choice nodes at `:help luasnip-choicenode`, but you should probably learn about the basic text and insert nodes in this article first.

## Snippet files, directories, and loaders {#files}

This section explains where to store snippets on your file system, what file format to use, and how to make LuaSnip load the snippets for actual use.

Warning: LuaSnip offers a lot of choices here, and the required decision-making can be overwhelming for new users.
I'll try my best to guide you through your options and give a sensible recommendation for what to choose.

### Snippet format

LuaSnip supports multiple snippet formats.
Your first step is to decide which format you will write your snippets in.
Your main options are:

1. **Covered in this article:** Native LuaSnip snippets written in Lua (support for all LuaSnip features, best integration with the larger Neovim ecosystem).
1. Use third-party snippets written for another snippet engine (e.g. VS Code, SnipMate) and try to parse them with LuaSnip's various snippet loaders.
   Fewer features are available, and complex snippets may not be parsable and will not work.

*The rest of this article covers only native LuaSnip snippets written in Lua.*
I think this makes sense because:

- People seem to have the most trouble with native LuaSnip syntax, so covering it should benefit the most people.
- Native LuaSnip snippets give you more features, and integrate a bit better into the larger Neovim ecosystem (e.g. Tree-sitter and Telescope), than imported third-party snippets.

If you want to use third-party snippets the rest of this article will probably not be of much help to you;
see `:help luasnip-loaders`, `:help luasnip-vscode` and `:help luasnip-snipmate` instead.

### Loading snippets and directory structure {#loading}

You have two ways to load snippets:

- **Covered in this article:** write Lua snippets in dedicated snippet files and load these files using LuaSnip's Lua loader feature.

- Define and load snippets in your Neovim startup files using LuaSnip's `add_snippets` function.

This article covers the Lua loader---I recommend this approach because using dedicated snippet files with the Lua loader decouples your snippets from your Neovim startup configuration.
This approach is "cleaner" and more modular than writing snippets directly in, say, your `init.lua` file.
If you want to use the `add_snippets` function instead, see the documentation in `:help luasnip-api-reference`---most of this article will still be useful to you because the syntax for writing snippets is the same whether you load snippets with `add_snippets` or LuaSnip's loader.

Here's an overview of **how to load snippets from Lua files**:

- Write LuaSnip snippets in plain-text Lua files with the `.lua` extension.
  (Snippet syntax is described soon.)
  
- Wrap all snippets in a given `.lua` file inside a Lua table, and `return` this table from the Lua file. (Examples follow.)

- Name each snippet file appropriately:
  The file's base name determines which Vim `filetype` the snippets apply to.
  For example, snippets inside the file `tex.lua` would apply to files with `filetype=tex`,
  snippets inside `html.lua` to files with `filetype=html`, and so on.

  If you want certain snippets to apply globally to *all* file types, place these global snippets in the file `all.lua`.
  (This is the same naming scheme used by UltiSnips, in case you are migrating from UltiSnips).

- By default, LuaSnip expects your snippets to live in directories called `luasnippets` placed anywhere in your Neovim `runtimepath`---this is documented in the description of the `paths` key in `:help luasnip-loaders`.

  However, you can easily override the default `luasnippets` directory name and store snippets in any directory (or set of directories) on your file system---LuaSnip's loaders let you manually specify the snippet directory path(s) to load.
 I recommend using a directory in your Neovim config folder, e.g. `"${HOME}/.config/nvim/LuaSnip/"`.

- Load snippets by calling the LuaSnip Lua loader's `load` function from somewhere in your Neovim startup config (e.g. `init.lua`, `init.vim`, etc.):

  ```lua
  -- Load all snippets from the nvim/LuaSnip directory at startup
  require("luasnip.loaders.from_lua").load({paths = "~/.config/nvim/LuaSnip/"})

  -- Lazy-load snippets, i.e. only load when required, e.g. for a given filetype
  require("luasnip.loaders.from_lua").lazy_load({paths = "~/.config/nvim/LuaSnip/"})
  ```

  Bonus: if you manually set the `paths` key when calling `load` or `lazy_load`, LuaSnip will not need to scan your entire Neovim `runtimepath` looking for `luasnippets` directories---this should save you a few milliseconds of startup time.

- Want to use multiple snippet directories?
  No problem---set the `paths` key's value to a table or comma-separated string of multiple directories.
  Here are two ways to load snippets from both the directory `LuaSnip1` and `LuaSnip2`:

  ```lua
  -- Two ways to load snippets from both LuaSnip1 and LuaSnip2
  -- 1. Using a table
  require("luasnip.loaders.from_lua").load({paths = {"~/.config/nvim/LuaSnip1/", "~/.config/nvim/LuaSnip2/"}})
  -- 2. Using a comma-separated list
  require("luasnip.loaders.from_lua").load({paths = "~/.config/nvim/LuaSnip1/,~/.config/nvim/LuaSnip2/"})
  ```
  
Full syntax for the `load` call is documented in `:help luasnip-loaders`.

### Snippet filetype subdirectories

You might prefer to further organize `filetype`-specific snippets into multiple files of their own.
To do so, make a subdirectory named with the target `filetype` inside your main snippets directory.
LuaSnip will then load *all* `*.lua` files inside this filetype subdirectory, regardless of the individual files' basenames.
As a concrete example, a selection of my LuaSnip directory looks like this:

```bash
# Example LuaSnip directory structure
${HOME}/.config/nvim/LuaSnip/
├── all.lua
├── markdown.lua
├── python.lua
└── tex
    ├── delimiters.lua
    ├── environments.lua
    ├── fonts.lua
    └── math.lua
```

Explanation: I have a lot of `tex` snippets, so I prefer to further organize them in a dedicated subdirectory with individual files for LaTeX delimiters, environments, and so on, while a single file suffices for `all`, `markdown`, and `python`.

### Heads up---some abbreviations

**TLDR:**
LuaSnip defines a globally-available set of abbreviations for common modules that make writing snippets much easier.
These abbreviations are listed below, and you'll see them in this document, the LuaSnip docs, and elsewhere on the Internet.
You can now [jump to the next section](#anatomy).
**End TLDR**.

LuaSnip provides a set of convenient abbreviations for more compact snippet syntax.
For example, you technically define a LuaSnip by calling `require("luasnip").snippet()`.
Since this is a bit verbose, LuaSnip introduces the abbreviations...

```lua
-- Two common LuaSnip abbreviations
local ls = require("luasnip")
local s = ls.snippet
```

...in terms of which you you could then write `require("luasnip").snippet()` as

```lua
-- Three progressively shorter ways to do the same thing---define a snippet
require("luasnip").snippet()
ls.snippet()
s()
```

Here is a list of the LuaSnip abbreviations used in this article:

```lua
-- Abbreviations used in this article and the LuaSnip docs
local ls = require("luasnip")
local s = ls.snippet
local sn = ls.snippet_node
local t = ls.text_node
local i = ls.insert_node
local f = ls.function_node
local d = ls.dynamic_node
local fmt = require("luasnip.extras.fmt").fmt
local fmta = require("luasnip.extras.fmt").fmta
local rep = require("luasnip.extras").rep
```

You can find a more complete list in the LuaSnip docs just above the section `:help luasnip-basics` and (at the time of writing) around line 120 of the source file `LuaSnip/lua/luasnip/config.lua`.

I'll use the full names the first few times for the sake of completeness,
but will transition to the abbreviations later---just remember that the mysterious-looking `s`s and `t`s and `i`s are really just abbreviations of for LuaSnip modules and functions.

## Snippet anatomy {#anatomy}

**Think in terms of nodes:**
LuaSnip snippets are composed of *nodes*---think of nodes as building blocks that you put together to make snippets.
(Actual node syntax is described soon.)
LuaSnip provides around 10 types of nodes.
Each node offers a different feature, and your job is to combine these nodes in ways that create useful snippets.
(Fortunately, only about 4 nodes are needed for most use cases.)

You create snippets by specifying:

1. the snippet's basic parameters (trigger, name, etc.),
1. the snippet's nodes, and
1. possibly some custom expansion conditions and callback functions.

Here is the **anatomy of a LuaSnip snippet** in code:

```lua
-- Anatomy of a LuaSnip snippet
require("luasnip").snippet(
  snip_params:table,  -- table of snippet parameters
  nodes:table,        -- table of snippet nodes
  opts:table|nil      -- *optional* table of additional snippet options
)
```

And here is an English language summary of the arguments:

1. `snip_params`: a table of basic snippet parameters.
   This is where you put the snippet's trigger, description, and priority level, autoexpansion policy, and so on.
1. `nodes`: a table of nodes making up the snippet (this is the most important part!).
1. `opts`: an *optional* table of additional arguments for more advanced workflows, for example a condition function to implementing custom logic to control snippet expansion or callback functions triggered when navigating through snippet nodes.
   You'll leave this optional table blank for simple use cases.

I'll first cover the `snip_params` table, then spend most of the remainder of this article explaining various nodes and their use cases.

### Setting snippet parameters

**TLDR** (if you're familiar with Lua):
`snip_params` is a Lua table;
the data type and purpose of each table key is clearly stated in `:help luasnip-snippets` (just scroll down just a bit).
You can now [jump to the next section](#shortcut).
**End TLDR**.

And if you're not yet familiar with Lua tables, you:

- define any Lua table, including the `snip_params` table, with `{ }` curly braces, 
- find the list of possible table parameter keys in the LuaSnip docs at `:help luasnip-snippets`,
- use `key=value` syntax to set each of the table's keys, using the possible values listed in `:help luasnip-snippets`.

Since that might sound vague, here is a concrete example of a "Hello, world!" snippet with a bunch of parameters manually specified, to give you a feel for how this works.

```lua
return {
  -- Example: how to set snippet parameters
  require("luasnip").snippet(
    { -- Table 1: snippet parameters
      trig="hi",
      dscr="An autotriggering snippet that expands 'hi' into 'Hello, world!'",
      regTrig=false,
      priority=100,
      snippetType="autosnippet"
    },
    { -- Table 2: snippet nodes (don't worry about this for now---we'll cover nodes shortly)
      t("Hello, world!"), -- A single text node
    }
    -- Table 3, the advanced snippet options, is left blank.
  ),
}
```

This snippet expands the trigger string `"hi"` into the string `"Hello, world!"`;
we have given the snippet a human-readable description (with `dscr`),
explicitly specified that the trigger is not a Lua regular expression (with `regTrig=false`),
lowered the snippet's priority to `100` (the default is `1000`),
and made the snippet autoexpand by setting `snippetType="autosnippet"`.

Don't worry about the `t("Hello, world!")` part for now---this is a *text node*, which we'll cover shortly.
Note also that I've left out the optional third table of advanced options---it's not needed here.

You should probably read through `:help luasnip-snippets` to see the full list of table parameter keys (e.g. `trig`, `dscr`, etc.).
You usually only use a few keys and leave the rest with their default values;
we'll only need the following parameters in this guide:

- `trig`: the string or Lua pattern (i.e. Lua-flavored regex) used to trigger the snippet.
- `regTrig`: whether the snippet trigger should be treated as a Lua pattern.
  A `true`/`false` boolean value; `false` by default.
- `wordTrig`: loosely, a safety feature to prevent snippets from expanding when the snippet trigger is part of a larger word.
  A `true`/`false` boolean value; `true` (enabled) by default.
  Since the `wordTrig` safety feature can conflict with regular expression triggers, you often want to set `wordTrig = false` when using `regTrig = true` snippets.
- `snippetType`: either the string `"snippet"` (manually triggered) or `"autosnippet"` (autotriggered); `'snippet'` by default.
  I encourage autotriggered snippets for efficient typing---see the tips [at the bottom of this article](#tips) for details.
  
### A common shortcut you'll see in the wild {#shortcut}

The `trig` key is the only required snippet key,
and if you only need to set `trig` and leave the other keys with their default values, you can use the following shorthand syntax:

```lua
return {
  -- Shorthand example: the same snippet as above, but only setting the `trig` param
  s("hi", -- the snip_param table is replaced by a single string holding `trig`
    { -- Table 2: snippet nodes
      t("Hello, world!"),
    }
  ),
}
```

Explanation: notice that the `snip_param` table of snippet parameters is now gone---if you only need to set the `trig` key, you can optionally replace the parameter table with a single string, and LuaSnip will interpret this string as the value of the `trig` key.
You'll see this syntax a lot in the LuaSnip docs and on the Internet, so I wanted to show it here, but in this article I'll always explicitly specify the `trig` key and use a parameter table, which I think is clearer for new users.

That's all for setting snippet parameters---let's write some actual snippets!

## Actually writing snippets {#writing}

**Goal of this section:** explain enough syntax to cover what a typical user will ever need from LuaSnip;
after reading it you should have all the tools you need to set up an efficient LaTeX workflow.
Keep in mind that LuaSnip has many power user features not covered in this article, which I leave to [more](https://github.com/L3MON4D3/LuaSnip/blob/master/Examples/snippets.lua) [advanced](https://github.com/L3MON4D3/LuaSnip/wiki) [guides](https://www.youtube.com/watch?v=KtQZRAkgLqo).

<!-- what a typical user would need for a good LaTeX workflow, including static text insertion, tabstops, mirrored nodes, visual placeholders. -->

### Text node

Text nodes insert static text into a snippet.
Here are **typical text node use cases**:

- When used on their own, text nodes can transform a short, easy-to-type trigger into a longer, inconvenient-to-type piece of text.
- When used with other nodes, text nodes provide a template of static boilerplate text into which you dynamically insert variable text with, for example, insert or dynamic nodes.

You create a text node by passing a string or a table of strings to `require("luasnip").text_node()` (abbreviated `t()`).
Here is a simple "Hello, world!" example that expands the trigger `hi` into the string "Hello, world!":

```lua
return {
-- A simple "Hello, world!" text node
s(
  {trig = "hi"}, -- Table of snippet parameters
  { -- Table of snippet nodes
    t("Hello, world!")
  }
),
}
```

And here are some actual real-life examples I use to easily insert the Greek letter LaTeX commands `\alpha`, `\beta`, and `\gamma`:

```lua
return {
-- Examples of Greek letter snippets, autotriggered for efficiency
s({trig=";a", snippetType="autosnippet"},
  {
    t("\\alpha"),
  }
),
s({trig=";b", snippetType="autosnippet"},
  {
    t("\\beta"),
  }
),
s({trig=";g", snippetType="autosnippet"},
  {
    t("\\gamma"),
  }
),
}
```

Note that you have to escape the backslash character to insert it literally---for example I have to write `t("\\alpha")` to produce the string `\alpha` in the first snippet.

The only other caveat with text nodes is **multiline strings**: to insert multiple lines with a single text node, write each line as a separate string and wrap the strings in a Lua table.
Here is a concrete example of a three-line text node.

```lua
return {
-- Example of a multiline text node
s({trig = "lines", dscr = "Demo: a text node with three lines."},
  {
    t({"Line 1", "Line 2", "Line 3"})
  }
),
}
```

See `:help luasnip-textnode` for documentation of text nodes.

### Insert node

Insert nodes are positions within a snippet at which you can dynamically type text.
We've seen that text nodes insert *static* pieces of text---insert nodes allow you to *dynamically* type whatever text you like.
If you are migrating from UltiSnips or SnipMate, LuaSnip insert nodes are analogous to other snippet engines' tabstops (`$1`, `$2`, etc.).

**Use case:** Combine insert nodes with text nodes to insert variable content (using the insert nodes) into generic surrounding boilerplate (created by the text nodes).

Here are two concrete LaTeX examples of snippets for the LaTeX `\texttt` and `\frac` commands---I use text nodes to create the static boilerplate text and place insert nodes between the curly braces to dynamically type the commands' arguments:

{{< img-centered src="images/vim-latex/snippets/texttt-frac.gif" width="100%" global="1" alt="GIF demonstrating snippets for the \texttt and \frac commands." >}}

You create an insert node by passing an index number, and optionally some initial text, to `require("luasnip").insert_node()` (abbreviated `i()`).
Here is the code for the above examples:

```lua
return {
-- Combining text and insert nodes to create basic LaTeX commands
s({trig="tt", dscr="Expands 'tt' into '\texttt{}'"},
  {
    t("\\texttt{"), -- remember: backslashes need to be escaped
    i(1),
    t("}"),
  }
),
-- Yes, these jumbles of text nodes and insert nodes get messy fast, and yes,
-- there is a much better, human-readable solution: ls.fmt, described shortly.
s({trig="ff", dscr="Expands 'ff' into '\frac{}{}'"},
  {
    t("\\frac{"),
    i(1),  -- insert node 1
    t("}{"),
    i(2),  -- insert node 2
    t("}")
  }
),
}
```

**Insert node numbering:** notice that you can place multiple insert nodes into a snippet (the `\frac` snippet, for example, has two).
You specify the order in which you jump through insert nodes with a natural number (1, 2, 3, etc.) passed to the `i()` node as a mandatory argument and then navigate forward and backward through the numbered insert nodes by pressing the keys mapped to `<Plug>luasnip-jump-next` and `<Plug>luasnip-jump-prev`, respectively (i.e. the keys mapped at the start of this article in the section on [snippet trigger and tabstop navigation keys](#keymaps)).

See `:help luasnip-insertnode` for documentation of insert nodes.

### Format: a human-friendly syntax for writing snippets

<!-- Docs: `:help luasnip-fmt` -->
**The problem:** you've probably noticed that combinations of insert nodes and text nodes become hard to read very quickly.
Consider, for example, this snippet for a LaTeX equation environment:

```lua
return {
-- Example: text and insert nodes quickly become hard to read.
s({trig="eq", dscr="A LaTeX equation environment"},
  {
    t({ -- using a table of strings for multiline text
        "\\begin{equation}",
        "    "
      }),
    i(1),
    t({
        "",
        "\\end{equation}"
      }),
  }
),
}
```

The above snippet code is not particularly human-readable.
The snippet inserts an equation that looks like this...

```tex
\begin{equation}
    % Cursor is here
\end{equation}
```

...but the jumble of text and insert node code does not *look like* the nicely-indented LaTeX `equation` environment the code produces.
The code is software-friendly (it is relatively easy for LuaSnip to parse) but it is not *human-friendly*.

LuaSnip solves the human-readability problem with its `fmt` and `fmta` functions.
These functions give you a clean overview of what the rendered snippet will actually look like---here is the same `equation` environment snippet written with `fmt`:

```lua
return {
-- The same equation snippet, using LuaSnip's fmt function.
-- The snippet is not shorter, but it is more *human-readable*.
s({trig="eq", dscr="A LaTeX equation environment"},
  fmt( -- The snippet code actually looks like the equation environment it produces.
    [[
      \begin{equation}
          <>
      \end{equation}
    ]],
    -- The insert node is placed in the <> angle brackets
    { i(1) },
    -- This is where I specify that angle brackets are used as node positions.
    { delimiters = "<>" }
  )
),
}
```

Don't worry, we'll break the snippet down piece by piece---I just wanted to first show what the final product looks like.

#### `fmt` is a function that returns a table of nodes

LuaSnip's `fmt` (the full name is `require("luasnip.extras.fmt").fmt`) is just a function that returns a table of nodes, and lets you create these nodes in a relatively human-readable way.
The point is: although `fmt` is a new technique, it is not *conceptually* different from how we've been creating snippets so far---it is just another way to supply a snippet with table of nodes.

Here's the big picture perspective:

```lua
-- What we've done so far: write a snippet by specifying node table manaully
require("luasnip").snippet(
  snip_params:table,
  nodes:table,        -- manually specified node table
  opts:table|nil
)

-- Alternative: using the fmt function to create the node table
require("luasnip").snippet(
  snip_params:table,
  fmt(args),          -- fmt returns the node table
  opts:table|nil
)
```

#### Using the format function

The `fmt` function's call signature looks like this:

```lua
-- The fmt function's call signature
fmt(format:string, nodes:table of nodes, fmt_opts:table|nil) -> table of nodes
```

The `fmta` function is almost identical to `fmt`---`fmt` uses `{}` curly braces as the default node placeholder and `fmta` uses `<>` angle brackets (this will make sense in just a moment).
The `fmta` function is more convenient for LaTeX, which itself uses curly braces to specify command and environment arguments, so I'll mostly use `fmta` below.

Here's **how to call the `fmta` function**:

1. Format string: place the snippet's boilerplate text in a Lua string (you can use quotes for single-line strings and `[[]]` for multiline strings), and place `<>` angle brackets at the positions where you want to place insert (or other non-text) nodes.
   Here are example format strings for the earlier LaTeX snippets:
 
   ```lua
   -- \texttt snippet
   "\\texttt{<>}"
 
   -- \frac snippet
   "\\frac{<>}{<>}"
 
   -- Equation snippet, using a multiline Lua string.
   -- (No need to escape backslashes in multiline strings.)
   [[
     \begin{equation*}
         <>
     \end{equation*}
   ]]
   ```

   Escaping delimiters: if you want to insert a delimiter character literally, just repeat it.
   For example, `<<>>` would insert literal angle brackets into a `fmta` string, and `{% raw %}{{}}{% endraw %}` would insert literal curly braces into a `fmt` string.
 
1. Node table: create a Lua table containing one node for each angle bracket placeholder in the boilerplate string.
   The `fmta` function will insert the nodes in this table, in sequential order, into the angle bracket placeholders in the boilerplate string.
   (Examples just below.)
 
1. Format options: optionally create a third table of format options with `key = value` syntax.
   In practice, you will usually only ever need the `delimiter` key, which you can use with regular `fmt` to specify delimiters other than `fmt`'s default `{}` curly braces.
   See the `opts` entry in `:help luasnip-fmt` for the full list of possible keys.
 
Then pass the format string, node table, and optional `fmt_opts` table (if you're using one) as arguments to `fmt()` or `fmta()`.
As always, here are concrete examples---I'll continue with the `\texttt`, `\frac`, and `equation` snippets.

```lua
-- fmta call for the \texttt snippet
fmta(
  "\\texttt{<>}",
  { i(1) },
)

-- Example: using fmt's `delimiters` key to manually specify angle brackets
fmt(
  "\\frac{<>}{<>}",
  {
    i(1),
    i(2)
  },
  {delimiters = "<>"} -- manually specifying angle bracket delimiters
)

-- Using a multiline string for the equation snippet
fmta(
   [[
     \begin{equation*}
         <>
     \end{equation*}
   ]],
   { i(1) }
)
```

Finally, you create a snippet by using the call to the `fmt` or `fmta` function in place of a node table.
At the risk of getting boring---I know I'm going slowly here, but I want to fully list all steps---here are the `\texttt`, `\frac`, and `equation` examples as complete snippets.

```lua
return {
-- Examples of complete snippets using fmt and fmta

-- \texttt
s({trig="tt", dscr="Expands 'tt' into '\texttt{}'"},
  fmta(
    "\\texttt{<>}",
    { i(1) }
  )
),
-- \frac
s({trig="ff", dscr="Expands 'ff' into '\frac{}{}'"},
  fmt(
    "\\frac{<>}{<>}",
    {
      i(1),
      i(2)
    },
    {delimiters = "<>"} -- manually specifying angle bracket delimiters
  )
),
-- Equation
s({trig="eq", dscr="Expands 'eq' into an equation environment"},
  fmta(
     [[
       \begin{equation*}
           <>
       \end{equation*}
     ]],
     { i(1) }
  )
)
}
```

See `:help luasnip-fmt` for complete documentation of `fmt` and `fmta`, although the above should have you covered for most use cases.

### Insert node tips and tricks

#### Repeated nodes

Repeated nodes (analogous to what UltiSnips calls mirrored tabstops) allow you to reuse a node's content in multiple locations throughout the snippet body.

In practice, you might use repeated insert nodes to simultaneously fill out the `\begin` and `\end` fields of a LaTeX environment.
Here's an example:

{{< img-centered src="images/vim-latex/snippets/mirrored.gif" width="100%" global="1" alt="GIF demonstrating mirrored tabstops." >}}

The syntax for repeated nodes straightforward: you pass the index of the node you want to repeat to a `rep()` node, which is provided by the `luasnip.extras` module.
For example, here is the code for the snippet shown in the above GIF---note how the `rep(1)` node in the environment's `\end` command repeats the `i(1)` node in the `\begin` command.

```lua
return {
-- Code for environment snippet in the above GIF
s({trig="env", snippetType="autosnippet"},
  fmta(
    [[
      \begin{<>}
          <>
      \end{<>}
    ]],
    {
      i(1),
      i(2),
      rep(1),  -- this node repeats insert node i(1)
    }
  )
),
}
```

Note: for text in the repeated node **to update as you type** (e.g. like in the `\end{}` field in the above GIF) you should set `update_events = 'TextChanged,TextChangedI'` [in your LuaSnip config](#config).
The default update event is `InsertLeave`, which will update repeated nodes only after leaving insert mode.
Repeated nodes are are documented, in passing, in the section `:help luasnip-extras`.

#### Custom snippet exit point with the zeroth insert node

By default, you exit/complete a snippet with your cursor placed at the very last piece of text.
(In the previous environment snippet, for example, this would be after the `\end{}` command.)
But sometimes it is convenient to complete a snippet with your cursor still inside the snippet body.

You can specify a custom exit point using the zero-index insert node `i(0)` (which is analogous to `$0` in UltiSnips).
The `i(0)` node is always the last node jumped to, and you use it to specify the desired cursor position when the snippet completes.
Here is an example where an explicitly-specified `i(0)` node makes you exit a equation snippet with your cursor conveniently placed inside the environment's body.

```lua
return {
-- Using a zero-index insert node to exit snippet in equation body
s({trig="eq", dscr=""},
  fmta(
    [[
      \begin{equation}
          <>
      \end{equation}
    ]],
    { i(0) }
  )
),
}
```

If `i(0)` is not explicitly defined, an `i(0)` node is implicitly placed at the very end of the snippet---in this case this would be after the `\end{equation}` command.
The zero-index insert node is documented in `:help luasnip-insertnode`.

#### Insert node placeholder text

Placeholder text is used to give an insert node a description or default text.
You define placeholder text by passing an optional second string argument to an insert node

Here is a real-world example I used to remind myself the correct order for the URL and display text in the `hyperref` package's `href` command:

```lua
return {
-- Example use of insert node placeholder text
s({trig="hr", dscr="The hyperref package's href{}{} command (for url links)"},
  fmta(
    [[\href{<>}{<>}]],
    {
      i(1, "url"),
      i(2, "display name"),
    }
  )
),
}
```

Here is what this snippet looks like in action:

{{< img-centered src="images/vim-latex/snippets/hyperref-tabstop-placeholder.gif" width="100%" global="1" alt="GIF demonstrating the tabstop placeholder." >}}

See the end of `:help luasnip-insertnode` for documentation of insert node placeholder text.

### The visual placeholder and a few advanced nodes {#advanced-nodes}

<!-- https://github.com/L3MON4D3/LuaSnip/issues/511 -->

We've barely scratched the surface of what LuaSnip can do.
Using three nodes called *function nodes*, *dynamic nodes*, and *snippet nodes*, you can create nodes that call custom Lua functions and even recursively return other nodes, which opens up a world of possibilities.
This section explains, cookbook-style, how to port an UltiSnips feature called the *visual placeholder* to LuaSnip.

The visual placeholder lets you use text selected in Vim's visual mode inside the content of a snippet body.
A typical **use case** is to quickly surround existing text with a snippet (e.g. to surround a word with quotation marks, surround a paragraph in a LaTeX environment, etc.).
Here's a snippet that automatically surrounds selected text in the LaTeX `\textit` command:

{{< img-centered src="images/vim-latex/snippets/visual-placeholder.gif" width="100%" global="1" alt="GIF demonstrating the visual placeholder." >}}

What happened: I selected the line of text with `V`, triggered visual selection with Tab, and after I triggered the snippet (with `tii` in this case) the `\textit{}` command's argument was automatically populated with the previously-selected text.

Here's how to set up and use visual selection:

**Config:** visual selection is an opt-in feature;
to enable it, open your LuaSnip config and set the `store_selection_keys` option to the key you want to use to trigger visual selection.
The following example uses the Tab key, but you could use any key you like.
  
```lua
-- Somewhere in your Neovim startup, e.g. init.lua
require("luasnip").config.set_config({ -- Setting LuaSnip config
  -- Use <Tab> (or some other key if you prefer) to trigger visual selection
  store_selection_keys = "<Tab>",
})
```

Pressing `<Tab>` in visual mode will then store the visually-selected text in a LuaSnip variable called `SELECT_RAW`, which we will reference later to retrieve the visual selection.

Here's **how to use visual placeholder snippets** (it sounds really complicated when written out, but should make more sense in the GIF below and will quickly become part of your muscle memory):

1. Create and save a LuaSnip snippet with a dynamic node that calls the `get_visual` function (all of this is described below, with a complete example---I'm just giving an overview for now).
1. Use Vim to open a file in which you want to test out the just-created snippet.
1. Use Vim's visual mode to select some text.
1. Press the Tab key (or whatever other key you set earlier with `store_selection_keys`).
   The selected text is deleted and stored in the LuaSnip variable `SELECT_RAW`, and you are placed into Vim's insert mode.
1. Type the trigger to expand the previously-written snippet that included the dynamic node calling the `get_visual` function.
   The snippet expands, and the text you had selected in visual mode and stored in `SELECT_RAW` appears in place of the dynamic node in the snippet body.

Here's the above GIF again---see if you can identify steps 3 (`V`), 4 (Tab), and 5 (trigger):

{{< img-centered src="images/vim-latex/snippets/visual-placeholder.gif" width="100%" global="1" alt="GIF demonstrating the visual placeholder." >}}

<!-- Notice how I select the text and hit Tab, and after I trigger the snippet (with `tii` in this case) the `\textit{}` command's argument is automatically populated with the previously-selected text. -->

Here is the corresponding snippet code:

```lua
-- This is the `get_visual` function I've been talking about.
-- ----------------------------------------------------------------------------
-- Summary: If `SELECT_RAW` is populated with a visual selection, the function
-- returns an insert node whose initial text is set to the visual selection.
-- If `SELECT_RAW` is empty, the function simply returns an empty insert node.
local get_visual = function(args, parent)
  if (#parent.snippet.env.SELECT_RAW > 0) then
    return sn(nil, i(1, parent.snippet.env.SELECT_RAW))
  else  -- If SELECT_RAW is empty, return a blank insert node
    return sn(nil, i(1))
  end
end
-- ----------------------------------------------------------------------------

return {
-- Example: italic font implementing visual selection
s({trig = "tii", dscr = "Expands 'tii' into LaTeX's textit{} command."},
  fmta("\\textit{<>}",
    {
      d(1, get_visual),
    }
  )
),
}
```

A few comments:

- You only need to write the `get_visual` function once per snippet file---you can then use it in all snippets in the file.
  By the way, there is no need to use the name `get_visual`.
  You could name the function anything you like.
- You're probably wondering what the heck is a dynamic node---good question.
  A full answer falls beyond the scope of this article; see `:help luasnip-dynamicnode` for details.
  For our purposes, a dynamic node takes a numeric index (just like an insert node) as its first argument and a Lua function as its second argument, and this function (`get_visual` in the above example), returns a LuaSnip construct called a snippet node that *contains other nodes* (a single insert node in the above example).
- In the above example the dynamic node has an index of 1, but you can of course set a dynamic node's index to anything you like if other nodes come earlier.
  So, for example, you might first create a snippet that first uses an insert node `i(1)` and only then uses a visual dynamic node `d(2, get_visual)`.

Here's the great thing: you can still use any snippet that includes the `d(1, get_visual)` dynamic node without going through the select-and-Tab procedure described above---if there is no active visual selection, the dynamic node simply acts as a regular insert node.

**Docs:** This use of dynamic nodes and `SELECT_RAW` to create a visual-selection snippet is not explicitly mentioned in the LuaSnip docs at the time of writing, but you can read about `SELECT_RAW` at `:help luasnip-variables` and about dynamic nodes, as mentioned earlier, at `:help luasnip-dynamicnode`.
The `store_selection_keys` config key is documented in the [LuaSnip README's config section](https://github.com/L3MON4D3/LuaSnip#config).

## Conditional snippet expansion

### The problem and the solution

If you haven't noticed already, sooner or later you'll run into the following problem: 

> *Short, easy-to-type snippet triggers tend to interfere with words typed in regular text.*

This problem becomes particularly noticeable if you use autotrigger snippets, (which I strongly encourage if you need to type LaTeX quickly and conveniently).
For example:

- `ff` is a great choice to trigger a `\frac{}{}` snippet---it's a short, convenient trigger with good semantics---but you wouldn't want `ff` to spontaneously expand to `\frac{}{}` in the middle of typing the word "offer" in regular text, for example.
- `mm` is a nice trigger for `$ $` (inline math), but expansion would be unacceptable when typing words like "communication", "command", etc.

You get the idea---loosely, we need a way to "stop snippets from expanding when we don't want them to".
This section gives two solutions to this problem:

1. Regular expansion (regex) triggers
1. Making certain snippets expand only when the trigger is typed in certain LaTeX contexts (e.g. math, comments, only in a specific environment, etc.)

In combination, these techniques should solve your snippet expansion problems in all typical use cases.
I'll cover regex triggers first, since they apply to any filetype workflow, and then cover math-specific and environment-specific expansion, which are more LaTeX-specific.

### Regex snippet triggers

For our purposes, if you aren't familiar with them, regular expressions let you implement conditional pattern matching in snippet triggers.
You could use a regular expression trigger, for example, to do something like "make the trigger `ff` expand to the fraction snippet `\frac{i(1)}{i(2)}`, but only if the `ff` does not come after an alphabetical character".
(That would solve the problem of `ff` expanding in words like "off" or "offer".)

**Technicality: Lua patterns vs. traditional regexps:** the Lua language, and thus LuaSnip, uses a flavor of regular expressions called "Lua patterns", which basically provide a simple, limited subset of what "traditional" (e.g. POSIX or Perl) regular expressions can do.
If you're already familiar with traditional regex syntax, Lua patterns will be easy for you---for our purposes, the only meaningful difference is that Lua patterns use the percent sign instead of the backslash to escape characters.
I'll use the terms "regex" and "Lua pattern" interchangeably in this article.

A formal explanation of regular expressions and Lua patterns falls beyond the scope of this article, and I offer the examples below in a "cookbook" style in the hope that you can adapt the ideas to your own use cases.
Regex tutorials abound on the internet; if you need a place to start, I recommend first watching [Corey Schafer's YouTube tutorial on traditional regexes](https://www.youtube.com/watch?v=sa-TUpSx1JA), then reading the Programming in Lua book's [section on Lua patterns](https://www.lua.org/pil/20.2.html).

For future reference, here the Lua pattern keywords needed for this article:

<div align="center">

{{
  "
  | Keyword | Matched characters                |
  | ------- | ------------------                |
  | `.`     | all characters                    |
  | `%d`    | digits                            |
  | `%a`    | letters (uppercase and lowercase) |
  | `%w`    | alphanumeric characters           |
  | `%s`    | white space characters            |
  "
| markdownify }}

</div>

**Here's how the following sections will work:**

- I'll first give the generic snippet parameter table needed to use each class of regex triggers, and use `foo` as the example trigger.
- I'll give a short explanation of how each Lua regex works.
- I'll give a few real life examples I personally find useful when writing LaTeX.

#### Suppress expansion after alphanumeric characters.

The following trigger expands after blank spaces, punctuation marks, braces and other delimiters, but not after alphanumeric characters.
Here are the snippet parameter tables for a few variations on the same theme:

```lua
-- Prevents expansion if 'foo' is typed after letters
 s({trig = "([^%a])foo", regTrig = true, wordTrig = false}

-- Prevents expansion if 'foo' is typed after alphanumeric characters
 s({trig = "([^%w])foo", regTrig = true, wordTrig = false}
```

Explanation: `%a` represents letters;
the `^` character, *when used in square brackets*, performs negation, so `[^%a]foo` will negate (reject) all matches when `foo` is typed after a letter;
and `([^%a])` captures matched non-letter characters to insert back into the snippet body.
(You get behavior similar to this out of the box from LuaSnip's default `wordTrig` snippet parameter (mentioned in `:help luasnip-snippets`), but I prefer custom regex triggers for finer-grained control, so I've set `wordTrig = false` and will continue to do so in the remaining regex snippets.)

This is by far my most-used class of regex triggers, because it prevents common snippet triggers from expanding in regular words.
Here are some example use cases:

- Make `mm` expand to `$ $` (inline math), but not in words like "comment", "command", etc...

  ```lua
  return {
  s({trig = "([^%a])mm", wordTrig = false, regTrig = true},
    fmta(
      "<>$<>$",
      {
        f( function(_, snip) return snip.captures[1] end ),
        d(1, get_visual),
      }
    )
  ),
  }
  ```
  
  The `d(1, get_visual)` node implements the visual selection [covered earlier](#advanced-nodes) in this article.
  The weird-looking function node `f( function(_, snip) return snip.captures[1] end )` preserves the trigger's regex capture group and is explained below.

- Make `ee` expand to `e^{}` (Euler's number raised to a power) after spaces, delimiters, and so on, but not in words like "see", "feel", etc...

  ```lua
  return {
  s({trig = '([^%a])ee', regTrig = true, wordTrig = false},
    fmta(
      "<>e^{<>}",
      {
        f( function(_, snip) return snip.captures[1] end ),
        d(1, get_visual)
      }
    )
  ),
  }
  ```

- Make `ff` expand to `frac{}{}` but not in words like "off", "offer", etc...

  ```lua
  return {
  s({trig = '([^%a])ff', regTrig = true, wordTrig = false},
    fmta(
      [[<>\frac{<>}{<>}]],
      {
        f( function(_, snip) return snip.captures[1] end ),
        i(1),
        i(2)
      }
    )
  ),
  }
  ```

  (Note that the `ff -> \frac{}{}` expansion problem can also be solved with a math-context expansion condition, which is covered in the next section.)

#### Intermezzo: function nodes and regex captures

**TLDR:** Saw those weird-looking function nodes `f( function(_, snip) return snip.captures[1] end )` popping up in the above regex-triggered snippets?
This node just inserts regex capture groups from snippet's trigger back into the snippet body.
You can now [jump to the next section](#after-a).
**End TLDR**.

Longer explanation: regex-triggered snippets have a potential problem.
In the fraction snippet, for example,
the entire pattern `"([^%a])ff"` (including leading non-letter character `([^%a])`) is interpreted as the snippet trigger, not just the string `"ff"`,
and so the leading non-letter character is never inserted back into the snippet and disappears!
This might sound vague, but try copying and triggering the above regex snippets and notice how after expansion the character before the trigger disappears.

The solution is to access the leading whitespace from the trigger's regex capture group and insert it back into the snippet.
You can access regex capture groups with LuaSnip function nodes---the syntax looks like this...

```lua
-- Accessing regex capture groups with LuaSnip
f( function(_, snip) return snip.captures[1] end ) -- return first capture group
f( function(_, snip) return snip.captures[2] end ) -- return second capture group, etc.
```

...and that is why each snippet above included a function node.
It's bit verbose, to be sure, but in practice you basically only write the capture group function node once and then copy and paste it into your other snippets, so it's not too bad.

#### Expand only after alphanumeric characters and closing delimiters {#after-a}

This class of triggers expands only after letter characters and closing delimiters, but not after blank spaces or numbers.

```lua
-- Only after letters
s({trig = '([%a])foo', regTrig = true, wordTrig = false}

-- Only after letters and closing delimiters
s({trig = '([%a%)%]%}])foo', regTrig = true, wordTrig = false}
```

Explanation: `%a` matches letters;
`%)`, `%]`, and `%}` match closing parentheses, square brackets, and curly braces, respectively (these three characters have to be escaped with the percent sign);
and `([%a%)%]%}])` saves the captured characters in a capture group.

I don't use this trigger that often, but here is one example I really like.
It makes `00` expand to the `_{0}` subscript after letters and closing delimiters, but not in numbers like `100`:

```lua
return {
-- A fun zero subscript snippet
s({trig = '([%a%)%]%}])00', regTrig = true, wordTrig = false, snippetType="autosnippet"},
  fmta(
    "<>_{<>}",
    {
      f( function(_, snip) return snip.captures[1] end ),
      t("0")
    }
  )
),
}
```

And here is the above snippet in action:

{{< img-centered src="images/vim-latex/snippets/0-subscript.gif" width="100%" global="1" alt="GIF demonstrating a snippet for creating a zero subscript." >}}

Combined with math-context expansion (described below), these three classes of regex triggers cover the majority of my use cases and should give you enough tools to get started writing your own snippets.

#### Bonus: expansion only at the start of a new line

This is the equivalent of the UltiSnips `b` option, and will only expand snippets on new lines.
This trigger is useful for expanding environments, `\section`-style commands, preamble commands, which are usually defined only on new lines.

You could do this manually with a regex trigger like `"^([%s]*)foo"`, but LuaSnip provides a cleaner way to do this---a built-in `line_begin` expansion condition.
This will be our first use of the `condition` key in a LuaSnip snippet's `opts` table (mentioned in the [snippet anatomy section](#anatomy) earlier in this article and documented towards the bottom of `:help luasnip-snippets`)---here are a few real-life examples of how to use it:
one uses the HTML-inspired trigger `h1` to create LaTeX `\section` commands (you could use `h2` for `\subsection`, and so on),
and the other uses `new` to create a new environment.

<!-- Source code: `LuaSnip/lua/luasnip/extras/expand_conditions.lua` -->

```lua
-- Example: expanding a snippet on a new line only.
-- In a snippet file, first require the line_begin condition...
local line_begin = require("luasnip.extras.expand_conditions").line_begin

-- ...then add `condition=line_begin` to any snippet's `opts` table:
return {
s({trig = "h1", dscr="Top-level section"},
  fmta(
    [[\section{<>}]],
    { i(1) }
  ), 
  {condition = line_begin}  -- set condition in the `opts` table
),

s({trig="new", dscr="A generic new environmennt"},
  fmta(
    [[
      \begin{<>}
          <>
      \end{<>}
    ]],
    {
      i(1),
      i(2),
      rep(1),
    }
  ),
  {condition = line_begin}
),
}
```

### Context-specific expansion for LaTeX

The `condition` option in a LuaSnip snippet's `opts` table gives you essentially arbitrary control over when snippets expand.
We used it above to implement the `line_begin` expansion condition;
here's how to use it more generally:

1. In a snippet file, write a Lua function that returns a boolean value: `true` when a snippet should expand and `false` when it should not.
   Here is a silly example that uses Vim's `line()` function (documented at `:help line()`) and the Lua modulo operator to only expand snippets on even-numbered lines.
   
   ```lua
   -- Silly example: returns true when the cursor is on an even-numbered line
   is_even_line = function()
     local line_number = vim.fn['line']('.')
     if ((line_number % 2) == 0) then  -- an even-numbered line
       return true
     else  -- an odd-numbered line
       return false
     end
   end
   -- (Yes, I know I could have written `return ((line_number % 2) == 0)`,
   -- but I wanted to make the if/else logic explicitly clear.)
   ```

1. Set the `condition` key in a snippet's `opts` table to the name of the expansion function:

   ```lua
   return {
   s({trig="test", snippetType="autosnippet"},
      {t("The current line number is even")},
      {condition = is_even_line}
   ),
   }
   ```

   The above snippet will expand only on even lines (just make sure to include the `is_even_line` function in the snippet file).

The `condition` key gives you a lot of power, especially if you leverage built-in Vim functions (e.g. `line()`, `col()`, `nvim_get_current_line()`, etc.) to get information about the current line and cursor position for use in the `condition` function.
LuaSnip even passes a few convenience variables to the `condition` function for you---see the `opts` section in `:help luasnip-snippets` for details.

To **implement math-specific snippet expansion**, you basically need a function that returns `true` in math contexts and `false` otherwise.
The excellent [VimTeX plugin](https://github.com/lervag/vimtex/) provides exactly such a function---the `in_mathzone()` function in `vimtex/autoload/vimtex/syntax.vim`.
<!-- This function isn't explicitly mentioned in the VimTeX documentation, but you can find it in the VimTeX source code at [`vimtex/autoload/vimtex/syntax.vim`](https://github.com/lervag/vimtex/blob/master/autoload/vimtex/syntax.vim). -->
<!-- (which I cover in detail [later in the series]({{< relref "/tutorials/vim-latex/vimtex" >}})) -->
You can integrate VimTeX's math zone detection with LuaSnip's `condition` feature as follows:

```lua
-- Include this `in_mathzone` function at the start of a snippets file...
local in_mathzone = function()
  -- The `in_mathzone` function requires the VimTeX plugin
  return vim.fn['vimtex#syntax#in_mathzone']() == 1
end
-- Then pass the table `{condition = in_mathzone}` to any snippet you want to
-- expand only in math contexts.

return {
-- Another take on the fraction snippet without using a regex trigger
s({trig = "ff"},
  fmta(
    "\\frac{<>}{<>}",
    {
      i(1),
      i(2),
    }
  ),
  {condition = in_mathzone}  -- `condition` option passed in the snippet `opts` table 
),
}
```

You can use analogous expansion functions for any other LaTeX context, as long as you have a function that reliably detects if the cursor is currently in a given context or not, where VimTeX again comes to the rescue.
Following are a few more examples for **conditional expansion in comments, text, and various LaTeX environments**---I've wrapped the various condition functions in a Lua table called `tex_utils` for organizational purposes.

Here are the expansion functions...

```lua
-- Some LaTeX-specific conditional expansion functions (requires VimTeX)

local tex_utils = {}
tex_utils.in_mathzone = function()  -- math context detection
  return vim.fn['vimtex#syntax#in_mathzone']() == 1
end
tex_utils.in_text = function()
  return not tex_utils.in_mathzone()
end
tex_utils.in_comment = function()  -- comment detection
  return vim.fn['vimtex#syntax#in_comment']() == 1
end
tex_utils.in_env = function(name)  -- generic environment detection
    local is_inside = vim.fn['vimtex#env#is_inside'](name)
    return (is_inside[1] > 0 and is_inside[2] > 0)
end
-- A few concrete environments---adapt as needed
tex_utils.in_equation = function()  -- equation environment detection
    return tex_utils.in_env('equation')
end
tex_utils.in_itemize = function()  -- itemize environment detection
    return tex_utils.in_env('itemize')
end
tex_utils.in_tikz = function()  -- TikZ picture environment detection
    return tex_utils.in_env('tikzpicture')
end
```

...and here is a simple example: expanding `dd` into the TikZ `\draw` command only in `tikzpicture` environments---you can of course use any condition you like in your own snippets.

```lua
return {
-- Expand 'dd' into \draw, but only in TikZ environments
s({trig = "dd"},
  fmta(
    "\\draw [<>] ",
    {
      i(1, "params"),
    }
  ),
  { condition = tex_utils.in_tikz }
),
}
```

As always, make sure to define the conditional expansion functions in any snippet file you wish to use them in!

**Acknowledgements:** thank you to [@evesdropper](https://github.com/evesdropper) and [@lervag](https://github.com/lervag) for the good ideas and discussion in [VimTeX issue #2501](https://github.com/lervag/vimtex/issues/2501), which is where I got the idea for environment-specific expansion;
my original source for math-context expansion is [the famous Gilles Castel article](https://castel.dev/post/lecture-notes-1/#context).

<!-- See `:help vimtex#env#is_inside` in `:help vimtex-code-api`. -->

## Extra 

### (Subjective) practical tips for fast editing {#tips}

I'm writing this with math-heavy LaTeX in real-time university lectures in mind, where speed is crucial; these tips might be overkill for more relaxed use cases.
In no particular order, here are some useful tips based on my personal experience:

- Use automatic completion whenever possible.
  This technically makes your snippet engine use more computing resources, but I am yet to notice a perceptible slow-down on modern hardware.
  For example, I regularly use 150+ autotrigger snippets on a 2.5 GHz, dual-core, third-gen i5 processor and 8 gigabytes of RAM (typical, even modest specs by today's standards) without any problems.

- Use *short* snippet triggers.
  Like one-, two-, or and *maybe* three-character triggers.

- Repeated-character triggers offer a good balance between efficiency and good semantics.
  For example, I use `ff` (fraction), `mm` (inline math), and `nn` (new equation environment).
  Although `frac`, `$`, and `eqn` would be even clearer, `ff`, `mm`, and `nn` still get the message across and are also much faster to type.

  Use math-context expansion and regular expressions to free up short, convenient triggers that would otherwise conflict with common words.

- Use ergonomic triggers on or near the home row.
  Depending on your capacity to develop muscle memory, you can dramatically improve efficiency if you sacrifice meaningful trigger names for convenient trigger locations.
  I'm talking weird combinations of home row keys like `j`, `k`, `l`, `s`, `d`, and `f` that smoothly roll off your fingers.
  For example, `sd`, `df`, `jk`, and `kl`, if you can get used to them, are very convenient to type and also don't conflict with many words in English or Romance languages.

  Here are two examples I use all the time:

  1. I first define the LaTeX command `\newcommand{\diff}{\ensuremath{\operatorname{d}\!}}` in a system-wide preamble file, then access it with the following snippet:

     ```lua
     return {
     s({trig = "df", snippetType = "autosnippet"},
       { t("\\diff") },
       { condition = tex.in_mathzone }
     ),
     }
     ```
     This `df` snippet makes typing differentials a breeze, with correct spacing, upright font, and all that.
     Happily, in this case using `df` for a differential also makes semantic sense.

     You can see the `\diff` snippet playing a minor supporting role as the differential in this variation of the fundamental theorem of calculus:

     <image src="/assets/images/vim-latex/show-off/calc.gif" alt="Example use of a differential in the fundamental theorem of calculus" />

     As a side note, using a `\diff` command also makes redefinition of the differential symbol very easy---for example to adapt an article for submission to a journal that uses italic instead of upright differentials, one could just replace `\operatorname{d}\!` with `\,d` in the command definition instead of rummaging through LaTeX source code changing individual differentials.

  2. I use the following snippet for upright text in subscripts---the trigger makes no semantic sense, but I got used to it and love it.

     ```lua
     return {
     s({trig = 'sd', snippetType="autosnippet", wordTrig=false},
       fmta("_{\\mathrm{<>}}",
         { d(1, get_visual) }
       ),
       {condition = tex.in_mathzone}
     ),
     }
     ```
     This snippet triggers in math contexts and includes a visual placeholder.

     Please keep in mind: I'm not suggesting you should stop what you're doing, fire up your Vim config, and start using `sd` to trigger upright-text subscripts just like me.
     The point here is just to get you thinking about using the home-row keys as efficient snippet triggers.
     Try experimenting for yourself---you might significantly speed up your editing.
     Or maybe this tip doesn't work for you, and that's fine, too.

- Try using `jk` as your `<Plug>luasnip-jump-next` key, i.e. for jumping forward through tabstops:

  ```vim
  imap <silent><expr> jk luasnip#jumpable(1) ? '<Plug>luasnip-jump-next' : 'jk'
  smap <silent><expr> jk luasnip#jumpable(1) ? '<Plug>luasnip-jump-next' : 'jk'
  ```

  The other obvious choice is the Tab key, but I found the resulting pinky reach away from the home row to be a hindrance in real-time LaTeX editing.
  Of course `jk` is two key presses instead of one, but it rolls of the fingers so quickly that I don't notice a slowdown.
  (And you don't have `jk` reserved for exiting Vim's insert mode because you've [remapped Caps Lock to Escape on a system-wide level](https://www.dannyguo.com/blog/remap-caps-lock-to-escape-and-control/) and use that to exit insert mode, right?)

### Tip: Refreshing snippets from a separate Vim instance

In addition to initially loading snippets, the Lua loader functions `load` and `lazy_load` (covered [at the start of this article](#loading)) will refresh the snippets in the current Vim instance to reflect the contents of your snippets directory.
Here's an example use case:

- Problem: you're editing `foobar.tex` in one Vim instance, make some changes to the snippets file `tex.lua` in a *separate* Vim instance, and want the updates to be immediately available in `foobar.tex` without having to restart Vim.
  (Any snippet edits made in the *current* Vim instance should already be automatically available.)

- Solution: call Lua loader function with the Vim command

  ```vim
  lua require("luasnip.loaders.from_lua").load({paths = "~/.config/nvim/LuaSnip/"})<CR>
  ```

Since this workflow comes up regularly if you use snippets often, and the above command is inconvenient to type manually, and I suggest writing a key mapping to do it for you.
The following mapping, for example, makes `<Leader>L` reload your LuaSnip snippets.

```lua
-- In Lua
vim.keymap.set('n', '<Leader>L', '<Cmd>lua require("luasnip.loaders.from_lua").load({paths = "~/.config/nvim/LuaSnip/"})<CR>')
```

```vim
" In Vimscript
nnoremap <leader>L <Cmd>lua require("luasnip.loaders.from_lua").load({paths = "~/.config/nvim/LuaSnip/"})<CR>
```

Of course, if needed, you should update `~/.config/nvim/LuaSnip/` to your own snippet directory, covered [at the start of this article](#loading).

In case they look unfamiliar, the above code snippets are Vim *key mappings*, a standard Vim configuration tool described in much more detail in the series's final article, [7. A Vim Configuration Primer for Filetype-Specific Workflows]({{< relref "/tutorials/vim-latex/vimscript" >}}).

{{< vim-latex/navbar >}}

{{< vim-latex/license >}}
