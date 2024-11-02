/**
 * Wait for a specified amount of time.
 * @param {number} ms The number of milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the specified time.
 * @example
 * await wait(1000); // Waits for 1 second
 */
export function wait(ms) { // ms: number
    return new Promise((resolve) => setTimeout(resolve, ms)); // returns: Promise<void>
}
