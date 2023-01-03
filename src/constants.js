const constants = {
  BROWSER_PATH_LINUX: '/usr/bin/chromium',
  BROWSER_PATH_WINDOWS: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  DEFAULT_YOUTUBE_VIDEO_ID: 'oC0iVoNJwbE', // synthwave retrowave live channel
  // Filters: video, live (this is encoded into the "sp" query param by google)
  YT_SEARCH_URL_TEMPLATE: 'https://www.youtube.com/results?search_query=%QUERY%&sp=EgQQAUAB',
};

module.exports = constants;
