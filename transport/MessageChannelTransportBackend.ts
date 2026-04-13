import type { ITransportBackend } from './types';

/**
 * Options for MessageChannelTransportBackend.
 */
export interface IMessageChannelTransportBackendOptions {

    /**
     * The origin to use for postMessage calls and origin checks.
     */
    origin?: string;

    /**
     * A scope identifier used to namespace channel initialization messages,
     * allowing multiple independent channels on the same window.
     */
    scope?: string;

    /**
     * Whether this side should create the MessageChannel.
     * When true, creates a new MessageChannel and sends port2 to the target window.
     * When false, listens for an incoming channel initialization message.
     */
    shouldCreateChannel?: boolean;

    /**
     * The target window to send the initial channel port to.
     * Defaults to window.parent.
     */
    targetWindow?: Window;
}

/**
 * Implements message transport using the postMessage API.
 */
export default class MessageChannelTransportBackend implements ITransportBackend {
    /**
     * The underlying MessageChannel instance used when this side creates the channel.
     */
    private channel?: MessageChannel;

    /**
     * The expected origin for postMessage calls and origin validation.
     * When set, incoming messages from other origins are rejected.
     */
    private origin?: string;

    /**
     * The MessagePort used for sending and receiving messages.
     */
    private port?: MessagePort;

    /**
     * A scope identifier used to namespace or a shared secret for messages.
     */
    private scope?: string;

    /**
     * Callback function for receiving messages.
     */
    private _receiveCallback: (message: any) => void;

    /**
     * Creates a new MessageChannelTransportBackend instance.
     *
     * @param {IMessageChannelTransportBackendOptions} options - Configuration options for the transport backend.
     */
    constructor({ shouldCreateChannel = false, targetWindow = window.parent, origin, scope }: IMessageChannelTransportBackendOptions) {
        this._initialMessageHandler = this._initialMessageHandler.bind(this);
        this.origin = origin;
        this.scope = scope;

        if (shouldCreateChannel) {
            this.channel = new MessageChannel();
            this.port = this.channel.port1;
            targetWindow.postMessage({
                type: 'init_channel',
                scope: this.scope
            }, origin ?? '*', [ this.channel.port2 ]);
        } else {
            window.addEventListener('message', this._initialMessageHandler);
        }


        this._receiveCallback = () => {
            // Do nothing until a callback is set by the consumer of
            // MessageChannelTransportBackend via setReceiveCallback.
        };

        if (this.port) {
            this.port.onmessage = (event: MessageEvent) => {
                this._receiveCallback(event.data);
            };
        }
    }

    /**
     * Handles the initial postMessage event to receive the MessagePort from the channel creator.
     *
     * @param {MessageEvent} event - The incoming message event.
     */
    _initialMessageHandler(event: MessageEvent) {
        if (this.origin && event.origin !== this.origin) {
            return;
        }

        const { data, ports } = event;

        // TODO: For security maybe add common secret (maybe passed trough the URL of an iframe)
        if (data?.type === 'init_channel' && data.scope === this.scope && ports?.length) {
            this.port = event.ports[0];
            this.port.onmessage = (ev: MessageEvent) => {
                this._receiveCallback(ev.data);
            };
            window.removeEventListener('message', this._initialMessageHandler);
        }
    }

    /**
     * Disposes the allocated resources.
     *
     * @returns {void}
     */
    dispose(): void {
        this.port?.close();
        delete this.port;
        delete this.channel;
        window.removeEventListener('message', this._initialMessageHandler);
    }

    /**
     * Sends the passed message.
     *
     * @param {any} message - The message to be sent.
     * @param {Array<any>} [transfer] - Optional array of transferable objects.
     * @returns {void}
     */
    send(message: any, transfer?: Transferable[]): void {
        this.port?.postMessage(message, { transfer });
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
