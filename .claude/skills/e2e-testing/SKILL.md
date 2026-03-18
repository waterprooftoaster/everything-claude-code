---
name: e2e-testing
description: Detox E2E testing patterns, Screen Object Model, configuration, CI/CD integration, artifact management, and flaky test strategies for React Native / Expo.
origin: ECC
---

# E2E Testing Patterns

Comprehensive Detox v20+ patterns for building stable, fast, and maintainable E2E test suites for React Native / Expo apps.

## Test File Organization

```
e2e/
├── screens/
│   ├── ItemsScreen.ts
│   ├── LoginScreen.ts
│   └── MarketDetailsScreen.ts
├── auth/
│   ├── login.test.ts
│   ├── logout.test.ts
│   └── register.test.ts
├── features/
│   ├── browse.test.ts
│   ├── search.test.ts
│   └── create.test.ts
├── utils/
│   ├── fixtures.ts
│   └── helpers.ts
├── jest.config.js
└── .detoxrc.js
```

## Screen Object Model (SOM)

```typescript
// e2e/screens/ItemsScreen.ts

export class ItemsScreen {
  static get searchInput() {
    return element(by.id('search-input'))
  }

  static get itemCards() {
    return element(by.id('item-card'))
  }

  static get createButton() {
    return element(by.id('create-btn'))
  }

  static get noResults() {
    return element(by.id('no-results'))
  }

  static async navigateTo() {
    await element(by.id('tab-items')).tap()
    await waitFor(ItemsScreen.searchInput)
      .toBeVisible()
      .withTimeout(5000)
  }

  static async search(query: string) {
    await ItemsScreen.searchInput.clearText()
    await ItemsScreen.searchInput.typeText(query)
    await waitFor(ItemsScreen.itemCards)
      .toBeVisible()
      .withTimeout(10000)
  }

  static async verifyItemAtIndex(index: number) {
    await expect(element(by.id('item-card')).atIndex(index)).toBeVisible()
  }

  static async verifyNoItems() {
    await expect(ItemsScreen.noResults).toBeVisible()
  }
}
```

## Test Structure

```typescript
// e2e/features/search.test.ts
import { ItemsScreen } from '../screens/ItemsScreen'

describe('Item Search', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  beforeEach(async () => {
    await device.reloadReactNative()
    await ItemsScreen.navigateTo()
  })

  it('should search by keyword', async () => {
    await ItemsScreen.search('test')

    await expect(ItemsScreen.itemCards).toBeVisible()
    await device.takeScreenshot('search-results')
  })

  it('should handle no results', async () => {
    await ItemsScreen.searchInput.typeText('xyznonexistent123')

    await waitFor(ItemsScreen.noResults)
      .toBeVisible()
      .withTimeout(5000)

    await expect(ItemsScreen.noResults).toBeVisible()
  })
})
```

## Detox Configuration

```javascript
// .detoxrc.js
/** @type {import('detox').DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      config: 'e2e/jest.config.js',
      maxWorkers: 1,
      _: ['e2e'],
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/MyApp.app',
      build:
        'xcodebuild -workspace ios/MyApp.xcworkspace -scheme MyApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Release-iphonesimulator/MyApp.app',
      build:
        'xcodebuild -workspace ios/MyApp.xcworkspace -scheme MyApp -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath:
        'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_7_API_34' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
}
```

```javascript
// e2e/jest.config.js
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.test.ts'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'e2e/artifacts', outputName: 'junit.xml' }],
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
}
```

## Flaky Test Patterns

### Quarantine

```typescript
it.skip('flaky: complex search — Issue #123', async () => {
  // Quarantined until root cause is fixed
})

// Conditional skip per platform
it('platform-specific behavior', async () => {
  if (device.getPlatform() === 'android') {
    console.warn('Skipping on Android — Issue #456')
    return
  }
  // test code...
})
```

### Identify Flakiness

