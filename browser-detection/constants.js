// TODO: Maybe fix the values to 'Chrome', 'Internet Explorer', etc. Currently
// this values needs to be as they are becuse they are going to analytics,
// callstats, etc.

export const CHROME = 'chrome';

export const FIREFOX = 'firefox';

export const SAFARI = 'safari';

export const ELECTRON = 'electron';

export const REACT_NATIVE = 'react-native';

export const WEBKIT_BROWSER = 'webkit-browser';

/**
 * Maps the names of the browsers from ua-parser to the internal names defined in
 * ./browsers.js
 */
export const PARSER_TO_JITSI_NAME = {
    'Chrome': CHROME,
    'Firefox': FIREFOX,
    'Safari': SAFARI,
    'Electron': ELECTRON
};

export const BLINK = 'blink';

export const WEBKIT = 'webkit';

export const GECKO = 'gecko';

export const ENGINES = {
    'Blink': BLINK,
    'WebKit': WEBKIT,
    'Gecko': GECKO
};
