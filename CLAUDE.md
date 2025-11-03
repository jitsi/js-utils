# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@jitsi/js-utils`, a collection of utility libraries for Jitsi JavaScript projects. The package is published to npm and provides shared functionality across the Jitsi ecosystem. This is a TypeScript project that exports ES6 modules.

## Development Commands

### Build
- `npm run build` - Compile TypeScript files to dist/ directory using tsc
- `npm run clean` - Remove the dist/ directory
- `npm run prepack` - Runs clean and build (automatically runs before publishing)

### Testing
- `npm test` or `npm run test` - Run all tests using @web/test-runner
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run test:debug` - Run tests in manual debug mode with browser UI

### Linting
- `npm run lint` - Run ESLint using @jitsi/eslint-config
- Always run linting before committing changes

## Code Architecture

### Module Structure
The codebase is organized as a collection of independent utility modules, each in its own directory:

- **avatar/** - Avatar generation utilities
  - Gravatar URL generation with email hashing

- **browser-detection/** - Browser and environment detection using ua-parser-js
  - Uses TypeScript with `BrowserDetection` class
  - Maps various browser names to Jitsi-specific naming conventions
  - Detects React Native, Electron, Chromium-based browsers, engines (Blink, Gecko, WebKit)

- **jitsi-local-storage/** - LocalStorage wrapper with fallback
  - Provides `JitsiLocalStorage` class extending EventEmitter
  - Falls back to `DummyLocalStorage` (in-memory) when localStorage is unavailable
  - Emits 'changed' events on modifications
  - Supports serialization with optional key exclusion

- **json.ts** - Safe JSON parsing using @hapi/bourne to prevent prototype pollution

- **polyfills/** - Browser polyfills (currently querySelector-related)

- **random/** - Random utility functions
  - `roomNameGenerator.ts` - Generate random room names
  - `randomUtil.ts` - General random utilities (hex strings, alphanumeric strings)

- **transport/** - Message transport abstraction with request/response pattern
  - `Transport.ts` - Main transport class with event emitter pattern
  - Handles MESSAGE_TYPE_EVENT, MESSAGE_TYPE_REQUEST, MESSAGE_TYPE_RESPONSE
  - Implements pluggable backends via `setBackend()`
  - `PostMessageTransportBackend.ts` - postMessage-based backend
  - `postis.ts` - Third-party postMessage utility (used by PostMessageTransportBackend)

### Entry Point and Exports
The main `index.ts` re-exports all utility modules:
- avatar
- browser-detection
- jitsi-local-storage
- json
- polyfills
- random
- transport

All modules can be imported from the main package entry point:
```typescript
import { randomHexString, Transport, BrowserDetection } from '@jitsi/js-utils';
```

Alternatively, subpath imports are also supported via the wildcard export pattern:
```typescript
import { randomHexString } from '@jitsi/js-utils/random';
import { Transport } from '@jitsi/js-utils/transport';
```

### TypeScript Configuration
- Target: ES6 modules
- Strict mode enabled
- Entire codebase written in TypeScript
- Build output goes to `dist/` directory with compiled .js and .d.ts files
- Source files remain in root directory structure (avatar/, browser-detection/, etc.)

### Package Publishing
- Published as `@jitsi/js-utils` to npm with public access
- Main entry: `dist/index.js`
- TypeScript types: `dist/index.d.ts`
- Package type: ES module
- Only the `dist/` directory is published (controlled by `files` field in package.json)
- Wildcard exports pattern allows subpath imports (e.g., `@jitsi/js-utils/random`)
- AutoPublish workflow triggers on master branch pushes
- Version bumping handled automatically by gh-action-bump-version

## Key Dependencies
- `@hapi/bourne` - Safe JSON parsing (prevents prototype pollution)
- `js-md5` - MD5 hashing
- `ua-parser-js` - User agent parsing for browser detection

## Coding Conventions
- Uses @jitsi/eslint-config with TypeScript ESLint parser
- JSDoc comments for all public APIs
- Private members prefixed with underscore (_)
- Event emitter pattern used for reactive components (JitsiLocalStorage, Transport)
- All code written in TypeScript with strict type checking
- Follow existing patterns and naming conventions in the codebase

## Testing and CI

### Test Suite
- Comprehensive unit test suite with 100% code coverage
- Uses @web/test-runner with @esm-bundle/chai for assertions
- Tests organized alongside source files with `.spec.ts` extension
- 182+ tests covering all utility modules
- Run tests before committing changes

### CI Workflow
The CI workflow is split into three parallel jobs:

1. **Lint Job** - Runs ESLint on all TypeScript files
2. **Test Job** - Runs tests with coverage and generates reports
   - Parses test results and generates GitHub check summaries
   - Uploads coverage to Codecov for tracking over time
   - Creates test result artifacts
3. **Build Job** - Compiles TypeScript to ensure no build errors

All jobs must pass before merging pull requests.

### Coverage Reporting
- Coverage reports generated with every test run
- Integrated with Codecov for tracking coverage trends
- Aim to maintain 100% code coverage for all new features
- Coverage reports available as CI artifacts
