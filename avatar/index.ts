import md5 from 'js-md5';

/**
 * Returns the Gravatar URL of a given email id.
 *
 * @param {string} key - Email or id for which we need gravatar URL.
 * @param {string} [baseURL='https://www.gravatar.com/avatar/'] - Base Gravatar URL.
 * @returns {string} Gravatar URL.
 */
export function getGravatarURL(key: string, baseURL: string = 'https://www.gravatar.com/avatar/'): string {
    const urlSuffix = '?d=404&size=200';

    // If the key is a valid email, we hash it. If it's not, we assume it's already a hashed format.
    const avatarKey: string = isValidEmail(key) ? md5.hex(key.trim().toLowerCase()) : key;

    return `${baseURL}${avatarKey}${urlSuffix}`;
}

/**
 * Returns if the email id is valid.
 *
 * @param {string} email - Email id to be checked.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
function isValidEmail(email: string): boolean {
    return Boolean(email?.indexOf('@') > 0);
}