```bash
# Run the same test 10 times
for i in {1..10}; do detox test -c ios.sim.debug e2e/features/search.test.ts; done

# Run with retry
detox test -c ios.sim.debug --retries 3
```

### Common Causes & Fixes

**Synchronization issues:**
```typescript
// Bad: assumes element is ready immediately
await element(by.id('button')).tap()

// Good: wait for element to appear first
await waitFor(element(by.id('button')))
  .toBeVisible()
  .withTimeout(5000)
await element(by.id('button')).tap()
```

**Animation timing:**
```typescript
// Bad: tap during animation
await element(by.id('menu-item')).tap()

// Good: wait for animation to settle
await waitFor(element(by.id('menu-item')))
  .toBeVisible()
  .withTimeout(5000)
await element(by.id('menu-item')).tap()
```

**React Native bridge timing:**
```typescript
// Bad: arbitrary delay
await new Promise(r => setTimeout(r, 5000))

// Good: reload RN and wait for idle
await device.reloadReactNative()
await waitFor(element(by.id('home-screen')))
  .toBeVisible()
  .withTimeout(10000)
```

## Artifact Management

### Screenshots

```typescript
// device.takeScreenshot(name) returns the file path of the saved image.
// It works on both iOS and Android in Detox v20+.
const screenshotPath = await device.takeScreenshot('after-login')
await device.takeScreenshot('search-results')
await device.takeScreenshot('market-details')

// The artifact plugin (configured in .detoxrc.js) auto-captures screenshots
// on failure. Manual calls above are for capturing at key success moments.
// Note: if keepOnlyFailedTestsArtifacts is true in the plugin config,
// manual screenshots from passing tests are still retained.
```

### Device Logs

```bash
# Detox artifacts directory contains logs automatically
# Configure artifact location in .detoxrc.js:
# artifacts: { rootDir: 'e2e/artifacts', plugins: { log: 'all', screenshot: 'failing' } }
```

```javascript
// Add to .detoxrc.js at the top level
artifacts: {
  rootDir: 'e2e/artifacts',
  plugins: {
    log: { enabled: true },
    screenshot: {
      shouldTakeAutomaticSnapshots: true,
      keepOnlyFailedTestsArtifacts: true,
    },
    video: {
      enabled: true,
      keepOnlyFailedTestsArtifacts: true,
    },
    instruments: { enabled: false },
    uiHierarchy: 'enabled',
  },
},
```

### Video Recording

```bash
# Enable video in .detoxrc.js plugins (see above)
# Videos are saved per-test in e2e/artifacts/<test-name>/
# Useful for debugging CI failures
```

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-ios:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: brew tap wix/brew && brew install applesimutils
      - run: npx pod-install ios
      - name: Build iOS app
        run: detox build -c ios.sim.release
      - name: Run E2E tests (iOS)
        run: detox test -c ios.sim.release --headless --cleanup --retries 2
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: detox-artifacts-ios
          path: e2e/artifacts/
          retention-days: 30

  e2e-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 34
          target: google_apis
          arch: x86_64
          profile: Pixel 7
          script: |
            detox build -c android.emu.release
            detox test -c android.emu.release --headless --cleanup --retries 2
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: detox-artifacts-android
          path: e2e/artifacts/
          retention-days: 30

  # Optional: EAS Build integration for cloud-based testing
  # eas-e2e:
  #   runs-on: ubuntu-latest
  #   steps:
  #     - uses: actions/checkout@v4
  #     - uses: expo/expo-github-action@v8
  #       with:
  #         eas-version: latest
  #         token: ${{ secrets.EXPO_TOKEN }}
  #     - run: eas build --platform all --profile test --non-interactive
```

## Test Report Template

```markdown
# E2E Test Report

**Date:** YYYY-MM-DD HH:MM
**Duration:** Xm Ys
**Status:** PASSING / FAILING
**Platform:** iOS / Android / Both

## Summary
- Total: X | Passed: Y (Z%) | Failed: A | Flaky: B | Skipped: C

## Failed Tests

