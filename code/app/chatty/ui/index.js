import { readFileSync } from 'node:fs'
/**
 * 
 * @type {import("@based/functions").BasedFunction}
 */
export default async (_, payload) => {
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