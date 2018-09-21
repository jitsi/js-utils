import bowser from 'bowser';

import {
    CHROME,
    OPERA,
    FIREFOX,
    INTERNET_EXPLORER,
    EDGE,
    SAFARI,
    NWJS,
    ELECTRON,
    REACT_NATIVE,
    UNKNOWN
} from './browsers';

/**
 * Maps the names of the browsers from bowser to the internal names defined in
 * ./browsers.js
 */
const bowserNameToJitsiName = {
    'Chrome': CHROME,
    'Chromium': CHROME,
    'Opera': OPERA,
    'Firefox': FIREFOX,
    'Internet Explorer': INTERNET_EXPLORER,
    'Microsoft Edge': EDGE,
    'Safari': SAFARI
};

/**
 * Detects a Chromium based environent.
 * 
 * NOTE: Here we cannot check solely for "Chrome" in the UA string and the
 * "window.chrome" property, because Edge has both, so we add an explicit
 * check for NOT Edge.
 *
 * @returns {Object|undefined} - The name (CHROME) and version.
 */
function _detectChromiumBased() {
    const userAgent = navigator.userAgent;

    if (Boolean(window.chrome)
            && !userAgent.match(/Edge/) && userAgent.match(/Chrome/)) {
        const version = userAgent.match(/Chrome\/([\d.]+)/)[1];

        return {
            name: CHROME,
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
        const version = userAgent.match(/Electron\/([\d.]+)/)[1];

        return {
            name: ELECTRON,
            version
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
 *
 * @returns {Object} - The name and version of the browser.
 */
function _detect() {
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

    const { name, version } = bowser;

    if (name in bowserNameToJitsiName) {
        return {
            name: bowserNameToJitsiName[name],
            version
        };
    }

    // Detect other browsers with the Chrome engine, such as Vivaldi.
    browserInfo = _detectChromiumBased();
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

        if (typeof browserInfo === 'undefined') {
            const detectedBrowserInfo = _detect();

            name = detectedBrowserInfo.name;
            version = detectedBrowserInfo.version;
        } else if (browserInfo.name in bowserNameToJitsiName) {
            name = bowserNameToJitsiName[browserInfo.name];
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
     * Checks if current browser is Microsoft Edge.
     * @returns {boolean}
     */
    isEdge() {
        return this._name === EDGE;
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
     * Returns the version of the current browser.
     * @returns {string}
     */
    getVersion() {
        return this._version;
    }

    /**
     * Compares the passed version with the current browser version.
     * {@see https://github.com/lancedikson/bowser}
     */
    static compareVersions = bowser.compareVersions;

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {*} version - The version to compare with. Anything different
     * than string will be converted to string.
     * @returns {number|undefined} - Returns 0 if the version is equal to the
     * current one, 1 if the version is greater than the current one, -1 if the
     * version is lower than the current one and undefined if the current
     * browser version is unknown.
     */
    compareVersion(version) {
        if (this._version) {
            return bowser.compareVersions([ String(version), this._version ]);
        }
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
        return this.compareVersion(version) === -1;
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
        return this.compareVersion(version) === 1;
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {*} version - The version to compare with. Anything different
     * than string will be converted to string.
     * @returns {boolean|undefined} - Returns true if the current version is
     * equal to the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     */
    isVersionEqualTo(version) {
        return this.compareVersion(version) === 0;
    }
}
