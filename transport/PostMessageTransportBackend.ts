import Postis, { PostisOptions } from './postis';
import type { ITransportBackend } from './types';

/**
 * Options for PostMessageITransportBackend.
 */
export interface IPostMessageTransportBackendOptions {
    postisOptions?: Partial<PostisOptions>;
}

/**
 * The default options for postis.
 *
 * @type {Object}
 */
const DEFAULT_POSTIS_OPTIONS: Partial<PostisOptions> = {
    window: window.opener || window.parent
};

/**
 * The postis method used for all messages.
 *
 * @type {string}
 */
const POSTIS_METHOD_NAME = 'message' as const;

/**
 * Implements message transport using the postMessage API.
 */
export default class PostMessageITransportBackend implements ITransportBackend {
    /**
     * The postis instance for communication.
     */
    private postis: Postis;

    /**
     * Callback function for receiving messages.
     */
    private _receiveCallback: (message: any) => void;

    /**
     * Creates new PostMessageITransportBackend instance.
     *
     * @param {Object} options - Optional parameters for configuration of the
     * transport.
     */
    constructor({ postisOptions }: IPostMessageTransportBackendOptions = {}) {
        this.postis = new Postis({
            ...DEFAULT_POSTIS_OPTIONS,
            ...postisOptions
        } as PostisOptions);

        this._receiveCallback = () => {
            // Do nothing until a callback is set by the consumer of
            // PostMessageITransportBackend via setReceiveCallback.
        };

        this.postis.listen(
            POSTIS_METHOD_NAME,
            (message: any) => this._receiveCallback(message));
    }

    /**
     * Disposes the allocated resources.
     *
     * @returns {void}
     */
    dispose(): void {
        this.postis.destroy();
    }

    /**
     * Sends the passed message.
     *
     * @param {Object} message - The message to be sent.
     * @returns {void}
     */
    send(message: any): void {
        this.postis.send({
            method: POSTIS_METHOD_NAME,
            params: message
        });
    }

    /**
     * Sets the callback for receiving data.
     *
     * @param {Function} callback - The new callback.
     * @returns {void}
     */
    setReceiveCallback(callback: (message: any) => void): void {
        this._receiveCallback = callback;
    }
}
