import { BrowserDetection } from '../browser-detection';

// TODO: Move BrowserCapabilities from lib-jitsi-meet here and use the JSON
// format for them.

/**
 * Implements browser capabilities for lib-jitsi-meet.
 */
export default class BrowserCapabilities {
    /**
     * Creates new BrowserCapabilities instance.
     *
     * @param {Object} capabilitiesDB - The JSON database with capabilities.
     * @param {boolean} [isUsingIFrame] - True if Jitsi Meet is loaded in iframe
     * and false otherwise.
     * @param {Object} [browserInfo] - Information about the browser.
     * @param {string} browserInfo.name - The name of the browser.
     * @param {string} browserInfo.version - The version of the browser.
     */
    constructor(capabilitiesDB = {}, isUsingIFrame = false, browserInfo) {
        const browser = new BrowserDetection(browserInfo);
        let capabilitiesByVersion;

        // If the capabilitiesDB is not in the correct format or the type of the
        // version of the browser is undefined(the version is unknown) or the
        // version type is not compatible (not a string) we'll consider the
        // browser as not supported.
        if (typeof capabilitiesDB === 'object'
                && typeof browser.getVersion() === 'string') {
            const browserCapabilities = capabilitiesDB[browser.getName()] || [];

            for (let i = 0; i < browserCapabilities.length; i++) {
                const capabilities = browserCapabilities[i];

                if (typeof capabilities !== 'object') {
                    // eslint-disable-next-line no-continue
                    continue;
                }

                const version = capabilities.version;

                if (!version || !browser.isVersionGreaterThan(version)) {
                    capabilitiesByVersion = capabilities;
                    break;
                }
            }
        }

        if (!capabilitiesByVersion || !capabilitiesByVersion.capabilities) {
            this._capabilities = { isSupported: false };
        } else if (isUsingIFrame) {
            this._capabilities = {
                ...capabilitiesByVersion.capabilities,
                ...capabilitiesByVersion.iframeCapabilities
            };
        } else {
            this._capabilities = capabilitiesByVersion.capabilities;
        }

        if (typeof this._capabilities.isSupported === 'undefined') {
            // we have some capabilities but isSupported property is not filled.
            this._capabilities.isSupported = true;
        } else if (this._capabilities.isSupported === false) {
            // Clean the other capabilities.
            this._capabilities = { isSupported: false };
        }
    }

    /**
     * Checks whether the browser is supported by Jitsi Meet.
     *
     * @returns {boolean}
     */
    isSupported() {
        return this._capabilities.isSupported;
    }

    /**
     * Checks whether the browser supports incoming audio.
     *
     * @returns {boolean}
     */
    supportsAudioIn() {
        return this._capabilities.audioIn || false;
    }

    /**
     * Checks whether the browser supports outgoing audio.
     *
     * @returns {boolean}
     */
    supportsAudioOut() {
        return this._capabilities.audioOut || false;
    }


    /**
     * Checks whether the browser supports screen sharing.
     *
     * @returns {boolean}
     */
    supportsScreenSharing() {
        return this._capabilities.screenSharing || false;
    }

    /**
     * Checks whether the browser supports incomming video.
     *
     * @returns {boolean}
     */
    supportsVideoIn() {
        return this._capabilities.videoIn || false;
    }

    /**
     * Checks whether the browser supports incomming video.
     *
     * @returns {boolean}
     */
    supportsVideoOut() {
        return this._capabilities.videoOut || false;
    }
}
