import { MessageType } from './constants';
import type {
    ITransportBackend,
    ITransportMessage,
    ITransportOptions,
    TransportListener
} from './types';

/**
 * Stores the current transport backend that has to be used. Also implements
 * request/response mechanism.
 */
export default class Transport {
    /**
     * Maps an event name and listeners that have been added to the Transport instance.
     */
    private _listeners: Map<string, Set<TransportListener>>;

    /**
     * The request ID counter used for the id property of the request. This
     * property is used to match the responses with the request.
     */
    private _requestID: number;

    /**
     * Maps IDs of the requests and handlers that will process the responses of those requests.
     */
    private _responseHandlers: Map<number, (message: ITransportMessage) => void>;

    /**
     * A set with the events and requests that were received but not
     * processed by any listener. They are later passed on every new
     * listener until they are processed.
     */
    private _unprocessedMessages: Set<any[]>;

    /**
     * The transport backend.
     */
    private _backend?: ITransportBackend | null;

    /**
     * Alias for on method.
     */
    public addListener: typeof Transport.prototype.on;

    /**
     * Creates new instance.
     *
     * @param {ITransportOptions} options - Optional parameters for configuration of the transport backend.
     */
    constructor({ backend }: ITransportOptions = {}) {
        this._listeners = new Map();
        this._requestID = 0;
        this._responseHandlers = new Map();
        this._unprocessedMessages = new Set();
        this.addListener = this.on;

        if (backend) {
            this.setBackend(backend);
        }
    }

    /**
     * Disposes the current transport backend.
     */
    private _disposeBackend(): void {
        if (this._backend) {
            this._backend.dispose();
            this._backend = null;
        }
    }

    /**
     * Handles incoming messages from the transport backend.
     *
     * @param {ITransportMessage} message - The message.
     * @returns {void}
     */
    private _onMessageReceived(message: ITransportMessage): void {
        if (message.type === MessageType.RESPONSE) {
            const handler = this._responseHandlers.get(message.id!);

            if (handler) {
                handler(message);
                this._responseHandlers.delete(message.id!);
            }
        } else if (message.type === MessageType.REQUEST) {
            this.emit('request', message.data, (result: any, error?: any) => {
                this._backend!.send({
                    type: MessageType.RESPONSE,
                    error,
                    id: message.id,
                    result
                });
            });
        } else {
            this.emit('event', message.data);
        }
    }

    /**
     * Disposes the allocated resources.
     *
     * @returns {void}
     */
    dispose(): void {
        this._responseHandlers.clear();
        this._unprocessedMessages.clear();
        this.removeAllListeners();
        this._disposeBackend();
    }

    /**
     * Calls each of the listeners registered for the event named eventName, in
     * the order they were registered, passing the supplied arguments to each.
     *
     * @param {string} eventName - The name of the event.
     * @param {...any} args - Arguments to pass to the listeners.
     * @returns {boolean} True if the event has been processed by any listener, false otherwise.
     */
    emit(eventName: string, ...args: any[]): boolean {
        const listenersForEvent = this._listeners.get(eventName);
        let isProcessed = false;

        if (listenersForEvent?.size) {
            listenersForEvent.forEach(listener => {
                isProcessed = listener(...args) || isProcessed;
            });
        }

        if (!isProcessed) {
            this._unprocessedMessages.add(args);
        }

        return isProcessed;
    }

    /**
     * Adds the listener function to the listeners collection for the event
     * named eventName.
     *
     * @param {string} eventName - The name of the event.
     * @param {TransportListener} listener - The listener that will be added.
     * @returns {Transport} References to the instance of Transport class, so that calls can be chained.
     */
    on(eventName: string, listener: TransportListener): this {
        let listenersForEvent = this._listeners.get(eventName);

        if (!listenersForEvent) {
            listenersForEvent = new Set();
            this._listeners.set(eventName, listenersForEvent);
        }

        listenersForEvent.add(listener);

        this._unprocessedMessages.forEach(args => {
            if (listener(...args)) {
                this._unprocessedMessages.delete(args);
            }
        });

        return this;
    }

    /**
     * Removes all listeners, or those of the specified eventName.
     *
     * @param {string} [eventName] - The name of the event. If this parameter is not specified all listeners will be removed.
     * @returns {Transport} References to the instance of Transport class, so that calls can be chained.
     */
    removeAllListeners(eventName?: string): this {
        if (eventName) {
            this._listeners.delete(eventName);
        } else {
            this._listeners.clear();
        }

        return this;
    }

    /**
     * Removes the listener function from the listeners collection for the event
     * named eventName.
     *
     * @param {string} eventName - The name of the event.
     * @param {TransportListener} listener - The listener that will be removed.
     * @returns {Transport} References to the instance of Transport class, so that calls can be chained.
     */
    removeListener(eventName: string, listener: TransportListener): this {
        const listenersForEvent = this._listeners.get(eventName);

        if (listenersForEvent) {
            listenersForEvent.delete(listener);
        }

        return this;
    }

    /**
     * Sends the passed event.
     *
     * @param {Object} [event={}] - The event to be sent.
     * @returns {void}
     */
    sendEvent(event: any = {}): void {
        if (this._backend) {
            this._backend.send({
                type: MessageType.EVENT,
                data: event
            });
        }
    }

    /**
     * Sending request.
     *
     * @param {Object} request - The request to be sent.
     * @returns {Promise<any>} A promise that resolves with the response result or rejects with an error.
     */
    sendRequest(request: any): Promise<any> {
        if (!this._backend) {
            return Promise.reject(new Error('No transport backend defined!'));
        }

        this._requestID++;

        const id = this._requestID;

        return new Promise((resolve, reject) => {
            this._responseHandlers.set(id, ({ error, result }: ITransportMessage) => {
                if (typeof result !== 'undefined') {
                    resolve(result);

                // eslint-disable-next-line no-negated-condition
                } else if (typeof error !== 'undefined') {
                    reject(error);
                } else { // no response
                    reject(new Error('Unexpected response format!'));
                }
            });

            try {
                this._backend!.send({
                    type: MessageType.REQUEST,
                    data: request,
                    id
                });
            } catch (error) {
                this._responseHandlers.delete(id);
                reject(error);
            }
        });
    }

    /**
     * Changes the current backend transport.
     *
     * @param {ITransportBackend} backend - The new transport backend that will be used.
     * @returns {void}
     */
    setBackend(backend: ITransportBackend): void {
        this._disposeBackend();

        this._backend = backend;
        this._backend.setReceiveCallback(this._onMessageReceived.bind(this));
    }
}
