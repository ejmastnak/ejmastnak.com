---
title: "Real-time LaTeX using Vim/Neovim, VimTeX, and snippets"
date: 2021-10-08
---

<script type="text/javascript" src="/helpers/carousel.js"></script>
<link rel="stylesheet" href="/helpers/carousel.css">

# Real-time LaTeX using (Neo)Vim, VimTeX, and snippets

This tutorial series will help you set up the Vim or Neovim text editors for efficiently writing LaTeX documents.
Here is an example of what I have in mind:

{{< img-centered src="gauss.gif" width="100%" alt="GIF of a screencast showing writing LaTeX quickly using snippets." >}}

The blue bar with white text shows the keys I am typing, the bottom shows the resulting LaTeX source code, and the top is the compiled output.
More on how this works below.

{{< details summary="Wait, what are you talking about, what is LaTeX?" >}}
[LaTeX](https://www.latex-project.org/) is the industry standard typesetting software for writing articles/reports/books in mathematics, physics, computer science, and other quantitative sciences (but is mostly unknown outside this niche, so it's quite reasonable to have never heard of it).
LaTeX has a reputation for producing high-quality documents but being clumsy to type---this series presents a framework aimed at eliminating the clumsiness.
{{< /details >}}

**Goal of this guide:** make writing LaTeX as easy (fast, efficient, enjoyable...) as writing math by hand.
Tech stack: the Vim text editor using the UltiSnips snippet plugin and the VimTeX plugin's LaTeX editing features.
The series should help if you...

- are interested in taking real-time lecture notes using LaTeX, à la [Gilles Castel](https://castel.dev/),
- want a LaTeX experience decidedly more pleasant and efficient than whatever you were probably first taught, whether your motivation is real-time university lecture speed or not,
- hope to switch to Vim from a different LaTeX editor, but are unsure how to proceed, or
- just want to browse someone else's workflow and configuration out of curiosity.

**What it costs you:** everything in the guide is free, but it will cost you time and effort.
You can skim through the guide in about 15-30 minutes; a closer read-through might take a few hours;
and you'll realistically need a few weekends (or perhaps a few weeks if you're new to Vim) of dedicated focus and effort to become fully functional.
From that point reaching the speed in this page's GIFs would probably take months of practice.

### Contents

1. Cover [**prerequisites**]({% link tutorials/vim-latex/prerequisites.md %}) for getting the most out of the series, along with references that should get you up to speed if needed.

1. Explain snippets, the key to real-time LaTeX.
   Available in [**UltiSnips**]({% link tutorials/vim-latex/ultisnips.md %}) or [**LuaSnip**]({% link tutorials/vim-latex/luasnip.md %}) flavor.

1. Introduce Vim's [**filetype plugin system**]({% link tutorials/vim-latex/ftplugin.md %}), which will help you understand the VimTeX plugin.

1. Cover the excellent [**VimTeX plugin**]({% link tutorials/vim-latex/vimtex.md %})---*the reason* to use Vim over another LaTeX editor.

1. Show how to [**compile LaTeX documents**]({% link tutorials/vim-latex/compilation.md %}) from within Vim.

1. Integrate Vim and a [**PDF reader**]({% link tutorials/vim-latex/pdf-reader.md %}) for viewing LaTeX documents.

1. [**A Vimscript primer**]({% link tutorials/vim-latex/vimscript.md %}) explaining the key mappings and Vimscript functions used in this tutorial.

#### Shut up and show me results

As concrete evidence that the techniques in this tutorial work in practice, here are [1500+ pages of typeset physics notes](https://ejmastnak.github.io/fmf.html) from my undergraduate studies, most of them written during university lecture in real time (although grammar and style were improved later).
Here are some examples of what these notes look like:

{{< vim-latex/carousel items="1" height="108" unit="%" duration="7000" >}}

And here are more GIFs showing that LaTeX can be written at handwriting speed:

{{< img-centered src="demo.gif" width="100%" alt="GIF of a screencast showing writing LaTeX quickly using snippets." >}}

This is actually a little *faster* than I can write by hand---try taking out a pencil and paper and see if you can keep up!
(Yes, I know I'm cheating by throwing in a bunch of hard-to-handwrite integrals.)
If you like, you can see [**more examples on YouTube**](https://www.youtube.com/watch?v=P7iMX1lqGnU).

**Credit where it is due**: the above GIFs are inspired by Gilles Castel's video [Fast LaTeX editing with Vim and UltiSnips](https://www.youtube.com/watch?v=a7gpx0h-BuU)---it is beautifully done and I encourage you to watch it.

#### A human-friendly guide

The series is written with the voice, format, notation, and explanation style I would have liked to have read if I were once again an inexperienced undergraduate learning the material for the first time myself.

All of the small discoveries I inefficiently scraped together from official documentation, online tutorials, YouTube, Stack Overflow, Reddit, and other online forums are compiled here and (hopefully) synthesized into an easily-followed, self-contained work.
I do my best to write clearly and concisely.
References to official documentation appear throughout the guide, so you know where each technique comes from.
I'll show you practical tips and tricks I use in everyday, real-life writing.
You'll find plenty of examples and GIFs.
I might even crack a joke or two.
Basically, I'll try to teach how I would like to be taught.
Hope it's helpful!

#### The original Vim-LaTeX article

By the way: the seminal work on the subject of Vim and LaTeX, and my inspiration for attempting and ultimately succeeding in writing real-time LaTeX using Vim, is Gilles Castel's [*How I'm able to take notes in mathematics lectures using LaTeX and Vim*](https://castel.dev/post/lecture-notes-1/).
You've probably seen it on the Internet if you dabble in Vim or LaTeX circles, and you should definitely read it if you haven't yet.

This series builds on Castel's article by more thoroughly walking the reader through technical details of implementation (e.g. the details of setting up a PDF reader with forward and inverse search, how to use the VimTeX plugin, how to write Vimscript functions and key mappings, how Vim's `ftplugin` system works, how to manually compile LaTeX documents, and so on).

#### Config

Since someone will probably be curious, here is an overview of the setup used in this series:

- Editor: [Neovim](https://neovim.io/)
- Terminal: [Alacritty](https://alacritty.org/)
- Colorscheme: [Nord](https://www.nordtheme.com/)
- Font: [Source Code Pro](https://github.com/adobe-fonts/source-code-pro) in the terminal and [Computer Modern](https://www.tug.org/FontCatalogue/computermodern/) on this website; at the time of writing, the fonts used on this website are available on [this demo page](https://www.checkmyworking.com/cm-web-fonts/).
- OS: [Arch Linux](https://archlinux.org/) as a daily driver; [macOS](https://www.apple.com/macos/) for testing cross-platform functionality
- Window manager: [i3](https://i3wm.org/) on Linux; [Amethyst](https://ianyh.com/amethyst/) on macOS
- GIF recording and screen capture: [Menyoki](https://github.com/orhun/menyoki)
- Dotfiles: [`github.com/ejmastnak/dotfiles`](https://github.com/ejmastnak/dotfiles), where you can find both my main [Neovim config](https://github.com/ejmastnak/dotfiles/tree/main/config/nvim) and a smaller [Vim config](https://github.com/ejmastnak/dotfiles/tree/main/config/nvim) for testing Vim-specific inverse search features for this series.

#### Feedback, suggestions, appreciation, criticisms, etc.

- If this series helped you, it will make my day to hear.
- If you suggest constructive ideas for improving the series, I will quite likely implement them, appreciate your input, and give you credit for your contributions.
  (Many thanks to Kai Breucker, Maxwell Jiang, and [@subnut](https://github.com/subnut) for catching mistakes and offering good ideas on how improve this series.)
- If you implement the setup in this series and show me the results, I will be very happy to see.

Feedback is welcome and appreciated.

You can reach me by email, in English, Spanish, or Slovene, at [`ejmastnak@gmail.com`](mailto:ejmastnak@gmail.com) or by opening an issue or pull request at [`github.com/ejmastnak/ejmastnak.github.io`](https://github.com/ejmastnak/ejmastnak.github.io)).

#### Have ideas for future projects?

If there is collective interest from readers of this guide, I would consider creating follow-up content expanding on this series.
Here are two possible projects:
- A GitHub repo implementing a minimum working example of the setup in this series (I'm thinking a minimal `vimrc`, a few example UltiSnips snippets to get you started writing your own, basic VimTeX configuration etc.).
  This might be less overwhelming for new users than browsing my above-linked dotfiles.
- A write-up of how the GIFs in this series were made (using shell scripts for repeatable results and dimensions, setting colorscheme and fonts, reaching an acceptable resolution, etc.).

If these or other ideas interest you, let me know---if there is enough interest from the community, I'd enjoy putting together more content like this.

<div style="margin-top: 1.5em">
<p style="text-align: center"><a href="/tutorials/vim-latex/prerequisites.html"><strong><em>Begin the series!</em></strong></a></p>
</div>

{{< vim-latex/vim-latex-license >}}
