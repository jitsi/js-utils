export declare enum Browser {
    CHROME = "chrome",
    FIREFOX = "firefox",
    SAFARI = "safari",
    ELECTRON = "electron",
    REACT_NATIVE = "react-native",
    WEBKIT_BROWSER = "webkit-browser"
}
/**
 * Maps the names of the browsers from ua-parser to the internal names defined in
 * ./browsers.js
 */
export declare const PARSER_TO_JITSI_NAME: {
    [key: string]: Browser;
};
export declare enum Engine {
    BLINK = "blink",
    WEBKIT = "webkit",
    GECKO = "gecko"
}
export declare const ENGINES: {
    [key: string]: Engine;
};
