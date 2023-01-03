const { writeFile } = require('fs/promises');
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
const { cyan, red, blue, yellow } = colorize;

// CONSTANTS
const VER = '1.0';
const DEBUG = ifHasParam('--debug') || ifHasParam('-d');
const SHOW_HEAD = ifHasParam('--head');
const BROWSER_PATH = paramValueOf('--browser') || getBrowserPath();
const JSON_OUTPUT = paramValueOf('--file') || '.yt-search.json';
const LAST_ARG = process.argv[process.argv.length - 1];
const URL = constants.YT_SEARCH_URL_TEMPLATE.replace(/%QUERY%/, encodeURIComponent(LAST_ARG));

// SHOW HELP / CHECK SEARCH TERM / EXIT
if (ifHasParam('--help') || ifHasParam('-h') || process.argv.length === 2) {
  console.info(
    `Script ver is ${VER}\nParams (all optional, except the last query):\n--help / -h\n--debug / -d\n--head` +
      '\n--browser=/usr/bin/chromium\n--file=.yt-search.json ("null" disables)\n[search query]' +
      '\n\nExample: `node yt-search chillsynth` = searches for chillsynth live feeds'
  );
  process.exit();
}
if (LAST_ARG.startsWith('-')) {
  console.error("Search term shouldn't start with a parameter delimiter (-).");
  process.exit(1);
}

// MAIN
(async () => {
  const pup = { browser: null, page: null };
  const debugPrint = getPrint(DEBUG);
  const quit = getQuitFn(pup);
  async function handleInterrupt() {
    await quit(0, 'Closing chrome.');
  }
  process.on('SIGINT', handleInterrupt);

  debugPrint(`Searching for: "${LAST_ARG}"`);
  print(`Let's try to open "${cyan(URL)}"`);
  const headless = !SHOW_HEAD;
  const args = getCommonPuppArgs([headless ? '--headless' : '']);
  debugPrint(`Args:\n${args.join('\n')}`);

  const executablePath = BROWSER_PATH;
  const browserParams = { headless, executablePath, args };
  const browser = (pup.browser = await puppeteer.launch(browserParams));
  const page = (pup.page = await browser.newPage());

  await page.goto(URL);
  let results = [];
  try {
    results = await page.$$eval('h3.title-and-badge > a', (els) =>
      els.map((el) => ({
        title: (el.getAttribute('title') ?? '').trim(), // just the title
        fullTitle: (el.getAttribute('aria-label') ?? '').trim(), // title + channel owner + view count
        id: (el.getAttribute('href') ?? '').split('=')[1] ?? '', // youtube video id
      }))
    );
  } catch (err) {
    print(red(err));
  }
  if (Array.isArray(results) && results.length > 0) {
    // pretty print the results
    results.length = Math.min(results.length, 10);
    results.forEach((item, idx) => {
      const extra = blue(item.fullTitle.replace(item.title, '').trim()); // such lazy, very replace
      print(`${yellow(String(idx).padStart(2, '0'))} [${cyan(item.id)}] | ${item.title} ${extra}`);
    });
    // save it into the output json
    if (JSON_OUTPUT && JSON_OUTPUT !== 'null' && JSON_OUTPUT !== '"null"') {
      await writeFile(JSON_OUTPUT, JSON.stringify({ ok: true, query: LAST_ARG, url: URL, results }, null, 2), 'utf-8');
      print(`(Result saved as ${JSON_OUTPUT}, you can use the (first) result with "node yt 0")`);
    }
  }
  if (!DEBUG) return pup.browser.close(); // promise
  print('Debug mode is active, press ctrl+c to exit.');
})();
