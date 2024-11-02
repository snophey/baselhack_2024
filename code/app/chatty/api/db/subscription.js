class Subscription {
    constructor() {
        this.subscribers = {};
    }

    /**
     * Subscribe a callback to a specific key
     * @param {string} key - The key to listen for updates
     * @param {Function} callback - The callback to invoke on update
     */
    subscribe(key, callback) {
        if (!this.subscribers[key]) {
            this.subscribers[key] = [];
        }
        this.subscribers[key].push(callback);
    }

    /**
     * Unsubscribe a callback from a specific key
     * @param {string} key - The key to remove the callback from
     * @param {Function} callback - The callback to remove
     */
    unsubscribe(key, callback) {
        if (!this.subscribers[key]) return;
        this.subscribers[key] = this.subscribers[key].filter(cb => cb !== callback);
    }

    /**
     * Publish an update to a specific key, invoking all callbacks
     * @param {string} key - The key to publish an update for
     * @param {...any} args - Arguments to pass to the callback functions
     */
    publish(key, ...args) {
        if (!this.subscribers[key]) return;
        this.subscribers[key].forEach(callback => callback(...args));
    }
}


const subscription = new Subscription()

function getSubscriptions() {
    return subscription
}

export { getSubscriptions }