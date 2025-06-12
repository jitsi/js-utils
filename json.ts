import { parse as BourneParse } from '@hapi/bourne';

/**
 * Safely parse JSON payloads.
 *
 * @param {string} data - The payload to be parsed.
 * @returns The parsed object.
 */
export function safeJsonParse(data: string): any {
    return BourneParse(data);
}
