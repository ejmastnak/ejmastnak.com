---
title: Compiling LaTeX Documents in Vim \| Vim and LaTeX Series Part 5
prevFilename: "vimtex"
prevDisplayName: "« 4. The VimTeX plugin"
nextFilename: "pdf-reader"
nextDisplayName: "6. PDF Reader »"
date: 2021-10-08
---

{{< vim-latex/navbar >}}

# 5. Compiling LaTeX Documents in a Vim-Based Workflow

{{< date-last-mod >}}

This is part five in a [seven-part series]({{< relref "/tutorials/vim-latex/intro" >}}) explaining how to use the Vim or Neovim text editors to efficiently write LaTeX documents.
This article covers compilation and should explain what you need to get started compiling LaTeX documents from within Vim using either the VimTeX plugin's compilation features or a custom compilation set-up of your own design.

{{< toc level="2" title="Contents of this article" >}}

**Background knowledge:**
- This article will make occasional references to the file `ftplugin/tex.vim`, which we will use to implement LaTeX-specific Vim configuration through Vim's filetype plugin system.
  In case you are just dropping in now and Vim's `ftplugin` system sounds unfamiliar, consider first reading through the article [3. Vim's `ftplugin` system]({{< relref "/tutorials/vim-latex/ftplugin" >}}), which covers what you need to know.

- We will also define some Vim key mappings in this article---if Vim keywords like `:map`, `<leader>`, `<localleader>`, and `<Plug>` are unfamiliar to you, consider taking a detour and reading through the final article in this series, [7. A Vim Configuration Primer for Filetype-Specific Workflows]({{< relref "/tutorials/vim-latex/vimscript" >}}), which explains everything you need to know about Vim key mappings to understand this series.

## What to read in this article

*Most users will only need to read the first part of this article.*

There are two parts in this article: 

1. Using the compilation interface provided by the VimTeX, which should work out of the box and satisfy the use cases of most users with minimal configuration;
   I cover it in the first part of this article.

1. How you can manually set up Vim's built-in `compiler` and `make` features to compile LaTeX documents "manually", without relying on the VimTeX interface (which does the same thing).

You should only read the second part of this article if...

- you are interested in understanding (a basic picture of) what happens under the hood when you call `:VimtexCompile`, and/or
- you want to write a custom compilation interface that offers you more flexibility than what ships with VimTeX.

{{< details summary="**My suggestion for new users**: use VimTeX's built-in compilation interface and only read the [first part of this article](#vimtex)." >}}
VimTeX's compilation features are tested by thousands of users, thoroughly debugged, and require minimal work to set up on your part, and so are good place to begin as a new user.
As you get more comfortable, you can come back to the second part of this article and experiment with your own compilation plugin if you're interested.

