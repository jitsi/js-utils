import { UAParser } from 'ua-parser-js';

import {
    Browser,
    Engine,
    ENGINES,
    PARSER_TO_JITSI_NAME,  
} from './constants';

interface IBrowserInfo {
    name: string;
    version: string;
    engine?: string;
    engineVersion?: string;
}

/**
 * Detects React Native environment.
 * @returns {Object|undefined} - The name (REACT_NATIVE) and version.
 */
function _detectReactNative(): IBrowserInfo | undefined {
    const match = navigator.userAgent.match(/\b(react[ \t_-]*native)(?:\/(\S+))?/i);
    let version: string;

    // If we're remote debugging a React Native app, it may be treated as Chrome. Check navigator.product as well and
    // always return some version even if we can't get the real one.
    if (match || navigator.product === 'ReactNative') {
        let name: string = Browser.REACT_NATIVE;
        version = 'unknown';

        if (match && match.length > 2) {
            name = match[1];
            version = match[2];
        }

        return {
            name,
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
function _getJitsiBrowserInfo(browserInfo: IBrowserInfo): IBrowserInfo {
    const { engine, engineVersion, name, version} = browserInfo;

    return {
        name: PARSER_TO_JITSI_NAME[name],
        version,
        engine: ENGINES[engine],
        engineVersion: engineVersion
    };
}

/**
 * Returns information about the current browser.
 * @param {Object} - The parser instance.
 * @returns {Object} - The name and version of the browser.
 */
function _detect(parser: any): IBrowserInfo {
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
    _parser: any;
    _name: string;
    _version: any;
    _engine: string | undefined;
    _engineVersion: string | undefined;

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
    constructor(browserInfo: IBrowserInfo) {
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
    isChrome(): boolean {
        // for backward compatibility returns true for all Chromium browsers
        return this._name === Browser.CHROME || this._engine === Engine.BLINK;
    }

    /**
     * Checks if current browser is Firefox.
     * @returns {boolean}
     */
    isFirefox(): boolean {
        return this._engine === Engine.GECKO;
    }

    /**
     * Checks if current browser is Safari.
     * @returns {boolean}
     */
    isSafari(): boolean {
        return this._name === Browser.SAFARI;
    }

    /**
     * Checks if current environment is Electron.
     * @returns {boolean}
     */
    isElectron(): boolean {
        return this._name === Browser.ELECTRON;
    }

    /**
     * Checks if current environment is React Native.
     * @returns {boolean}
     */
    isReactNative(): boolean {
        return this._name === Browser.REACT_NATIVE;
    }

    /**
     * Checks if current browser is based on chromium.
     * @returns {boolean}
     */
    isChromiumBased(): boolean {
        return this._engine === Engine.BLINK;
    }

    /**
     * Checks if current browser is based on webkit.
     * @returns {boolean}
     */
    isWebKitBased(): boolean {
        return this._engine === Engine.WEBKIT;
    }

    /**
     * Gets current browser name.
     * @returns {string}
     */
    getName(): string {
        if (this._name) {
            return this._name;
        }

        return this._parser.getBrowser().name;
    }

    /**
     * Returns the version of the current browser.
     * @returns {string}
     */
    getVersion(): string {
        if (this._version) {
            return this._version;
        }

        return this._parser.getBrowser().version;
    }

    /**
     * Gets current engine name of the browser.
     * @returns {string}
     */
    getEngine(): string | undefined {
        return this._engine;
    }

    /**
     * Returns the engine version of the current browser.
     * @returns the engine version
     */
    getEngineVersion(): string | undefined {
        return this._engineVersion;
    }

    /**
     * Returns the operating system.
     */
    getOS(): string {
        return this._parser.getOS().name;
    }

    /**
     * Return the os version.
     */
    getOSVersion(): string {
        return this._parser.getOS().version;
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean|undefined} - Returns true if the current version is
     * greater than the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     */
    isVersionGreaterThan(version: number): boolean | undefined {
        if (this._version) {
            return parseInt(this._version, 10) > version;
        }
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean|undefined} - Returns true if the current version is
     * lower than the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     */
    isVersionLessThan(version: number): boolean | undefined {
        if (this._version) {
            return parseInt(this._version, 10) < version;
        }
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean|undefined} - Returns true if the current version is
     * equal to the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     * A loose-equality operator is used here so that it matches the sub-versions as well.
     */
    isVersionEqualTo(version: number): boolean | undefined {
        if (this._version) {
            return parseInt(this._version, 10) === version;
        }
    }

    /**
     * Compares the passed version with the current engine version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean|undefined} - Returns true if the current version is
     * greater than the passed version and false otherwise. Returns undefined if
     * the current engine version is unknown.
     */
    isEngineVersionGreaterThan(version: number): boolean | undefined {
        if (this._engineVersion) {
            return parseInt(this._engineVersion, 10) > version;
        }
    }

    /**
     * Compares the passed version with the current engine version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean|undefined} - Returns true if the current version is
     * lower than the passed version and false otherwise. Returns undefined if
     * the current engine version is unknown.
     */
    isEngineVersionLessThan(version: number): boolean | undefined {
        if (this._engineVersion) {
            return parseInt(this._engineVersion, 10) < version;
        }
    }

    /**
     * Compares the passed version with the current engine version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean|undefined} - Returns true if the current version is
     * equal to the passed version and false otherwise. Returns undefined if
     * the current engine version is unknown.
     * A loose-equality operator is used here so that it matches the sub-versions as well.
     */
    isEngineVersionEqualTo(version: number): boolean | undefined {
        if (this._engineVersion) {
            return parseInt(this._engineVersion, 10) === version;
        }
    }
}
