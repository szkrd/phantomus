# phantomus

Quick and dirty cli music player using puppeteer.

Install: `git clone https://github.com/szkrd/phantomus.git && cd phantomus && npm install`

## yt

- Help: `node yt --help`
- Play video: `node yt --vid=FuWljRgJYKw`
- Install a specific channel to user bin: `TO=~/bin/yt-synthwave&&echo -e '#!/usr/bin/env bash'>$TO&&echo "node $(pwd)/yt --vid=q5OjZhOYhow">>$TO&&chmod +x $TO&&unset TO`

## bbc

- Help: `node bbc --help`
- List channels: `node bbc --list-channels` / `node bbc -l`
- Play channel: `node bbc --channel=bbc_1xtra` / `node bbc -c=bbc_6music`
- Play channel: `node bbc --fuzzy=world` / `node bbc -f=four`
- Install to user bin: `TO=~/bin/bbc&&echo -e '#!/usr/bin/env bash'>$TO&&echo "node $(pwd)/bbc \$@">>$TO&&chmod +x $TO&&unset TO`
