# Testing Guide

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or later) installed.

Then install dependencies from the project root:

```bash
npm install
```

## Running Tests

Run the full test suite:

```bash
npm test
```

This runs all test files in the `tests/` folder with verbose output.

### Run with coverage report

```bash
npm run test:coverage
```

This generates a coverage summary in the terminal and a detailed HTML report in the `coverage/` directory.

### Run a specific test file

```bash
npx jest tests/content.test.js
npx jest tests/manifest.test.js
```

### Run end-to-end tests

```bash
npm run test:e2e
```

This launches a real Chromium browser with the extension loaded and tests the popup UI.

## Test Structure

### Unit Tests (`tests/`)

| File | What it covers |
|------|----------------|
| `content.test.js` | `extractText()`, `setupMutationObserver()`, and `init()` from `content.js` |
| `manifest.test.js` | Validates `manifest.json` structure, permissions, and file references |
| `popup.test.js` | `initPopup()` toggle behavior and error handling for missing DOM elements |

### Integration Tests (`tests/`)

| File | What it covers |
|------|----------------|
| `integration.test.js` | Message passing between `popup.js` and `content.js` — scan flow, error handling |

### End-to-End Tests (`e2e/`)

| File | What it covers |
|------|----------------|
| `extension.spec.js` | Loads extension in Chromium, verifies popup UI, toggle interaction |

## Writing New Tests

1. Create a new file in `tests/` named `<module>.test.js`.
2. If your module uses browser APIs (DOM, `document`, `window`), it will automatically run in the **jsdom** environment configured in `jest.config.js`.
3. For source files to be testable, export functions using the conditional pattern already in `content.js`:

```javascript
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { myFunction };
} else {
    myFunction();
}
```

4. Import in your test with `require()`:

```javascript
const { myFunction } = require('../myModule');
```

## CI Pipeline

Tests run automatically on every push and pull request to `main` via GitHub Actions (`.github/workflows/test.yml`):

1. **Unit & Integration Tests** — runs with Node 18.x and 20.x, generates coverage report
2. **E2E Tests** — installs Playwright Chromium, loads the extension, and runs end-to-end tests

Coverage reports are uploaded as build artifacts on the Node 20.x run.
