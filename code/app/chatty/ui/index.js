import { readFileSync } from 'node:fs'
import { buildUI } from './build/buildUI.js'
/**
 * 
 * @type {import("@based/functions").BasedFunction}
 */
export default async (_, payload) => {
    await buildUI()
    const app = readFileSync('./chatty/ui/dist/index.js').toString()
    return `
        <html>
            
            <body>
                <script type="module">
                    ${app}
                </script>
            <body>
        </html>
    `
}