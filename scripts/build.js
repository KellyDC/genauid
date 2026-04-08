'use strict';

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src', 'index.js');

async function build() {
    fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

    // CJS bundle (consumed via require())
    await esbuild.build({
        entryPoints: [src],
        bundle: true,
        platform: 'node',
        format: 'cjs',
        outfile: path.join(root, 'dist', 'index.cjs'),
    });

    // ESM bundle (consumed via import)
    await esbuild.build({
        entryPoints: [src],
        bundle: true,
        platform: 'node',
        format: 'esm',
        outfile: path.join(root, 'dist', 'index.mjs'),
    });

    // Copy hand-written type declarations for both module flavours
    fs.copyFileSync(
        path.join(root, 'src', 'index.d.ts'),
        path.join(root, 'dist', 'index.d.ts')
    );
    fs.copyFileSync(
        path.join(root, 'src', 'index.d.ts'),
        path.join(root, 'dist', 'index.d.mts')
    );

    console.log('Build complete → dist/');
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
