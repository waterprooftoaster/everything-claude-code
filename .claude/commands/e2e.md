---
description: Generate and run end-to-end tests with Detox. Creates test journeys, runs tests on iOS/Android simulators, captures screenshots/device logs, and uploads artifacts.
---

# E2E Command

This command invokes the **e2e-runner** agent to generate, maintain, and execute end-to-end tests using Detox for React Native / Expo.

## What This Command Does

1. **Generate Test Journeys** - Create Detox tests for user flows
2. **Run E2E Tests** - Execute tests on iOS simulator and Android emulator
3. **Capture Artifacts** - Screenshots, device logs, videos on failures
4. **Upload Results** - JUnit XML and artifact bundles for CI
5. **Identify Flaky Tests** - Quarantine unstable tests

## When to Use

Use `/e2e` when:
- Testing critical user journeys (login, trading, payments)
- Verifying multi-step flows work end-to-end on mobile
- Testing UI interactions and navigation (tabs, stacks, modals)
- Validating deep linking and Expo Router navigation
- Preparing for App Store / Play Store submission
- Verifying behavior across iOS and Android

## How It Works

The e2e-runner agent will:

1. **Analyze user flow** and identify test scenarios
2. **Generate Detox test** using Screen Object Model pattern
3. **Build the app** for iOS simulator and/or Android emulator
4. **Run tests** on target devices
5. **Capture failures** with screenshots, device logs, and videos
6. **Generate report** with results and artifacts
7. **Identify flaky tests** and recommend fixes

## Example Usage

```
User: /e2e Test the market search and view flow

Agent (e2e-runner):
# E2E Test Generation: Market Search and View Flow

## Test Scenario Identified

**User Journey:** Market Search → View Results → Tap Market → View Details

**Test Coverage:**
1. Navigate to markets tab
2. Perform search
3. Verify search results appear
4. Tap on first result
5. Verify market details screen loads
6. Verify chart component renders

## Generated Test Code

```typescript
// e2e/screens/MarketsScreen.ts
export class MarketsScreen {
  static get header() { return element(by.id('markets-header')) }
  static get searchInput() { return element(by.id('search-input')) }
  static get marketCards() { return element(by.id('market-card')) }
  static get firstMarketCard() { return element(by.id('market-card')).atIndex(0) }
  static get noResults() { return element(by.id('no-results')) }

  static async navigateTo() {
    await element(by.id('tab-markets')).tap()
    await waitFor(MarketsScreen.header).toBeVisible().withTimeout(5000)
  }

  static async search(query: string) {
    await MarketsScreen.searchInput.clearText()
    await MarketsScreen.searchInput.typeText(query)
  }
}

// e2e/features/search-and-view.test.ts
import { MarketsScreen } from '../screens/MarketsScreen'
import { MarketDetailsScreen } from '../screens/MarketDetailsScreen'

describe('Market Search and View Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('user can search markets and view details', async () => {
    // 1. Navigate to markets tab
    await MarketsScreen.navigateTo()

    // Verify screen loaded
    await expect(MarketsScreen.header).toBeVisible()

    // 2. Perform search
    await MarketsScreen.search('election')

    // 3. Verify search results
    await waitFor(MarketsScreen.marketCards)
      .toBeVisible()
      .withTimeout(10000)

    // Take screenshot of search results
    await device.takeScreenshot('search-results')

    // 4. Tap on first result
    await MarketsScreen.firstMarketCard.tap()

    // 5. Verify market details screen loads
    await waitFor(MarketDetailsScreen.marketName)
      .toBeVisible()
      .withTimeout(5000)

    await expect(MarketDetailsScreen.marketDescription).toBeVisible()

    // 6. Verify chart renders
    await expect(MarketDetailsScreen.priceChart).toBeVisible()

    // Take screenshot of market details
    await device.takeScreenshot('market-details')
  })

  it('search with no results shows empty state', async () => {
    await MarketsScreen.navigateTo()

    // Search for non-existent market
    await MarketsScreen.search('xyznonexistentmarket123456')

    // Verify empty state
    await waitFor(MarketsScreen.noResults)
      .toBeVisible()
      .withTimeout(5000)

    await expect(MarketsScreen.noResults).toBeVisible()
  })

  it('can clear search and see all markets again', async () => {
    await MarketsScreen.navigateTo()

    // Verify initial list is visible
    await expect(MarketsScreen.marketCards).toBeVisible()

    // Perform search
    await MarketsScreen.search('trump')
    await waitFor(MarketsScreen.marketCards)
      .toBeVisible()
      .withTimeout(10000)

    // Clear search
    await MarketsScreen.searchInput.clearText()

    // Verify full list returns
    await waitFor(MarketsScreen.marketCards)
      .toBeVisible()
      .withTimeout(10000)
  })
})
```

## Running Tests

```bash
# Build the app first
detox build -c ios.sim.debug

