import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    target: 'node22',
    // WARN: the `createRequire` shim is required — esbuild's CJS-in-ESM output
    // calls `require` for Node builtins pulled in by bundled CJS dependencies.
    banner: {
      js: [
        '#!/usr/bin/env node',
        "import { createRequire as __createRequire } from 'node:module'",
        'const require = __createRequire(import.meta.url)',
      ].join('\n'),
    },
    clean: true,
    splitting: false,
    noExternal: [/.*/],
  },
])
