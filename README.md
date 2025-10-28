# js-utils

Collection of utilities for Jitsi JavaScript projects.

## Requirements

This library is designed to be used with a bundler (webpack, rollup, vite, etc.). The package uses `moduleResolution: "bundler"` in its TypeScript configuration and publishes compiled JavaScript targeting ES2019 with ES2020 module syntax.

**Important:** If you're consuming this library, ensure your build tool is configured to handle ES modules. Direct usage in Node.js without a bundler or transpilation may not work as expected.

## Development

### Building

The project is written in TypeScript and compiles to the `dist/` directory:

```bash
npm run build        # Compile TypeScript to dist/
npm run clean        # Remove the dist/ directory
npm run lint         # Run ESLint on source files
```

### Project Structure

- Source files are in TypeScript (`.ts`) in the root and module directories
- Compiled output (`.js` and `.d.ts`) goes to `dist/`
- The package exports multiple subpaths for individual utilities

### Publishing

The package is automatically published to npm when changes are pushed to the master branch. The `prepack` script ensures the package is built before publishing.
