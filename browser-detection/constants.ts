
// TODO: Maybe fix the values to 'Chrome', 'Internet Explorer', etc. Currently
// these values need to be as they are because they are going to analytics,
// callstats, etc.

export enum Browser {
    CHROME = 'chrome',
    FIREFOX = 'firefox',
    SAFARI = 'safari',
    ELECTRON = 'electron',
    REACT_NATIVE = 'react-native',
    WEBKIT_BROWSER = 'webkit-browser'
}

/**
 * Maps the names of the browsers from ua-parser to the internal names defined in
 * ./browsers.js
 */
export const PARSER_TO_JITSI_NAME: { [key: string]: Browser } = {
    'Chrome': Browser.CHROME,
    'Firefox': Browser.FIREFOX,
    'Safari': Browser.SAFARI,
    'Electron': Browser.ELECTRON
};

export enum Engine {
    BLINK = 'blink',
    WEBKIT = 'webkit',
    GECKO = 'gecko'
}

export const ENGINES: { [key: string]: Engine } = {
    'Blink': Engine.BLINK,
    'WebKit': Engine.WEBKIT,
    'Gecko': Engine.GECKO
};