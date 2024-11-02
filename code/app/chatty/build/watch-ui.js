import esbuild from "esbuild";

const ctx = await esbuild.context({
    entryPoints: ['./chatty/ui/index.tsx'],
    outdir: './chatty/ui/dist/',
    bundle: true,
})
ctx.watch()