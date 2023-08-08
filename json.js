import Bourne from '@hapi/bourne';

/**
 * Safely parse JSON payloads.
 *
 * @param {string} data - The payload to be parsed.
 * @returns The parsed object.
 */
export function safeJsonParse(data) {
    return Bourne.parse(data);
}
