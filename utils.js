const chalk = require('chalk');

const ifHasParam = (s = '') => process.argv.includes(s);

const paramValueOf = (s = '') => (process.argv.find(x => x.startsWith(`${s}=`)) || '').split('=')[1];

const print = (...args) => console.info(chalk.cyan(...args));

print.error =  (...args) => console.error(chalk.red(...args));

const getQuitFn = (pup = { browser: null, page: null }) => {
  return async function quit(code = 0, message = '') {
    if (message) print(!code ? message : chalk.red(message));
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

module.exports = {
  ifHasParam,
  paramValueOf,
  print,
  getQuitFn,
  getCommonPuppArgs,
};
