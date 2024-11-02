import fn from './index.js'
/**
 * @type {import("@based/functions").BasedFunctionConfigs}
 * 
 * This module exports a default object containing the `hello` function configuration.
 */
export default {
    app: {
        public: true,
        name: 'app',
        type: 'function',
        path: '/',
        favicon: './favicon.ico',
        fn
    }
}