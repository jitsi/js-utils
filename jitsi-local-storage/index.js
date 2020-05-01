/**
 * Dummy implementation of Storage interface with empty methods.
 */
class DummyLocalStorage {
    /* eslint-disable no-empty-function */
    /**
     * Empty function
     */
    getItem() { }

    /**
     * Empty function
     */
    setItem() { }

    /**
     * Empty function
     */
    removeItem() { }

    /**
     * Empty function
     */
    key() { }
    /* eslint-enable no-empty-function */
}

/**
 * Wrapper class for browser's local storage object.
 */
class JitsiLocalStorage extends DummyLocalStorage {
    /**
     * @constructor
     * @param {Storage} storage browser's local storage object.
     */
    constructor() {
        super();
        let storage;

        try {
            storage = window.localStorage;
        } catch (error) {
            // do nothing
        }
        this.storage = storage || new DummyLocalStorage();
    }

    /**
     * Returns that passed key's value.
     * @param {string} keyName the name of the key you want to retrieve
     * the value of.
     * @returns {String|null} the value of the key. If the key does not exist,
     * null is returned.
     */
    getItem(keyName) {
        return this.storage.getItem(keyName);
    }

    /**
     * Adds a key to the storage, or update key's value if it already exists.
     * @param {string} keyName the name of the key you want to create/update.
     * @param {string} keyValue the value you want to give the key you are
     * creating/updating.
     */
    setItem(keyName, keyValue) {
        return this.storage.setItem(keyName, keyValue);
    }

    /**
     * Remove a key from the storage.
     * @param {string} keyName the name of the key you want to remove.
     */
    removeItem(keyName) {
        return this.storage.removeItem(keyName);
    }

    /**
     * Returns the name of the nth key in the list, or null if n is greater
     * than or equal to the number of key/value pairs in the object.
     *
     * @param {number} i - The index of the key in the list.
     * @returns {string}
     */
    key(i) {
        return this.storage.key(i);
    }
}

export const jitsiLocalStorage = new JitsiLocalStorage();
