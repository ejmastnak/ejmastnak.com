# ejmastnak.com

Source files for [my website](https://www.ejmastnak.com/)—feel free to clone and reuse under the [license](https://www.ejmastnak.com/license/).


## Building

The website is built using the [Hugo static site generator](https://gohugo.io/).

Assuming you have Hugo and Node.js installed, you can reproduce the website on your local computer as follows:

```bash
# Clone the website
git clone https://github.com/ejmastnak/ejmastnak.com

# Change into the website root directory
cd ejmastnak.com

# Install Node packages (for TailwindCSS)
npm install

# Compile CSS stylesheets (this is a script defined in package.json)
npm run compile-tailwind

# Serve the website with Hugo
hugo serve

# The website should be available at localhost port 1313
xdg-open http://localhost:1313/
```

