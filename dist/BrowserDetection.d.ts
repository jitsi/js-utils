interface IBrowserInfo {
    name: string;
    version: string;
    engine?: string;
    engineVersion?: string;
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
    constructor(browserInfo: IBrowserInfo);
    /**
     * Checks if current browser is Chrome.
     * @returns {boolean}
     */
    isChrome(): boolean;
    /**
     * Checks if current browser is Firefox.
     * @returns {boolean}
     */
    isFirefox(): boolean;
    /**
     * Checks if current browser is Safari.
     * @returns {boolean}
     */
    isSafari(): boolean;
    /**
     * Checks if current environment is Electron.
     * @returns {boolean}
     */
    isElectron(): boolean;
    /**
     * Checks if current environment is React Native.
     * @returns {boolean}
     */
    isReactNative(): boolean;
    /**
     * Checks if current browser is based on chromium.
     * @returns {boolean}
     */
    isChromiumBased(): boolean;
    /**
     * Checks if current browser is based on webkit.
     * @returns {boolean}
     */
    isWebKitBased(): boolean;
    /**
     * Gets current browser name.
     * @returns {string}
     */
    getName(): string;
    /**
     * Returns the version of the current browser.
     * @returns {string}
     */
    getVersion(): string;
    /**
     * Gets current engine name of the browser.
     * @returns {string}
     */
    getEngine(): string | undefined;
    /**
     * Returns the engine version of the current browser.
     * @returns the engine version
     */
    getEngineVersion(): string | undefined;
    /**
     * Returns the operating system.
     */
    getOS(): string;
    /**
     * Return the os version.
     */
    getOSVersion(): string;
    /**
     * Compares the passed version with the current browser version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean} - Returns true if the current version is greater than the passed version and false otherwise.
     */
    isVersionGreaterThan(version: number): boolean;
    /**
     * Compares the passed version with the current browser version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean} - Returns true if the current version is lower than the passed version and false otherwise.
     */
    isVersionLessThan(version: number): boolean;
    /**
     * Compares the passed version with the current browser version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean} - Returns true if the current version is equal to the passed version and false otherwise.
     */
    isVersionEqualTo(version: number): boolean;
    /**
     * Compares the passed version with the current engine version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean} - Returns true if the current version is greater than the passed version and false otherwise.
     */
    isEngineVersionGreaterThan(version: number): boolean;
    /**
     * Compares the passed version with the current engine version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean} - Returns true if the current version is lower than the passed version and false otherwise.
     */
    isEngineVersionLessThan(version: number): boolean;
    /**
     * Compares the passed version with the current engine version.
     *
     * @param {number} version - The version to compare with.
     * @returns {boolean} - Returns true if the current version is equal to the passed version and false otherwise.
     */
    isEngineVersionEqualTo(version: number): boolean;
}
export {};
