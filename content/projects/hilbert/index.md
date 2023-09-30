---
title: "Digital Hilbert Transformer"
date: 2022-04-20
---

# Digital Bandpass Hilbert Transformer 

{{< date-last-mod >}}

Project goal: design and implement a finite impulse response (FIR) Hilbert transformer and bandpass filter using the windowed-sinc method, but without using the usual filter design tools provided by software like Matlab or SciPy.

You might be interested in...

- [**reading the PDF report**](report.pdf) explaining design process and summarizing the results
- [**browsing the GitHub repo**](https://github.com/ejmastnak/hilbert-bandpass)  containing the project's source files
- watching the filter in action in the video below, which you may want to (carefully) unmute

<video controls muted width="100%">
  <source src="demo.mp4" type="video/mp4">
</video>

**What you're seeing:** the video shows the filter acting in real-time on a sequence of sinusoidal audio signals (or *pure tones* in musical terminology).
The audio signal's waveform (what you're hearing if you turn the sound on) is plotted as a dashed blue line, and the filtered version of this audio signal appears in solid red.
The input signal's frequency is increased from 500 Hz to 2500 Hz in five increments of 500 Hz.
Here's what to notice:

- The filter responds to the input signal's changing frequency in (near) real-time.
- In the passband from 1000 to 2000 Hz, the filtered signal is unchanged in amplitude and shifted in phase by 90 degrees relative to the input, as befits a Hilbert transformer.
- In the stopband below 500 Hz and above 2500 Hz, the filtered signal is completely attenuated, as befits a bandpass filter.

Here are the full filter specifications:

| Frequency band | Attenuation | Phase shift |
| - | - | - |
| Below 500 Hz | Less than −40 dB | - |
| 1000 Hz to 2000 Hz | 0 dB with up to 1 dB ripple | π/2 radians |
| Above 2500 Hz | Less than −40 dB | - |

## About the project

This was originally a project for the third-year course *Zajemanje in obdelava podatkov* (Data Acquisition and Processing) at the Faculty of Mathematics and Physics and the University of Ljubljana, Slovenia, which I later put online for a public audience.

The project is a pedagogical exercise meant to help new signal processing students (read: me when making the project) develop hands-on familiarity with foundational concepts and algorithms in FIR digital filter design, which should provide insight into the under-the-hood workings of conventional tools like Matlab's `fir1` and `fir2` or SciPy's `firwin`.
I draw the third-party library line at Numpy's implementation of the fast Fourier transform, and do remaining tasks---e.g. computing filter kernels and frequency responses; applying window functions; implementing the overlap-add method for online convolution; etc.---by hand.
The project is certainly *not* an attempt at creating a production-ready, high-performance digital filter.
