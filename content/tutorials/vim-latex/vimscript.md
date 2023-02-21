---
title: Vim Configuration Tutorial for Filetype-Specific Workflows | Vim and LaTeX Series Part 7
prevFilename: "pdf-reader"
prevDisplay-name: "« 6. PDF Reader"
nextFilename: "intro"
nextDisplay-name: "Introduction"
date: 2021-10-08
---

{{< vim-latex/navbar >}}

# 7. A Vim Configuration Primer for Filetype-Specific Workflows

{{< date-last-mod >}}

This is part seven in a [seven-part series]({{< relref "/tutorials/vim-latex/intro" >}}) explaining how to use the Vim or Neovim text editors to efficiently write LaTeX documents.
This article provides a theoretical background for use of Vimscript in filetype-specific workflows and aims to give you a foundation for understanding the filetype plugin system, key mapping syntax, and Vimscript functions used earlier in this series.

{{< toc level="2" title="Contents of this article" >}}

The article is a selection of the Vimscript and Vim configuration concepts needed to understand the content of this series, presented in a way that should hopefully be easier for a new user to understand than tackling the Vim documentation directly, together with references of exactly where in the Vim docs to find more information.

{{< details summary="What, Vimscript?! I use Neovim, dislike Vimscript, and write my config in Lua." >}}
Me too!
But I focused on Vimscript in this article...

1. so that both Vim and Neovim users can benefit from it and 
1. because the VimTeX plugin (which predates Lua in Neovim) uses Vimscript and is a bit easier to configure in Vimscript.

