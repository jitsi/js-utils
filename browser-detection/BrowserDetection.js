import { UAParser } from 'ua-parser-js';

import {
    CHROME,
    OPERA,
    FIREFOX,
    INTERNET_EXPLORER,
    SAFARI,
    WEBKIT,
    NWJS,
    ELECTRON,
    REACT_NATIVE,
    UNKNOWN,
} from './browsers.js';

/**
 * Maps the names of the browsers from ua-parser to the internal names defined in
 * ./browsers.js
 */
const parserNameToJitsiName = {
    'Chrome': CHROME,
    'Chromium': CHROME,
    'Opera': OPERA,
    'Firefox': FIREFOX,
    'Internet Explorer': INTERNET_EXPLORER,
    'Safari': SAFARI
};

/**
 * Detects a Chromium based environent.
 *
 * NOTE: Here we cannot check solely for "Chrome" in the UA, because Edge has
 * it too. We need to check explicitly for chromium based Edge first and then
 * detect other chromium based browsers.
 *
 * @returns {Object|undefined} - The name (CHROME) and version.
 */
function _detectChromiumBased() {
    const userAgent = navigator.userAgent;

    if (userAgent.match(/Chrome/) && !userAgent.match(/Edge/)) {
        // Edge is currenly supported only on desktop and android.
        if (userAgent.match(/Edg(A?)/)) {
            // Compare the underlying chromium version.
            const version = userAgent.match(/Chrome\/([\d.]+)/)[1];

            if (Number.parseInt(version, 10) > 72) {
                return {
                    name: CHROME,
                    version
                };
            }
        } else {
            return {
                name: CHROME,
                version: userAgent.match(/Chrome\/([\d.]+)/)[1]
            };
        }
    }
}

function _detectWebKitBased(parser) {
    const { name, version } = parser.getEngine();
    if (name === 'WebKit') {
        return {
            name: WEBKIT,
            version
        };
    }
}

/**
 * Detects Electron environment.
 *
 * @returns {Object|undefined} - The name (ELECTRON) and version.
 */
function _detectElectron() {
    const userAgent = navigator.userAgent;

    if (userAgent.match(/Electron/)) {
        const version = userAgent.match(/Electron(?:\s|\/)([\d.]+)/)[1];

        return {
            name: ELECTRON,
            version
        };
    } else if (typeof window.JitsiMeetElectron !== 'undefined') {
        return {
            name: ELECTRON,
            version: undefined
        };
    }
}

/**
 * Detects NWJS environment.
 *
 * @returns {Object|undefined} - The name (NWJS) and version.
 */
function _detectNWJS() {
    const userAgent = navigator.userAgent;

    if (userAgent.match(/JitsiMeetNW/)) {
        const version = userAgent.match(/JitsiMeetNW\/([\d.]+)/)[1];

        return {
            name: NWJS,
            version
        };
    }
}

/**
 * Detects React Native environment.
 * @returns {Object|undefined} - The name (REACT_NATIVE) and version.
 */
function _detectReactNative() {
    const match
        = navigator.userAgent.match(/\b(react[ \t_-]*native)(?:\/(\S+))?/i);
    let version;

    // If we're remote debugging a React Native app, it may be treated as
    // Chrome. Check navigator.product as well and always return some version
    // even if we can't get the real one.

    if (match || navigator.product === 'ReactNative') {
        let name;

        if (match && match.length > 2) {
            name = match[1];
            version = match[2];
        }
        name || (name = 'react-native');
        version || (version = 'unknown');

        return {
            name: REACT_NATIVE,
            version
        };
    }
}

/**
 * Returns information about the current browser.
 * @param {Object} - The parser instance.
 * @returns {Object} - The name and version of the browser.
 */
