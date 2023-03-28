---
title: "ROF"
date: 2023-03-07
description: Benford's law
---

# Benford's law

Rešitev za prvo domačo nalogo v Pythonu s pomočjo Matplotlib, Numpy in SciPy.
Za rešitev z Gnuplot ste pa odgovorni vi :)

## Rezultat

{{< img-centered src="histogram.png" width="100%" alt="Histogram of leading digits in sample experimental data." >}}

## Priprava podatkov

(Namenoma ne objavljam celotne rešitve za ta korak, ampak samo namig.)

Za računanje histograma predlagam da iz `benford.txt` izluščite samo prvo številko vsake vrstice.

Jaz sem naredil takole: prvo cifro iz vsake vrstice v `benford.txt` sem shranil v novo datoteko `leading.txt` (ang. "leading digit" pomeni "prva številka"), in v nadaljevanju uporabljal `leading.txt` kot vhodno datoteko za risanje histograma.

Za občutek, kako zgleda `leading.txt`:

<!-- # Vzamemo samo prvo številko iz vsake vrstice in shranimo rezultat v -->
<!-- # `leading.txt` (ang. "leading digit" pomeni "prva številka") -->
<!-- $ cut -c 1 "benford.txt" > "leading.txt" -->

```bash
$ ls
benford.txt  # originalni podatki
leading.txt  # prva cifra vsake vrstice v `benford.txt`

# Prvih 5 vrstic iz `benford.txt`...
$ head -5 benford.txt
1.531190
1.053729
5.172971
1.051773
4.877888

# ... in prvih 5 vrstic iz `leading.txt` za primerjavo
$ head -5 leading.txt
1
1
5
1
4
```

## Python skripta

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

# Colors from TailwindCSS https://tailwindcss.com/docs/customizing-colors
blue100 = "#dbeafe"
blue700 = "#1d4ed8"

# Read leading digits from data file
digits = np.loadtxt("leading.txt")
N = len(digits)

def plot():
    """
    This function plots:
        1. The histogram of the leading digits in benford.txt and
        2. A fit of the histogram data to the Benford's law distribution 

    """
    fig, ax = plt.subplots(figsize=(7, 4), facecolor="#fafafa")
    remove_spines(ax)
    ax.set_facecolor('#fafafa')
        
    # See https://matplotlib.org/stable/api/_as_gen/matplotlib.axes.Axes.hist.html
    hist, bin_edges, patches = ax.hist(digits, bins=9, density=True, range=(1, 10),
                                       facecolor=blue100, edgecolor="#666666",
                                       label="Experimental data")
    ax.set_xticks(np.arange(1, 10, 1))
    ax.set_xlabel("Leading digit $d$")
    ax.set_ylabel("Frequency $p(d)$")
    ax.set_title("Frequency of leading digits in benford.txt", pad=12)

    x = np.arange(1, 10, 1) 
    y = hist
    a, b, a_std, b_std = fit(x, y)
    y_fit = benford(x, a, b)

    ax.plot(x, y_fit, color=blue700, linestyle=":", marker="o",
            label="Fit: $p(d) = a \, \log (1 + b/d)$\n $a = {:.2f} \pm {:.2f}$\n $b = {:.2f} \pm {:.2f}$".format(a, a_std, b, b_std))

    ax.legend(facecolor="#fafafa")
    plt.tight_layout()
    plt.savefig("histogram.png", dpi=200, facecolor=fig.get_facecolor())
    plt.show()


def benford(x, a, b):
    """
    A model for fitting data to the Benford's law probablity distribution.
    The true distribution is p(x) = log10(1 + 1/x); we thus expect both a ~ 1
    and b ~ 1 for experimental data matching Benford's law. Note that I'm using
    a base-10 logarithm to match the Benford's law distribution.
    See https://en.wikipedia.org/wiki/Benford%27s_law#Definition.

    """
    return a*np.log10(1 + b/x)


def fit(x, y):
    """
    Fits the inputted (x, y) data to a Benford's law distribution.
    Typically x would be the digits 1, 2, ..., 9 and y would the normalized
    frequencies with which each digit occurs in some sample data.

    """
    # See https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.curve_fit.html
    p0 = (1.0, 1.0)  # initial guess for a and b
    popt, pcov = curve_fit(benford, x, y)

    # Extract optimal parameter values
    a = popt[0]
    b = popt[1]

    # The standard errors of the fit parameters are the square roots of the
    # corresponding entries along the diagonal of the fit's covariance matrix
    a_std = pcov[0, 0]**0.5
    b_std = pcov[1, 1]**0.5

    return a, b, a_std, b_std


def remove_spines(ax):
    """
    Removes top and right spines from the inputted Matplotlib axis. This is for
    aesthetic purposes only and has no practical function.

    """
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.get_xaxis().tick_bottom()
    ax.get_yaxis().tick_left()


if __name__ == "__main__":
    plot()
```

Vsebino Python skripte shranimo v datoteko, npr. `benford.py`, in zaženemo s sledečim ukazom:

```bash
$ python3 benford.py
```
