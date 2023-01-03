const constants = require('./constants');

const addColor = (colId = 'reset', s = '') => {
  const colors = { reset: 0, red: 31, yellow: 33, blue: 34, magenta: 35, cyan: 36, white: 37 };
  const ansi = (num = 0) => `\x1b[${num}m`; // 1b = 033 (select graphic rendition)
  return ansi(colors[colId] || colors.reset) + s + ansi(colors.reset);
};
const getColorizer =
  (color = '') =>
  (s = '') =>
    addColor(color, s);
const colorize = {
  red: getColorizer('red'),
  yellow: getColorizer('yellow'),
  cyan: getColorizer('cyan'),
  blue: getColorizer('blue'),
};

const platform = {
  linux: process.platform === 'linux',
  windows: process.platform === 'win32',
  mac: process.platform === 'darwin',
};

const getBrowserPath = () => {
  if (platform.linux) return constants.BROWSER_PATH_LINUX;
  if (platform.windows) return constants.BROWSER_PATH_WINDOWS;
  return '';
};

const textToLines = (text = '') =>
  text
    .replace(/[\r\n]/g, '\n')
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line);

const ifHasParam = (s = '') => process.argv.includes(s);

const paramValueOf = (s = '') => (process.argv.find((x) => x.startsWith(`${s}=`)) || '').split('=')[1];

const print = (...args) => console.info(...args);

const nullFunc = () => {};

const getPrint = (forReal = true) => (forReal ? print : nullFunc);

print.error = (...args) => console.error(colorize.red(...args));

const getQuitFn = (pup = { browser: null, page: null }) => {
  return async function quit(code = 0, message = '') {
    if (message) print(!code ? message : colorize.red(message));
    await pup.browser.close();
    process.exit(code);
  };
};

const getCommonPuppArgs = (extras = []) =>
  [
    '--autoplay-policy=no-user-gesture-required',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-crash-reporter',
    '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0)"',
    '--use-gl=egl',
    ...extras,
  ].filter((x) => x);

const shortRadioNames = {
  1: 'bbc_radio_one',
  '1d': 'bbc_radio_one_dance',
  '1r': 'bbc_radio_one_relax',
  '1x': 'bbc_1xtra',
  2: 'bbc_radio_two',
  3: 'bbc_radio_three',
  4: 'bbc_radio_fourfm',
  '4x': 'bbc_radio_four_extra',
  5: 'bbc_radio_five_live',
  6: 'bbc_6music',
  a: 'bbc_asian_network',
  w: 'bbc_world_service',
};

const shortRadioDescriptions = {
  1: '[Radio 1] specialises in modern popular music and current chart hits throughout the day.',
  '1d': '[Radio 1 Dance] plays a mix of back-to-back current, future and classic electronic dance music.',
  '1r': '[Radio 1 Relax] plays a selection of relaxation and well-being focussed shows.',
  '1x': '[Radio 1Xtra] broadcasts black music and urban music, including hip hop and R&B.',
  2: '[Radio 2] is the most popular station in the UK; it broadcasts a wide range of content.',
  3: '[Radio 3] broadcasts classical music and opera, with jazz, world music, drama, culture and the arts.',
  4: '[Radio 4] broadcasts a wide variety of spoken-word programmes, including news, drama, comedy, science and history.',
  '4x': '[Radio 4 Extra] broadcasts archived repeats of comedy, drama and documentary programmes nationally, 24 hours a day.',
  5: '[Radio 5 live] broadcasts mainly news, sport, discussion, interviews and phone-ins.',
  6: '[BBC 6 Music] is a dedicated alternative music station.',
  a: "[BBC Asian Network]'s target audience is people with an interest in British Asian lifestyles.",
  w: '[BBC World Service] broadcasts radio news, speech and discussions.',
};

const fromChannelIds = (abbr) => {
  return shortRadioNames[abbr];
};

module.exports = {
  platform,
  getBrowserPath,
  ifHasParam,
  paramValueOf,
  print,
  getPrint,
  nullFunc,
  getQuitFn,
  getCommonPuppArgs,
  colorize,
  shortRadioNames,
  shortRadioDescriptions,
  fromChannelIds,
  textToLines,
};
