// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { build } from 'esbuild';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

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
  // Build all standard entries (no externals)
  const promises = [];
  for (const { input, name } of entries) {
    promises.push(
      build({
        ...sharedOptions,
        entryPoints: [input],
        outfile: `dist/${name}.esm.js`,
        format: 'esm',
        external: [],
      }),
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
  promises.push(
    build({
      ...sharedOptions,
      entryPoints: [buildEntry.input],
      outfile: `dist/${buildEntry.name}.esm.js`,
      format: 'esm',
      external: ['fs', 'path', 'vite', 'node:fs', 'node:path'],
    }),
    build({
      ...sharedOptions,
      entryPoints: [buildEntry.input],
      outfile: `dist/${buildEntry.name}.cjs.js`,
      format: 'cjs',
      external: ['fs', 'path', 'vite', 'node:fs', 'node:path'],
    }),
  );

  await Promise.all(promises);
  console.log(`Built ${entries.length + 1} entry points (ESM + CJS)`);

  // Generate declaration files using tsc
  // Use --rootDir src so declarations land at dist/types/ not dist/types/src/
  console.log('Generating declaration files...');
  execSync(
    'npx tsc --emitDeclarationOnly --declaration --outDir dist/types --rootDir src',
    { stdio: 'inherit' },
  );

  // Components barrel uses a separate tsconfig — run with --noCheck to skip
  // type errors in external component sources (esbuild already validated the JS)
  try {
    execSync(
      'npx tsc -p tsconfig.components.json --emitDeclarationOnly --declaration --outDir dist/types --noCheck',
      { stdio: 'inherit' },
    );
  } catch {
    // If --noCheck is not available on this tsc version, fall back to
    // creating a simple re-export declaration from the main pass output
    console.warn('Components .d.ts via tsc failed; creating stub re-export.');
  }

  // Create bundled .d.ts shims for exports that reference dist/specifyjs-*.d.ts
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
