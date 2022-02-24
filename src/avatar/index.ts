import md5 from 'js-md5';

/**
 * Returns the Gravatar URL of a given email id.
 *
 * @param key - Email or id for which we need gravatar URL.
 * @param baseURL - Base Gravatar URL.
 * @returns Gravatar URL.
 */
export const getGravatarURL = ( key: string, baseURL: string = 'https://seccdn.libravatar.org/avatar/' ) => {
    const urlSuffix = '?d=404&size=200';

    // If the key is a valid email, we hash it. If it's not, we assume it's already a hashed format
    const avatarKey = isValidEmail( key ) ? md5.hex( key.trim().toLowerCase() ) : key;

    return `${ baseURL }${ avatarKey }${ urlSuffix }`;
}

/**
 * Returns if the email id is valid.
 *
 * @param email - Email id to be checked.
 */
const isValidEmail = ( email: string ): boolean => email && email.indexOf( '@' ) > 0;
