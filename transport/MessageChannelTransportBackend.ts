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
 * Implements message transport using the MessageChannel API.
 *
 * When shouldCreateChannel is true, a new MessageChannel is created and port2 is
 * transferred to the target window via postMessage. When false, the backend listens
 * for an incoming init_channel message carrying the port.
 *
 * Outgoing messages sent before the port is established (receiver side) are buffered and
 * flushed automatically once the handshake completes. Incoming messages are buffered
 * natively by the MessagePort until a receive callback is wired via setReceiveCallback,
 * since assigning onmessage implicitly starts the port.
 *
 * Re-handshake: on the receiver side the init_channel listener stays attached for the
 * lifetime of the backend. If the creator (e.g. an iframe) self-navigates or reloads
 * and posts a fresh init_channel, the receiver closes the previous (now-dead) port and
 * adopts the new one transparently. MessageChannel exposes no liveness signal, so this
 * "always re-adopt the latest matching port" policy is the only way to keep working
 * across in-creator reloads without cooperation from the creator side.
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
     * Callback function for receiving messages. Undefined until setReceiveCallback is called;
     * while undefined the MessagePort remains unstarted and buffers incoming messages natively.
     */
    private receiveCallback?: (message: any) => void;

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

        if (shouldCreateChannel) {
            this.channel = new MessageChannel();
            this.port = this.channel.port1;
            targetWindow.postMessage({
                type: 'init_channel',
                scope: this.scope
            }, origin ?? '*', [ this.channel.port2 ]);
        } else {
            window.addEventListener('message', this.initialMessageHandler);
        }
    }

    /**
     * Handles the initial postMessage event to receive the MessagePort from the channel creator.
     *
     * The listener remains attached for the lifetime of the backend so that if the creator
     * self-reloads (its previous document and port1 are gone, leaving the receiver with an
     * inert port2 that the platform never signals), a fresh init_channel can replace the
     * dead port without cooperation from the creator.
     *
     * @param {MessageEvent} event - The incoming message event.
     */
    private initialMessageHandler(event: MessageEvent) {
        if (this.origin && event.origin !== this.origin) {
            return;
        }

        const { data, ports } = event;

        if (data?.type === 'init_channel' && data.scope === this.scope && ports?.length) {
            // Release the previous port (if any) before adopting the new one. Closing also
            // detaches its onmessage handler, so no stale messages can still be dispatched.
            this.port?.close();

            this.port = event.ports[0];

            // Only start the port (via onmessage assignment) if the consumer has already wired
            // a receive callback. Otherwise let the port buffer incoming messages natively until
            // setReceiveCallback is called.
            if (this.receiveCallback) {
                this.port.onmessage = this.handlePortMessage;
            }
            this.flushPendingMessages();
        }
    }

    /**
     * Forwards messages from the MessagePort to the current receive callback.
     *
     * @param {MessageEvent} event - The incoming port message event.
     */
    private handlePortMessage = (event: MessageEvent): void => {
        this.receiveCallback?.(event.data);
    };

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
        this.receiveCallback = undefined;
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
     * Sets the callback for receiving data. If the MessagePort is available and has not
     * yet been started, this also starts it (by assigning onmessage), flushing any messages
     * buffered natively by the port since the handshake completed.
     *
     * @param {Function} callback - The new callback.
     * @returns {void}
     */
    setReceiveCallback(callback: (message: any) => void): void {
        this.receiveCallback = callback;

        if (this.port && !this.port.onmessage) {
            this.port.onmessage = this.handlePortMessage;
        }
    }
}
