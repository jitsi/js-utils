import type { ITransportBackend } from './types';

/**
 * Options for MessageChannelTransportBackend.
 */
export interface IMessageChannelTransportBackendOptions {

    /**
     * The origin to use for postMessage calls and origin checks.
     * When not provided, the wildcard origin ('*') is used for the initial port transfer,
     * which means any origin can receive the port. For production use with cross-origin
     * iframes, always specify the expected origin to prevent port interception.
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
 * Pending message entry for buffering messages before the port is established.
 */
interface IPendingMessage {

    /**
     * The message to be sent.
     */
    message: any;

    /**
     * Optional array of transferable objects.
     */
    transfer?: Transferable[];
}

/**
 * A noop function.
 */
function noOp() {
    // noop
}

/**
 * Implements message transport using the MessageChannel API.
 *
 * When shouldCreateChannel is true, a new MessageChannel is created and port2 is
 * transferred to the target window via postMessage. When false, the backend listens
 * for an incoming init_channel message carrying the port.
 *
 * Messages sent before the port is established (receiver side) are buffered and
 * flushed automatically once the handshake completes.
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
     * Messages buffered before the port was established on the receiver side.
     * Flushed in order once the port becomes available.
     */
    private pendingMessages: IPendingMessage[];

    /**
     * The MessagePort used for sending and receiving messages.
     */
    private port?: MessagePort;

    /**
     * A scope identifier used to namespace channel initialization messages.
     */
    private scope?: string;

    /**
     * Callback function for receiving messages.
     */
    private receiveCallback: (message: any) => void;

    /**
     * Creates a new MessageChannelTransportBackend instance.
     *
     * @param {IMessageChannelTransportBackendOptions} options - Configuration options for the transport backend.
     */
    constructor({ shouldCreateChannel = false, targetWindow = window.parent, origin, scope }: IMessageChannelTransportBackendOptions) {
        this.initialMessageHandler = this.initialMessageHandler.bind(this);
        this.origin = origin;
        this.scope = scope;
        this.pendingMessages = [];

        // Do nothing until a callback is set by the consumer of
        // MessageChannelTransportBackend via setReceiveCallback.
        this.receiveCallback = noOp;

        if (shouldCreateChannel) {
            this.channel = new MessageChannel();
            this.port = this.channel.port1;
            targetWindow.postMessage({
                type: 'init_channel',
                scope: this.scope
            }, origin ?? '*', [ this.channel.port2 ]);
            this.port.onmessage = (event: MessageEvent) => {
                this.receiveCallback(event.data);
            };
        } else {
            window.addEventListener('message', this.initialMessageHandler);
        }
    }

    /**
     * Handles the initial postMessage event to receive the MessagePort from the channel creator.
     *
     * @param {MessageEvent} event - The incoming message event.
     */
    private initialMessageHandler(event: MessageEvent) {
        if (this.origin && event.origin !== this.origin) {
            return;
        }

        const { data, ports } = event;

        // TODO: For security maybe add common secret (maybe passed through the URL of an iframe)
        if (data?.type === 'init_channel' && data.scope === this.scope && ports?.length) {
            this.port = event.ports[0];
            this.port.onmessage = (ev: MessageEvent) => {
                this.receiveCallback(ev.data);
            };
            window.removeEventListener('message', this.initialMessageHandler);
            this.flushPendingMessages();
        }
    }

    /**
     * Flushes any messages that were buffered before the port was established.
     */
    private flushPendingMessages(): void {
        for (const { message, transfer } of this.pendingMessages) {
            this.port?.postMessage(message, transfer ? { transfer } : undefined);
        }
        this.pendingMessages = [];
    }

    /**
     * Disposes the allocated resources.
     *
     * @returns {void}
     */
    dispose(): void {
        this.port?.close();
        this.port = undefined;
        this.channel = undefined;
        this.pendingMessages = [];
        this.receiveCallback = noOp;
        window.removeEventListener('message', this.initialMessageHandler);
    }

    /**
     * Sends the passed message. If the port has not yet been established (receiver side),
     * the message is buffered and will be sent once the handshake completes.
     *
     * @param {any} message - The message to be sent.
     * @param {Transferable[]} [transfer] - Optional array of transferable objects.
     * @returns {void}
     */
    send(message: any, transfer?: Transferable[]): void {
        if (this.port) {
            this.port.postMessage(message, transfer ? { transfer } : undefined);
        } else {
            this.pendingMessages.push({ message, transfer });
        }
    }

    /**
     * Sets the callback for receiving data.
     *
     * @param {Function} callback - The new callback.
     * @returns {void}
     */
    setReceiveCallback(callback: (message: any) => void): void {
        this.receiveCallback = callback;
    }
}
