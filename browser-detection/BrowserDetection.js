import { UAParser } from 'ua-parser-js';

import {
    BLINK,
    CHROME,
    ELECTRON,
    ENGINES,
    GECKO,
    PARSER_TO_JITSI_NAME,
    REACT_NATIVE,
    SAFARI,
    WEBKIT
} from './constants.js';

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
 * Returns the Jitsi recognized name for the browser
 *
 * @param {Object} [browserInfo] - Information about the browser.
 * @param {string} browserInfo.name - The name of the browser.
 * @param {string} browserInfo.version - The version of the browser.
 * @param {string} browserInfo.engine - The engine of the browser.
 * @param {string} browserInfo.engineVersion - The version of the engine of the browser.
 * @param {string} browserInfo.os - The os of the browser.
 * @param {string} browserInfo.osVersion - The os version of the browser.
 * @returns
 */
function _getJitsiBrowserInfo(browserInfo) {
    return {
        name: PARSER_TO_JITSI_NAME[browserInfo.name],
        version: browserInfo.version,
        engine: ENGINES[browserInfo.engine],
        engineVersion: browserInfo.engineVersion
    };
}

/**
 * Returns information about the current browser.
 * @param {Object} - The parser instance.
 * @returns {Object} - The name and version of the browser.
 */
function _detect(parser) {
    const reactNativeInfo = _detectReactNative();

    if (reactNativeInfo) {
        return reactNativeInfo;
    }

    const { name, version } = parser.getBrowser();
    const { name: engine, version: engineVersion } = parser.getEngine();

    return _getJitsiBrowserInfo({
        name,
        version,
        engine,
        engineVersion });
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
     * @param {string} browserInfo.engine - The engine of the browser.
     * @param {string} browserInfo.engineVersion - The version of the engine of the browser.
     * @param {string} browserInfo.os - The os of the browser.
     * @param {string} browserInfo.osVersion - The os version of the browser.
     */
    constructor(browserInfo) {
        this._parser = new UAParser(navigator.userAgent);

        const {
            name,
            version,
            engine,
            engineVersion
        } = browserInfo ? _getJitsiBrowserInfo(browserInfo) : _detect(this._parser);

        this._name = name;
        this._version = version;
        this._engine = engine;
        this._engineVersion = engineVersion;
    }

    /**
     * Checks if current browser is Chrome.
     * @returns {boolean}
     */
    isChrome() {
        // for backward compatibility returns true for all Chromium browsers
        return this._name === CHROME || this._engine === BLINK;
    }

    /**
     * Checks if current browser is Firefox.
     * @returns {boolean}
     */
    isFirefox() {
        return this._engine === GECKO;
    }

    /**
     * Checks if current browser is Safari.
     * @returns {boolean}
     */
    isSafari() {
        return this._name === SAFARI;
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
     * Gets current browser name.
     * @returns {string}
     */
    getName() {
        if (this._name) {
            return this._name;
        }

        return this._parser.getBrowser().name;
    }

    /**
     * Returns the version of the current browser.
     * @returns {string}
     */
    getVersion() {
        if (this._version) {
            return this._version;
        }

        return this._parser.getBrowser().version;
    }

    /**
     * Gets current engine name of the browser.
     * @returns {string}
     */
    getEngine() {
        return this._engine;
    }

    /**
     * Returns the engine version of the current browser.
     * @returns the engine version
     */
    getEngineVersion() {
        return this._engineVersion;
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
        if (this._version) {
            return parseInt(this._version, 10) > parseInt(version, 10);
        }
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
        if (this._version) {
            return parseInt(this._version, 10) < parseInt(version, 10);
        }
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
        if (this._version) {
            return parseInt(this._version, 10) === parseInt(version, 10);
        }
    }

    /**
     * Compares the passed version with the current engine version.
     *
     * @param {number|string} version - The version to compare with.
     * @returns {boolean|undefined} - Returns true if the current version is
     * greater than the passed version and false otherwise. Returns undefined if
     * the current engine version is unknown.
     */
    isEngineVersionGreaterThan(version) {
        if (this._engineVersion) {
            return parseInt(this._engineVersion, 10) > parseInt(version, 10);
        }
    }

    /**
     * Compares the passed version with the current engine version.
     *
     * @param {number|string} version - The version to compare with.
     * @returns {boolean|undefined} - Returns true if the current version is
     * lower than the passed version and false otherwise. Returns undefined if
     * the current engine version is unknown.
     */
    isEngineVersionLessThan(version) {
        if (this._engineVersion) {
            return parseInt(this._engineVersion, 10) < parseInt(version, 10);
        }
    }

    /**
     * Compares the passed version with the current engine version.
     *
     * @param {number|string} version - The version to compare with.
     * @returns {boolean|undefined} - Returns true if the current version is
     * equal to the passed version and false otherwise. Returns undefined if
     * the current engine version is unknown.
     * A loose-equality operator is used here so that it matches the sub-versions as well.
     */
    isEngineVersionEqualTo(version) {
        if (this._engineVersion) {
            return parseInt(this._engineVersion, 10) === parseInt(version, 10);
        }
    }
}
