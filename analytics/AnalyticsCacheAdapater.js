import { getLogger } from 'jitsi-meet-logger';

const MAX_CACHE_SIZE = 100;

// eslist-disable-line no-undef
const logger = getLogger(__filename);

/**
 * AnalyticsCacheAdapater class implements the functionality to route events to
 * multiple analytics handlers and to cache the events if no handlers are added.
 */
class AnalyticsCacheAdapater {
    /**
     * Creates new AnalyticsCacheAdapater instance.
     */
    constructor() {
        /**
         * Whether this AnalyticsCacheAdapater has been disposed of or not. Once
         * this is set to true, the AnalyticsCacheAdapater is disabled and does
         * not accept any more events, and it can not be re-enabled.
         * @type {boolean}
         */
        this._disposed = false;

        /**
         * The set of handlers to which events will be sent.
         * @type {Set<any>}
         */
        this._analyticsHandlers = new Set();

        /**
         * The cache of events which are not sent yet. The cache is enabled
         * while this field is truthy, and disabled otherwise.
         * @type {Array}
         */
        this._cache = [];
    }

    /**
     * Dispose analytics. Clears all handlers.
     */
    dispose() {
        this.setAnalyticsHandlers([]);
        this._disposed = true;
    }

    /**
     * Sets the handlers that are going to be used to send analytics. Sends any
     * cached events.
     * @param {Array} handlers the handlers
     */
    setAnalyticsHandlers(handlers) {
        if (this._disposed) {
            return;
        }

        this._analyticsHandlers = new Set(handlers);

        // Note that we disable the cache even if the set of handlers is empty.
        const cache = this._cache;

        this._cache = null;
        if (cache) {
            cache.forEach(event => this._sendEvent(event));
        }
    }

    /**
     * Sends an event with a given name and given properties.
     *
     * @param {Object} event the event that will be send.
     */
    sendEvent(event) {
        if (this._disposed) {
            logger.warn('Not sending an event, disposed.');

            return;
        }

        this._sendEvent(event);
    }

    /**
     * Saves an event to the cache, if the cache is enabled.
     * @param event the event to save.
     * @returns {boolean} true if the event was saved, and false otherwise (i.e.
     * if the cache was disabled).
     * @private
     */
    _maybeCacheEvent(event) {
        if (this._cache) {
            this._cache.push(event);

            // We limit the size of the cache, in case the user fails to ever
            // set the analytics handlers.
            if (this._cache.length > MAX_CACHE_SIZE) {
                this._cache.splice(0, 1);
            }

            return true;
        }

        return false;

    }

    /**
     * Caches the event or formats( using _formatEvent() ) and routes the event
     * to all analytics handlers.
     *
     * @param event - The event to be sent.
     * @private
     */
    _sendEvent(event) {
        if (this._maybeCacheEvent(event)) {
            // The event was consumed by the cache.
        } else {
            // We append the permanent properties at the time we send the event,
            // not at the time we receive it.
            const formattedEvent = this._formatEvent(event);

            for (const handler of this.analyticsHandlers) {
                try {
                    handler.sendEvent(formattedEvent);
                } catch (e) {
                    logger.warn(`Error sending analytics event: ${e}`);
                }
            }
        }
    }

    /**
     * This method is called just before sending the event in order to provide
     * interface for classes that extend AnalyticsCacheAdpater to format the
     * events before sending.
     *
     * @param {Object} event - The event to be formatted.
     * @returns {Object} - The formatted event.
     */
    _formatEvent(event) {
        return event;
    }
}

export default AnalyticsCacheAdapater;