# Run the generated test
detox test -c ios.sim.debug e2e/features/search-and-view.test.ts

 PASS  e2e/features/search-and-view.test.ts (14.832s)
  Market Search and View Flow
    ✓ user can search markets and view details (4218ms)
    ✓ search with no results shows empty state (1832ms)
    ✓ can clear search and see all markets again (2914ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Time:        14.832s

Artifacts saved to: e2e/artifacts/
- e2e/artifacts/search-results.png
- e2e/artifacts/market-details.png
```

## Test Report

```
╔══════════════════════════════════════════════════════════════╗
║                    E2E Test Results                          ║
╠══════════════════════════════════════════════════════════════╣
║ Status:     ALL TESTS PASSED                                 ║
║ Platform:   iOS Simulator (iPhone 15)                        ║
║ Total:      3 tests                                          ║
║ Passed:     3 (100%)                                         ║
║ Failed:     0                                                ║
║ Flaky:      0                                                ║
║ Duration:   14.8s                                            ║
╚══════════════════════════════════════════════════════════════╝

Artifacts:
Screenshots: 2 files
Videos: 0 files (only on failure)
Device Logs: e2e/artifacts/device.log
JUnit Report: e2e/artifacts/junit.xml

Re-run on Android: detox test -c android.emu.debug e2e/features/search-and-view.test.ts
```

E2E test suite ready for CI/CD integration!
```

## Test Artifacts

When tests run, the following artifacts are captured:

**On All Tests:**
- JUnit XML report for CI integration
- Device logs for debugging

**On Failure Only:**
- Screenshot of the failing state
- Video recording of the test run
- UI hierarchy dump for element inspection
- Full device/simulator logs

## Viewing Artifacts

```bash
# Artifacts are saved to e2e/artifacts/ by default
ls e2e/artifacts/

# View screenshots
open e2e/artifacts/search-results.png

# View JUnit report
cat e2e/artifacts/junit.xml

# View device logs
cat e2e/artifacts/device.log

# Artifacts are organized by test name in CI
ls e2e/artifacts/Market_Search_and_View_Flow/
```

## Flaky Test Detection

If a test fails intermittently:

```
FLAKY TEST DETECTED: e2e/features/trade.test.ts

Test passed 7/10 runs (70% pass rate)

Common failure:
"Element with testID 'confirm-btn' not found"

Recommended fixes:
1. Add explicit wait: await waitFor(element(by.id('confirm-btn'))).toBeVisible().withTimeout(5000)
2. Increase global timeout in jest.config.js
3. Check for race conditions in component mounting
4. Verify element is not hidden by keyboard or modal
5. Use device.reloadReactNative() for clean state

Quarantine recommendation: Mark as it.skip() until fixed
```

## Device Configuration

Tests run on the following devices by default:
- iOS: iPhone 15 Simulator (iOS 17+)
- Android: Pixel 7 Emulator (API 34)

Configure in `.detoxrc.js` to adjust devices and configurations.

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/e2e.yml
# iOS
- name: Install simulator utilities
  run: brew tap wix/brew && brew install applesimutils

- name: Build iOS app
  run: detox build -c ios.sim.release

- name: Run E2E tests (iOS)
  run: detox test -c ios.sim.release --headless --cleanup --retries 2

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: detox-artifacts-ios
    path: e2e/artifacts/

# Android (use reactivecircus/android-emulator-runner)
- name: Run E2E tests (Android)
  uses: reactivecircus/android-emulator-runner@v2
  with:
    api-level: 34
    script: |
      detox build -c android.emu.release
      detox test -c android.emu.release --headless --cleanup --retries 2
```

## Critical Flows

For Expo apps, prioritize these E2E tests:

**CRITICAL (Must Always Pass):**
1. User can authenticate (sign up / log in / log out)
2. User can navigate between tabs
3. User can search and view items
4. User can view detail screens
5. Deep links resolve to correct screens
6. Push notifications navigate correctly
7. Offline/online transitions are handled

**IMPORTANT:**
1. Form submission flows
2. Pull-to-refresh behavior
3. Modal and bottom sheet interactions
4. Platform-specific behavior (iOS vs Android)
5. Keyboard interactions and avoidance
6. Orientation changes (if supported)

## Best Practices

**DO:**
- Use Screen Object Model for maintainability
- Use `testID` prop for selectors (React Native convention)
- Wait for conditions with `waitFor().toBeVisible().withTimeout()`
- Test critical journeys on BOTH iOS and Android
- Run tests before merging to main
- Review artifacts (screenshots, logs) when tests fail

**DON'T:**
- Use brittle selectors (text matchers break with i18n)
- Test implementation details
- Run tests against production
- Ignore flaky tests
- Skip artifact review on failures
- Test every edge case with E2E (use unit tests)

## Integration with Other Commands

- Use `/plan` to identify critical journeys to test
- Use `/tdd` for unit tests (faster, more granular)
- Use `/e2e` for integration and user journey tests
- Use `/code-review` to verify test quality

## Related Agents

This command invokes the `e2e-runner` agent provided by ECC.

For manual installs, the source file lives at:
`agents/e2e-runner.md`

## Quick Commands

```bash
# Build for iOS simulator
detox build -c ios.sim.debug

# Build for Android emulator
detox build -c android.emu.debug

# Run all E2E tests (iOS)
detox test -c ios.sim.debug

# Run all E2E tests (Android)
detox test -c android.emu.debug

# Run specific test file
detox test -c ios.sim.debug e2e/features/search.test.ts

# Run with retry on failure
detox test -c ios.sim.debug --retries 3

# Run headless (CI mode)
detox test -c ios.sim.release --headless --cleanup

# Reset simulator state
detox test -c ios.sim.debug --reuse false

# Clean build artifacts
detox clean-framework-cache && detox build-framework-cache
```
