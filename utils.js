const addColor = (colId = 'reset', s = '') => {
  const colors = { reset: 0, red: 31, yellow: 33, blue: 34, magenta: 35, cyan: 36, white: 37 };
  const ansi = (num = 0) => `\x1b[${num}m`; // 1b = 033 (select graphic rendition)
  return ansi(colors[colId] || colors.reset) + s + ansi(colors.reset);
};
const getColorizer = (color = '') => (s = '') => addColor(color, s);
const colorize = {
  red: getColorizer('red'),
  yellow: getColorizer('yellow'),
  cyan: getColorizer('cyan'),
};

const ifHasParam = (s = '') => process.argv.includes(s);

const paramValueOf = (s = '') => (process.argv.find(x => x.startsWith(`${s}=`)) || '').split('=')[1];

const print = (...args) => console.info(...args);

print.error =  (...args) => console.error(colorize.red(...args));

const getQuitFn = (pup = { browser: null, page: null }) => {
  return async function quit(code = 0, message = '') {
    if (message) print(!code ? message : colorize.red(message));
    await pup.browser.close();
    process.exit(code);
  };
}

const getCommonPuppArgs = () => [
  '--autoplay-policy=no-user-gesture-required',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-crash-reporter',
  '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0)"',
  '--use-gl=egl',
];

const shortRadioNames = {
  '1': 'bbc_radio_one',
  '1d': 'bbc_radio_one_dance',
  '1r': 'bbc_radio_one_relax',
  '1x': 'bbc_1xtra',
  '2': 'bbc_radio_two',
  '3': 'bbc_radio_three',
  '4': 'bbc_radio_fourfm',
  '4x': 'bbc_radio_four_extra',
  '5': 'bbc_radio_five_live',
  '6': 'bbc_6music',
  'a': 'bbc_asian_network',
  'w': 'bbc_world_service',
};

const fromChannelIds = (abbr) => {
  return shortRadioNames[abbr];
}

module.exports = {
  ifHasParam,
  paramValueOf,
  print,
  getQuitFn,
  getCommonPuppArgs,
  colorize,
  shortRadioNames,
  fromChannelIds,
};
