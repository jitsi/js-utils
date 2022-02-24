import BrowserDetection from '../browser-detection/BrowserDetection';

// TODO: Move BrowserCapabilities from lib-jitsi-meet here and use the JSON
// format for them.

type Capabilities = {
    isSupported: boolean;
    audioIn: boolean;
    audioOut: boolean;
    screenSharing: boolean;
    videoIn: boolean;
    videoOut: boolean;
};

type CapabilitiesByVersion = {
    capabilities: Capabilities;
    iframeCapabilities: Partial<Capabilities> & {
        isSupported: boolean;
    };
};

type CapabilitiesDb = {
    [ key: string ]: Array<{ version?: string } & CapabilitiesByVersion>
};

/**
 * Implements browser capabilities for lib-jitsi-meet.
 */
export default class BrowserCapabilities {
    readonly _capabilities: Partial<Capabilities> & { isSupported: boolean };

    /**
     * Creates new BrowserCapabilities instance.
     *
     * @param capabilitiesDB - The JSON database with capabilities.
     * @param [isUsingIFrame] - True if Jitsi Meet is loaded in iframe
     * and false otherwise.
     * @param [browserInfo] - Information about the browser.
     * @param browserInfo.name - The name of the browser.
     * @param browserInfo.version - The version of the browser.
     */
    constructor( capabilitiesDB: CapabilitiesDb = {}, isUsingIFrame = false, browserInfo?: { name: string, version: string } ) {
        const browser = new BrowserDetection( browserInfo );

        let capabilitiesByVersion: CapabilitiesByVersion;

        // If the capabilitiesDB is not in the correct format or the type of the
        // version of the browser is undefined(the version is unknown) or the
        // version type is not compatible (not a string) we'll consider the
        // browser as not supported.
        if ( typeof capabilitiesDB === 'object'
            && typeof browser.getVersion() === 'string' ) {
            const browserCapabilities = capabilitiesDB[ browser.getName() ] || [];

            for ( let i = 0; i < browserCapabilities.length; i++ ) {
                const capabilities = browserCapabilities[ i ];

                if ( typeof capabilities !== 'object' ) {
                    // eslint-disable-next-line no-continue
                    continue;
                }

                const version = capabilities.version;

                if ( !version || !browser.isVersionGreaterThan( version ) ) {
                    capabilitiesByVersion = capabilities;
                    break;
                }
            }
        }

        if ( !capabilitiesByVersion || !capabilitiesByVersion.capabilities ) {
            this._capabilities = { isSupported: false };
        } else if ( isUsingIFrame ) {
            this._capabilities = {
                ...capabilitiesByVersion.capabilities,
                ...capabilitiesByVersion.iframeCapabilities
            };
        } else {
            this._capabilities = capabilitiesByVersion.capabilities;
        }

        if ( typeof this._capabilities.isSupported === 'undefined' ) {
            // we have some capabilities but isSupported property is not filled.
            this._capabilities.isSupported = true;
        } else if ( this._capabilities.isSupported === false ) {
            // Clean the other capabilities.
            this._capabilities = { isSupported: false };
        }
    }

    /**
     * Checks whether the browser is supported by Jitsi Meet.
     */
    readonly isSupported = () => this._capabilities.isSupported;

    /**
     * Checks whether the browser supports incoming audio.
     */
    readonly supportsAudioIn = () => this._capabilities.audioIn || false;

    /**
     * Checks whether the browser supports outgoing audio.
     */
    readonly supportsAudioOut = () => this._capabilities.audioOut || false;

    /**
     * Checks whether the browser supports screen sharing.
     */
    readonly supportsScreenSharing = () => this._capabilities.screenSharing || false;

    /**
     * Checks whether the browser supports incoming video.
     */
    readonly supportsVideoIn = () => this._capabilities.videoIn || false;

    /**
     * Checks whether the browser supports outgoing video.
     */
    readonly supportsVideoOut = () => this._capabilities.videoOut || false;
}
