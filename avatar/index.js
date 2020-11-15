import md5 from 'js-md5';

/**
 * Returns the Gravatar URL of a given email id.
 *
 * @param {string} key - Email or id for which we need gravatar URL.
 * @param {string} baseURL - Base Gravatar URL.
 * @returns {string} - Gravatar URL.
 */
export function getGravatarURL(key, baseURL = 'https://seccdn.libravatar.org/avatar/') {
    const urlSuffix = '?d=404&size=200';

    // If the key is a valid email, we hash it. If it's not, we assume it's already a hashed format
    const avatarKey = isValidEmail(key) ? md5.hex(key.trim().toLowerCase()) : key;

    return `${baseURL}${avatarKey}${urlSuffix}`;
}

/**
 * Returns if the email id is valid.
 *
 * @param {string} email - Email id to be checked.
 * @returns {boolean}
 */
function isValidEmail(email) {
    return email && email.indexOf('@') > 0;
}
