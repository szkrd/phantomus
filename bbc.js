const puppeteer = require('puppeteer-core');
const chalk = require('chalk');
const { ifHasParam, paramValueOf, print, getQuitFn, getCommonPuppArgs } = require('./utils');

const VER = '1.1';
const DEFAULT_CHANNEL_ID = 'bbc_world_service'; // BBC World Service
const DEBUG = ifHasParam('--debug');
const SHOW_HEAD = ifHasParam('--head');
const LIST_CHANNELS = ifHasParam('--list-channels') || ifHasParam('-l');
const CHANNEL_ID = paramValueOf('--channel') || paramValueOf('-c');
const FUZZY_CHANNEL_ID = paramValueOf('--fuzzy') || paramValueOf('-f');
let URL = `https://www.bbc.co.uk/sounds/player/${CHANNEL_ID || DEFAULT_CHANNEL_ID}`;
const LIST_URL = 'https://www.bbc.co.uk/sounds/stations';
const ALSA_DEVICE = paramValueOf('--alsa');
let BROWSER_PATH = paramValueOf('--browser');
if (!BROWSER_PATH && process.platform === 'linux') BROWSER_PATH = '/usr/bin/chromium';
if (!BROWSER_PATH && process.platform === 'win32') BROWSER_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (ifHasParam('--help')) {
  console.info(`Script ver is ${VER}\nParams (all optional):\n--help\n--debug\n--head\n--list-channels (or -l)\n` +
    '--channel=CHANNEL_ID (or -c=)\n--fuzzy=CHANNEL_ID_SUBSTRING (or -f=)\n--browser=/usr/bin/chromium\n--alsa=ALSA_DEVICE_ID');
  process.exit();
}
let pup = { browser: null, page: null };
const quit = getQuitFn(pup);
async function handleExit() { await quit(0, 'Closing chrome, good bye!'); }
(async () => {
  process.on('SIGINT', handleExit);
  const headless = !SHOW_HEAD;
  const args = [
    ...getCommonPuppArgs(),
    ALSA_DEVICE ? `--alsa-output-device=${ALSA_DEVICE}` : '',
    headless ? '--headless' : ''
  ].filter(x => x);
  if (DEBUG) print(`Args:\n${args.join('\n')}`);
  const ignoreDefaultArgs = '--mute-audio';
  const browser = pup.browser = await puppeteer.launch({ headless, executablePath: BROWSER_PATH, ignoreDefaultArgs, args });
  const page = pup.page = await browser.newPage();
  let channels = [];
  if (LIST_CHANNELS || FUZZY_CHANNEL_ID) {
    await page.goto(LIST_URL);
    channels = await page.$$eval('a[class*=station-link]', (els) => els.map(el => ({
      text: el.innerText.replace(/[\r\n]+/g, ' | '),
      id: el.dataset.bbcSource || '',
    }))) || [];
  }
  if (LIST_CHANNELS) {
    if (channels && channels.length) {
      channels.forEach(channel => console.info(`${chalk.yellow(channel.id)} - ${chalk.cyan(channel.text)}`));
      await quit(0);
    } else {
      await quit(1, 'Channel list not found.')
    }
  }
  if (FUZZY_CHANNEL_ID && channels && channels.length) {
    const match = channels.find(channel => channel.id.includes(FUZZY_CHANNEL_ID));
    if (match) {
      print(`Channel "${chalk.yellow(match.id)}" selected.`);
      URL = URL.replace(/[^\/]*$/, match.id);
    }
  }
  await page.goto(URL);
  await page.click('#play');
  print('Done. Press ctrl+c to exit.');
})();
