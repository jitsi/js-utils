/* eslint-disable */

import { safeJsonParse } from '../json';

// Originally: https://github.com/adtile/postis
//
// The MIT License
//
// Copyright (c) 2015-2015 Adtile Technologies Inc. http://www.adtile.me
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * Postis options configuration.
 */
export interface PostisOptions {
    scope: string;
    window: Window;
    windowForEventListening?: Window;
    allowedOrigin?: string;
}

/**
 * Parameters for sending a message.
 */
export interface SendOptions {
    method: string;
    params?: any;
}

/**
 * Message data structure for postMessage communication.
 */
interface MessageData {
    postis: boolean;
    scope: string;
    method: string;
    params?: any;
}

/**
 * Creates a postMessage-based communication channel between windows.
 */
export default class Postis {
    private scope: string;
    private targetWindow: Window;
    private windowForEventListening: Window;
    private allowedOrigin?: string;
    private listeners: Record<string, Array<(params: any) => void>> = {};
    private sendBuffer: SendOptions[] = [];
    private listenBuffer: Record<string, any[]> = {};
    private _ready: boolean = false;
    private readyMethod: string = "__ready__";
    private readynessCheck: number;
    private readyCheckID: string;
    private listener: (event: MessageEvent) => void;

    /**
     * Creates a new Postis instance.
     *
     * @param {PostisOptions} options - Configuration options for the postis instance.
     */
    constructor(options: PostisOptions) {
        this.scope = options.scope;
        this.targetWindow = options.window;
        this.windowForEventListening = options.windowForEventListening || window;
        this.allowedOrigin = options.allowedOrigin;
        this.readyCheckID = `${Date.now()}-${Math.random()}`;

        // Bind the listener method to preserve 'this' context.
        this.listener = this.handleMessage.bind(this);

        this.windowForEventListening.addEventListener("message", this.listener, false);

        // Start readiness check.
        this.readynessCheck = window.setInterval(() => {
            this.send({
                method: this.readyMethod,
                params: this.readyCheckID
            });
        }, 50);

        // Listen for readiness check responses.
        this.listen(this.readyMethod, (id: string) => {
            if (id === this.readyCheckID) {
                window.clearInterval(this.readynessCheck);
                this._ready = true;

                for (let i = 0; i < this.sendBuffer.length; i++) {
                    this.send(this.sendBuffer[i]);
                }
                this.sendBuffer = [];
            } else {
                this.send({
                    method: this.readyMethod,
                    params: id
                });
            }
        });
    }

    /**
     * Handles incoming postMessage events.
     *
     * @param {MessageEvent} event - The message event from postMessage.
     * @returns {void}
     */
    private handleMessage(event: MessageEvent): void {
        let data: MessageData | null;
        try {
            data = safeJsonParse(event.data) as MessageData;
        } catch (e) {
            return;
        }

        if (this.allowedOrigin && event.origin !== this.allowedOrigin) {
            return;
        }

        if (data && data.postis && data.scope === this.scope) {
            const listenersForMethod = this.listeners[data.method];
            if (listenersForMethod) {
                for (let i = 0; i < listenersForMethod.length; i++) {
                    listenersForMethod[i].call(null, data.params);
                }
            } else {
                this.listenBuffer[data.method] = this.listenBuffer[data.method] || [];
                this.listenBuffer[data.method].push(data.params);
            }
        }
    }

    /**
     * Registers a listener for a specific method.
     *
     * @param {string} method - The method name to listen for.
     * @param {Function} callback - The callback function to invoke when the method is received.
     * @returns {void}
     */
    listen(method: string, callback: (params: any) => void): void {
        this.listeners[method] = this.listeners[method] || [];
        this.listeners[method].push(callback);

        const listenBufferForMethod = this.listenBuffer[method];
        if (listenBufferForMethod) {
            const listenersForMethod = this.listeners[method];
            for (let i = 0; i < listenersForMethod.length; i++) {
                for (let j = 0; j < listenBufferForMethod.length; j++) {
                    listenersForMethod[i].call(null, listenBufferForMethod[j]);
                }
            }
        }
        delete this.listenBuffer[method];
    }

    /**
     * Sends a message to the target window.
     *
     * @param {SendOptions} opts - The message options containing method and params.
     * @returns {void}
     */
    send(opts: SendOptions): void {
        const method = opts.method;

        if ((this._ready || opts.method === this.readyMethod) &&
            (this.targetWindow && typeof this.targetWindow.postMessage === "function")) {
            this.targetWindow.postMessage(JSON.stringify({
                postis: true,
                scope: this.scope,
                method: method,
                params: opts.params
            }), "*");
        } else {
            this.sendBuffer.push(opts);
        }
    }

    /**
     * Executes the callback when the connection is ready.
     *
     * @param {Function} callback - The callback to execute when ready.
     * @returns {void}
     */
    ready(callback: () => void): void {
        if (this._ready) {
            callback();
        } else {
            setTimeout(() => { this.ready(callback); }, 50);
        }
    }

    /**
     * Destroys the postis instance and cleans up resources.
     *
     * @param {Function} [callback] - Optional callback to execute after cleanup.
     * @returns {void}
     */
    destroy(callback?: () => void): void {
        window.clearInterval(this.readynessCheck);
        this._ready = false;
        if (this.windowForEventListening && typeof this.windowForEventListening.removeEventListener === "function") {
            this.windowForEventListening.removeEventListener("message", this.listener);
        }
        callback && callback();
    }
}
