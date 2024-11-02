import { readFileSync } from 'node:fs'
import { buildUI } from './build/buildUI.js'
/**
 * 
 * @type {import("@based/functions").BasedFunction}
 */
export default async (_, payload) => {
    await buildUI()
    return readFileSync('./chatty/ui/index.html').toString()
}