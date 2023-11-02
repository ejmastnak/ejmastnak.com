---
title: "Supercharged LaTeX using Vim/Neovim, VimTeX, and snippets"
date: 2021-10-08
---

<script type="text/javascript" src="/helpers/carousel.js"></script>
<link rel="stylesheet" href="/helpers/carousel.css">

# A guide to supercharged mathematical typesetting

This is a tutorial series to help you set up the Vim or Neovim text editors for efficiently writing math in LaTeX.
Here is an example of what I have in mind:

{{< img-centered src="gauss.gif" width="100%" alt="GIF of a screencast showing writing LaTeX quickly using snippets." >}}

The blue bar with white text shows the keys I am typing, the bottom shows the resulting LaTeX source code, and the top is the compiled output.
More on how this works below.

{{< details summary="Wait, what are you talking about, what is LaTeX?" >}}
[LaTeX](https://www.latex-project.org/) is the industry standard typesetting software for writing papers, books, reports, etc. in mathematics, physics, computer science, and other quantitative sciences (but is mostly unknown outside this niche, so it's quite reasonable to have never heard of it).
LaTeX has a reputation for producing high-quality documents but being clumsy to type---this series presents a framework aimed at eliminating the clumsiness.
{{< /details >}}

**Goal of this guide:** make writing LaTeX as easy (fast, efficient, enjoyable...) as writing math by hand.
Tech stack: the Vim text editor using the UltiSnips or LuaSnip snippet plugin and the VimTeX plugin's LaTeX editing features.
The series should help if you...

- are interested in taking real-time lecture notes using LaTeX, à la [Gilles Castel](https://castel.dev/),
- want a LaTeX experience decidedly more pleasant and efficient than whatever you were probably first taught, whether your motivation is real-time university lecture speed or not,
- hope to switch to Vim from a different LaTeX editor, but are unsure how to proceed, or
- just want to browse someone else's workflow and configuration out of curiosity.

**What it costs you:** everything in the guide is free, but it will cost you time and effort.
You can skim through the guide in about 15-30 minutes; a closer read-through might take a few hours;
and you'll realistically need a few weekends (or perhaps a few weeks if you're new to Vim) of dedicated focus and effort to become fully functional.
From that point reaching the speed in this page's GIFs would probably take months of practice.

## Contents

1. [**Prerequisites**]({{< relref "/tutorials/vim-latex/prerequisites" >}})
   <br>
   <span class="text-sm text-gray-500 dark:text-gray-400">
   Covers prerequisites for getting the most out of the series, along with references that should get you up to speed if needed.
   </span>

1. [**UltiSnips**]({{< relref "/tutorials/vim-latex/ultisnips" >}})<span class="text-sm text-gray-500 dark:text-gray-400"> or </span>[**LuaSnip**]({{< relref "/tutorials/vim-latex/luasnip" >}})
   <br>
   <span class="text-sm text-gray-500 dark:text-gray-400">
   Explains snippets, the key to real-time LaTeX.
   Both articles cover the same content---once using the UltiSnips plugin and once using the LuaSnip plugin.
   </span>

1. [**Vim's ftplugin system**]({{< relref "/tutorials/vim-latex/ftplugin" >}})
   <br>
   <span class="text-sm text-gray-500 dark:text-gray-400">
   Introduces Vim's filetype plugin system, which will help you understand the VimTeX plugin.
   </span>

1. [**The VimTeX plugin**]({{< relref "/tutorials/vim-latex/vimtex" >}})
   <br>
   <span class="text-sm text-gray-500 dark:text-gray-400">
   The excellent VimTeX plugin is *the reason* to use Vim over another LaTeX editor.
   </span>

1. <span>[**Compilation**]({{< relref "/tutorials/vim-latex/compilation" >}})</span>
   <br>
   <span class="text-sm text-gray-500 dark:text-gray-400">
   How to compile LaTeX documents from within Vim.
   </span>

1. [**PDF reader**]({{< relref "/tutorials/vim-latex/pdf-reader" >}})
   <br>
   <span class="text-sm text-gray-500 dark:text-gray-400">
   How to integrate Vim and a PDF reader for viewing LaTeX documents.
   </span>

1. [**Vim configuration**]({{< relref "/tutorials/vim-latex/vimscript" >}})
   <br>
   <span class="text-sm text-gray-500 dark:text-gray-400">
   A Vim configuration guide explaining the key mappings and Vimscript functions used in this tutorial.
   </span>

<div class="my-8">
{{< tutorials/begin href="/tutorials/vim-latex/prerequisites" >}}
</div>

## More about the series

### Shut up and show me results

As concrete evidence that the techniques in this tutorial work, here are [1500+ pages of typeset physics notes]({{< relref "/notes/fmf/fmf" >}}) from my undergraduate studies, most of them written during university lecture in real time (although grammar and style were improved later).
Here are some examples of what these notes look like:

{{< vim-latex/carousel items="1" height="108" unit="%" duration="7000" >}}

And here are more GIFs showing that LaTeX can be written at handwriting speed:

{{< img-centered src="demo.gif" width="100%" alt="GIF of a screencast showing writing LaTeX quickly using snippets." >}}

This is actually a little *faster* than I can write by hand---try taking out a pencil and paper and see if you can keep up!
(Yes, I know I'm cheating by throwing in a bunch of hard-to-handwrite integrals.)
If you like, you can see [**more examples on YouTube**](https://www.youtube.com/watch?v=P7iMX1lqGnU).

**Credit where credit is due**: the above GIFs are inspired by Gilles Castel's video [Fast LaTeX editing with Vim and UltiSnips](https://www.youtube.com/watch?v=a7gpx0h-BuU)---it is beautifully done and I encourage you to watch it.

### The original Vim-LaTeX article

By the way: the seminal work on the subject of Vim and LaTeX, and my inspiration for attempting and ultimately succeeding in writing real-time LaTeX using Vim, is Gilles Castel's [*How I'm able to take notes in mathematics lectures using LaTeX and Vim*](https://castel.dev/post/lecture-notes-1/).
You've probably seen it on the Internet if you dabble in Vim or LaTeX circles, and you should definitely read it if you haven't yet.

This series builds on Castel's article by more thoroughly walking you through the technical implementation details (e.g. the details of setting up a PDF reader with forward and inverse search, how to use the VimTeX plugin, how to write Vimscript functions and key mappings, how Vim's `ftplugin` system works, how to compile LaTeX documents, and so on).

### Config

Here is an overview of the setup used in this series:

- Editor: [Neovim](https://neovim.io/)
- Terminal: [Alacritty](https://alacritty.org/)
- Colorscheme: [Nord](https://www.nordtheme.com/)
- Font: [Source Code Pro](https://github.com/adobe-fonts/source-code-pro) in the terminal (I've since jumped on the [Iosevka](https://github.com/be5invis/Iosevka) bandwagon) and [Inter](https://github.com/rsms/inter) on this website.
- OS: [Arch Linux](https://archlinux.org/) as a daily driver; [macOS](https://www.apple.com/macos/) for testing cross-platform functionality
- Window manager: [i3](https://i3wm.org/) on Linux; [Amethyst](https://ianyh.com/amethyst/) on macOS
- GIF recording and screen capture: [Menyoki](https://github.com/orhun/menyoki)
- Dotfiles: [`github.com/ejmastnak/dotfiles`](https://github.com/ejmastnak/dotfiles), where you can find both my main [Neovim config](https://github.com/ejmastnak/dotfiles/tree/main/config/nvim) and a smaller [Vim config](https://github.com/ejmastnak/dotfiles/tree/main/config/nvim) for testing Vim-specific inverse search features for this series.

### Feedback, suggestions, etc. {#feedback}

If you have ideas for improving the series, I will quite likely implement them, appreciate your input, and give you a shoutout for your contributions.
Feedback is welcome and appreciated.

Shoutouts to previous readers: many thanks to Andrey Rukhin, [Merlin Büge](https://github.com/camoz), [Albert Gu](https://github.com/albertfgu), Pano Otis, Jason Yao, [@Glirastes](https://github.com/Glirastes), [Daniele Avitabile](https://www.danieleavitabile.com/), Kai Breucker, Maxwell Jiang, [@lodisy](https://github.com/lodisy), and [@subnut](https://github.com/subnut) for catching mistakes and offering good ideas on how improve this series.

You can reach me by email at [elijan@ejmastnak.com](mailto:elijan@ejmastnak.com) or by opening an issue or pull request at [github.com/ejmastnak/ejmastnak.com](https://github.com/ejmastnak/ejmastnak.com)).

### Want to say thank you? {#thank-you}

You could:

- [Send me an email!]({{< relref "/contact" >}})
  Seriously, if this material helped you, it will make my day to know.
  I love hearing from readers, and you'll almost certainly get a message back from me.

- [Contribute financially.](https://www.buymeacoffee.com/ejmastnak)
  Based on reader input, there are in fact people out there interested in compensating me financially for this guide.
  That's awesome---thank you!
  You can [Buy Me a Coffee here.](https://www.buymeacoffee.com/ejmastnak)

<div class="my-8">
{{< tutorials/begin href="/tutorials/vim-latex/prerequisites" >}}
</div>

<div class="mt-6">
  {{< tutorials/license >}}
<div>
