import {
    MESSAGE_TYPE_EVENT,
    MESSAGE_TYPE_REQUEST,
    MESSAGE_TYPE_RESPONSE
} from './constants';

type Message = {
    type: string;
    id?: number;
    data?: unknown;
    error?: unknown;
    result?: unknown;
};

type ListenerFunc = ( ...args: Array<unknown> ) => boolean | undefined;

type ResponseFunc = ( message: unknown ) => void;

type Backend = {
    dispose: () => void;
    send: ( message: Message ) => void;
    setReceiveCallback: ( callback: () => void ) => void;
};

/**
* Stores the current transport backend that have to be used. Also implements
* request/response mechanism.
*/
export default class Transport {
    _listeners: Map<string, Set<ListenerFunc>>;
    _requestID: number;
    _responseHandlers: Map<number, ResponseFunc>;
    _unprocessedMessages: Set<Array<unknown>>;
    _backend: Backend;

    protected addListener: ( eventName: string, listener: ListenerFunc ) => void;

    /**
     * Creates new instance.
     *
     * @param options - Optional parameters for configuration of the
     * transport backend.
     */
    constructor( { backend }: { backend?: Backend } = {} ) {
        /**
         * Maps an event name and listener that have been added to the Transport
         * instance.
         */
        this._listeners = new Map<string, Set<ListenerFunc>>();

        /**
         * The request ID counter used for the id property of the request. This
         * property is used to match the responses with the request.
         */
        this._requestID = 0;

        /**
         * Maps an IDs of the requests and handlers that will process the
         * responses of those requests.
         */
        this._responseHandlers = new Map<number, ResponseFunc>();

        /**
         * A set with the events and requests that were received but not
         * processed by any listener. They are later passed on every new
         * listener until they are processed.
         */
        this._unprocessedMessages = new Set<Array<unknown>>();

        /**
         * Alias.
         */
        this.addListener = this.on;

        if ( backend ) {
            this.setBackend( backend );
        }
    }

    /**
     * Disposes the current transport backend.
     */
    readonly _disposeBackend = () => {
        if ( this._backend ) {
            this._backend.dispose();
            this._backend = null;
        }
    };

    /**
     * Handles incoming messages from the transport backend.
     *
     * @param message - The message.
     */
    readonly _onMessageReceived = ( message: Message ): void => {
        if ( message.type === MESSAGE_TYPE_RESPONSE ) {
            const handler = this._responseHandlers.get( message.id );

            if ( handler ) {
                handler( message );
                this._responseHandlers.delete( message.id );
            }
        } else if ( message.type === MESSAGE_TYPE_REQUEST ) {
            this.emit( 'request', message.data, ( result: unknown, error: unknown ) => {
                this._backend.send( {
                    type: MESSAGE_TYPE_RESPONSE,
                    error,
                    id: message.id,
                    result
                } );
            } );
        } else {
            this.emit( 'event', message.data );
        }
    };

    /**
     * Disposes the allocated resources.
     */
    readonly dispose = () => {
        this._responseHandlers.clear();
        this._unprocessedMessages.clear();
        this.removeAllListeners();
        this._disposeBackend();
    };

    /**
     * Calls each of the listeners registered for the event named eventName, in
     * the order they were registered, passing the supplied arguments to each.
     *
     * @param eventName -  The name of the event.
     * @returns True if the event has been processed by any listener,
     * false otherwise.
     */
    readonly emit = ( eventName: string, ...args: Array<unknown> ): boolean => {
        const listenersForEvent = this._listeners.get( eventName );
        let isProcessed = false;

        if ( listenersForEvent && listenersForEvent.size ) {
            listenersForEvent.forEach( listener => {
                isProcessed = listener( ...args ) || isProcessed;
            } );
        }

        if ( !isProcessed ) {
            this._unprocessedMessages.add( args );
        }

        return isProcessed;
    };

    /**
     * Adds the listener function to the listeners collection for the event
     * named eventName.
     *
     * @param eventName -  The name of the event.
     * @param listener - The listener that will be added.
     * @returns References to the instance of Transport class, so
     * that calls can be chained.
     */
    readonly on = ( eventName: string, listener: ListenerFunc ): Transport => {
        let listenersForEvent = this._listeners.get( eventName );

        if ( !listenersForEvent ) {
            listenersForEvent = new Set();
            this._listeners.set( eventName, listenersForEvent );
        }

        listenersForEvent.add( listener );

        this._unprocessedMessages.forEach( args => {
            if ( listener( ...args as Array<unknown> ) ) {
                this._unprocessedMessages.delete( args );
            }
        } );

        return this;
    };

    /**
     * Removes all listeners, or those of the specified eventName.
     *
     * @param [eventName] - The name of the event. If this parameter is
     * not specified all listeners will be removed.
     * @returns References to the instance of Transport class, so
     * that calls can be chained.
     */
    readonly removeAllListeners = ( eventName?: string ): Transport => {
        if ( eventName ) {
            this._listeners.delete( eventName );
        } else {
            this._listeners.clear();
        }

        return this;
    };

    /**
     * Removes the listener function from the listeners collection for the event
     * named eventName.
     *
     * @param eventName -  The name of the event.
     * @param listener - The listener that will be removed.
     * @returns References to the instance of Transport class, so
     * that calls can be chained.
     */
    readonly removeListener = ( eventName: string, listener: ListenerFunc ): Transport => {
        const listenersForEvent = this._listeners.get( eventName );

        if ( listenersForEvent ) {
            listenersForEvent.delete( listener );
        }

        return this;
    };

    /**
     * Sends the passed event.
     *
     * @param event - The event to be sent.
     */
    readonly sendEvent = ( event: unknown = {} ) => {
        if ( this._backend ) {
            this._backend.send( {
                type: MESSAGE_TYPE_EVENT,
                data: event
            } );
        }
    };

    /**
     * Sending request.
     *
     * @param request - The request to be sent.
     */
    readonly sendRequest = ( request: object ): Promise<unknown> => {
        if ( !this._backend ) {
            return Promise.reject( new Error( 'No transport backend defined!' ) );
        }

        this._requestID++;

        const id = this._requestID;

        return new Promise( ( resolve, reject ) => {
            this._responseHandlers.set( id, ( { error, result } ) => {
                if ( typeof result !== 'undefined' ) {
                    resolve( result );

                    // eslint-disable-next-line no-negated-condition
                } else if ( typeof error !== 'undefined' ) {
                    reject( error );
                } else { // no response
                    reject( new Error( 'Unexpected response format!' ) );
                }
            } );

            this._backend.send( {
                type: MESSAGE_TYPE_REQUEST,
                data: request,
                id
            } );
        } );
    };

    /**
     * Changes the current backend transport.
     *
     * @param backend - The new transport backend that will be used.
     */
    readonly setBackend = ( backend: Backend ) => {
        this._disposeBackend();

        this._backend = backend;
        this._backend.setReceiveCallback( this._onMessageReceived.bind( this ) );
    };
}
