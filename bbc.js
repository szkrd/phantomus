const puppeteer = require('puppeteer-core');
const {
  getBrowserPath,
  ifHasParam,
  paramValueOf,
  print,
  getPrint,
  getQuitFn,
  getCommonPuppArgs,
  colorize,
  shortRadioNames,
  shortRadioDescriptions,
  fromChannelIds,
  textToLines,
} = require('./src/utils');
const { yellow, cyan } = colorize;

// CONSTANTS
const VER = '1.5';
const DEFAULT_CHANNEL_ID = 'bbc_world_service'; // BBC World Service
const DEBUG = ifHasParam('--debug') || ifHasParam('-d');
const SHOW_HEAD = ifHasParam('--head');
const LIST_CHANNELS = ifHasParam('--list-channels') || ifHasParam('-l');
let CHANNEL_ID = paramValueOf('--channel') || paramValueOf('-c');
CHANNEL_ID = fromChannelIds(CHANNEL_ID) || CHANNEL_ID;
const FUZZY_CHANNEL_ID = paramValueOf('--fuzzy') || paramValueOf('-f');
let URL = `https://www.bbc.co.uk/sounds/player/${CHANNEL_ID || DEFAULT_CHANNEL_ID}`;
const LIST_URL = 'https://www.bbc.co.uk/sounds/stations';
const ALSA_DEVICE = paramValueOf('--alsa');
const BROWSER_PATH = paramValueOf('--browser') || getBrowserPath();

// HELP AND EXIT
if (ifHasParam('--help') || ifHasParam('-h')) {
  console.info(
    `Script ver is ${VER}\nParams (all optional):\n--help (or -h)\n--debug (or -d)\n--head\n--list-channels (or -l)\n` +
      `--channel=CHANNEL_ID (or -c=)(abbreviations: ${Object.keys(shortRadioNames).sort().join(',')})\n` +
      `--show-channel-info (or -ci)``--fuzzy=CHANNEL_ID_SUBSTRING (or -f=)\n--browser=/usr/bin/chromium\n--alsa=ALSA_DEVICE_ID`
  );
  process.exit();
}
if (ifHasParam('--show-channel-info') || ifHasParam('-ci')) {
  console.info('Channel id abbreviations:');
  Object.keys(shortRadioDescriptions)
    .sort()
    .forEach((key) => {
      console.info(cyan(key.padEnd(3)) + '= ' + shortRadioDescriptions[key]);
    });
  process.exit();
}

// MAIN
(async () => {
  const pup = { browser: null, page: null };
  const debugPrint = getPrint(DEBUG);
  const quit = getQuitFn(pup);
  async function handleExit() {
    await quit(0, 'Closing chrome, good bye!');
  }
  process.on('SIGINT', handleExit);

  const headless = !SHOW_HEAD;
  const args = [
    // lately the user agent param started to misbehave (403)
    ...getCommonPuppArgs().filter((param) => !param.startsWith('--user-agent')),
    ALSA_DEVICE ? `--alsa-output-device=${ALSA_DEVICE}` : '',
    headless ? '--headless' : '',
  ].filter((x) => x);
  debugPrint(`Args:\n${args.join('\n')}`);

  const ignoreDefaultArgs = '--mute-audio';
  const browser = (pup.browser = await puppeteer.launch({
    headless,
    executablePath: BROWSER_PATH,
    ignoreDefaultArgs,
    args,
  }));
  const page = (pup.page = await browser.newPage());

  let channels = [];
  if (LIST_CHANNELS || FUZZY_CHANNEL_ID) {
    await page.goto(LIST_URL);
    channels =
      (await page.$$eval('a[class*=station-link]', (els) =>
        els.map((el) => ({
          text: el.innerText.replace(/[\r\n]+/g, ' | '),
          id: el.dataset.bbcSource || '',
        }))
      )) || [];
  }
  if (LIST_CHANNELS) {
    if (channels && channels.length) {
      channels.forEach((channel) => console.info(`${yellow(channel.id)} - ${channel.text}`));
      await quit(0);
    } else {
      await quit(1, 'Channel list not found.');
    }
  }
  if (FUZZY_CHANNEL_ID && channels && channels.length) {
    const match = channels.find((channel) => channel.id.includes(FUZZY_CHANNEL_ID));
    if (match) {
      print(`Channel "${yellow(match.id)}" selected.`);
      URL = URL.replace(/[^/]*$/, match.id);
    }
  }
  print(`Opening url "${cyan(URL)}"`);
  await page.goto(URL);
  await page.waitForTimeout(1000);
  try {
    await page.click('button[aria-label="play"]'); // we used to have a "#play" element
  } catch {
    // noop
  }
  print('Press ctrl+c anytime to exit.\n');

  // print program info if possible (time, title and short synopsis)
  // (bbc lately started using an iframe, well, because iframes are cool, even in 2023)
  let prevInfo = '';
  const printInfo = async () => {
    try {
      // all the program info is now in an iframe, let's grab all of it (inside `<main>`)
      const frameHandle = await page.waitForSelector('iframe[class*=IframeWidget]');
      const frame = await frameHandle.contentFrame();
      let selector = 'main';
      let info = (await frame.$$eval(selector, (els) => els.map((el) => (el.innerText ?? '').trim()))) || [];
      const lines = textToLines(info[0] || '').filter(
        (line) => !line.startsWith('LIVE') && !line.startsWith('View Full Schedule') && !line.includes('Head to BBC')
      );
      // first line looks like a time schedule info
      if (/^\d+$/.test(lines[0].replace(/[: -]/g, ''))) {
        lines[0] = yellow(lines[0]);
        lines[1] = cyan(lines[1]);
      }
      // detect pretty time (NOW PLAYING, LESS THAN A MINUTE AGO, 1 MINUTE AGO etc.)
      const timestampInfoIdx = lines.findIndex((line) => line.endsWith(' AGO') || line === 'NOW PLAYING');
      if (timestampInfoIdx > 1) {
        lines[timestampInfoIdx] = '---';
      }
      info = lines.join('\n');
      if (info && info !== prevInfo) {
        print((prevInfo = info) + '\n');
      }
    } catch {
      // noop
    }
  };
  printInfo();
  setInterval(printInfo, 30 * 1000);
})();