Keep in mind that the same concepts covered in this article also apply to Lua-configured Neovim, you just have to [translate the Vimscript to Lua](https://neovim.io/doc/user/lua-guide.html#lua-guide) if you so wish.
And remember that you can always [include snippets of Vimscript in an otherwise Lua-based config](https://neovim.io/doc/user/lua-guide.html#lua-guide-vimscript).
{{< /details >}}

## How to read this article

This article is long. 
You don't have to read everything---in fact, if you are already familiar with Vim configuration or if you find theory boring, feel free to skip the article entirely.
I suggest skimming through on a first reading, remembering this article exists, and then referring back to it, if desired, when you wish to better understand the Vimscript functions and key mappings used in the series.

By the way, nothing in this article is particularly LaTeX-specific and would generalize well to Vim workflows with other file types.

## Key mappings

Vim key mappings allow you to map arbitrary logic to keyboard keys,
and I would count them among the fundamental Vim configuration tools.
In the context of this series, key mappings are mostly used to define shortcuts for calling commands and functions that would be tedious to type out in full (similar to aliases in, say, the Bash shell).
This section is a whirlwind tour through Vimscript key mappings, from the basic definition syntax to practical mappings actually used in this tutorial.

The official documentation of key mappings lives in the `Key mapping` chapter of the Vim documentation file `map.txt`, and you can access it with `:help key-mapping`.
I will summarize here what I deem necessary for understanding the key mappings used in this series. 

### Writing key mappings

The basic syntax for defining a key mapping, which you can find at `:help map-commands`, is

```vim
:map {lhs} {rhs}
```
Here is what's involved in the mapping definition:

- `{lhs}` (left hand side): A (generally short and memorable) key combination you wish to map
- `{rhs}` (right hand side): A (generally longer, tedious-to-manually-type) key combination you want the short, memorable `{lhs}` to trigger.
- The Vim mode you want the mapping to apply in, which you can control by replacing `:map` with `:nmap` (normal mode), `:vmap` (visual mode), `:imap` (insert mode), or a host of other related commands, listed in `:help :map-commands`.

The command `:map {lhs} {rhs}` then maps the key sequence `{lhs}` to the key sequence `{rhs}` in the Vim mode in which the mapping applies.

You probably already have some key mappings in your `vimrc` or `init.vim`,
but in case you haven't seen mappings yet, here are some very simple examples to get you started:

```vim
" Map `Y` to `y$` (copy from current cursor position to the end of the line),
" which makes Y work analogously to `D` and `C`.
" (Not vi compatible, and enabled by default on Neovim)
noremap Y y$

" Map `j` to `gj` and `k` to `gk`, which makes it easier to navigate wrapped lines.
noremap j gj
noremap k gk
```

Using `noremap` instead of `map` is a standard Vimscript best practice, described in the following section immediately below.

#### Remapping: `map` and `noremap`

I will cover this topic only briefly (it's really not too complicated in practice), and refer you to Steve Losh's nice description of the same content in [Chapter 5 of Learn Vimscript the Hard Way](https://learnvimscriptthehardway.stevelosh.com/chapters/05.html) for a more thorough treatment.

Here is the TLDR version:

- Vim offers two types of mapping commands:

  1. The *recursive* commands `map`, `nmap`, `imap`, and their other `*map` relatives.
  2. The *non-recursive* commands `noremap`, `nnoremap`, `inoremap`, and their other `*noremap` relatives.

- Both `:map {lhs} {rhs}` and `:noremap {lhs} {rhs}` will map `{lhs}` to `{rhs}`, but here is the difference:
  - `map`: If any keys in the `{rhs}` of a `:map` mapping have been used the `{lhs}` of a *second* mapping (e.g. somewhere else in your Vim config or in third-party plugin), then the second mapping will in turn be triggered as a result of the first (often with unexpected results!).

  - `noremap`: Using `:noremap {lhs} {rhs}` is safer---it ensures that even if `{rhs}` contains the `{lhs}` of a second mapping, the second mapping won't interfere with the first.
    In everyday terms, `noremap` and its relatives ensure mappings do what you meant them to do.
  
- *Best practice: always use* `noremap` *or its* `*noremap` *relatives unless you have a very good reason not to* (e.g. when working with `<Plug>` or `<SID>` mappings, which are meant to be remapped, and which I cover later in this article).

Again, if desired, consult [Chapter 5 of Learn Vimscript the Hard Way](https://learnvimscriptthehardway.stevelosh.com/chapters/05.html) for a more thorough discussion of `map` and `noremap`.

#### Two tips for choosing LHS keys

- **Notation for special keys:** Certain keys can be used in key mappings only if you refer to them with a special notation.
  Some examples follow below:
  
  | Key | Vim mapping notation |
  | - | - |
  | Space | `<Space>` |
  | Enter | `<CR>` |
  | Escape | `<Esc>` |
  | Tab | `<Tab>` |
  | Backspace | `<BS>` |

  See `:help keycodes` for a full list of special keys and their Vim notation, and `:help <>` for the rules behind Vim's `<>` notation for special keys.
  Note that the Vim names are case-insensitive---`<cr>` is the same as `<CR>`, for example.
  
- **Seeing what keys are already used by Vim:** Vim defines a great deal of keyboard shortcuts, which can cause problems when defining your own mappings---you don't want the mapping's `{lhs}` to override a built-in Vim command.
  
  You can use the Vim command `:help {key}<C-D>` (where `<C-D>` is Vim notation for `<Ctrl>d`) to see if `{key}` is used for some built-in or plugin-defined Vim command.
  For example `:help s<C-D>` shows a multi-column list of all commands beginning with `s` (there are a lot!).
  You can then type out the full version of any command you see in this list and press enter to go its help page. 
  This useful tip is tucked away at the bottom of `:help map-which-keys`.

  It also helps to use Vim's leader key functionality to avoid conflicts with built-in Vim commands---the leader key is described a few paragraphs below in the section [The leader key](#leader).

#### Map modes

Not every mapping will expand in every Vim mode;
you control the Vim mode in which a given key mapping applies with your choice of `nmap`, `imap`, `map`, etc., which each correspond to a different mode.
The Vim documentation at `:help map-modes` states exactly which map command corresponds to which Vim mode(s).
For your convenience, here is a table summarizing which command applies to which mode, taken from `:help map-table`.
You don't need to memorize it, of course---just remember it exists at `:help map-table`, and come back for refresher when needed.

  |       | normal | insert | command | visual | select | operator-pending | terminal | lang-arg |
  | -----------  |------|-----|-----|-----|-----|-----|------|------| 
  | `[nore]map`  | ✅ |  -  |  -  | ✅ | ✅ | ✅ |  -   |  -   |
  | `n[nore]map` | ✅  |  -  |  -  |  -  |  -  |  -  |  -   |  -   |
  | `[nore]map!` |  -   | ✅ | ✅ |  -  |  -  |  -  |  -   |  -   |
  | `i[nore]map` |  -   | ✅ |  -  |  -  |  -  |  -  |  -   |  -   |
  | `c[nore]map` |  -   |  -  | ✅ |  -  |  -  |  -  |  -   |  -   |
  | `v[nore]map` |  -   |  -  |  -  | ✅ | ✅ |  -  |  -   |  -   |
  | `x[nore]map` |  -   |  -  |  -  | ✅ |  -  |  -  |  -   |  -   |
  | `s[nore]map` |  -   |  -  |  -  |  -  | ✅ |  -  |  -   |  -   |
  | `o[nore]map` |  -   |  -  |  -  |  -  |  -  | ✅ |  -   |  -   |
  | `t[nore]map` |  -   |  -  |  -  |  -  |  -  |  -  | ✅  |  -   |
  | `l[nore]map` |  -   | ✅ | ✅ |  -  |  -  |  -  |  -   | ✅  |

This series will use mostly `noremap` and `nnoremap`,  and occasionally `omap`, `xmap`, `vmap`, and their `noremap` equivalents.

#### The leader key {#leader}

Vim offers something called a *leader key*, which works as a prefix you can use to begin the `{lhs}` of key mappings.
The leader key works as a sort of unique identifier that helps prevent your own key mapping shortcuts from clashing with Vim's default key bindings, and it is common practice to begin the `{lhs}` of your custom key mappings with a leader key.
For official documentation, see `:help mapleader`.

Here's how the leader key business works in practice:

1. Decide on a key to use as your leader key.
   You will have to make a compromise: the key should be convenient and easily typed, but it shouldn't clash with keys used for built-in Vim actions.
   Common values are the space bar (`<Space>`), the comma (`,`) and the backslash (`\`), which aren't used in default Vim commands.
   A key like `j`, `f`, or `d` wouldn't work well, since these keys are already used by Vim for motion and deletion.
 
1. In your `vimrc` or `init.vim`, store your chosen leader key in Vim's built-in `mapleader` variable.
   Here are some examples:

   ```vim
   " Use space as the leader key
   let mapleader = " "
 
   " Use the comma as the leader key
   let mapleader = ","
 
   " Use the backslash as the leader key
   let mapleader = "\"
   ```

   The default leader key is the backslash, but many users prefer to use either the space bar or comma, since the backslash is a bit out of the way.
   You can view the current value of the leader key with `:echo mapleader`.
   (Caution: if you use space as your leader key, the output of `:echo mapleader` will look blank, but has really printed a space character).

1. Use the leader key in key mappings with the special `<leader>` keyword in the mapping's `{lhs}`.
   You can think of `<leader>` as a sort of alias for the content of the `mapleader` variable.
   For illustrative purposes, here are some concrete examples:

   ```vim
   " Use <leader>s to toggle Vim's spell-checking on and off;
   " <CR> (carriage return) is just the mapping keycode for the Enter key.
   noremap <leader>s :set spell!<CR>
 
   " Use <leader>b to move to the next Vim buffer
   noremap <leader>b :bnext<CR>
 
   " Use <leader>U to refresh UltiSnips after changing snippet files
   noremap <leader>U :call UltiSnips#RefreshSnippets()<CR>
 
   " Use <leader>c to save and comile the current document
   noremap <leader>c :write<CR>:VimtexCompile<CR>
   ```

1. Enjoy!
   For example, you could then type `<leader>s` in normal mode, of course replacing `<leader>` with the value of your leader key, to call `:set spell!<CR>` and toggle Vim's spell-checking on and off.

Disclaimer: A few of the above example mappings are actually poor Vimscript---Vim offer a better way to call commands from key mappings using a special `<Cmd>` keyword.
But because I haven't introduced it yet, the above mappings use `:` to enter Command mode.
We'll fix this later in this article in the section [The useful `<Cmd>` keyword](#cmd).

#### The local leader key

Vim is flexible, and allows you (if you wanted) to define a different leader key for each Vim buffer.
You would do this with the built-in variable `maplocalleader` and the corresponding keyword `<localleader>`, which are the buffer-local equivalents of `mapleader` and `<localleader>`, and you can use them in the exactly same way.

The local leader key gives you the possibility of a different leader key for each filetype (for example `<Space>` as a local leader in LaTeX files, `,` in Python files, and optionally a different key, say `\`, as a global leader key).

The VimTeX plugin uses `<localleader>` in its default mappings (as a precaution to avoid override your own `<leader>` mappings), so it is important to set a local leader key for LaTeX files.
To do this, add the following code to your `ftplugin/tex.vim` file:

```vim
" This code would go in ftplugin/tex.vim, and sets
" space as the leader leader key for `tex` filetype.
let maplocalleader = " "
```

In practice, most users will want to set `maplocalleader` to the same value as their global leader (to avoid the confusion of different global and local leader keys), but you could of course use any key you want.

See `:help maplocalleader` for official documentation of the local leader key.

#### Map arguments

Vim defines 6 map arguments, which are special keywords that allow you to customize a key mapping's functionality.
Their possible values are `<buffer>`, `<nowait>`, `<silent>`, `<script>`, `<expr>` and `<unique>`, and the official documentation may be found at `:help map-arguments`.
These keywords can be combined and used in any order, but as a whole must appear immediately after the `:map` command and before a mapping's `{lhs}`.
Here is a short summary, which you can reference later, as needed:

- `<silent>` stops a mapping from producing output on Vim's command line.
  It is often used in practice to avoid annoying `"Press ENTER or type command to continue"` prompts.

- If the `<buffer>` keyword is included in a key mapping, the mapping will apply only to the Vim buffer for which the mapping was loaded or defined.
  Example use case: filetype plugins implementing filetype-specific functionality, in which you want a mapping to apply only to the buffer holding the target filetype. 

- A mapping using `<unique>` will fail if a mapping with the same `{lhs}` already exists.
  Use `<unique>` when you want to be extra careful that a mapping won't overwrite an existing mapping with the same `{lhs}`.

- `<script>` is used to define a new mapping that only remaps characters in the `{rhs}` using mappings that were defined local to a script, starting with `<SID>`.
  This keyword is used in practice when defining mappings that call script-local functions, and is not something you would have to worry about outside of that context.
  For a description of script-local mappings, you can scroll down to the section [Calling script-local functions using SID key mappings](#sid).

- The `<nowait>` and `<expr>` keywords are not needed for this series; see `:help map-nowait` and `:help map-expression` if interested.

#### The useful `<Cmd>` keyword {#cmd}

Vim defines one more keyword: `<Cmd>`.
You can use `<Cmd>` mappings to execute Vim commands directly in the current mode (without using `:` to enter Vim's command mode).
The official documentation lives at `:help map-<cmd>`;
for our purposes, using `<Cmd>` avoids unnecessary mode changes and associated autocommand events, improves performance, and is generally the best way to run Vim commands.

Here are some examples for reference, which correct some of the mappings defined earlier in this article in the section [The leader key](#leader), before we had introduced the `<Cmd>` keyword.

```vim
" Best practice: using <Cmd> to execute commands
noremap <leader>c <Cmd>write<CR><Cmd>VimtexCompile<CR>

" Poor practice: manually entering command mode with `:`
noremap <leader>c :write<CR>:VimtexCompile<CR>

" Another example using `<leader>b` to move to the next Vim buffer
noremap <leader>b <Cmd>bnext<CR>

" Use `<leader>i` in normal mode to call `:VimtexInfo`
nnoremap <leader>i <Cmd>VimtexInfo<CR>
```

### Diagnostics: Listing mappings and getting information

You can see a list of all mappings currently defined in a given map mode using the `:map`, `:nmap`, `imap`, etc. commands without any arguments.
For example, `:nmap` will list all mappings defined in normal mode, `:imap` all mappings defined in insert mode, etc.

To filter the search down, you can use `:map {characters}` to show a list of all mappings with a `{lhs}` starting with `{characters}`.
For example, `:nmap \` will show all normal mode mappings beginning with `\`, `:imap <leader>g` will show all insert mode mappings beginning with `<leader>g`, etc.

An example output of `:map <leader>` (which would show all mappings in normal, visual, and operator-pending modes beginning with the leader key) might look something like this:

```vim
  " Using some of the mappings defined earlier in this article,
  " and assuming <Space> is the leader key.
  <Space>c   * <Cmd>write<CR><Cmd>VimtexCompile<CR>
  <Space>b   * <Cmd>bnext<CR>
n <Space>i   * <Cmd>VimtexInfo<CR>
```

This output has four columns, summarized in the following table:

| **Mode** | **LHS** | **Remap status** | **RHS** |
| - | - | - | - |
| A single character indicating the mode in which the mapping applies | The mapping's full `{lhs}` | A single character indicating if the mapping can be remapped or not | The mapping's full `{rhs}` |

The characters in the mode column are mostly self-explanatory---`n` means normal mode (the result of `nmap`), ` ` &#31; (space) means `nvo` mode (the result of `map`), `i` means insert mode (the result of `imap`), etc.
See `:help map-listing` for a list of all codes.
The remap status column will usually only show `*` (meaning a mapping is not remappable; the result of `noremap`) and ` ` (meaning a mapping is remappable; the result of `map`), but other values are possible---again, see `:help map-listing` for a list of all codes.

### Plug mappings

Sooner or later, especially if you use third-party plugins, you will run into mappings including the strange-looking `<Plug>` keyword.
Don't be scared!
The `<Plug>` keyword is just a way for plugin authors to give plugin users more flexibility in defining custom shortcuts for using functionality provided by the plugin.

Here's how the whole `<Plug>` business works:

1. A plugin author maps some (potentially complicated) plugin functionality to a `<Plug>` mapping, and notes this in the plugin documentation.
   
1. A plugin user reads the plugin documentation, sees the `<Plug>` mapping, and defines a convenient `{lhs}` mapping of their own that calls the plugin's `<Plug>` mapping (which in turn remaps to the plugin functionality that `<Plug>` was originally mapped to).
 
1. The user then uses their own `{lhs}` to trigger the plugin functionality associated with the original `<Plug>` mapping.

Since that probably sounds abstract, here is a real-life example, taken from the VimTeX plugin, of this exact three-step `<Plug>` process:

1. The VimTeX documentation at `:help vimtex-default-mappings` and `:help VimtexCompile` explains that VimTeX maps the `:VimtexCompile` command (which triggers the compilation functionality provided by the VimTeX plugin) to the `<Plug>` mapping `<Plug>(vimtex-compile)`.
   (Note that the `<Plug>` keyword is case-insensitive, so e.g. `<Plug>` and `<plug>` mean the same thing.)

1. A user reads the VimTeX docs, sees that the `:VimtexCompile` command is mapped to `<Plug>(vimtex-compile)`, and decides they want to use the shortcut `<leader>c` to call `:VimtexCompile`.
   They then define (for example in `ftplugin/vimtex.vim`) the mapping

   ```vim
   " Using `<leader>c` to call `:VimtexCompile` via VimTeX's plug mapping
   nmap <leader>c <Plug>(vimtex-compile)
   ```

   (It is important to use `nmap` instead of `noremap`, since it is *intended* for the mapping's `rhs`, i.e. `<Plug>(vimtex-compile)`, to remap to its original meaning of `:VimtexCompile` as defined in the VimTeX plugin.)

1. The user can then use `<leader>c` in normal mode to call `:VimtexCompile` and thus compile their LaTeX documents.

It might help to think of `<Plug>` mappings as a sort of API for calling plugin's functionality---users interface with the plugin's internal workings via `<Plug>` mappings provided by the plugin author.

Here's why `<Plug>` mappings are useful:

- They give plugin users flexibility in choosing the `{lhs}` shortcut they personally want to use to trigger plugin functions (each user is different and has their own preferences), instead of the plugin author forcing one shortcut on all users.

- `<Plug>` is a special Vim keyword that cannot be produced by physical keyboard keys (see `:help using-<Plug>`), so there is no risk of a plugin's `<Plug>` mapping overriding any of the plugin users' existing mappings.

Note that, in addition to its `<Plug>` mappings, VimTeX also defines default shortcuts for most of its commands (for example `<localleader>ll` to call `:VimtexCompile`), but any `<Plug>` remappings done by the user, such as `nmap <leader>c <Plug>(vimtex-compile)` above, will override VimTeX's default mappings and respect the user's.
This behavior was mentioned earlier in this series in the article [4. Getting started with the VimTeX plugin]({{< relref "/tutorials/vim-latex/vimtex" >}}), and is described in the VimTeX documentation at `:help vimtex-default-mappings`.

## Writing Vimscript functions

### About this section

Nothing in this section is original---everything comes from the Vim documentation section `eval.txt`, which covers everything a typical user would need to know about Vimscript expressions.
But `eval.txt` is over 12000 lines and not terribly inviting to beginners, so I am listing here the information I have subjectively found most relevant for a typical user getting started with writing Vimscript functions.

Note on documentation: `:help usr_41.txt` provides a summary of Vimscript.
There is some overlap between `usr_41.txt` and `eval.txt`.
In my experience the coverage of functions in `eval.txt` is more comprehensive but less easy to read, like a `man` page, while the coverage of functions in  `usr_41.txt` is an incomplete summary of the material from `eval.txt`.

### Function definition syntax

A quick Vim vocabulary lesson:

- *Vim functions* (a better name might be *built-in functions*) are functions built-in to Vim, like `expand()` and `append()`; built-in function start with lowercase letters.
  You can find a full list at `:help vim-function`, which is 7500+ lines long.

- *User functions* are custom Vimscript functions written by a user in their personal plugins or Vim config; their usage is documented at `:help user-function`.

In this series we'll be interested in user functions.


#### Naming functions

User-defined Vimscript should start with a capital letter.
To quote the official documentation at `:help E124`, the name of a user-defined function...

  > ... must be made of alphanumeric characters and `_`, and must start with either a capital letter or `s:` [...] to avoid confusion with built-in functions.

Starting functions with capital letters, to the best of my knowledge, is just a sensible best practice to avoid conflicts or confusion with built-in Vim functions, which are always lowercase, 
and the Vim documentation makes the capital letter requirement for user-defined functions sound more severe than it is.

Your user functions will work fine if they start with a lower-case letter, as long as they don't conflict with existing Vim functions.
(For example, Tim Pope's excellent [`vim-commentary`](https://github.com/tpope/vim-commentary) and [`vim-surround`](https://github.com/tpope/vim-surround) plugins include some lowercase function names.) 

But by using uppercase function names, you *ensure* your functions won't conflict with built-in Vim functions.
(Note that a special class of functions called *autoload functions* often intentionally start with lowercase letters, but autoload functions use a special syntax to avoid conflict with built-in Vim functions.)

#### Function definition syntax

The general syntax for defining Vimscript functions, defined at `:help E124`, is

```vim
function[!] {name}([arguments]) [range] [abort] [dict] [closure]
  " function body
endfunction
```

Anything in square brackets is optional.
Most Vimscript functions used in this series use the following syntax:

```vim
function! {name}([arguments]) abort
  " function body
endfunction
```

Here is an explanation of what each piece means:

- Adding `!` after a `function` declaration will overwrite any pre-existing functions with the same name; see `:help E127` for reference.
  This is common practice to ensure a function is reloaded whenever its parent Vimscript file is re-sourced, but will also override any functions with the same name elsewhere in your Vim configuration.

- Appending `abort` to a function definition stops function execution immediately if an error occurs during function execution (as opposed to attempting to complete the function in spite of the error).
  See `:help :function-abort` for details.
  You can also read about the optional `range`, `dict`, and `closure` keywords at `:help :func-range`, `:help :func-dict`, `:help :func-closure`, respectively, but we won't need them in this series.

- Function arguments are placed between parentheses, separated by commas, and are accessed from within the function by prepending `a:` (for "argument").
  To give you a feel for the syntax:

  ```vim
  " A function without arguments
  function MyFunction()
    echo "I don't have any arguments!"
  endfunction

  " A function with two arguments
  function MyFunction(arg1, arg2)
    echo "I have two arguments!"
    echo "Argument 1: " . a:arg1
    echo "Argument 2: " . a:arg2
    " (. is the string concatenation operator)
  endfunction
  ```

  See `:help function-argument` for documentation of how function arguments work and how to use them.

You can use the `:function` command to list all loaded user functions (expect a long list if you use plugins); consult `:help :function` for more on listing functions and finding where they were defined.

#### Tip: Best practice for naming functions

As suggested in the `PACKAGING` section of `:help 41.10`, prepend a unique, memorable string before all related functions in a Vimscript file, for example an abbreviation of the script name.
For example, a LaTeX-related script might use a `Tex` prefix, as in

```vim
function TexCompile
  " function body
endfunction

function TexForwardShow
  " function body
endfunction

" and so on...
```

Prepending a short, memorable string to related functions keeps your Vimscript more organized and also makes it less likely that function names in different scripts will conflict---if you had `Compile` functions for multiple file types, for example, using a short prefix, such as `TexCompile` and `JavaCompile`, avoids the problem of conflicting `Compile` functions in two separate scripts.

#### Note: Another way of defining functions

When defining Vimscript functions you can use either of the following:

```vim
" Overrides any existing instance of `MyFunction` currently in memory
function! MyFunction()
  " function body
endfunction

" Loads `MyFunction` only if there are no existing instances currently in memory
if !exists("MyFunction")
  function MyFunction()
    " function body
  endfunction
endif
```

Explanation: a filetype plugin is sourced every time a file of the target file type is opened.
The above techniques are two ways to make sure functions in filetype plugins are not loaded twice; the second preserves the existing definition and the first overwrites it.
The first option is more concise and readable, while the second is probably slightly more efficient, since evaluating an `if` statement is faster that overwriting and reloading a function from scratch.
But on modern hardware it is unlikely you would notice any difference in speed between the two.

### Script-local functions

Script-local functions, as the name suggests, have a scope local to the script in which they are defined.
You declare script-local functions by prepending `s:` to the function name, and they are used to avoid cluttering the global function namespace and to prevent naming conflicts across scripts.

#### Scope of script-local functions

From `:help local-function`, a script-local function can be called from the following scopes:

| if called from... | the function is accessible... |
| ----------------------------- | ----- |
| Vimscript and from within Vimscript functions | only in the parent script it was defined in |
| an autocommand defined in the parent script | anywhere |
| a user command defined in the parent script | anywhere |
| a key mapping | anywhere\* |

\* assuming you use the `<SID>` (script ID) mapping syntax, explained a few paragraphs below in the section [Calling script-local functions using SID key mappings](#sid).

#### Why use script-local functions?

Vimscript functions have two possible scopes: global and script-local (see `:help local-function`).
The Vim documentation recommends using script-local functions in all user-defined plugins to avoid conflicts in which functions in two different scripts use the same name.
Here is what the documentation at `:help local-function` has to say:

> If two scripts both defined global functions called, say, `function SomeFunctionName`, the names would conflict, because the functions are global.
One would overwrite the other, leading to confusion.
Meanwhile, if the scripts both used `function s:SomeFunctionName`, no problems would occur because the functions are script-local.

**Lesson:** using script-local functions prevents name conflicts with functions in other scripts.

**But keep in mind:** If you are not a plugin author who will distribute your Vimscript to other users, the risk of name overlap is often small, and you may decide that using script local functions is more bother than it is worth.
If you are certain your function names won't conflict with other scripts or plugins---especially if you don't intend to distribute your plugin to others---you don't need to make every function script-local.
Even well-known filetype plugins from reputable authors can include global functions, such as `MarkdownFold` and `MarkdownFoldText` in Tim Pope's [`vim-markdown`](https://github.com/tpope/vim-markdown), and everything works just fine.

In any case, if you do follow best practices and use script-local functions, the following section describes how to call the functions with key mappings outside of the script in which the functions were defined.

#### Calling script-local functions using SID key mappings {#sid}

In Vimscript, defining key mappings that call script-local functions is a multi-step process:

1. Pick a short, convenient key combination you will actually use to call the function.
1. Map the shortcut key combination to a `<Plug>` mapping.
1. Map the `<Plug>` mapping to a `<SID>` (script ID) mapping.
1. Use the `<SID>` mapping to call the function.

<!-- adapted from the official documentation; you can see the original source in the `PIECES` section of `:help write-plugin`. -->
Following is a concrete example of this multi-step process: we will define a script-local plugin called `s:TexCompile()` in the file `ftplugin/tex.vim`, and use the short key sequence `,c` in normal mode to call this function in all Vim buffers with the `tex` filetype.
Here is the code that would achieve this:

```vim
" In the file ftplugin/tex.vim (for instance)...

function! s:TexCompile()
  " implement compilation functionality here
endfunction

" Define key map here
nmap ,c <Plug>TexCompile
nnoremap <script> <Plug>TexCompile <SID>TexCompile
nnoremap <SID>TexCompile :call <SID>TexCompile()<CR>
```

You could then use `,c` in normal mode to call the `s:TexCompile` function from *any* file with the `tex` filetype.
(You could off course replace `,c` with whatever shortcut you wanted.)

Here's an explanation of what the above Vimscript does:

- `nmap ,c <Plug>TexCompile` maps the shortcut `,c` to the string `<Plug>TexCompile` (in normal mode because of `nmap`) using a `<Plug>` mapping, which was described earlier in this article in the section [Plug mappings](#plug-mappings).

- `nnoremap <script> <Plug>TexCompile <SID>TexCompile` maps the string `<Plug>TexCompile` to `<SID>Compile`.

- The final line maps `<SID>Compile` to the command `:call <SID>TexCompile()<CR>`, which calls the `s:TexCompile()` function (`<CR>` represents the enter key).
  Using `<SID>` before the function name, as in `<SID>TexCompile()`, allows Vim to identify the script ID of the script the function was originally defined in, which makes it possible for Vim to find and execute the function even when the mapping the calls it is used outside the original script.
  You can read more about this admittedly convoluted process at `:help <SID>`.

  It's important that `nmap ,c <Plug>TexCompile` uses `nmap` and not `nnoremap`, since it is *intended* that `<Plug>TexCompile` remaps to `<SID>Compile`.
  Using `noremap ,c <Plug>TexCompile` (instead of `nmap`) would make `,c` the equivalent of literally typing the key sequence `<Plug>TexCompile` in normal mode.

In summary, `,c` maps to `<Plug>TexCompile`, which maps to `<SID>TexCompile`, which calls the `s:TexCompile()` function.
Kind of a bother, right? Oh well, consider it a peculiarity of Vim.
And, if followed, this technique ensure functions from different scripts won't conflict, which is important for maintaining a healthy plugin ecosystem.

Note that, in principle, the `<SID>` and `<Plug>` mappings and the function name could all be different! Both of the following would let you use `,c` to call a script-local `TexCompile()` function:

```vim
nmap ,c <Plug>TexCompile
nnoremap <script> <Plug>TexCompile <SID>TexCompile
nnoremap <SID>TexCompile :call <SID>TexCompile()<CR>

nmap ,c <Plug>ABC
nnoremap <script> <Plug>ABC <SID>XYZ
nnoremap <SID>XYZ :call <SID>TexCompile()<CR>
```

But it is conventional to use similar names for the `<Plug>` mapping, `<SID` mapping, and function definition.

**Review of the big picture**

- Using script-local functions is a Vimscript best practice that prevents naming conflicts between functions with the same name in different scripts.

- Making functions script-local comes with a compromise---calling script-local functions with key mappings that work outside of the parent script requires the multi-step process using the `<SID>` keyword described above.

- The `<SID>` keyword gives each function a unique "script ID", so that it won't conflict with functions with the same name in other scripts;
  Vim expands `<SID>` to a unique script identification number when it loads script-local functions into memory.
  This script ID allows Vim to find and call the function even outside the function's parent script.

**The result:** The above mapping process makes script-local functions usable outside of the script in which they were written, but in a way that prevents conflict with mappings and functions in other plugins.

This is most relevant for plugin authors, who must ensure *their* plugin functions don't unexpectedly overwrite the personal functions of the users who installed their plugins.
If you're not a plugin author and feel sure that a function name doesn't occur anywhere else in your Vim `runtimepath` (which is reasonable if you prefix your function name with a short abbreviation of your script and have a good picture of your third-party plugins), you'll can probably get away with not using a script-local function.

### Autoload functions

I will briefly cover autoload functions here only for the sake of completeness.
You probably won't use them for your own purposes, but the VimTeX plugin makes heavy use of autoload functions, so you might run into them when browsing the VimTeX source code.

Summarizing somewhat, autoload functions are essentially an optimization to slightly lower Vim's start-up time---instead of Vim reading and loading them into memory during initial start-up, like regular functions, Vim will load autoload functions only when they are first called.
On modern hardware, the resulting decrease in start-up time will be noticeable only for a large plugin with hundreds of functions, like VimTeX.

Here is the basic workflow for using autoload functions:

- In an `autoload/` directory somewhere in your Vim `runtimepath`, create a Vimscript file, for example `my_function_script.vim`.

- Inside `autoload/my_function_script.vim`, define a function with the syntax

  ```vim
  function my_function_script#function_name()
    " function body
  endfunction
  ```

  The general naming syntax is `{filename}#{function-name}`, where
  `{filename}` must exactly match the name of the Vimscript file within which the function is defined.
  When autoloading functions, it is conventional that `function-name` starts with lowercase characters.

- When needed, call the function using `call my_function_script#function_name()`.
  
  Here is what happens: Vim recognizes the `{filename}#{function-name}` syntax, realizes the function is an autoload function, and searches all `autoload` directories in your Vim `runtimepath` for files name `filename`, then within these files searches for functions named `function_name`.
  If a match is found, a function is loaded into memory, can be called by the user, and should be visible with `:function`.

You can find official documentation of autoload functions at `:help autoload-functions`.

{{< vim-latex/navbar >}}

{{< vim-latex/license >}}
