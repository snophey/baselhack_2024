import fn from './fn.js'
/**
 * @type {import("@based/functions").BasedFunctionConfigs}
 * 
 */
export default {
    'chat:query:messages': {
        type: 'query',
        name: 'chat:query:messages',
        fn
    }
}