As a personal anecdote, I did the exact opposite of what I recommend now: motivated by a naive desire to build everything from scratch, I spent many hours putting together my own LaTeX compilation setup.
This was great as a learning experience but completely impractical, since it generated needless code to maintain without solving anything VimTeX hadn't already solved.
(In my wise old age I now use VimTeX's compilation features---if there is an existing solution to your problem, use it!)
{{< /details >}}

## Using VimTeX's compilation interface {#vimtex}

### TLDR

Here is a short summary:

- Ensure the `latexmk` and `pdflatex` programs are installed on your system ([reminder of the prerequisites for this series]({{< relref "/tutorials/vim-latex/prerequisites" >}})).
- Compile LaTeX documents from within Vim using the command `:VimtexCompile`, which you can either type directly as a Vim command or access with the default VimTeX mapping `<localleader>ll`.

  {{< details summary="If words like `:map`, `<leader>`, and `<localleader>` are unfamiliar to you..." >}}
  ...consider taking a detour and reading through the final article in this series, [7. A Vim Configuration Primer for Filetype-Specific Workflows]({{< relref "/tutorials/vim-latex/vimscript" >}}), which explains everything you need to know about Vim key mappings to understand this series (the `<leader>` and `<localleader>` concepts also apply if you use Neovim and Lua).
  {{< /details >}}

- Optionally, if you don't like `<localleader>ll` as the compilation shortcut, [define a custom mapping](#compilation-shortcut) to call `:VimtexCompile` and use that instead.

Following is a more detailed description.

### How VimTeX's compilation interface works

VimTeX provides a variety of compilation backends, which can in turn use different LaTeX engines to perform actual compilation.
Here is a short summary:

- VimTeX's uses `latexmk` as the default compiler backend.
  This should work well for most users, and I will cover only the default `latexmk` backend in this article.
  See `:help g:vimtex_compiler_method` if you want to use something else.
- The default LaTeX engine used by the `latexmk` backend is `pdflatex`, which should again work well for most users.
  If you want to use something else (for example LuaLaTeX or XeLaTeX), read through `:help g:vimtex_compiler_latexmk_engines`.

- VimTeX offers both continuous and "single-shot" compilation via the commands `:VimtexCompile` and `:VimtexCompileSS`, respectively.
  In continuous compilation mode, which you turn on with `:VimtexCompile`, `latexmk` automatically recompiles your LaTeX document after every file change until you call `:VimtexStop`.
  In single-shot mode, `latexmk` will only compile your document when you explicitly call `:VimtexCompileSS`, which is roughly the equivalent of running `latexmk your-document.tex` on a command line.
  
  In a continuous compilation workflow, you would typically open your document, call `:VimtexCompile` once, and forget about compilation until you close the document.
  In a more traditional "single-shot" workflow, you would open a LaTeX document, make some edits, and then call `:VimtexCompileSS` whenever you're ready to see the changes reflected in the corresponding PDF.

  For more information, consult `:help vimtex-compiler` and the references therein.

- You can configure VimTeX's `latexmk` compiler using the dictionary-like variable `g:vimtex_compiler_latexmk`; see `:help g:vimtex_compiler_latexmk` if interested.
  The default values should work well for most users.

  You can get a summary of your compiler status using the command `VimtexInfo`;
  a default set-up will produce something like this:

  ```bash
  # Example output of VimtexInfo, showing compilation information
  compiler: latexmk      # the VimTeX compiler backend in use
    engine: -pdf         # the LaTeX engine uesd by `latexmk`
    options:             # command-line options used by `latexmk`
      -verbose
      -file-line-error
      -synctex=1
      -interaction=nonstopmode
    callback: 1          # whether to run VimTeX's callbacks after compilation completes 
    continuous: 1        # whether `latexmk` should run in continuous mode
    executable: latexmk  # the name of the `latexmk` executable
  ```

  If interested, you can read more about what these options do [in the second part of this article](#pdflatex-latexmk).

### Shortcut for compilation {#compilation-shortcut}
You can always manually type out the commands `:VimtexCompile` or `:VimtexCompileSS` to start compilation.
But since all that typing is inefficient, VimTeX offers  `<localleader>ll` as a default shortcut for calling `:VimtexCompile`, meaning you can type `<localleader>ll` (in normal mode) to trigger the `:VimtexCompile` command.

If you prefer, setting your own shortcut is really easy!
For example, to use `<localleader>c` to trigger compilation, place the following code in your `ftplugin/tex.vim` file:

```vim
" Use `<localleader>c` to trigger continuous compilation...
nmap <localleader>c <Plug>(vimtex-compile)

" ...or single-shot compilation, if you prefer.
nmap <localleader>c <Plug>(vimtex-compile-ss)
```

You could then use the shortcut `<localleader>c` in normal mode to call either `:VimtexCompile` or `:VimtexCompileSS`, depending on your choice of continuous or single-shot compilation.
In case you are just dropping in now, modifying VimTeX's default behavior was described in more detail in the [previous article in this series]({{< relref "/tutorials/vim-latex/vimtex" >}}).

You can also use Vim's built-in `:update` command to make Vim automatically save your document before single-shot compilation (to ensure you compile the most recent version of your source code):

```vim
" Use `update` to ensure document is saved before single-shot compilation
noremap <localleader>c <Cmd>update<CR><Cmd>VimtexCompileSS<CR>
```
Using `update` is redundant and therefore omitted for continuous compilation, which requires you to save the document in the first place before compilation runs.
Note that, because the above is not a `<Plug>` mapping to `<Plug>(vimtex-compile)` (which is tricky to combine with the `:update` command), this mapping will *not* override VimTeX's default `<localleader>ll` shortcut for triggering compilation.

Aside: The above mapping uses the `<Cmd>` keyword (see `:help map-cmd` for documentation), which lets you call commands directly without switching Vim modes.
The final article in the series, [7. A Vim Configuration Primer for Filetype-Specific Workflows]({{< relref "/tutorials/vim-latex/vimscript" >}}), explains key mappings in more detail.

### A QuickFix menu crash course {#quickfix}

After compiling with `:VimtexCompile` or `:VimtexCompileSS`, VimTeX will automatically open the QuickFix menu if warnings or errors occurred during compilation (the QuickFix menu stays closed if compilation completes successfully).
For most compilation errors, the QuickFix menu will display the error's line number and a (hopefully) useful error message.
In such cases you can use the Vim commands `:cc` and `:cn` (short for `:cnext`, which also works), to jump directly to the offending line.

Here is an example in which VimTeX detects missing inline math around the math-mode `\int` command,
recognizes that the error occurs on line `8`,
and displays the LaTeX error `Missing $ inserted` in the QuickFix menu.
After the error is fixed, the QuickFix menu disappears.

{{< img-centered src="quickfix-error-short.gif" width="100%" alt="GIF demonstrating the QuickFix menu showing LaTeX errors after failed compilation." >}}

Here are two VimTeX-related QuickFix settings you might be interested in tweaking:
- By default, VimTeX opens the QuickFix menu if compilation produces warning messages but no error messages.
  LaTeX's warning messages are often unhelpful, so some users will want to open the QuickFix menu only if compilation fails with error messages.
  To do this, place the following code in your `ftplugin/tex.vim` file:

  ```vim
  " Don't open QuickFix for warning messages if no errors are present
  let g:vimtex_quickfix_open_on_warning = 0  
  ```

  See `:help g:vimtex_quickfix_open_on_warning` for the official documentation.

- VimTeX makes it easy to filter out undesirable warning messages produced during LaTeX compilation.
  To do so, use the variable `g:vimtex_quickfix_ignore_filters` to define a set of Vim regular expression filters;
  the compilation messages that match these filters will then disappear from the QuickFix menu.
  See `:help regular-expression` for a review of Vim's regular expression syntax; here are some examples to get you started:

  ```vim
  " Filter out some compilation warning messages from QuickFix display
  let g:vimtex_quickfix_ignore_filters = [
        \ 'Underfull \\hbox',
        \ 'Overfull \\hbox',
        \ 'LaTeX Warning: .\+ float specifier changed to',
        \ 'LaTeX hooks Warning',
        \ 'Package siunitx Warning: Detected the "physics" package:',
        \ 'Package hyperref Warning: Token not allowed in a PDF string',
        \]
  ```

VimTeX's QuickFix behavior is quite configurable, and I suggest you read through the VimTeX documentation beginning at `:help g:vimtex_quickfix_enabled` and ending at `:help g:vimtex_quickfix_open_on_warning` to see if anything catches your eye.
In fact, consider reading through the entire VimTeX compilation documentation---see `:help vimtex-compiler` and the references therein.
VimTeX offers plenty of compilation goodies beyond the scope of this article that you might be interested in discovering and experimenting with yourself.

*The rest of this article is relevant only if you are interested in writing your own compiler plugin.
 If you are satisfied with what VimTeX provides, feel free to skip to the [next article in this series]({{< relref "/tutorials/vim-latex/pdf-reader" >}}).*

## How to use `pdflatex` and `latexmk` {#pdflatex-latexmk}

This section is written for new users who have not worked directly with  `pdflatex` and `latexmk` before;
if you are familiar with these programs, feel free to jump ahead to the section [Writing a simple LaTeX compiler plugin](#compiler).

### About pdflatex and latexmk

Both `pdflatex` and `latexmk` are command line programs that read a plain text LaTeX file as input and produce a PDF file as output.
In this context, the process of turning plain text LaTeX code into a PDF is called *compilation*.
This guide covers two related compilation programs:

- `pdflatex` ships by default with any standard LaTeX installation and is the standard method for converting LaTeX files into PDFs.
- `latexmk` is a Perl script used to fully automate compiling complicated LaTeX documents with cross-references and bibliographies.
  The `latexmk` script actually calls `pdflatex` (or similar programs) under the hood, and automatically determines exactly how many `pdflatex` runs are needed to properly compile a document.
  In practice, one uses `latexmk` to ensure all cross-reference are resolved and that a document's bibliography renders correctly.

Online and GUI LaTeX editors you might already know, such as Overleaf, TeXShop, or Texmaker, also compile LaTeX documents with `latexmk` or `pdflatex` (or similar command line programs) under the hood.
You just don't see this directly because the `pdflatex` calls are hidden behind a graphical interface.

  To get useful functionality from `pdflatex` and `latexmk` you'll need to specify some command line options.
  The two sections below explain the options for both `pdflatex` and `latexmk` that have served me well over the past few years---these could be a good starting point if you are new to command line compilation.

### Possible options for pdflatex {#pdflatex}

The full `pdflatex` command I use to compile `tex` files, with all options shown, is

  ```bash
  pdflatex -file-line-error -halt-on-error -interaction=nonstopmode -output-dir={output-directory} -synctex=1 {sourcefile.tex}
  ```
  where
  - `{sourcefile.tex}` represents the full path to the `tex` file you wish to compile (e.g. `~/Documents/myfile.tex`), and
  - `{output-directory}` represents the full path to the directory you want the compilation's output files (e.g. PDF files, log files, SyncTeX files, etc...) to go.
    The output directory should generally be set to the parent directory of `sourcefile.tex`.

You can find full documentation of `pdflatex` options by running `man pdflatex` on a command line; for our purposes, here is an explanation of each option used above:

- `-file-line-error` prints error  messages in the form `file:line:error`.
  As a concrete example, here is what the command `pdflatex -file-line-error ~/test/myfile.tex` reports if I incorrectly leave out the `\item` command in an `itemize` environment on line 15 of the file `test.tex`:

  ```txt
  /home/user/test/test.tex:15: LaTeX Error: Something's wrong--perhaps a missing item
  ```

  Notice how the log message matches the `file:line:error` format: the file is `/home/user/test/test.tex`, the line number is `15`, and the error is `LaTeX Error: Something's wrong--perhaps a missing item`.
  The `-file-line-error` format makes it easier to parse LaTeX compilation log messages using Vim's `errorformat` functionality, which is covered in more detail below in the section on [implementing error message parsing](#error-parse).

- `-halt-on-error` exits `pdflatex` immediately if an error is encountered during compilation (instead of attempting to continue compiling the document in spite of the error)

- `-interaction=nonstopmode` sets `pdflatex`'s run mode to not stop on errors.
  The idea is to use `-interaction=nonstopmode` *together* with `-halt-on-error`  to halt compilation at the first error and return control to the parent process/program from which `pdflatex` was run.

  If you're curious for official documentation of the other possible values of the `interaction` option,
  open on a command line and run `texdoc texbytopic`, which opens a PDF manual (you'll need an installation of TeX Live or similar to access `texdoc`).
  In the PDF, search for the chapter `Running TeX` (chapter 32 at the time of writing) and find the subsection `Run modes` (subsection 32.2 at the time of writing), where you will find TeX's run modes explained; the possible values of the `-interaction` option for `pdflatex` have the same effect.

- `-output-dir={output-directory}` writes the files outputted by the compilation process into the directory `{output-directory}` (instead of the current working directory from which `pdflatex` was run).
  I set `directory` equal to the parent directory of the to-be-compiled `tex` file; e.g. to compile `~/Documents/tex-files/myfile.tex` I would use `output-directory=~/Documents/tex-files`.

  Here is why manually setting `pdflatex`'s `-output-dir` option is useful:
  suppose you open Vim to edit `file1.tex`, then, in the same Vim instance, switch to editing `file2.tex`.
  By default, Vim's current working directory will still be `file1.tex`'s parent directory even after switching to `file2.tex` 
  (unless you manually update Vim's working directory with the `:cd` command; see `:help cd`),
  so if you compile `file2.tex` without setting `pdflatex`'s `-output-dir` option to `file2.tex`'s parent directory, the output files from compiling `file2.tex` will end up in `file1.tex`'s parent directory.
  Setting `-output-dir` to `file2.tex`'s parent directory solves this problem.

- `synctex=1` generates SyncTeX data for the compiled file, which enables inverse search between a PDF reader and the `tex` source file; more on this in the article [6. Setting Up a PDF Reader for Writing LaTeX with Vim]({{< relref "/tutorials/vim-latex/pdf-reader" >}}).

  Using `synctex=1` saves the `synctex` data in a `gz` archive with the extension `.synctex.gz`.
  Possible values of the `synctex` argument other than `1` are documented under `man synctex`

### Possible options for latexmk

When compiling `tex` files with `latexmk` instead of with `pdflatex`, I use the command

```bash
latexmk -pdf -output-directory={output-directory} {sourcefile.tex}
```
*together with the following* `latexmkrc` *file*:

```bash
# This file lives at ~/.config/latexmk/latexmkrc
# and contains the single line...
$pdflatex = "pdflatex -file-line-error -halt-on-error -interaction=nonstopmode -synctex=1";
```

First, regarding the options in the `latexmk` call itself:

- `-pdf` tells `latexmk` to compile using `pdflatex`, which creates a PDF output file.

- `-output-dir={output-directory}` has the same role as in the section on [options for pdflatex](#pdflatex).

The `latexmkrc` file configures `latexmk`'s default behaviour; the `$pdflatex = "..."` line in the `latexmkrc` specifies the options `latexmk` should use when using `pdflatex` for compilation.
This saves specifying `pdflatex` options by hand on every `latexmk` call.
Note that these options match the options for the `pdflatex` calls described in the section on [options for pdflatex](#pdflatex).

You should put your `latexmkrc` file in one of the following locations:

- `~/.config/latexmk/latexmkrc` (or `XDG_CONFIG_HOME/latexmk/latexmkrc` if you use `XDG_CONFIG_HOME`), or
- `~/.latexmkrc`.

The `latexmkrc` file's usage is documented in `man latexmkrc` under the section `CONFIGURATION/INITIALIZATION (RC) FILES`.
The `latexmk` program is well-documented in general; see`man latexmk` for far more information than is covered here, including the possibility of fancy features like continuous compilation.

### You can use other options, too

The `pdflatex` and `latexmk` commands and options described above are by no means the definitive way to compile LaTeX documents.
Consider them a starting point based on what has served me well during my undergraduate studies.
I encourage you to read through the `pdflatex` and `latexmk` documentation and experiment with what works for you.

### Warning: compiling when using the minted package

The [`minted` package](https://github.com/gpoore/minted) provides expressive syntax highlighting for LaTeX documents, which is useful when you include samples of computer code in your LaTeX documents.
(If you don't use `minted`, feel free to skip this section.)

<!-- **TODO:** Here is an image of a code block highlighted using `minted`: -->

The `minted` package works by leveraging the [Pygments syntax highlighting library](https://github.com/pygments/pygments).
For `minted` to have access to Pygments during compilation, you *must compile LaTeX documents with `pdflatex` or `latexmk`'s `-shell-escape` option* enabled.
A `pdflatex` call with `-shell-escape` enabled might look like this:

```bash
pdflatex -shell-escape myfile.tex
```

However, as warned in Section 3.1 (Basic Usage/Preliminary) of the [`minted` documentation](https://tug.ctan.org/macros/latex/contrib/minted/minted.pdf), using `-shell-escape` is a security risk:

> Using `-shell-escape` allows LaTeX to run potentially
arbitrary commands on your system. It is probably best to use `-shell-escape` only when you need it, and to use it only with [LaTeX] documents from trusted sources.

Basically the lessons here are:
- If you want highlighted code blocks, use the `minted` package.
- For `minted` to work, you must enable `-shell-escape` during compilation.
- If you want to follow best practices, only use `-shell-escape` if you're sure your LaTeX document doesn't contain or call malicious code, and disable `-shell-escape` if you don't need it.
  (Of course, if you wrote the LaTeX document yourself, you should have nothing to worry about.)

  The idea of malicious LaTeX code might sound strange, and I am not sure myself what the details of implementation would look like (if anyone knows please write, and I'll update this article).
  But I trust that the `minted` developers know more than I do, and so consider `-shell-escape` a security risk to be aware of.

## Writing a simple LaTeX compiler plugin by hand {#compiler}

Here is the big picture:

> We need a convenient way to call `pdflatex` or `latexmk`, which are *command-line programs* (and are usually run as shell commands from a terminal emulator), from *within Vim*.

Vim has a built-in `compiler` feature for doing just that.
For full documentation, you can read through `:help :compiler`, `:help make_makeprg`, `:help makeprg` and `:help write-compiler-plugin`.
For our purposes, at least for getting started,

- Vim has a built-in system for easily compiling documents using shell commands of your choice.
- You use Vim's `makeprg` option to store the shell command you want to use to compile a document.
- You use Vim's `errorformat` option to specify how to parse the compilation command's output log for errors.
- You use Vim's `:make` command to trigger the compilation command stored in `makeprg`.
- You can view the command's output, along with any errors, in an IDE-style QuickFix menu built in to Vim, which you can open with `:copen`.

This section will explain:

- how to translate the `pdflatex` and `latexmk` commands described earlier in this article at [How to use `pdflatex` and `latexmk`](#pdflatex-latexmk) into something understood by Vim's `makeprg` option,
- writing a Vimscript function for easily toggling between `pdflatex` and `latexmk` compilation, and mapping this to a convenient keyboard shortcut, and
- setting Vim's `errorformat` option to correctly parse LaTeX errors.

For `minted` package users, a Vimscript function for easily toggling `-shell-escape` compilation on and off, and a simple way to detect the `minted` package in a file's preamble and enable `-shell-escape` compilation if `minted` is detected, are included in the [appendix](#appendix).
If you just want to see the final script, you can jump to the section [Complete compiler plugin](#complete-plugin).

### File structure

Compiler plugins should be stored in Vim's `~/.vim/compiler/` directory (you might need to create a `compiler` directory if you don't have one yet).
For a LaTeX compiler plugin, create the file `~/.vim/compiler/tex.vim` (you could name it whatever you want, e.g. `mytex.vim`, but using the name of the target file type---in this case `tex`---is conventional).
For orientation, here are the relevant parts of my Vim directory tree:

```bash
${HOME}/.vim/       # or ${HOME}/.config/nvim/ for Neovim
├── compiler/
│   └── tex.vim
└── ftplugin/
    └── tex.vim
# other directories ommitted...
```

### Aside: Specifying file names with Vim's file macros

Of course, to actually to compile a file, you need to specify the file's name.
Vim provides a set of macros and modifiers that makes it easy to reference the current file, but the syntax is a little weird if you haven't seen it before.
It might be easiest with a concrete example: consider a LaTeX file with the path `~/Documents/demo/myfile.tex`, and suppose Vim was launched from inside the `myfile.tex`'s parent directory `~/Documents/demo/` to edit `myfile.tex` (so that Vim's working directory is `~/Documents/demo/`).
In this case...

| Macro | General meaning | For the above example |
| ----- | ------- | -------------- |
| `%` | the current file relative to Vim's working directory | `myfile.tex` |
| `%:p` | the current file expressed as a full path | `~/Documents/demo/myfile.tex` |
| `%:h` | the file's parent directory relative to Vim's working directory | `.` |
| `%:r` | the file's root (last extension removed) | `myfile` |

The macros and their modifiers can also be combined, for example:

| Macro | Meaning | For the above example |
| ----- | ------- | -------------- |
| `%:p:h` | full path to file's parent directory | `~/Documents/demo` |
| `%:p:r` | full path to file, without extension | `~/Documents/demo/myfile` |

These are all the modifiers we need for this series, but there are quite a few more.
If you're curious, you can read more about the `%` macro in `:help cmdline-special` and about the various modifiers in `:help filename-modifiers`.
For orientation, you can always try evaluating the macro expressions yourself in Vim, for example with `:echo expand('%')` or `:echo expand('%:p:h')`.

### Compilation commands using Vim filename macros

For review, to save you from scrolling back up, the compilation commands suggested earlier in this article in the section [How to use `pdflatex` and `latexmk`](#pdflatex-latexmk) were:

```bash
pdflatex -file-line-error -halt-on-error -interaction=nonstopmode -output-dir={output-directory} -synctex=1 {sourcefile.tex}
latexmk -pdf -output-directory={output-directory} {sourcefile.tex}
```

Using Vim's macros, `{output-directory}` is replaced by `%:h` and `{sourcefile.tex}` is replaced with `%`, and the result is

```bash
pdflatex -file-line-error -halt-on-error -interaction=nonstopmode -output-dir=%:h -synctex=1 %
latexmk -pdf -output-directory=%:h %
```

### Choosing a Vim `makeprg` option

Vim's `makeprg` option is used to store shell-style compilation commands.
You have two ways to set `makeprg`:

1. Set `makeprg` directly using `:set` or `:setlocal`, in which case you must escape spaces with `\`.
   For example, you would use the following code to set `makeprg` to the command `latexmk -pdf -output-directory=%:h %`:

   ```vim
   " This code would go in compiler/tex.vim
   setlocal makeprg=latexmk\ -pdf\ -output-directory=%:h\ %
   ```

2. Store the desired value of `makeprg` in a variable as a literal Vimscript string (in which case you don't need to escape spaces),
   then programmatically set the `makeprg` option to the value of the variable with Vim's `:let &{option}` syntax:

   ```vim
   " This code would go in compiler/tex.vim

   " First create a script-local variable `s:latexmk` to store the latexmk command
   let s:latexmk = 'latexmk -pdf -output-directory=%:h %'

   " Then set `makeprg` to the value of `s:latexmk`
   let &l:makeprg = expand(s:latexmk)
   ```

   Using `let &l:{option}` is the buffer-local equivalent of `:let &{option}` (just like `:setlocal` is the buffer-local equivalent of `:set`).
   See `:help :let-&` for documentation.

In either case, once you have set `makeprg`, you can compile the current LaTeX document with the Vim command `:make`.
(I recommend checking the value of `makeprg` with `:echo &makeprg` to see that it has changed from its default value, which is `make`, to whatever custom command you set.)
   
### Toggling between pdflatex and latexmk compilation

If you only want to use `latexmk`, feel free to skip this section.
Here's why you might want to switch between the two:

- `pdflatex` always performs a single pass of compilation.
  This is fast, but won't always resolve cross-references (you might see a `?` symbol instead of the correct equation number for a `\ref` command, for example).
  I use `pdflatex` when I want quick visual feedback of text I just edited, but don't need all `\label`, `\ref`, and `\cite` commands to work correctly .
- `latexmk` performs as many compilation passes as needed to perfectly resolve all cross-references.
  This is slow if you just want basic visual feedback, but vital if, for example, you're about to send a paper out for publication.

If you want to toggle between compilation commands, first create a boolean-like variable, for example `b:tex_use_latexmk`, to store the current buffer's `pdflatex` or `latexmk` state.
You can then implement toggle logic as follows:

```vim
" This code would go in compiler/tex.vim

" Set `makeprg` command values for both pdflatex and latexmk
let s:pdflatex = 'pdflatex -file-line-error -interaction=nonstopmode ' .
      \ '-halt-on-error -synctex=1 -output-directory=%:h %'
" (Using '\' just continues a Vimscript expression on a new line for better readability)
let s:latexmk = 'latexmk -pdf -output-directory=%:h %'

" Create a variable to store pdflatex/latexmk state
" Possible values: 1 for latexmk and 0 for pdflatex
let b:tex_use_latexmk = 0

" Toggles between latexmk and pdflatex
function! s:TexToggleLatexmk() abort
  if b:tex_use_latexmk  " if latexmk is on, turn it off
    let b:tex_use_latexmk = 0
  else  " if latexmk is off, turn it on
    let b:tex_use_latexmk = 1
  endif
  call s:TexSetMakePrg()  " update Vim's `makeprg` option
endfunction

" Sets the value of `makeprg` based on current value of `b:tex_use_latexmk`
function! s:TexSetMakePrg() abort
  if b:tex_use_latexmk
    let &l:makeprg = expand(s:latexmk)
  else
    let &l:makeprg = expand(s:pdflatex)
  endif
endfunction
```

And here is some Vimscript to map the toggle function to a keyboard shortcut, for example `<leader>tl`:

```vim
" This code would go in compiler/tex.vim

" Use <leader>tl to switch between pdflatex and latexmk compilation
nmap <leader>tl <Plug>TexToggleLatexmk
nnoremap <script> <Plug>TexToggleLatexmk <SID>TexToggleLatexmk
nnoremap <SID>TexToggleLatexmk :call <SID>TexToggleLatexmk()<CR>
```

You could then use `<leader>tl` in normal mode to toggle between `pdflatex` and `latexmk` compilation.
The `<Plug>` and `<SID>` syntax for script-local mapping is explained in detail in the final article in this series, [7. A Vim Configuration Primer for Filetype-Specific Workflows]({{< relref "/tutorials/vim-latex/vimscript" >}}).

### Setting the `makeprg` option

To actually set Vim's `makeprg` option to your custom compilation command, assuming you're using the `s:TexSetMakePrg` function defined above, add the following line to `compiler/tex.vim`

```vim
call s:TexSetMakePrg()  " set value of Vim's `makeprg` option
```

### Implementing error message parsing {#error-parse}

Vim turns the `makeprg` command's log output into useful error messages using the `errorformat` option.
A properly configured `errorformat` can show you file name, line number, and error description, and also makes it easy to jump to the error location in the offending source code.
You can find the details of the `:make` and error-parsing cycle in `:help :make`, and scroll back up the section [A QuickFix menu crash course](#quickfix) for a GIF of the QuickFix menu in action.

Vim's `errorformat` uses a similar format to the C function `scanf`, which is rather cryptic to new users.
I won't cover `errorformat` design in this series, and will only quote some `errorformat` values, taken from the [VimTeX](https://github.com/lervag/vimtex) plugin, that should satisfy most use cases.
If inspired, see `:help errorformat` for documentation.

The following `errorformat` is a trimmed-down version of the VimTeX plugin's `errorformat`.
If you're interested, the original source code can be found at the time of writing on the VimTeX GitHub page on [line 25 of `vimtex/autoload/vimtex/qf/latexlog.vim`](https://github.com/lervag/vimtex/blob/master/autoload/vimtex/qf/latexlog.vim#L25) (although the exact line number may change in future VimTeX releases).

```vim
" This code would go in compiler/tex.vim
" The code code sets Vim's errorformat for compiling LaTeX.
" Important: The errorformat used below works only if the LaTeX source 
" file is compiled with pdflatex's `-file-line-error` option enabled.

" Match file name
setlocal errorformat=%-P**%f
setlocal errorformat+=%-P**\"%f\"

" Match LaTeX errors
setlocal errorformat+=%E!\ LaTeX\ %trror:\ %m
setlocal errorformat+=%E%f:%l:\ %m
setlocal errorformat+=%E!\ %m

" More info for undefined control sequences
setlocal errorformat+=%Z<argument>\ %m

" More info for some errors
setlocal errorformat+=%Cl.%l\ %m

" Catch-all to ignore unmatched lines
setlocal errorformat+=%-G%.%#
```

**Important:** this `errorformat` will only work if `pdflatex` or `latexmk` are used with the `-file-line-error` option, as suggested earlier in this article in the section [How to use `pdflatex` and `latexmk`](#pdflatex-latexmk).

## Asynchronous compilation with `vim-dispatch` {#async}

*Note: thanks to developments after I wrote this article, both Vim and Neovim now offer built-in asynchronous job management. You no longer need to rely on a third-party plugin like Vim Dispatch to run jobs asynchronously. If interested, see `:help job` on Neovim and `:help channel` on Vim, but know that Dispatch is still a good solution and considerably simpler to configure than native job management.*

This is the final step, and thankfully the implementation is quite simple.
First, here is the big picture:

### The big picture

- Problem: Vim's built-in `:make` and command-line functionality run *synchronously*---this means Vim freezes until the make command finishes executing.
For execution times over a few hundreds of milliseconds (and compiling large projects can take tens of *seconds*), this delay is unacceptable.
Try running `:!pdflatex %` on a large LaTeX file (or use this article's custom `:make` if you have everything up and running) and see for yourself---you won't be able to type, move the cursor, or otherwise interact with Vim until compilation finishes.
Put simply, that sucks.

- Solution: use an *asynchronous build plugin* (or use Vim/Neovim's built-in asynchronous job management; [see the note just above](#async)).

### Asynchronous build plugins

Asynchronous build plugins allow you to run shell commands asynchronously from within Vim without freezing up your editor.
For this series I recommend using Tim Pope's [`vim-dispatch`](https://github.com/tpope/vim-dispatch).
You can install Dispatch, just like any other Vim plugin, with the installation method of your choice.

Dispatch provides a `:Make` command that serves as an asynchronous equivalents of `:make`.
Here is a concrete example:

```bash
:!pdflatex %                     # compile the current file synchronously with vanilla pdflatex
:make                            # compile *synchronously* using current `makeprg` settings
:Make                            # compile *asynchronously* using `makeprg` and Dispatch
```

### Setting up Dispatch to use your compiler settings

Thankfully this is very simple---like with most Tim Pope plugins, Dispatch does the heavy lifting under the hood, and the plugin should "just work".
Here's what to do:

1. Install Tim Pope's [Dispatch plugin](https://github.com/tpope/vim-dispatch) just like you would any other Vim plugin.

1. Assuming that you used `compiler/tex.vim` as the name of the compiler plugin described earlier in this article in the section [Writing a simple LaTeX compiler plugin](#compiler),
   somewhere inside `ftplugin/tex.vim` include the line

   ```vim
   " Load the compiler settings in the file `compiler/tex.vim`
   compiler tex
   ```

   This line loads the compiler settings in the compiler plugin `compiler/tex.vim`.
   More generally, the name following `compiler` must match the base filename of the target compiler plugin in your `compiler/` folder.
   For example, to use `compiler/tex.vim` use `compiler tex`, to use `compiler/mytex.vim` use `compiler mytex`, to use `compiler/asdasadg.vim`, use `compiler asdasadg`, etc...

1. In Vim, use the Dispatch-provided command `:Make` to compile LaTeX documents.
   That's it! (Loosely, `:Make` is an asynchronous version of `:make`, and will automatically pick up your current `compiler` settings.
   Assuming you have properly set Vim's `:makeprg` option, everything should "just work".)

1. Optionally, create a convenient key mapping to call `:Make`, for example

   ```vim
   " Use <leader>m in normal mode to call `:Make`
   noremap <leader>m <Cmd>Make<CR>
   ```
   You could then use `<leader>m` in normal mode to call the `:Make` command---of course change `<leader>m` to whatever key combination you prefer.

For more details on the Vim Dispatch plugin, including how to tinker with its various job handlers (e.g. opening a Vim `terminal`, using a `tmux` window, going into headless mode to suppress output, etc...), see the Vim Dispatch documentation at `:help dispatch`.
  
## Appendix

### Implementing `minted` detection and using `--shell-escape`

Feel free to ignore this section if you don't use `minted` for code highlighting and have no needed for `shell-escape` compilation.
The logic for toggling `-shell-escape` on and off is the same as for toggling between `pdflatex` and `latexmk`.

```vim
" Create a variable to store shell-escape state
let b:tex_use_shell_escape = 0

" Toggles shell escape compilation on and off
function! s:TexToggleShellEscape() abort
  if b:tex_use_shell_escape  " turn off shell escape
    let b:tex_use_shell_escape = 0
  else  " turn on shell escape
    let b:tex_use_shell_escape = 1
  endif
  call s:TexSetMakePrg()     " update Vim's `makeprg` option
endfunction
```

The `TexSetMakePrg` function would then need to be generalized to

```vim
" Sets the value of `makeprg` based on current values of both
" `b:tex_use_latexmk` and `b:tex_use_shell_escape`.
function! s:TexSetMakePrg() abort
  if b:tex_use_latexmk
    let &l:makeprg = expand(s:latexmk)
  else
    let &l:makeprg = expand(s:pdflatex)
  endif
  if b:tex_use_shell_escape
    let &l:makeprg = &makeprg . ' -shell-escape'
  endif
endfunction
```

And here is some Vimscript to let you call the `TexToggleShellEscape()` function with a keyboard shortcut, e.g. `<leader>te`:

```vim
" This code would go in compiler/tex.vim
" Use <leader>te to toggle -shell-escape compilation on and off
nmap <leader>te <Plug>TexToggleShellEscape
nnoremap <script> <Plug>TexToggleShellEscape <SID>TexToggleShellEscape
nnoremap <SID>TexToggleShellEscape :call <SID>TexToggleShellEscape()<CR>
```

You could then use `<leader>te` in normal mode to toggle `-shell-escape` compilation on and off.
See the final article in this series, [7. A Vim Configuration Primer for Filetype-Specific Workflows]({{< relref "/tutorials/vim-latex/vimscript" >}}), for an explanation of the `<Plug>` and `<SID>` syntax.

**A simple way to automatically detect `minted`**

Finally, here is a (naive but functional) way to detect `minted` using the Unix utilities `sed` and `grep`:

```vim
" Create a variable to store shell-escape state
" Possible values: 0 for shell-escape off; 1 for shell-escape on
let b:tex_use_shell_escape = 0

" Enable shell-escape if the minted package is detected in a just-opened tex file's preamble
silent execute '!sed "/\\begin{document}/q" ' . expand('%') . ' | grep "minted" > /dev/null'
if v:shell_error  " 'minted' not found in preamble
  let b:tex_use_shell_escape = 0  " disable shell escape
else  " search was successful; 'minted' found in preamble
  let b:tex_use_shell_escape = 1  " enable shell escape
endif
```

On the command line, without all the extra Vimscript jargon, the `sed` and `grep` call would read

```bash
sed "/\\begin{document}/q" myfile.tex | grep "minted" > /dev/null
```

The `sed` call reads the file's preamble (and quits at `\begin{document}`), and the output is piped into a `grep` search for the string `"minted"`.
I then use Vim's `v:shell_error` variable to check the `grep` command's exit status---if the search is successful, I update `b:tex_use_shell_escape`'s value to enable shell escape.

This command is naive, I'm sure.
Aside from probably being inefficient, it won't work, for example, if you keep your preamble in a separate file and access it with the `\input` command.
If you know a better way, e.g. with some `awk` magic, please tell me and I'll update this article.

However, even if the automatic `minted` detection does not work, you can always manually toggle shell escape compilation on and off using the key mapping from a few paragraphs above that calls the `TexToggleShellEscape()` function.

### Complete compiler plugin {#complete-plugin}

(The code is explained earlier in this article in the section [writing a simple LaTeX compiler plugin](#compiler).)

```vim
" Settings for compiling LaTeX documents
if exists("current_compiler")
	finish
endif
let current_compiler = "tex"

" Set make programs for both pdflatex and latexmk
let s:pdflatex = 'pdflatex -file-line-error -interaction=nonstopmode ' .
      \ '-halt-on-error -synctex=1 -output-directory=%:h %'
let s:latexmk = 'latexmk -pdf -output-directory=%:h %'

" Create variables to store pdflatex/latexmk and shell-escape state
let b:tex_use_latexmk = 0
let b:tex_use_shell_escape = 0


" Search for the minted package in the document preamble.
" Enable b:tex_use_shell_escape if the minted package
" is detected in the tex file's preamble.
" --------------------------------------------- "
silent execute '!sed "/\\begin{document}/q" ' . expand('%') . ' | grep "minted" > /dev/null'
if v:shell_error  " 'minted' not found in preamble
  let b:tex_use_shell_escape = 0  " disable shell escape
else  " 'minted' found in preamble
  let b:tex_use_shell_escape = 1  " enable shell escape
endif


" User-defined functions
" ------------------------------------------- "
" Toggles between latexmk and pdflatex
function! s:TexToggleLatexmk() abort
  if b:tex_use_latexmk    " turn off latexmk
    let b:tex_use_latexmk = 0
  else  " turn on latexmk
    let b:tex_use_latexmk = 1
  endif
  call s:TexSetMakePrg()  " update Vim's `makeprg` option
endfunction

" Toggles shell escape compilation on and off
function! s:TexToggleShellEscape() abort
  if b:tex_use_shell_escape  " turn off shell escape
    let b:tex_use_shell_escape = 0
  else  " turn on shell escape
    let b:tex_use_shell_escape = 1
  endif
  call s:TexSetMakePrg()     " update Vim's `makeprg` option
endfunction

" Sets correct value of `makeprg` based on current values of
" both `b:tex_use_latexmk` and `b:tex_use_shell_escape`
function! s:TexSetMakePrg() abort
  if b:tex_use_latexmk
    let &l:makeprg = expand(s:latexmk)
  else
    let &l:makeprg = expand(s:pdflatex)
  endif
  if b:tex_use_shell_escape
    let &l:makeprg = &makeprg . ' -shell-escape'
  endif
endfunction


" Key mappings for functions
" ---------------------------------------------
" TexToggleShellEscape
nmap <leader>te <Plug>TexToggleShellEscape
nnoremap <script> <Plug>TexToggleShellEscape <SID>TexToggleShellEscape
nnoremap <SID>TexToggleShellEscape :call <SID>TexToggleShellEscape()<CR>

" TexToggleLatexmk
nmap <leader>tl <Plug>TexToggleLatexmk
nnoremap <script> <Plug>TexToggleLatexmk <SID>TexToggleLatexmk
nnoremap <SID>TexToggleLatexmk :call <SID>TexToggleLatexmk()<CR>


" Set Vim's `makeprg` and `errorformat` options
" ---------------------------------------------
call s:TexSetMakePrg()  " set value of Vim's `makeprg` option

" Note: The errorformat used below assumes the tex source file is 
" compiled with pdflatex's -file-line-error option enabled.
setlocal errorformat=%-P**%f
setlocal errorformat+=%-P**\"%f\"

" Match errors
setlocal errorformat+=%E!\ LaTeX\ %trror:\ %m
setlocal errorformat+=%E%f:%l:\ %m
setlocal errorformat+=%E!\ %m

" More info for undefined control sequences
setlocal errorformat+=%Z<argument>\ %m

" More info for some errors
setlocal errorformat+=%Cl.%l\ %m

" Ignore unmatched lines
setlocal errorformat+=%-G%.%#
```

{{< vim-latex/navbar >}}

{{< vim-latex/license >}}
