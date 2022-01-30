const puppeteer = require('puppeteer-core');
const { ifHasParam, paramValueOf, print, getQuitFn, getCommonPuppArgs, colorize } = require('./utils');
const { cyan } = colorize;

const VER = '1.8';
const DEFAULT_VIDEO_ID = '5qap5aO4i9A'; // Chilled Cow /  Lofi Girl; other channel is "DWcJFNfaw9c"
const DEBUG = ifHasParam('--debug');
const SHOW_HEAD = ifHasParam('--head');
const VIDEO_ID = paramValueOf('--vid');
const URL = `https://www.youtube.com/embed/${VIDEO_ID || DEFAULT_VIDEO_ID}?autoplay=1&fs=0&iv_load_policy=3&showinfo=0&rel=0&cc_load_policy=0&start=0&end=0`;
const ALSA_DEVICE = paramValueOf('--alsa');
let BROWSER_PATH = paramValueOf('--browser');
if (!BROWSER_PATH && process.platform === 'linux') BROWSER_PATH = '/usr/bin/chromium';
if (!BROWSER_PATH && process.platform === 'win32') BROWSER_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (ifHasParam('--help')) {
  console.info(`Script ver is ${VER}\nParams (all optional):\n--help\n--debug\n--head\n--vid=YOUTUBE_ID` +
    '\n--browser=/usr/bin/chromium\n--alsa=ALSA_DEVICE_ID');
  process.exit();
}
let pup = { browser: null, page: null };
const quit = getQuitFn(pup);
async function handleExit() { await quit(0, 'Closing chrome, good bye!'); }
(async () => {
  process.on('SIGINT', handleExit);
  print(`Let's try to play "${cyan(URL)}"`);
  const headless = !SHOW_HEAD;
  const args = [
    ...getCommonPuppArgs(),
    ALSA_DEVICE ? `--alsa-output-device=${ALSA_DEVICE}` : '',
    headless ? '--headless' : '',
  ].filter(x => x);
  if (DEBUG) print(`Args:\n${args.join('\n')}`);
  const ignoreDefaultArgs = '--mute-audio';
  const browser = pup.browser = await puppeteer.launch({ headless, executablePath: BROWSER_PATH, ignoreDefaultArgs, args });
  const page = pup.page = await browser.newPage();
  await page.goto(URL);
  try {
    const errMsg = await page.$eval('.ytp-error', (el) => el.innerText);
    if (errMsg) quit(1, errMsg);
  } catch {};
  print('Done. Press ctrl+c to exit.');
})();
