import type { ITransportBackend } from './types';

/**
 * Implements message transport using direct function calls
 * instead of the postMessage API. Designed for embedding Jitsi Meet
 * directly into a host page without an iframe.
 */
export default class EmbeddedTransportBackend implements ITransportBackend {
    /**
     * The other end of this transport pair.
     */
    _otherEnd: EmbeddedTransportBackend | null;

    /**
     * Callback function for receiving messages.
     */
    private _receiveCallback: (message: any) => void;

    constructor() {
        this._otherEnd = null;
        this._receiveCallback = () => {
            // Do nothing until a callback is set by the consumer
            // via setReceiveCallback.
        };
    }

    /**
     * Disposes the backend and severs the connection to the other end.
     *
     * @returns {void}
     */
    dispose(): void {
        if (this._otherEnd) {
            this._otherEnd._otherEnd = null;
            this._otherEnd = null;
        }

        this._receiveCallback = () => {
            // no-op
        };
    }

    /**
     * Sends a message to the other end of the pair by directly
     * invoking its receiver callback.
     */
    send(message: any): void {
        this._otherEnd?._receiveCallback(message);
    }

    /**
     * Sets the callback for receiving messages from the other end.
     *
     * @param {Function} callback - The new callback.
     * @returns {void}
     */
    setReceiveCallback(callback: (message: any) => void): void {
        this._receiveCallback = callback;
    }
}

export function createEmbeddedTransportPair(): [EmbeddedTransportBackend, EmbeddedTransportBackend] {
    const backendA = new EmbeddedTransportBackend();
    const backendB = new EmbeddedTransportBackend();

    backendA._otherEnd = backendB;
    backendB._otherEnd = backendA;

    return [ backendA, backendB ];
}
