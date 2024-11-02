import fn from './fn.js'
/**
 * @type {import("@based/functions").BasedFunctionConfigs}
 * 
 * This module exports a default object containing the `hello` function configuration.
 */
export default {
    'chat:getMsgs': {
        type: 'function',
        name: 'chat:getMsgs',
        fn
    }
}