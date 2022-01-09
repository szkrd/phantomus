# phantomus

Quick and dirty cli music player using puppeteer.

## yt

- `node yt --help`
- `node yt --vid=FuWljRgJYKw`
- Install a specific channel to user bin: `TO=~/bin/yt-synthwave&&echo -e '#!/usr/bin/env bash'>$TO&&echo "node $(pwd)/yt --vid=q5OjZhOYhow">>$TO&&chmod +x $TO&&unset TO`

## bbc

- `node bbc --help`
- `node bbc --list-channels`
- `node bbc --channel=bbc_1xtra`
- `node bbc --fuzzy=world`
- Install to user bin: `TO=~/bin/bbc&&echo -e '#!/usr/bin/env bash'>$TO&&echo "node $(pwd)/bbc \$@">>$TO&&chmod +x $TO&&unset TO`
