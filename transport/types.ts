import { MessageType } from './constants';

/**
 * Transport backend interface.
 */
export interface ITransportBackend {
    /**
     * Disposes the transport backend and cleans up resources.
     *
     * @returns {void}
     */
    dispose: () => void;

    /**
     * Sends a message through the transport.
     *
     * @param {any} message - The message to send.
     * @returns {void}
     */
    send: (message: any) => void;

    /**
     * Sets the callback function to handle received messages.
     *
     * @param {Function} callback - The callback function.
     * @returns {void}
     */
    setReceiveCallback: (callback: (message: any) => void) => void;
}

/**
 * Transport options.
 */
export interface ITransportOptions {
    backend?: ITransportBackend;
}

/**
 * Listener function type.
 */
export type TransportListener = (...args: any[]) => boolean | void;

/**
 * Response callback type for handling request/response pattern.
 */
export type ResponseCallback = (result: any, error?: any) => void;

/**
 * Message types for transport communication.
 */
export interface ITransportMessage {
    data?: any;
    error?: any;
    id?: number;
    result?: any;
    type: MessageType;
}
