![rip](./docs/rip.png)

Lived: 1 year, 2 months, 18 days.

Killed by Chrome/Puppeteer; rest in peace, good software.

(Puppeteer stopped playing back media reliably for me in headless mode, though it still "mostly"
works with the browser window open (using the `--head` parameter), except when it doesn't. Debugging
headless and/or automated browsers are a pain in the back anyway: long live walled gardens and
the megacorps of the ever brighter future!)

---

# phantomus

Quick and dirty cli music player using puppeteer.

Install: `git clone https://github.com/szkrd/phantomus.git && cd phantomus && npm install`

## yt-search

- Help: `node yt-search --help`
- Search for live feeds:
  - lo fi: `node yt-search "lofi girl"`
  - drone: `node yt-search "cryo chamber"`
  - enka: `node yt-search enka`
  - jpop: `node yt-search jpop`
  - etc.

![yt-search.js](./docs/demo-yt-search.png)

## yt

- Help: `node yt --help`
- Play video: `node yt --vid=FuWljRgJYKw`
- Play video based on **yt-search** result: `node yt 0` / `node yt 9`
- Install a specific channel to user bin: `TO=~/bin/yt-synthwave&&echo -e '#!/usr/bin/env bash'>$TO&&echo "node $(pwd)/yt --vid=q5OjZhOYhow">>$TO&&chmod +x $TO&&unset TO`

![yt.js](./docs/demo-yt.png)

## bbc

- Help: `node bbc --help`
- List channels: `node bbc --list-channels` / `node bbc -l`
- List channel id abbreviations: `node bbc --show-channel-info` / `node bbc -ci`
- Play channel: `node bbc --channel=bbc_1xtra` / `node bbc -c=bbc_6music` / `node bbc -c=4`  
  `node bbc --fuzzy=world` / `node bbc -f=four` / `node bbc -c=a`
- Install to user bin: `TO=~/bin/bbc&&echo -e '#!/usr/bin/env bash'>$TO&&echo "node $(pwd)/bbc \$@">>$TO&&chmod +x $TO&&unset TO`

![bbc.js](./docs/demo-bbc.png)

## install with functions/aliases

Add to your `.bashrc` or `.bash_aliases`.

```bash
function yt() { node /home/.../phantomus/yt.js "$@"; }
alias yt-foobar="yt --vid=0_2t6VYgwOY"
alias yt-search="node /home/.../phantomus/yt-search.js"
alias bbc="node /home/.../phantomus/bbc.js"
```
