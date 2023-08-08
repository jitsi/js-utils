import Bourne from '@hapi/bourne';

/**
 * Safely parse JSON payloads. Makes sure the return value it's either an object
 * or an error.
 *
 * @param {string} data - The payload to be parsed.
 * @returns The parsed object.
 */
export function safeJsonParse(data) {
    const json = Bourne.parse(data);

    if (json && typeof json === 'object') {
        return json;
    }

    return {};
}
