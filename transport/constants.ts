/**
 * Message types for transport communication.
 *
 * @enum {string}
 */
export enum MessageType {
    /**
     * The message type for events.
     *
     * @type {string}
     */
    EVENT = 'event',

    /**
     * The message type for requests.
     *
     * @type {string}
     */
    REQUEST = 'request',

    /**
     * The message type for responses.
     *
     * @type {string}
     */
    RESPONSE = 'response'
}
