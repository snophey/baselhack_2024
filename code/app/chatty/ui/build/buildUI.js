import esbuild from "esbuild";


export async function buildUI() {
    await esbuild.build({
        entryPoints: ['./chatty/ui/index.tsx'],
        outdir: './chatty/ui/dist/' 
    })
    console.log(`⚡ build completed.`)

}
