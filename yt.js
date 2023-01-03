const puppeteer = require('puppeteer-core');
const constants = require('./src/constants');
const {
  ifHasParam,
  paramValueOf,
  print,
  getPrint,
  getQuitFn,
  getCommonPuppArgs,
  colorize,
  getBrowserPath,
} = require('./src/utils');
const { cyan } = colorize;

// CONSTANTS
const VER = '1.9';
const DEFAULT_VIDEO_ID = constants.DEFAULT_YOUTUBE_VIDEO_ID;
const DEBUG = ifHasParam('--debug') || ifHasParam('-d');
const SHOW_HEAD = ifHasParam('--head');
const VIDEO_ID = paramValueOf('--vid');
const urlQueryParams = 'autoplay=1&fs=0&iv_load_policy=3&showinfo=0&rel=0&cc_load_policy=0&start=0&end=0';
const URL = `https://www.youtube.com/embed/${VIDEO_ID || DEFAULT_VIDEO_ID}?${urlQueryParams}`;
const ALSA_DEVICE = paramValueOf('--alsa');
const BROWSER_PATH = paramValueOf('--browser') || getBrowserPath();

// SHOW HELP AND EXIT
if (ifHasParam('--help') || ifHasParam('-h')) {
  console.info(
    `Script ver is ${VER}\nParams (all optional):\n--help / -h\n--debug / -d\n--head\n--vid=YOUTUBE_ID` +
      '\n--browser=/usr/bin/chromium\n--alsa=ALSA_DEVICE_ID'
  );
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

  print(`Let's try to play "${cyan(URL)}"`);
  const headless = !SHOW_HEAD;
  const args = getCommonPuppArgs([
    ALSA_DEVICE ? `--alsa-output-device=${ALSA_DEVICE}` : '',
    headless ? '--headless' : '',
  ]);
  debugPrint(`Args:\n${args.join('\n')}`);

  const ignoreDefaultArgs = '--mute-audio';
  const executablePath = BROWSER_PATH;
  const browserParams = { headless, executablePath, ignoreDefaultArgs, args };
  const browser = (pup.browser = await puppeteer.launch(browserParams));
  const page = (pup.page = await browser.newPage());

  await page.goto(URL);
  try {
    const errMsg = await page.$eval('.ytp-error', (el) => el.innerText);
    if (errMsg) quit(1, errMsg);
  } catch {
    // noop
  }
  print('Done. Press ctrl+c to exit.');
})();
