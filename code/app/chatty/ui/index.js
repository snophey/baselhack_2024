import { readFileSync } from 'node:fs'
/**
 * 
 * @type {import("@based/functions").BasedFunction}
 */
export default async (_, payload) => {
    return readFileSync('./chatty/ui/index.html').toString()
}