function _detect(parser) {
    let browserInfo;
    const detectors = [
        _detectReactNative,
        _detectElectron,
        _detectNWJS
    ];

    // Try all browser detectors
    for (let i = 0; i < detectors.length; i++) {
        browserInfo = detectors[i]();
        if (browserInfo) {
            return browserInfo;
        }
    }

    const { name, version } = parser.getBrowser();

    if (name in parserNameToJitsiName) {
        return {
            name: parserNameToJitsiName[name],
            version
        };
    }

    // Detect other browsers with the Chrome engine, such as Vivaldi and Brave.
    browserInfo = _detectChromiumBased();
    if (browserInfo) {
        return browserInfo;
    }

    browserInfo = _detectWebKitBased(parser);
    if (browserInfo) {
        return browserInfo;
    }

    return {
        name: UNKNOWN,
        version: undefined
    };
}

/**
 * Implements browser detection.
 */
export default class BrowserDetection {
    /**
     * Creates new BrowserDetection instance.
     *
     * @param {Object} [browserInfo] - Information about the browser.
     * @param {string} browserInfo.name - The name of the browser.
     * @param {string} browserInfo.version - The version of the browser.
     */
    constructor(browserInfo) {
        let name, version;

        this._parser = new UAParser(navigator.userAgent);
        if (typeof browserInfo === 'undefined') {
            const detectedBrowserInfo = _detect(this._parser);

            name = detectedBrowserInfo.name;
            version = detectedBrowserInfo.version;
        } else if (browserInfo.name in parserNameToJitsiName) {
            name = parserNameToJitsiName[browserInfo.name];
            version = browserInfo.version;
        } else {
            name = UNKNOWN;
            version = undefined;
        }

        this._name = name;
        this._version = version;
    }

    /**
     * Gets current browser name.
     * @returns {string}
     */
    getName() {
        return this._name;
    }

    /**
     * Checks if current browser is Chrome.
     * @returns {boolean}
     */
    isChrome() {
        return this._name === CHROME;
    }

    /**
     * Checks if current browser is Opera.
     * @returns {boolean}
     */
    isOpera() {
        return this._name === OPERA;
    }

    /**
     * Checks if current browser is Firefox.
     * @returns {boolean}
     */
    isFirefox() {
        return this._name === FIREFOX;
    }

    /**
     * Checks if current browser is Internet Explorer.
     * @returns {boolean}
     */
    isIExplorer() {
        return this._name === INTERNET_EXPLORER;
    }

    /**
     * Checks if current browser is Safari.
     * @returns {boolean}
     */
    isSafari() {
        return this._name === SAFARI;
    }

    /**
     * Checks if current browser is based on webkit.
     * @returns {boolean}
     */
    isWebKit() {
        return this._name === WEBKIT;
    }

    /**
     * Checks if current environment is NWJS.
     * @returns {boolean}
     */
    isNWJS() {
        return this._name === NWJS;
    }

    /**
     * Checks if current environment is Electron.
     * @returns {boolean}
     */
    isElectron() {
        return this._name === ELECTRON;
    }

    /**
     * Checks if current environment is React Native.
     * @returns {boolean}
     */
    isReactNative() {
        return this._name === REACT_NATIVE;
    }

    /**
     * Returns the version of the current browser.
     * @returns {string}
     */
    getVersion() {
        return this._version;
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {*} version - The version to compare with. Anything different
     * than string will be converted to string.
     * @returns {boolean|undefined} - Returns true if the current version is
     * greater than the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     */
    isVersionGreaterThan(version) {
        return this._parser.getBrowser().version >= version;
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {*} version - The version to compare with. Anything different
     * than string will be converted to string.
     * @returns {boolean|undefined} - Returns true if the current version is
     * lower than the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     */
    isVersionLessThan(version) {
        return this._parser.getBrowser().version >= version;
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {*} version - The version to compare with. Anything different
     * than string will be converted to string.
     * @returns {boolean|undefined} - Returns true if the current version is
     * equal to the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     * A loose-equality operator is used here so that it matches the sub-versions as well.
     */
    isVersionEqualTo(version) {
        return this._parser.getBrowser().version === version;
    }
}
