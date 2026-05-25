// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { build } from 'esbuild';
import { execSync } from 'child_process';
import { writeFileSync, readdirSync, renameSync, existsSync } from 'fs';
import { join } from 'path';

const banner = '/* (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE */';

const entries = [
  { input: 'src/index.ts', name: 'specifyjs' },
  { input: 'src/dom/index.ts', name: 'specifyjs-dom' },
  { input: 'src/server/index.ts', name: 'specifyjs-server' },
  { input: 'src/jsx-runtime.ts', name: 'specifyjs-jsx-runtime' },
  { input: 'src/jsx-dev-runtime.ts', name: 'specifyjs-jsx-dev-runtime' },
  { input: 'src/client/index.ts', name: 'specifyjs-client' },
  { input: 'src/telemetry/index.ts', name: 'specifyjs-telemetry' },
  { input: 'src/components-barrel.ts', name: 'specifyjs-components' },
];

const buildEntry = { input: 'src/build/index.ts', name: 'specifyjs-build' };

const sharedOptions = {
  bundle: true,
  minify: true,
  sourcemap: true,
  target: 'es2020',
  banner: { js: banner },
};

async function buildAll() {
  // ── ESM: code-splitting enabled ──────────────────────────────────────
  // Build all standard ESM entries together with splitting: true.
  // This extracts shared internal modules (hook dispatcher, scheduler,
  // reconciler) into common chunks, guaranteeing a single singleton
  // instance when a consumer imports from multiple subpaths.
  // See: https://github.com/asymmetric-effort/specifyjs/issues/58
  const esmEntryPoints = entries.map((e) => e.input);
  await build({
    ...sharedOptions,
    entryPoints: esmEntryPoints,
    outdir: 'dist/esm',
    format: 'esm',
    splitting: true,
    chunkNames: 'chunks/[name]-[hash]',
    external: [],
  });

  // Rename ESM outputs to match the expected filenames in package.json exports.
  // esbuild with splitting uses the input filename as the output name:
  //   dist/esm/index.js → dist/specifyjs.esm.js
  //   dist/esm/dom/index.js → dist/specifyjs-dom.esm.js
  const esmRenames = [
    { from: 'dist/esm/index.js', to: 'dist/specifyjs.esm.js' },
    { from: 'dist/esm/dom/index.js', to: 'dist/specifyjs-dom.esm.js' },
    { from: 'dist/esm/server/index.js', to: 'dist/specifyjs-server.esm.js' },
    { from: 'dist/esm/jsx-runtime.js', to: 'dist/specifyjs-jsx-runtime.esm.js' },
    { from: 'dist/esm/jsx-dev-runtime.js', to: 'dist/specifyjs-jsx-dev-runtime.esm.js' },
    { from: 'dist/esm/client/index.js', to: 'dist/specifyjs-client.esm.js' },
    { from: 'dist/esm/telemetry/index.js', to: 'dist/specifyjs-telemetry.esm.js' },
    { from: 'dist/esm/components-barrel.js', to: 'dist/specifyjs-components.esm.js' },
  ];

  for (const { from, to } of esmRenames) {
    if (existsSync(from)) {
      // Read the file and rewrite relative chunk imports to point to ./esm/chunks/
      const { readFileSync } = await import('fs');
      let content = readFileSync(from, 'utf-8');
      // Fix chunk import paths to be relative to dist/ instead of dist/esm/
      // Minified output has no space: from"../chunks/" or from"./chunks/"
      content = content.replace(/from\s*"\.\.?\/(?:\.\.\/)*chunks\//g, 'from "./esm/chunks/');
      content = content.replace(/from\s*'\.\.?\/(?:\.\.\/)*chunks\//g, "from './esm/chunks/");
      writeFileSync(to, content);
    }
  }

  // Also rename sourcemaps
  for (const { from, to } of esmRenames) {
    const mapFrom = from + '.map';
    const mapTo = to + '.map';
    if (existsSync(mapFrom)) {
      renameSync(mapFrom, mapTo);
    }
  }

  // ── CJS: separate builds (no code-splitting support in CJS) ──────────
  const cjsPromises = [];
  for (const { input, name } of entries) {
    cjsPromises.push(
      build({
        ...sharedOptions,
        entryPoints: [input],
        outfile: `dist/${name}.cjs.js`,
        format: 'cjs',
        external: [],
      }),
    );
  }

  // Build the build-tools entry (Node.js only, external deps)
  cjsPromises.push(
    build({
      ...sharedOptions,
      entryPoints: [buildEntry.input],
      outfile: `dist/${buildEntry.name}.cjs.js`,
      format: 'cjs',
      external: ['fs', 'path', 'vite', 'node:fs', 'node:path'],
    }),
  );

  // ESM build-tools (separate, not part of splitting since it has externals)
  cjsPromises.push(
    build({
      ...sharedOptions,
      entryPoints: [buildEntry.input],
      outfile: `dist/${buildEntry.name}.esm.js`,
      format: 'esm',
      external: ['fs', 'path', 'vite', 'node:fs', 'node:path'],
    }),
  );

  await Promise.all(cjsPromises);
  console.log(`Built ${entries.length + 1} entry points (ESM with shared chunks + CJS)`);

  // Generate declaration files using tsc
  console.log('Generating declaration files...');
  execSync(
    'npx tsc --emitDeclarationOnly --declaration --outDir dist/types --rootDir src',
    { stdio: 'inherit' },
  );

  try {
    execSync(
      'npx tsc -p tsconfig.components.json --emitDeclarationOnly --declaration --outDir dist/types --noCheck',
      { stdio: 'inherit' },
    );
  } catch {
    console.warn('Components .d.ts via tsc failed; creating stub re-export.');
  }

  // Create bundled .d.ts shims
  writeFileSync('dist/specifyjs.d.ts', 'export * from "./types/index";\n');
  writeFileSync('dist/specifyjs-dom.d.ts', 'export * from "./types/dom/index";\n');
  writeFileSync('dist/specifyjs-server.d.ts', 'export * from "./types/server/index";\n');
  writeFileSync('dist/specifyjs-client.d.ts', 'export * from "./types/client/index";\n');
  writeFileSync('dist/specifyjs-telemetry.d.ts', 'export * from "./types/telemetry/index";\n');
  writeFileSync('dist/specifyjs-components.d.ts', 'export * from "./types/core/src/components-barrel";\n');
  writeFileSync('dist/specifyjs-build.d.ts', 'export * from "./types/build/index";\n');

  console.log('Done.');
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
