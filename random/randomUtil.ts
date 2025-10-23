/**
 * Alphanumeric characters.
 * @const
 */
const ALPHANUM = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Hexadecimal digit characters.
 * @const
 */
const HEX_DIGITS = '0123456789abcdef';

/**
 * Generate a string with random alphanumeric characters with a specific length.
 *
 * @param {number} length - The length of the string to return.
 * @returns {string} A string of random alphanumeric characters with the
 * specified length.
 */
export function randomAlphanumString(length: number): string {
    return _randomString(length, ALPHANUM);
}

/**
 * Get random element of array or string.
 *
 * @param {Array|string} arr - Source.
 * @returns {Array|string} Array element or string character.
 */
export function randomElement<T>(arr: readonly T[]): T;
export function randomElement(arr: string): string;
export function randomElement<T>(arr: readonly T[] | string): T | string {
    return arr[randomInt(0, arr.length - 1)];
}

/**
 * Returns a random hex digit.
 *
 * @returns {Array|string}
 */
export function randomHexDigit(): string {
    return randomElement(HEX_DIGITS);
}

/**
 * Generates a string of random hexadecimal digits with a specific length.
 *
 * @param {number} length - The length of the string to return.
 * @returns {string} A string of random hexadecimal digits with the specified
 * length.
 */
export function randomHexString(length: number): string {
    return _randomString(length, HEX_DIGITS);
}

/**
 * Generates random int within the range [min, max].
 *
 * @param {number} min - The minimum value for the generated number.
 * @param {number} max - The maximum value for the generated number.
 * @returns {number} Random int number.
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a string of random characters with a specific length.
 *
 * @param {number} length - The length of the string to return.
 * @param {string} characters - The characters from which the returned string is
 * to be constructed.
 * @private
 * @returns {string} A string of random characters with the specified length.
 */
function _randomString(length: number, characters: string): string {
    let result = '';

    for (let i = 0; i < length; ++i) {
        result += randomElement(characters);
    }

    return result;
}
