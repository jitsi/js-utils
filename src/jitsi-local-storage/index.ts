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
     */
    readonly clear = () => this._storage = {};

    /**
     * Returns the number of data items stored in the Storage object.
     *
     * @returns - The number of data items stored in the Storage object.
     */
    get length() {
        return Object.keys( this._storage ).length;
    }

    /**
     * Will return that key's value associated to the passed key name.
     *
     * @param keyName - The key name.
     * @returns - The key value.
     */
    readonly getItem = ( keyName: string ) => this._storage[ keyName ];

    /**
     * When passed a key name and value, will add that key to the storage,
     * or update that key's value if it already exists.
     *
     * @param keyName - The key name.
     * @param keyValue - The key value.
     */
    readonly setItem = ( keyName: string, keyValue: unknown ) => this._storage[ keyName ] = keyValue;

    /**
     * When passed a key name, will remove that key from the storage.
     *
     * @param keyName - The key name.
     */
    readonly removeItem = ( keyName: string ) => delete this._storage[ keyName ];

    /**
     * When passed a number n, this method will return the name of the nth key in the storage.
     *
     * @param idx - The index of the key.
     * @returns - The nth key name.
     */
    readonly key = ( n: number ) => {
        const keys = Object.keys( this._storage );

        if ( keys.length <= n ) {
            return undefined;
        }

        return keys[ n ];
    }

    /**
     * Serializes the content of the storage.
     *
     * @returns - The serialized content.
     */
    readonly serialize = () => JSON.stringify( this._storage );
}

/**
 * Wrapper class for browser's local storage object.
 */
class JitsiLocalStorage extends EventEmitter {
    _storage: Storage;
    _localStorageDisabled: boolean;

    /**
     * @constructor
     * @param {Storage} storage browser's local storage object.
     */
    constructor() {
        super();

        try {
            this._storage = window.localStorage;
            this._localStorageDisabled = false;
        } catch ( ignore ) {
            // localStorage throws an exception.
        }

        if ( !this._storage ) { // Handles the case when window.localStorage is undefined or throws an exception.
            console.warn( 'Local storage is disabled.' );
            this._storage = new DummyLocalStorage();
            this._localStorageDisabled = true;
        }
    }

    /**
     * Returns true if window.localStorage is disabled and false otherwise.
     *
     * @returns - True if window.localStorage is disabled and false otherwise.
     */
    readonly isLocalStorageDisabled = () => this._localStorageDisabled;

    /**
     * Empties all keys out of the storage.
     */
    readonly clear = () => {
        this._storage.clear();
        this.emit( 'changed' );
    }

    /**
     * Returns the number of data items stored in the Storage object.
     *
     * @returns - The number of data items stored in the Storage object.
     */
    get length() {
        return this._storage.length;
    }

    /**
     * Returns that passed key's value.
     * @param keyName the name of the key you want to retrieve
     * the value of.
     * @returns the value of the key. If the key does not exist,
     * null is returned.
     */
    readonly getItem = ( keyName: string ) => this._storage.getItem( keyName );

    /**
     * Adds a key to the storage, or update key's value if it already exists.
     * @param keyName - the name of the key you want to create/update.
     * @param keyValue - the value you want to give the key you are
     * creating/updating.
     * @param dontEmitChangedEvent - If true a changed event won't be emitted.
     */
    readonly setItem = ( keyName: string, keyValue: string, dontEmitChangedEvent: boolean = false ) => {
        this._storage.setItem( keyName, keyValue );

        if ( !dontEmitChangedEvent ) {
            this.emit( 'changed' );
        }
    }

    /**
     * Remove a key from the storage.
     * @param keyName the name of the key you want to remove.
     */
    readonly removeItem = ( keyName: string ) => {
        this._storage.removeItem( keyName );
        this.emit( 'changed' );
    }

    /**
     * Returns the name of the nth key in the list, or null if n is greater
     * than or equal to the number of key/value pairs in the object.
     *
     * @param i - The index of the key in the list.
     */
    readonly key = ( i: number ) => this._storage.key( i );

    /**
     * Serializes the content of the storage.
     *
     * @returns - The serialized content.
     */
    readonly serialize = () => {
        if ( this.isLocalStorageDisabled() ) {
            return this._storage.serialize();
        }

        const length = this._storage.length;
        const localStorageContent = {};

        for ( let i = 0; i < length; i++ ) {
            const key = this._storage.key( i );

            localStorageContent[ key ] = this._storage.getItem( key );
        }

        return JSON.stringify( localStorageContent );
    }
}

export const jitsiLocalStorage = new JitsiLocalStorage();
