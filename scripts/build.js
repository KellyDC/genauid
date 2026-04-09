'use strict';

const esbuild = require('esbuild');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'src', 'index.ts');

async function build() {
    fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

    // 1. Emit TypeScript declaration files via tsc
    //    (tsconfig.json has emitDeclarationOnly: true, declarationDir: dist/types)
    execSync('npx tsc --project tsconfig.json', { cwd: root, stdio: 'inherit' });

    // 2. CJS bundle (consumed via require())
    //    Bundled so that all source modules are inlined — no extra files needed.
    await esbuild.build({
        entryPoints: [src],
        bundle: true,
        platform: 'neutral',
        format: 'cjs',
        target: 'es2020',
        outfile: path.join(root, 'dist', 'index.cjs'),
    });

    // 3. ESM bundle (consumed via import)
    //    Tree-shakeable: consumers' bundlers can eliminate unused named exports.
    await esbuild.build({
        entryPoints: [src],
        bundle: true,
        platform: 'neutral',
        format: 'esm',
        target: 'es2020',
        outfile: path.join(root, 'dist', 'index.mjs'),
    });

    // 4. Copy declarations for both module flavours.
    //    CJS types → dist/index.d.ts, ESM types → dist/index.d.mts
    const typesDir = path.join(root, 'dist', 'types');
    fs.copyFileSync(
        path.join(typesDir, 'index.d.ts'),
        path.join(root, 'dist', 'index.d.ts')
    );
    fs.copyFileSync(
        path.join(typesDir, 'index.d.ts'),
        path.join(root, 'dist', 'index.d.mts')
    );

    console.log('Build complete → dist/');
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
