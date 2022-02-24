import Bowser from 'bowser';

import {
    CHROME,
    OPERA,
    FIREFOX,
    INTERNET_EXPLORER,
    SAFARI,
    NWJS,
    ELECTRON,
    REACT_NATIVE,
    UNKNOWN
} from './browsers';

/**
 * Maps the names of the browsers from bowser to the internal names defined in
 * ./browsers.ts
 */
const bowserNameToJitsiName: { [ key: string ]: string } = {
    'Chrome': CHROME,
    'Chromium': CHROME,
    'Opera': OPERA,
    'Firefox': FIREFOX,
    'Internet Explorer': INTERNET_EXPLORER,
    'Safari': SAFARI
};

type BrowserInfo = {
    name: string;
    version?: string;
}

/**
 * Detects a Chromium based environment.
 *
 * NOTE: Here we cannot check solely for "Chrome" in the UA, because Edge has
 * it too. We need to check explicitly for chromium based Edge first and then
 * detect other chromium based browsers.
 *
 * @returns - The name (CHROME) and version.
 */
const _detectChromiumBased = (): BrowserInfo | undefined => {
    const userAgent = navigator.userAgent;
    const browserInfo: BrowserInfo = {
        name: UNKNOWN,
        version: undefined
    };

    if ( userAgent.match( /Chrome/ ) && !userAgent.match( /Edge/ ) ) {
        // Edge is currently supported only on desktop and android.
        if ( userAgent.match( /Edg(A?)/ ) ) {
            // Compare the underlying chromium version.
            const version = userAgent.match( /Chrome\/([\d.]+)/ )[ 1 ];

            if ( Number.parseInt( version, 10 ) > 72 ) {
                browserInfo.name = CHROME;
                browserInfo.version = version;
            }
        } else {
            browserInfo.name = CHROME;
            browserInfo.version = userAgent.match( /Chrome\/([\d.]+)/ )[ 1 ];
        }
    }

    return browserInfo;
}

/**
 * Detects Electron environment.
 *
 * @returns - The name (ELECTRON) and version.
 */
const _detectElectron = (): BrowserInfo | undefined => {
    const userAgent = navigator.userAgent;

    if ( userAgent.match( /Electron/ ) ) {
        const version = userAgent.match( /Electron(?:\s|\/)([\d.]+)/ )[ 1 ];

        return {
            name: ELECTRON,
            version
        };
    } else if ( typeof ( window as any ).JitsiMeetElectron !== 'undefined' ) {
        return {
            name: ELECTRON,
            version: undefined
        };
    }
}

/**
 * Detects NWJS environment.
 *
 * @returns - The name (NWJS) and version.
 */
const _detectNWJS = (): BrowserInfo | undefined => {
    const userAgent = navigator.userAgent;

    if ( userAgent.match( /JitsiMeetNW/ ) ) {
        const version = userAgent.match( /JitsiMeetNW\/([\d.]+)/ )[ 1 ];

        return {
            name: NWJS,
            version
        };
    }
}

/**
 * Detects React Native environment.
 * @returns - The name (REACT_NATIVE) and version.
 */
const _detectReactNative = (): BrowserInfo | undefined => {
    const match = navigator.userAgent.match( /\b(react[ \t_-]*native)(?:\/(\S+))?/i );
    let version: string;

    // If we're remote debugging a React Native app, it may be treated as
    // Chrome. Check navigator.product as well and always return some version
    // even if we can't get the real one.

    if ( match || navigator.product === 'ReactNative' ) {
        let name: string;

        if ( match && match.length > 2 ) {
            name = match[ 1 ];
            version = match[ 2 ];
        }
        name || ( name = 'react-native' );
        version || ( version = 'unknown' );

        return {
            name: REACT_NATIVE,
            version
        };
    }
}

/**
 * Returns information about the current browser.
 * @param - The bowser instance.
 * @returns - The name and version of the browser.
 */
