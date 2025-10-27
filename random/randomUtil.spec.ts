/**
 * Unit tests for random utility functions.
 * Tests random string generation, element selection, and integer generation.
 */
import { expect } from '@esm-bundle/chai';
import {
    randomAlphanumString,
    randomElement,
    randomHexDigit,
    randomHexString,
    randomInt
} from './randomUtil';

describe('randomUtil', () => {
    describe('randomAlphanumString', () => {
        it('should generate string with correct length', () => {
            const result = randomAlphanumString(10);

            expect(result).to.have.lengthOf(10);
        });

        it('should generate empty string for length 0', () => {
            const result = randomAlphanumString(0);

            expect(result).to.equal('');
        });

        it('should generate different strings on multiple calls', () => {
            const result1 = randomAlphanumString(20);
            const result2 = randomAlphanumString(20);

            // While theoretically possible to be equal, probability is extremely low.
            expect(result1).to.not.equal(result2);
        });

        it('should only contain alphanumeric characters', () => {
            const result = randomAlphanumString(100);
            const alphanumRegex = /^[0-9a-zA-Z]+$/;

            expect(result).to.match(alphanumRegex);
        });

        it('should generate strings with various lengths', () => {
            expect(randomAlphanumString(1)).to.have.lengthOf(1);
            expect(randomAlphanumString(5)).to.have.lengthOf(5);
            expect(randomAlphanumString(50)).to.have.lengthOf(50);
            expect(randomAlphanumString(100)).to.have.lengthOf(100);
        });
    });

    describe('randomElement', () => {
        it('should return element from array', () => {
            const array = [ 'a', 'b', 'c', 'd', 'e' ];
            const result = randomElement(array);

            expect(array).to.include(result);
        });

        it('should return character from string', () => {
            const string = 'abcde';
            const result = randomElement(string);

            expect(string).to.include(result);
            expect(result).to.have.lengthOf(1);
        });

        it('should return only element from single-element array', () => {
            const array = [ 'only' ];
            const result = randomElement(array);

            expect(result).to.equal('only');
        });

        it('should return different elements from array', () => {
            const array = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
            const results = new Set();

            // Generate 50 samples - should get some variation.
            for (let i = 0; i < 50; i++) {
                results.add(randomElement(array));
            }

            // With 50 samples from 10 elements, we should get at least 5 different values.
            expect(results.size).to.be.at.least(5);
        });

        it('should work with different types in array', () => {
            const array = [ 1, 'two', true, null ];
            const result = randomElement(array);

            expect(array).to.include(result);
        });
    });

    describe('randomHexDigit', () => {
        it('should return single hex digit', () => {
            const result = randomHexDigit();

            expect(result).to.have.lengthOf(1);
        });

        it('should return valid hex digit', () => {
            const result = randomHexDigit();
            const hexDigits = '0123456789abcdef';

            expect(hexDigits).to.include(result);
        });

        it('should return different hex digits', () => {
            const results = new Set();

            // Generate 50 samples - should get some variation.
            for (let i = 0; i < 50; i++) {
                results.add(randomHexDigit());
            }

            // With 50 samples from 16 possible digits, should get at least 8 different values.
            expect(results.size).to.be.at.least(8);
        });
    });

    describe('randomHexString', () => {
        it('should generate hex string with correct length', () => {
            const result = randomHexString(10);

            expect(result).to.have.lengthOf(10);
        });

        it('should generate empty string for length 0', () => {
            const result = randomHexString(0);

            expect(result).to.equal('');
        });

        it('should only contain hex digits', () => {
            const result = randomHexString(100);
            const hexRegex = /^[0-9a-f]+$/;

            expect(result).to.match(hexRegex);
        });

        it('should generate different strings on multiple calls', () => {
            const result1 = randomHexString(20);
            const result2 = randomHexString(20);

            // While theoretically possible to be equal, probability is extremely low.
            expect(result1).to.not.equal(result2);
        });

        it('should generate strings with various lengths', () => {
            expect(randomHexString(1)).to.have.lengthOf(1);
            expect(randomHexString(8)).to.have.lengthOf(8);
            expect(randomHexString(32)).to.have.lengthOf(32);
            expect(randomHexString(64)).to.have.lengthOf(64);
        });
    });

    describe('randomInt', () => {
        it('should return integer within range', () => {
            const min = 1;
            const max = 10;

            for (let i = 0; i < 20; i++) {
                const result = randomInt(min, max);

                expect(result).to.be.at.least(min);
                expect(result).to.be.at.most(max);
                expect(Number.isInteger(result)).to.be.true;
            }
        });

        it('should return min when min equals max', () => {
            const result = randomInt(5, 5);

            expect(result).to.equal(5);
        });

        it('should return different values in range', () => {
            const results = new Set();

            // Generate 100 samples from range [1, 10].
            for (let i = 0; i < 100; i++) {
                results.add(randomInt(1, 10));
            }

            // Should get at least 7 different values from 10 possible.
            expect(results.size).to.be.at.least(7);
        });

        it('should handle negative ranges', () => {
            const min = -10;
            const max = -1;

            for (let i = 0; i < 20; i++) {
                const result = randomInt(min, max);

                expect(result).to.be.at.least(min);
                expect(result).to.be.at.most(max);
            }
        });

        it('should handle range crossing zero', () => {
            const min = -5;
            const max = 5;

            for (let i = 0; i < 20; i++) {
                const result = randomInt(min, max);

                expect(result).to.be.at.least(min);
                expect(result).to.be.at.most(max);
            }
        });

        it('should handle large ranges', () => {
            const min = 0;
            const max = 1000000;

            for (let i = 0; i < 20; i++) {
                const result = randomInt(min, max);

                expect(result).to.be.at.least(min);
                expect(result).to.be.at.most(max);
                expect(Number.isInteger(result)).to.be.true;
            }
        });
    });
});
