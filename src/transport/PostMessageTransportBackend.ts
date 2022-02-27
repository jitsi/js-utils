import Postis from './postis';

/**
 * The default options for postis.
 */
const DEFAULT_POSTIS_OPTIONS = {
    window: window.opener || window.parent
};

/**
 * The postis method used for all messages.
 */
const POSTIS_METHOD_NAME = 'message';

/**
 * Implements message transport using the postMessage API.
 */
export default class PostMessageTransportBackend {
    postis: {
        listen: ( method?: unknown, callback?: unknown ) => void;
        send: ( opts?: unknown ) => void;
        ready: ( callback?: unknown ) => void;
        destroy: ( callback?: unknown ) => void;
    };
    _receiveCallback: ( message?: unknown ) => void;

    /**
     * Creates new PostMessageTransportBackend instance.
     *
     * @param options - Optional parameters for configuration of the
     * transport.
     */
    constructor( { postisOptions }: { postisOptions?: object } = {} ) {
        // eslint-disable-next-line new-cap
        this.postis = Postis( {
            ...DEFAULT_POSTIS_OPTIONS,
            ...postisOptions
        } );

        this._receiveCallback = () => {
            // Do nothing until a callback is set by the consumer of
            // PostMessageTransportBackend via setReceiveCallback.
        };

        this.postis.listen(
            POSTIS_METHOD_NAME,
            ( message: unknown ) => this._receiveCallback( message ) );
    }

    /**
     * Disposes the allocated resources.
     */
    readonly dispose = () => this.postis.destroy();

    /**
     * Sends the passed message.
     *
     * @param message - The message to be sent.
     */
    readonly send = ( message: unknown ) => {
        this.postis.send( {
            method: POSTIS_METHOD_NAME,
            params: message
        } );
    };

    /**
     * Sets the callback for receiving data.
     *
     * @param callback - The new callback.
     */
    readonly setReceiveCallback = ( callback: ( message?: unknown ) => void ) => {
        this._receiveCallback = callback;
    };
}
