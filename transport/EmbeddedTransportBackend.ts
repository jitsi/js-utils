import type { ITransportBackend } from './types';

/**
 * Implements message transport using direct function calls instead of the
 * postMessage API.
 */
export default class EmbeddedTransportBackend implements ITransportBackend {
    /**
     * The other end of this transport pair.
     */
    private _otherEnd: EmbeddedTransportBackend | null;

    /**
     * Callback function for receiving messages.
     */
    private _receiveCallback: (message: any) => void;

    /**
     * Creates a new EmbeddedTransportBackend instance.
     */
    constructor() {
        this._otherEnd = null;
        this._receiveCallback = () => {
            // Do nothing until a callback is set by the consumer
            // via setReceiveCallback.
        };
    }

    /**
     * Disposes the allocated resources.
     *
     * @returns {void}
     */
    dispose(): void {
        if (this._otherEnd) {
            this._otherEnd._otherEnd = null;
            this._otherEnd = null;
        }

        this._receiveCallback = () => {
            // no-op after disposal
        };
    }

    /**
     * Sends the passed message.
     *
     * @param {Object} message - The message to be sent.
     * @returns {void}
     */
    send(message: any): void {
        this._otherEnd?._receiveCallback(message);
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

    /**
     * Creates a linked pair of {@link EmbeddedTransportBackend} instances wired
     * to each other.
     *
     * @returns {[EmbeddedTransportBackend, EmbeddedTransportBackend]}
     */
    static createPair(): [EmbeddedTransportBackend, EmbeddedTransportBackend] {
        const backendA = new EmbeddedTransportBackend();
        const backendB = new EmbeddedTransportBackend();

        backendA._otherEnd = backendB;
        backendB._otherEnd = backendA;

        return [ backendA, backendB ];
    }
}
