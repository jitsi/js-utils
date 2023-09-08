import { UAParser } from 'ua-parser-js';

import {
    CHROME,
    FIREFOX,
    SAFARI,
    WEBKIT,
    NWJS,
    ELECTRON,
    REACT_NATIVE,
    UNKNOWN,
    PARSER_TO_JITSI_NAME,
    ENGINES,
    BLINK
} from './constants.js';

/**
 * Detects NWJS environment.
 *
 * @returns {Object|undefined} - The name (NWJS) and version.
 */
function _detectNWJS() {
    const userAgent = navigator.userAgent;

    if (userAgent.match(/JitsiMeetNW/)) {
        return {
            name: NWJS,
            version: userAgent.match(/JitsiMeetNW\/([\d.]+)/)[1]
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
 * Returns the Jitsi recognized name for the engine
 *
 * @param {string} engine - The engine name got by the parser
 * @returns
 */
function _getJitsiEngineName(engine) {
    return ENGINES[engine];
}

/**
 * Returns the Jitsi recognized name for the browser
 *
 * @param {string} browser - The browser name got by the parser
 * @returns
 */
function _getJitsiBrowserName(browser) {
    return PARSER_TO_JITSI_NAME[browser] ?? UNKNOWN;
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
        _detectNWJS
    ];

    // Try all browser detectors
    for (let i = 0; i < detectors.length; i++) {
        browserInfo = detectors[i]();
        if (browserInfo) {
            return browserInfo;
        }
    }

    const { name: parserName, version } = parser.getBrowser();
    const engine = _getJitsiEngineName(parser.getEngine().name);
    const name = _getJitsiBrowserName(parserName);

    return {
        name,
        version: name === UNKNOWN ? undefined : version,
        engine
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
        let engine, name, version;

        this._parser = new UAParser(navigator.userAgent);
        if (typeof browserInfo === 'undefined') {
            const detectedBrowserInfo = _detect(this._parser);

            name = detectedBrowserInfo.name;
            version = detectedBrowserInfo.version;
            engine = detectedBrowserInfo.engine;
        } else {
            name = _getJitsiBrowserName(browserInfo.name);
            version = name === UNKNOWN ? undefined : browserInfo.version;
            engine = _getJitsiEngineName(browserInfo.engine.name);
        }

        this._name = name;
        this._version = version;
        this._engine = engine;
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
     * Checks if current browser is based on chromium.
     * @returns {boolean}
     */
    isChromiumBased() {
        return this._engine === BLINK;
    }

    /**
     * Checks if current browser is based on webkit.
     * @returns {boolean}
     */
    isWebKitBased() {
        return this._engine === WEBKIT;
    }

    /**
     * Returns the version of the current browser.
     * @returns {string}
     */
    getVersion() {
        return this._version;
    }

    /**
     * Returns the operating system.
     */
    getOS() {
        return this._parser.getOS().name;
    }

    /**
     * Return the os version.
     */
    getOSVersion() {
        return this._parser.getOS().version;
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {number|string} version - The version to compare with. 
     * @returns {boolean|undefined} - Returns true if the current version is
     * greater than the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     */
    isVersionGreaterThan(version) {
        return parseInt(this._parser.getBrowser().version, 10) > parseInt(version, 10);
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {number|string} version - The version to compare with. 
     * @returns {boolean|undefined} - Returns true if the current version is
     * lower than the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     */
    isVersionLessThan(version) {
        return parseInt(this._parser.getBrowser().version, 10) < parseInt(version, 10);
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {number|string} version - The version to compare with. 
     * @returns {boolean|undefined} - Returns true if the current version is
     * equal to the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     * A loose-equality operator is used here so that it matches the sub-versions as well.
     */
    isVersionEqualTo(version) {
        return parseInt(this._parser.getBrowser().version, 10) === parseInt(version, 10);
    }
}
