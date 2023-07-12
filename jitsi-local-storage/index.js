import EventEmitter from 'events';

/**
 * Dummy implementation of Storage interface.
 */
class DummyLocalStorage extends EventEmitter {

    /**
     * The object used for storage.
     */
    _storage = {};

    /**
     * Empties all keys out of the storage.
     *
     * @returns {void}
     */
    clear() {
        this._storage = {};
    }

    /**
     * Returns the number of data items stored in the Storage object.
     *
     * @returns {number} - The number of data items stored in the Storage object.
     */
    get length() {
        return Object.keys(this._storage).length;
    }

    /**
     * Will return that key's value associated to the passed key name.
     *
     * @param {string} keyName - The key name.
     * @returns {*} - The key value.
     */
    getItem(keyName) {
        return this._storage[keyName];
    }

    /**
     * When passed a key name and value, will add that key to the storage,
     * or update that key's value if it already exists.
     *
     * @param {string} keyName - The key name.
     * @param {*} keyValue - The key value.
     * @returns {void}
     */
    setItem(keyName, keyValue) {
        this._storage[keyName] = keyValue;
    }

    /**
     * When passed a key name, will remove that key from the storage.
     *
     * @param {string} keyName - The key name.
     * @returns {void}
     */
    removeItem(keyName) {
        delete this._storage[keyName];
    }

    /**
     * When passed a number n, this method will return the name of the nth key in the storage.
     *
     * @param {number} idx - The index of the key.
     * @returns {string} - The nth key name.
     */
    key(n) {
        const keys = Object.keys(this._storage);

        if (keys.length <= n) {
            return undefined;
        }

        return keys[n];
    }

    /**
     * Serializes the content of the storage.
     *
     * @param {Array<string>} ignore - Array with keys from the local storage to be ignored.
     * @returns {string} - The serialized content.
     */
    serialize(ignore = []) {
        if (ignore.length === 0) {
            return JSON.stringify(this._storage);
        }

        const storageCopy = { ...this._storage };

        ignore.forEach(key => {
            delete storageCopy[key];
        });

        return JSON.stringify(storageCopy);
    }
}

/**
 * Wrapper class for browser's local storage object.
 */
class JitsiLocalStorage extends EventEmitter {
    /**
     * @constructor
     * @param {Storage} storage browser's local storage object.
     */
    constructor() {
        super();

        try {
            this._storage = window.localStorage;
            this._localStorageDisabled = false;
        } catch (ignore) {
            // localStorage throws an exception.
        }

        if (!this._storage) { // Handles the case when window.localStorage is undefined or throws an exception.
            console.warn('Local storage is disabled.');
            this._storage = new DummyLocalStorage();
            this._localStorageDisabled = true;
        }
    }

    /**
     * Returns true if window.localStorage is disabled and false otherwise.
     *
     * @returns {boolean} - True if window.localStorage is disabled and false otherwise.
     */
    isLocalStorageDisabled() {
        return this._localStorageDisabled;
    }

    /**
     * Switch between window.localStorage and DummyLocalStorage.
     */
    setLocalStorageDisabled(value) {
        this._localStorageDisabled = value;

        try {
            this._storage = value ? new DummyLocalStorage() : window.localStorage;
        } catch (ignore) {
            // localStorage throws an exception.
        }

        if (!this._storage) {
            this._storage = new DummyLocalStorage();
        }
    }

    /**
     * Empties all keys out of the storage.
     *
     * @returns {void}
     */
    clear() {
        this._storage.clear();
        this.emit('changed');
    }

    /**
     * Returns the number of data items stored in the Storage object.
     *
     * @returns {number} - The number of data items stored in the Storage object.
     */
    get length() {
        return this._storage.length;
    }

    /**
     * Returns that passed key's value.
     * @param {string} keyName the name of the key you want to retrieve
     * the value of.
     * @returns {String|null} the value of the key. If the key does not exist,
     * null is returned.
     */
    getItem(keyName) {
        return this._storage.getItem(keyName);
    }

    /**
     * Adds a key to the storage, or update key's value if it already exists.
     * @param {string} keyName - the name of the key you want to create/update.
     * @param {string} keyValue - the value you want to give the key you are
     * creating/updating.
     * @param {boolean} dontEmitChangedEvent - If true a changed event won't be emitted.
     */
    setItem(keyName, keyValue, dontEmitChangedEvent = false) {
        this._storage.setItem(keyName, keyValue);

        if (!dontEmitChangedEvent) {
            this.emit('changed');
        }
    }

    /**
     * Remove a key from the storage.
     * @param {string} keyName the name of the key you want to remove.
     */
    removeItem(keyName) {
        this._storage.removeItem(keyName);
        this.emit('changed');
    }

    /**
     * Returns the name of the nth key in the list, or null if n is greater
     * than or equal to the number of key/value pairs in the object.
     *
     * @param {number} i - The index of the key in the list.
     * @returns {string}
     */
    key(i) {
        return this._storage.key(i);
    }

    /**
     * Serializes the content of the storage.
     *
     * @param {Array<string>} ignore - Array with keys from the local storage to be ignored.
     * @returns {string} - The serialized content.
     */
    serialize(ignore = []) {
        if (this.isLocalStorageDisabled()) {
            return this._storage.serialize(ignore);
        }

        const length = this._storage.length;
        const localStorageContent = {};

        for (let i = 0; i < length; i++) {
            const key = this._storage.key(i);

            if (!ignore.includes(key)) {
                localStorageContent[key] = this._storage.getItem(key);
            }
        }

        return JSON.stringify(localStorageContent);
    }
}

export const jitsiLocalStorage = new JitsiLocalStorage();
