/**
 * Unit tests for JitsiLocalStorage class.
 * Tests storage operations, event emission, and fallback behavior.
 */
import { expect } from '@esm-bundle/chai';
import { jitsiLocalStorage, JitsiLocalStorage } from './index';

describe('JitsiLocalStorage', () => {
    // Clear storage and remove all event listeners before each test.
    beforeEach(() => {
        jitsiLocalStorage.clear();
        jitsiLocalStorage.removeAllListeners();
        jitsiLocalStorage.setLocalStorageDisabled(false);
    });

    describe('Basic storage operations', () => {
        it('should store and retrieve string values', () => {
            jitsiLocalStorage.setItem('testKey', 'testValue', true); // Don't emit event for this test.
            const value = jitsiLocalStorage.getItem('testKey');

            expect(value).to.equal('testValue');
        });

        it('should return null for non-existent keys', () => {
            const value = jitsiLocalStorage.getItem('nonExistentKey');

            expect(value).to.be.null;
        });

        it('should update existing key values', () => {
            jitsiLocalStorage.setItem('testKey', 'value1', true);
            jitsiLocalStorage.setItem('testKey', 'value2', true);
            const value = jitsiLocalStorage.getItem('testKey');

            expect(value).to.equal('value2');
        });

        it('should remove items from storage', () => {
            jitsiLocalStorage.setItem('testKey', 'testValue', true);
            jitsiLocalStorage.removeItem('testKey');
            const value = jitsiLocalStorage.getItem('testKey');

            expect(value).to.be.null;
        });

        it('should clear all items from storage', () => {
            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);
            jitsiLocalStorage.clear();

            expect(jitsiLocalStorage.getItem('key1')).to.be.null;
            expect(jitsiLocalStorage.getItem('key2')).to.be.null;
            expect(jitsiLocalStorage.length).to.equal(0);
        });
    });

    describe('Storage length property', () => {
        it('should return correct length when empty', () => {
            expect(jitsiLocalStorage.length).to.equal(0);
        });

        it('should return correct length with items', () => {
            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);
            jitsiLocalStorage.setItem('key3', 'value3', true);

            expect(jitsiLocalStorage.length).to.equal(3);
        });

        it('should update length when removing items', () => {
            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);
            expect(jitsiLocalStorage.length).to.equal(2);

            jitsiLocalStorage.removeItem('key1');
            expect(jitsiLocalStorage.length).to.equal(1);
        });
    });

    describe('key() method', () => {
        it('should return key name by index', () => {
            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);

            const key0 = jitsiLocalStorage.key(0);
            const key1 = jitsiLocalStorage.key(1);

            expect([ 'key1', 'key2' ]).to.include(key0);
            expect([ 'key1', 'key2' ]).to.include(key1);
        });

        it('should return null for out-of-bounds index', () => {
            jitsiLocalStorage.setItem('key1', 'value1', true);

            expect(jitsiLocalStorage.key(10)).to.be.null;
        });
    });

    describe('Event emission', () => {
        it('should emit "changed" event when setting item', (done) => {
            jitsiLocalStorage.once('changed', () => {
                done();
            });

            jitsiLocalStorage.setItem('testKey', 'testValue');
        });

        it('should not emit "changed" event when dontEmitChangedEvent is true', (done) => {
            let eventEmitted = false;

            jitsiLocalStorage.once('changed', () => {
                eventEmitted = true;
            });

            jitsiLocalStorage.setItem('testKey', 'testValue', true);

            // Wait a bit to ensure event is not emitted.
            setTimeout(() => {
                expect(eventEmitted).to.be.false;
                done();
            }, 50);
        });

        it('should emit "changed" event when removing item', (done) => {
            jitsiLocalStorage.setItem('testKey', 'testValue', true);

            jitsiLocalStorage.once('changed', () => {
                done();
            });

            jitsiLocalStorage.removeItem('testKey');
        });

        it('should emit "changed" event when clearing storage', (done) => {
            jitsiLocalStorage.setItem('testKey', 'testValue', true);

            jitsiLocalStorage.once('changed', () => {
                done();
            });

            jitsiLocalStorage.clear();
        });
    });

    describe('serialize() method', () => {
        it('should serialize empty storage', () => {
            const serialized = jitsiLocalStorage.serialize();

            expect(serialized).to.equal('{}');
        });

        it('should serialize storage with items', () => {
            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);

            const serialized = jitsiLocalStorage.serialize();
            const parsed = JSON.parse(serialized);

            expect(parsed).to.deep.equal({
                key1: 'value1',
                key2: 'value2'
            });
        });

        it('should serialize storage with ignored keys', () => {
            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);
            jitsiLocalStorage.setItem('key3', 'value3', true);

            const serialized = jitsiLocalStorage.serialize([ 'key2' ]);
            const parsed = JSON.parse(serialized);

            expect(parsed).to.deep.equal({
                key1: 'value1',
                key3: 'value3'
            });
        });

        it('should serialize storage with multiple ignored keys', () => {
            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);
            jitsiLocalStorage.setItem('key3', 'value3', true);

            const serialized = jitsiLocalStorage.serialize([ 'key1', 'key3' ]);
            const parsed = JSON.parse(serialized);

            expect(parsed).to.deep.equal({
                key2: 'value2'
            });
        });
    });

    describe('DummyLocalStorage fallback', () => {
        it('should use DummyLocalStorage when disabled', () => {
            jitsiLocalStorage.setLocalStorageDisabled(true);

            expect(jitsiLocalStorage.isLocalStorageDisabled()).to.be.true;
        });

        it('should work with DummyLocalStorage', () => {
            jitsiLocalStorage.setLocalStorageDisabled(true);

            jitsiLocalStorage.setItem('testKey', 'testValue', true);
            const value = jitsiLocalStorage.getItem('testKey');

            expect(value).to.equal('testValue');
        });

        it('should serialize DummyLocalStorage correctly', () => {
            jitsiLocalStorage.setLocalStorageDisabled(true);

            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);

            const serialized = jitsiLocalStorage.serialize();
            const parsed = JSON.parse(serialized);

            expect(parsed).to.deep.equal({
                key1: 'value1',
                key2: 'value2'
            });
        });

        it('should serialize DummyLocalStorage with ignored keys', () => {
            jitsiLocalStorage.setLocalStorageDisabled(true);

            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);
            jitsiLocalStorage.setItem('key3', 'value3', true);

            const serialized = jitsiLocalStorage.serialize([ 'key2' ]);
            const parsed = JSON.parse(serialized);

            expect(parsed).to.deep.equal({
                key1: 'value1',
                key3: 'value3'
            });
        });

        it('should switch between localStorage and DummyLocalStorage', () => {
            // Start with regular localStorage.
            expect(jitsiLocalStorage.isLocalStorageDisabled()).to.be.false;

            // Switch to DummyLocalStorage.
            jitsiLocalStorage.setLocalStorageDisabled(true);
            expect(jitsiLocalStorage.isLocalStorageDisabled()).to.be.true;

            // Switch back to regular localStorage.
            jitsiLocalStorage.setLocalStorageDisabled(false);
            expect(jitsiLocalStorage.isLocalStorageDisabled()).to.be.false;
        });

        it('should not share data when switching storage backends', () => {
            // Set item in regular localStorage.
            jitsiLocalStorage.setItem('testKey', 'value1', true);

            // Switch to DummyLocalStorage (starts empty).
            jitsiLocalStorage.setLocalStorageDisabled(true);
            expect(jitsiLocalStorage.getItem('testKey')).to.be.null;

            // Set different value in DummyLocalStorage.
            jitsiLocalStorage.setItem('testKey', 'value2', true);
            expect(jitsiLocalStorage.getItem('testKey')).to.equal('value2');

            // Switch back to regular localStorage (should have original value).
            jitsiLocalStorage.setLocalStorageDisabled(false);
            expect(jitsiLocalStorage.getItem('testKey')).to.equal('value1');
        });
    });

    describe('DummyLocalStorage removeItem', () => {
        it('should remove items from DummyLocalStorage', () => {
            jitsiLocalStorage.setLocalStorageDisabled(true);

            jitsiLocalStorage.setItem('key1', 'value1', true);
            jitsiLocalStorage.setItem('key2', 'value2', true);
            expect(jitsiLocalStorage.getItem('key1')).to.equal('value1');

            jitsiLocalStorage.removeItem('key1');
            expect(jitsiLocalStorage.getItem('key1')).to.be.null;
            expect(jitsiLocalStorage.getItem('key2')).to.equal('value2');

            // Restore
            jitsiLocalStorage.setLocalStorageDisabled(false);
        });
    });

    describe('DummyLocalStorage key() method', () => {
        it('should return null for out-of-bounds index in DummyLocalStorage', () => {
            jitsiLocalStorage.setLocalStorageDisabled(true);

            jitsiLocalStorage.setItem('key1', 'value1', true);
            expect(jitsiLocalStorage.key(0)).to.equal('key1');
            expect(jitsiLocalStorage.key(1)).to.be.null; // Out of bounds
            expect(jitsiLocalStorage.key(999)).to.be.null; // Way out of bounds

            // Restore
            jitsiLocalStorage.setLocalStorageDisabled(false);
        });
    });

    describe('DummyLocalStorage length getter', () => {
        it('should return correct length from DummyLocalStorage', () => {
            jitsiLocalStorage.setLocalStorageDisabled(true);

            // Initially empty
            expect(jitsiLocalStorage.length).to.equal(0);

            // Add items
            jitsiLocalStorage.setItem('key1', 'value1', true);
            expect(jitsiLocalStorage.length).to.equal(1);

            jitsiLocalStorage.setItem('key2', 'value2', true);
            expect(jitsiLocalStorage.length).to.equal(2);

            // Remove item
            jitsiLocalStorage.removeItem('key1');
            expect(jitsiLocalStorage.length).to.equal(1);

            // Clear all
            jitsiLocalStorage.clear();
            expect(jitsiLocalStorage.length).to.equal(0);

            // Restore
            jitsiLocalStorage.setLocalStorageDisabled(false);
        });
    });

    describe('Error handling in setLocalStorageDisabled', () => {
        it('should fallback to DummyLocalStorage if localStorage access fails during switch', () => {
            // Save original localStorage
            const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');

            try {
                // First set to dummy storage
                jitsiLocalStorage.setLocalStorageDisabled(true);

                // Mock localStorage to throw an error when accessed
                Object.defineProperty(window, 'localStorage', {
                    get() {
                        throw new Error('localStorage is disabled');
                    },
                    configurable: true
                });

                // Try to switch to regular localStorage (should catch error and fallback to Dummy)
                jitsiLocalStorage.setLocalStorageDisabled(false);

                // Should still work with DummyLocalStorage as fallback
                jitsiLocalStorage.setItem('test', 'value', true);
                expect(jitsiLocalStorage.getItem('test')).to.equal('value');
            } finally {
                // Restore original localStorage
                if (originalLocalStorage) {
                    Object.defineProperty(window, 'localStorage', originalLocalStorage);
                }

                // Reset to normal state
                jitsiLocalStorage.setLocalStorageDisabled(false);
            }
        });

        it('should handle case when storage becomes undefined after error', () => {
            // Create a new instance to test
            const instance = new JitsiLocalStorage();
            const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');

            try {
                // Set to dummy first
                instance.setLocalStorageDisabled(true);

                // Mock localStorage to return undefined
                Object.defineProperty(window, 'localStorage', {
                    get() {
                        return undefined as any;
                    },
                    configurable: true
                });

                // Try to switch to localStorage - will get undefined, should fallback to Dummy
                instance.setLocalStorageDisabled(false);

                // Verify it still works
                instance.setItem('test', 'value', true);
                expect(instance.getItem('test')).to.equal('value');
            } finally {
                // Restore original localStorage
                if (originalLocalStorage) {
                    Object.defineProperty(window, 'localStorage', originalLocalStorage);
                }
            }
        });
    });

    describe('Constructor error handling', () => {
        it('should fallback to DummyLocalStorage if localStorage throws during construction', () => {
            // Save original localStorage
            const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');

            try {
                // Mock localStorage to throw an error when accessed
                Object.defineProperty(window, 'localStorage', {
                    get() {
                        throw new Error('localStorage is disabled');
                    },
                    configurable: true
                });

                // Create a new instance - should catch error and use DummyLocalStorage
                const instance = new JitsiLocalStorage();

                // Should work with DummyLocalStorage
                instance.setItem('test', 'value', true);
                expect(instance.getItem('test')).to.equal('value');
                expect(instance.isLocalStorageDisabled()).to.be.true;
            } finally {
                // Restore original localStorage
                if (originalLocalStorage) {
                    Object.defineProperty(window, 'localStorage', originalLocalStorage);
                }
            }
        });

        it('should fallback to DummyLocalStorage if localStorage is undefined', () => {
            // Save original localStorage
            const originalLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');

            try {
                // Mock localStorage to be undefined
                Object.defineProperty(window, 'localStorage', {
                    get() {
                        return undefined;
                    },
                    configurable: true
                });

                // Create a new instance - should use DummyLocalStorage
                const instance = new JitsiLocalStorage();

                // Should work with DummyLocalStorage
                instance.setItem('test', 'value', true);
                expect(instance.getItem('test')).to.equal('value');
                expect(instance.isLocalStorageDisabled()).to.be.true;
            } finally {
                // Restore original localStorage
                if (originalLocalStorage) {
                    Object.defineProperty(window, 'localStorage', originalLocalStorage);
                }
            }
        });
    });
});
