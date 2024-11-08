/**
 * Replace newline and carriage return characters with spaces.
 * @param {string} s The input string.
 * @returns {string} The input string with newline and carriage return characters replaced with spaces.
 * @example
 * removeNewlines('Hello\nworld\r\n!');
 * // output: 'Hello world !'
 */
export function removeNewlines(s = '') { // s: string = '' (default parameter)
    return s.replaceAll(/[\n\r]+/g, ' '); // returns: string
}

/**
 * Parse a boolean value from a string.
 * @param {string | boolean | undefined} value The value to parse.
 * @returns {boolean} The parsed boolean value.
 * @example
 * parseBoolean('true');
 * // output: true
 * parseBoolean('false');
 * // output: false
 */
export function parseBoolean(value) { // value: string | boolean | undefined
    if (typeof value === 'boolean') {
        return value; // returns: boolean
    }
    if (value === undefined) {
        return false; // returns: boolean
    }
    return value === 'true'; // returns: boolean
}
