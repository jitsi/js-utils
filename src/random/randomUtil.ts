/**
 * Alphanumeric characters.
 */
const ALPHANUM
    = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Hexadecimal digit characters.
 */
const HEX_DIGITS = '0123456789abcdef';

/**
 * Generates a string of random characters with a specific length.
 *
 * @param length - The length of the string to return.
 * @param characters - The characters from which the returned string is
 * to be constructed.
 * @private
 * @returns A string of random characters with the specified length.
 */
const _randomString = ( length: number, characters: string ) => {
    let result = '';

    for ( let i = 0; i < length; ++i ) {
        // eslint-disable-next-line no-use-before-define
        result += randomElement( characters );
    }

    return result;
};

/**
 * Generate a string with random alphanumeric characters with a specific length.
 *
 * @param length - The length of the string to return.
 * @returns A string of random alphanumeric characters with the
 * specified length.
 */
export const randomAlphanumString = ( length: number ) => _randomString( length, ALPHANUM );

/**
 * Generates random int within the range [min, max].
 *
 * @param {number} min - The minimum value for the generated number.
 * @param {number} max - The maximum value for the generated number.
 * @returns {number} Random int number.
 */
export const randomInt = ( min: number, max: number ): number => Math.floor( Math.random() * ( max - min + 1 ) ) + min;

/**
 * Get random element of array or string.
 *
 * @param arr - Source.
 * @returns Array element or string character.
 */
export const randomElement = <T>( arr: Array<T> | string ): T | string => arr[ randomInt( 0, arr.length - 1 ) ];

/**
 * Returns a random hex digit.
 */
export const randomHexDigit = (): string => randomElement( HEX_DIGITS );

/**
 * Generates a string of random hexadecimal digits with a specific length.
 *
 * @param length - The length of the string to return.
 * @returns A string of random hexadecimal digits with the specified
 * length.
 */
export const randomHexString = ( length: number ): string => _randomString( length, HEX_DIGITS );