### test-name
**File:** `e2e/features/search.test.ts:45`
**Platform:** iOS Simulator (iPhone 15)
**Error:** Element with id "search-input" not found
**Screenshot:** e2e/artifacts/test-name/screenshot.png
**Device Log:** e2e/artifacts/test-name/device.log
**Recommended Fix:** [description]

## Artifacts
- JUnit Report: e2e/artifacts/junit.xml
- Screenshots: e2e/artifacts/*/screenshot.png
- Videos: e2e/artifacts/*/video.mp4
- Device Logs: e2e/artifacts/*/device.log
- UI Hierarchy: e2e/artifacts/*/ui-hierarchy.xml
```

## Critical Flow Testing

```typescript
describe('Trade Execution', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  it('should execute a trade on testnet', async () => {
    // Skip on production — real money
    if (process.env.APP_ENV === 'production') {
      console.warn('Skipping trade test on production')
      return
    }

    // Navigate to market
    await element(by.id('tab-markets')).tap()
    await waitFor(element(by.id('market-list')))
      .toBeVisible()
      .withTimeout(10000)

    // Select a market
    await element(by.id('market-card-0')).tap()
    await waitFor(element(by.id('market-details')))
      .toBeVisible()
      .withTimeout(5000)

    // Place trade
    await element(by.id('position-yes')).tap()
    await element(by.id('trade-amount')).typeText('1.0')

    // Verify preview
    await expect(element(by.id('trade-preview'))).toBeVisible()

    // Confirm trade
    await element(by.id('confirm-trade')).tap()
    await waitFor(element(by.id('trade-success')))
      .toBeVisible()
      .withTimeout(30000)

    await device.takeScreenshot('trade-success')
  })
})
```

## Deep Linking & Navigation Testing

```typescript
describe('Deep Linking', () => {
  it('should open market via deep link', async () => {
    await device.launchApp({
      newInstance: true,
      url: 'myapp://markets/test-market-123',
    })

    await waitFor(element(by.id('market-details')))
      .toBeVisible()
      .withTimeout(10000)

    await expect(element(by.id('market-name'))).toBeVisible()
    await device.takeScreenshot('deep-link-market')
  })

  it('should handle expo-router navigation', async () => {
    await device.launchApp({
      newInstance: true,
      url: 'exp://localhost:8081/--/markets',
    })

    await waitFor(element(by.id('market-list')))
      .toBeVisible()
      .withTimeout(10000)
  })
})
```

## Best Practices

**DO:**
- Use `testID` prop on React Native components for selectors
- Use Screen Object Model for maintainability
- Wait for conditions with `waitFor().toBeVisible().withTimeout()`
- Test critical user journeys end-to-end on both platforms
- Run tests before merging to main
- Review artifacts (screenshots, logs) when tests fail
- Use `device.reloadReactNative()` for test isolation

**DON'T:**
- Use brittle selectors (text matchers break with i18n)
- Test implementation details (internal state, component tree)
- Run financial tests against production
- Ignore flaky tests — quarantine and fix promptly
- Skip artifact review on failures
- Test every edge case with E2E (use unit tests)
- Use arbitrary timeouts (`setTimeout`) — use Detox waitFor

## Important Notes

**CRITICAL for Expo apps:**
- E2E tests involving real money MUST run on testnet/staging only
- Never run trading tests against production builds
- Use `testID` prop (React Native convention), NOT `data-testid`
- Test on BOTH iOS and Android — behavior can differ
- Expo Go has limitations; use development builds (`npx expo prebuild`) for Detox
- Use EAS Build profiles for CI/CD test builds

## Integration with Other Commands

- Use `/plan` to identify critical journeys to test
- Use `/tdd` for unit tests (faster, more granular)
- Use `/e2e` for integration and user journey tests
- Use `/code-review` to verify test quality

## Related Agents

This skill is referenced by the `e2e-runner` agent.

For manual installs, the source file lives at:
`agents/e2e-runner.md`
