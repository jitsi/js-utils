
export enum Browser {
    CHROME = 'chrome',
    ELECTRON = 'electron',
    FIREFOX = 'firefox',
    REACT_NATIVE = 'react-native',
    SAFARI = 'safari',
    WEBKIT_BROWSER = 'webkit-browser'
}

/**
 * Maps the names of the browsers from ua-parser to the internal names defined in
 * ./browsers.js
 */
export const PARSER_TO_JITSI_NAME: { [key: string]: Browser; } = {
    'Chrome': Browser.CHROME,
    'Firefox': Browser.FIREFOX,
    'Safari': Browser.SAFARI,
    'Electron': Browser.ELECTRON
};

export enum Engine {
    BLINK = 'blink',
    GECKO = 'gecko',
    WEBKIT = 'webkit'
}

export const ENGINES: { [key: string]: Engine; } = {
    'Blink': Engine.BLINK,
    'WebKit': Engine.WEBKIT,
    'Gecko': Engine.GECKO
};
