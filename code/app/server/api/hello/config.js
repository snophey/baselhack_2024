import fn from './fn.js'
/**
 * @type {import("@based/functions").BasedFunctionConfigs}
 * 
 * This module exports a default object containing the `hello` function configuration.
 */
export default {
    hello: {
        type: 'function',
        public: true,
        maxPayloadSize: 1e8,
        uninstallAfterIdleTime: 1e3,
        fn
    }
}