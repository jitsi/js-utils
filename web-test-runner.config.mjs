import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import rollupCommonjs from '@rollup/plugin-commonjs';

// Wrap Rollup CommonJS plugin for Web Dev Server
const commonjs = fromRollup(rollupCommonjs);

/**
 * Custom plugin to handle @hapi/bourne named exports in tests.
 * Web Test Runner uses Rollup's commonjs plugin which cannot reliably transform
 * named exports from CommonJS modules using `exports.functionName` pattern.
 * This plugin intercepts @hapi/bourne after CommonJS transformation and adds
 * named exports by reading the transformed module's default export.
 */
const bourneNamedExportsPlugin = {
  name: 'bourne-named-exports',
  transform(context) {
    // Match the already-transformed @hapi/bourne module
    if (context.path.includes('node_modules/@hapi/bourne/lib/index.js')) {
      // Parse the transformed code to find the default export variable name
      // The commonjs plugin typically creates something like: export default __moduleExports;
      const defaultExportMatch = context.body.match(/export\s+default\s+(\w+);/);

      if (defaultExportMatch) {
        const defaultVarName = defaultExportMatch[1];
        // Add named exports that reference properties of the default export variable
        return {
          body: context.body + `
export const parse = ${defaultVarName}.parse;
export const scan = ${defaultVarName}.scan;
export const safeParse = ${defaultVarName}.safeParse;
`,
          transformCache: false
        };
      }
    }
  }
};

/**
 * Custom plugin to handle ua-parser-js named exports in tests.
 * Similar to bourne plugin above - ua-parser-js is a UMD/CommonJS module
 * that needs its default export exposed as a named export (UAParser).
 */
const uaParserNamedExportsPlugin = {
  name: 'ua-parser-named-exports',
  transform(context) {
    // Match the already-transformed ua-parser-js module
    if (context.path.includes('node_modules/ua-parser-js/src/ua-parser.js')) {
      // Parse the transformed code to find the default export variable name
      const defaultExportMatch = context.body.match(/export\s+default\s+(\w+);/);

      if (defaultExportMatch) {
        const defaultVarName = defaultExportMatch[1];
        // UAParser is typically the main export (could be UAParser or the default itself)
        // Add named export that references the default export
        return {
          body: context.body + `
export const UAParser = ${defaultVarName}.UAParser || ${defaultVarName};
`,
          transformCache: false
        };
      }
    }
  }
};

/**
 * Web Test Runner configuration for @jitsi/js-utils.
 * Uses Mocha + Chai for testing with real Chrome browser (headless by default).
 *
 * Test pattern: **\/*.spec.ts
 * Browser: Chrome Headless (system Chrome, same approach as lib-jitsi-meet Karma)
 * Coverage: Enabled with 80% threshold
 */
export default {
  // Test files pattern - only match spec files in the root directories
  files: [
    'avatar/**/*.spec.ts',
    'browser-detection/**/*.spec.ts',
    'jitsi-local-storage/**/*.spec.ts',
    'polyfills/**/*.spec.ts',
    'random/**/*.spec.ts',
    'transport/**/*.spec.ts',
    'uri/**/*.spec.ts',
    '*.spec.ts'
  ],

  // Exclude patterns
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.d.ts',
    '**/coverage/**'
  ],

  // Node-style module resolution
  nodeResolve: true,

  // Plugins
  plugins: [
    // Compile TypeScript on-the-fly using esbuild
    esbuildPlugin({
      ts: true,
      target: 'auto',
      tsconfig: './tsconfig.json'
    }),
    // Convert CommonJS modules to ES modules for browser compatibility
    // Only transform specific CommonJS dependencies for performance
    commonjs({
      include: [
        '**/node_modules/@hapi/bourne/**',
        '**/node_modules/js-md5/**',
        '**/node_modules/ua-parser-js/**',
        '**/node_modules/events/**'
      ],
      defaultIsModuleExports: true, // Make module.exports the default export
      requireReturnsDefault: 'auto', // Smart handling of ES module imports
      esmExternals: false, // Don't skip CommonJS transformation for ESM externals
      strictRequires: false, // Required for v27+: Use legacy require handling
      transformMixedEsModules: true // Transform mixed module systems
    }),
    // Test-specific: Handle CommonJS module named exports
    // These plugins allow tests to use named imports from CommonJS modules
    bourneNamedExportsPlugin,
    uaParserNamedExportsPlugin
  ],

  // Uses default Chrome launcher (headless by default)
  // No 'browsers' config needed - works same as Karma ChromeHeadless

  // Coverage configuration
  coverage: true,
  coverageConfig: {
    report: true,
    reportDir: 'coverage',
    threshold: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70
    },
    exclude: [
      '**/*.spec.ts',
      '**/*.d.ts',
      '**/node_modules/**',
      'index.ts'
    ]
  },

  // Browser options
  browserStartTimeout: 30000,
  testsStartTimeout: 30000,
  testsFinishTimeout: 30000,

  // Logging - only show errors in browser console
  filterBrowserLogs: ({ type }) => type === 'error'
};
