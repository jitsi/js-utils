// NOTE: The 'events' module is a devDependency (not a runtime dependency).
// Consumers of this package are expected to provide 'events' via their bundler (e.g., webpack) or
// environment (e.g., nodeJS). For tests only, we include 'events' in devDependencies.
import EventEmitter from 'events';

/**
 * Dummy implementation of Storage interface.
 */
class DummyLocalStorage extends EventEmitter {

    /**
     * The object used for storage.
     */
    _storage: Record<string, string> = {};

    /**
     * Empties all keys out of the storage.
     *
     * @returns {void}
     */
    clear(): void {
        this._storage = {};
    }

    /**
     * Returns the number of data items stored in the Storage object.
     *
     * @returns {number} The number of data items stored in the Storage object.
     */
    get length(): number {
        return Object.keys(this._storage).length;
    }

    /**
     * Will return that key's value associated to the passed key name.
     *
     * @param {string} keyName - The key name.
     * @returns {string | null} The key value.
     */
    getItem(keyName: string): string | null {
        return this._storage[keyName] ?? null;
    }

    /**
     * When passed a key name and value, will add that key to the storage,
     * or update that key's value if it already exists.
     *
     * @param {string} keyName - The key name.
     * @param {string} keyValue - The key value.
     * @returns {void}
     */
    setItem(keyName: string, keyValue: string): void {
        this._storage[keyName] = keyValue;
    }

    /**
     * When passed a key name, will remove that key from the storage.
     *
     * @param {string} keyName - The key name.
     * @returns {void}
     */
    removeItem(keyName: string): void {
        delete this._storage[keyName];
    }

    /**
     * When passed a number n, this method will return the name of the nth key in the storage.
     *
     * @param {number} n - The index of the key.
     * @returns {string | null} The nth key name, or null if index is out of bounds.
     */
    key(n: number): string | null {
        const keys = Object.keys(this._storage);

        if (keys.length <= n) {
            return null;
        }

        return keys[n];
    }

    /**
     * Serializes the content of the storage.
     *
     * @param {string[]} [ignore=[]] - Array with keys from the local storage to be ignored.
     * @returns {string} The serialized content.
     */
    serialize(ignore: string[] = []): string {
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
export class JitsiLocalStorage extends EventEmitter {
    /**
     * The storage backend (either window.localStorage or DummyLocalStorage).
     */
    private _storage: Storage | DummyLocalStorage;

    /**
     * Whether window.localStorage is disabled.
     */
    private _localStorageDisabled: boolean = false;

    /**
     * Creates a new JitsiLocalStorage instance.
     */
    constructor() {
        super();

        let storage: Storage | DummyLocalStorage | undefined;

        try {
            storage = window.localStorage;
            this._localStorageDisabled = false;
        } catch (ignore) {
            // localStorage throws an exception.
        }

        if (!storage) { // Handles the case when window.localStorage is undefined or throws an exception.
            console.warn('Local storage is disabled.');
            storage = new DummyLocalStorage();
            this._localStorageDisabled = true;
        }

        this._storage = storage;
    }

    /**
     * Returns true if window.localStorage is disabled and false otherwise.
     *
     * @returns {boolean} True if window.localStorage is disabled and false otherwise.
     */
    isLocalStorageDisabled(): boolean {
        return this._localStorageDisabled;
    }

    /**
     * Switch between window.localStorage and DummyLocalStorage.
     *
     * @param {boolean} value - Whether to disable localStorage.
     * @returns {void}
     */
    setLocalStorageDisabled(value: boolean): void {
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
    clear(): void {
        this._storage.clear();
        this.emit('changed');
    }

    /**
     * Returns the number of data items stored in the Storage object.
     *
     * @returns {number} The number of data items stored in the Storage object.
     */
    get length(): number {
        return this._storage.length;
    }

    /**
     * Returns that passed key's value.
     *
     * @param {string} keyName - The name of the key you want to retrieve the value of.
     * @returns {string | null} The value of the key. If the key does not exist, null is returned.
     */
    getItem(keyName: string): string | null {
        return this._storage.getItem(keyName);
    }

    /**
     * Adds a key to the storage, or update key's value if it already exists.
     *
     * @param {string} keyName - The name of the key you want to create/update.
     * @param {string} keyValue - The value you want to give the key you are creating/updating.
     * @param {boolean} [dontEmitChangedEvent=false] - If true a changed event won't be emitted.
     * @returns {void}
     */
    setItem(keyName: string, keyValue: string, dontEmitChangedEvent: boolean = false): void {
        this._storage.setItem(keyName, keyValue);

        if (!dontEmitChangedEvent) {
            this.emit('changed');
        }
    }

    /**
     * Remove a key from the storage.
     *
     * @param {string} keyName - The name of the key you want to remove.
     * @returns {void}
     */
    removeItem(keyName: string): void {
        this._storage.removeItem(keyName);
        this.emit('changed');
    }

    /**
     * Returns the name of the nth key in the list, or null if n is greater
     * than or equal to the number of key/value pairs in the object.
     *
     * @param {number} i - The index of the key in the list.
     * @returns {string | null} The name of the nth key, or null if out of bounds.
     */
    key(i: number): string | null {
        return this._storage.key(i);
    }

    /**
     * Serializes the content of the storage.
     *
     * @param {string[]} [ignore=[]] - Array with keys from the local storage to be ignored.
     * @returns {string} The serialized content.
     */
    serialize(ignore: string[] = []): string {
        if (this.isLocalStorageDisabled()) {
            return (this._storage as DummyLocalStorage).serialize(ignore);
        }

        const length = this._storage.length;
        const localStorageContent: Record<string, string | null> = {};

        for (let i = 0; i < length; i++) {
            const key = this._storage.key(i);

            if (key && !ignore.includes(key)) {
                localStorageContent[key] = this._storage.getItem(key);
            }
        }

        return JSON.stringify(localStorageContent);
    }
}

export const jitsiLocalStorage = new JitsiLocalStorage();