const _detect = ( bowser: Bowser.Parser.Parser ): BrowserInfo => {
    let browserInfo: BrowserInfo;
    const detectors = [
        _detectReactNative,
        _detectElectron,
        _detectNWJS
    ];

    // Try all browser detectors
    for ( const detector of detectors ) {
        browserInfo = detector();
        if ( browserInfo ) {
            return browserInfo;
        }
    }

    const name = bowser.getBrowserName();

    if ( name in bowserNameToJitsiName ) {
        return {
            name: bowserNameToJitsiName[ name ],
            version: bowser.getBrowserVersion()
        };
    }

    // Detect other browsers with the Chrome engine, such as Vivaldi and Brave.
    browserInfo = _detectChromiumBased();
    if ( browserInfo ) {
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
    readonly _bowser: Bowser.Parser.Parser;
    readonly _name: string;
    readonly _version?: string;

    /**
     * Creates new BrowserDetection instance.
     *
     * @param {Object} [browserInfo] - Information about the browser.
     * @param {string} browserInfo.name - The name of the browser.
     * @param {string} browserInfo.version - The version of the browser.
     */
    constructor( browserInfo?: BrowserInfo ) {
        let name: string, version: string;

        this._bowser = Bowser.getParser( navigator.userAgent );
        if ( typeof browserInfo === 'undefined' ) {
            const detectedBrowserInfo = _detect( this._bowser );

            name = detectedBrowserInfo.name;
            version = detectedBrowserInfo.version;
        } else if ( browserInfo.name in bowserNameToJitsiName ) {
            name = bowserNameToJitsiName[ browserInfo.name ];
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
     */
    readonly getName = () => this._name;

    /**
     * Checks if current browser is Chrome.
     */
    readonly isChrome = () => this._name === CHROME;

    /**
     * Checks if current browser is Opera.
     */
    readonly isOpera = () => this._name === OPERA;

    /**
     * Checks if current browser is Firefox.
     */
    readonly isFirefox = () => this._name === FIREFOX;

    /**
     * Checks if current browser is Internet Explorer.
     */
    readonly isIExplorer = () => this._name === INTERNET_EXPLORER;

    /**
     * Checks if current browser is Safari.
     */
    readonly isSafari = () => this._name === SAFARI;

    /**
     * Checks if current environment is NWJS.
     */
    readonly isNWJS = () => this._name === NWJS;

    /**
     * Checks if current environment is Electron.
     */
    readonly isElectron = () => this._name === ELECTRON;

    /**
     * Checks if current environment is React Native.
     */
    readonly isReactNative = () => this._name === REACT_NATIVE;

    /**
     * Returns the version of the current browser.
     */
    readonly getVersion = () => this._version;

    /**
     * Check if the parsed browser matches the passed condition.
     *
     * @param checkTree - It's one or two layered object, which can include a
     * platform or an OS on the first layer and should have browsers specs on the
     * bottom layer.
     * Eg. { chrome: '>71.1.0' }
     *     { windows: { chrome: '<70.2' } }
     * @returns - Returns true if the browser satisfies the set
     * conditions, false if not and undefined when the browser is not defined in the
     * checktree object or when the current browser's version is unknown.
     * @private
     */
    readonly _checkCondition = ( checkTree: Bowser.Parser.checkTree ): boolean | undefined => {
        if ( this._version ) {
            return this._bowser.satisfies( checkTree );
        }
    }

    /**
     * Compares the passed version with the current browser version.
     *
     * @param version - The version to compare with. Anything different
     * than string will be converted to string.
     * @returns - Returns true if the current version is
     * greater than the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     */
    readonly isVersionGreaterThan = ( version: unknown ) => this._checkCondition( { [ this._name ]: `>${ version }` } );

    /**
     * Compares the passed version with the current browser version.
     *
     * @param version - The version to compare with. Anything different
     * than string will be converted to string.
     * @returns - Returns true if the current version is
     * lower than the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     */
    readonly isVersionLessThan = ( version: unknown ) => this._checkCondition( { [ this._name ]: `<${ version }` } );

    /**
     * Compares the passed version with the current browser version.
     *
     * @param version - The version to compare with. Anything different
     * than string will be converted to string.
     * @returns - Returns true if the current version is
     * equal to the passed version and false otherwise. Returns undefined if
     * the current browser version is unknown.
     * A loose-equality operator is used here so that it matches the sub-versions as well.
     */
    readonly isVersionEqualTo = ( version: unknown ) => this._checkCondition( { [ this._name ]: `~${ version }` } );
}
