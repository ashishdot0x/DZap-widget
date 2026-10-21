# DZap Widget QA automation porting status

Product: **DZap Widget** (https://dzapwidget.vercel.app/)

Reference code: `DZapIO/DZapTestingSuite`, read-only.

## Implemented in this independent repository
- Playwright + TypeScript; desktop and mobile-emulated Chromium.
- W01 initial HTML response, visible content, presence of controls.
- W02 uncaught JavaScript errors on first render.
- W03 read-only discovery of visible controls and API requests.
- W04 document-level horizontal overflow at 320, 375, 768 and 1280 px.
- W05 input inventory only (NOT full amount validation).
- Diagnostic screenshots, failed requests, API responses and UI control labels.
- HTML/JSON reports, failure traces, safe exclusions for local secrets.

## Reference architecture reviewed
- `helpers/tradeScreen.ts` / `helpers/zapScreen.ts` are UI adapters.
- `helpers/wallet.ts` provides EIP-1193 injected mock wallet.
- `helpers/qaTest.ts` records typed expected/actual checks.
- `playwright.config.ts` has mocked, fork, app and real lanes.
These modules have **not** been blindly copied because the Widget UI and API wiring are not yet verified.

## Pending verification
- Actual live UI DOM, wallet entry points, token/chain selectors, API host.
- Swap, bridge, zap-in, zap-out, migration, recipient and range presets.
- Mocked and local-fork execution; on-chain assertions and final UI state.
- Exact screenshots and actual bug repro evidence.

## Safety
- No real wallet keys or real-chain broadcast here.
- No work is performed on the original DZapTestingSuite.
- Tests written are not tests passed. All statuses require observed execution evidence.

## Phase 4 — read-only UI map (21 Oct 2026)
- `helpers/widgetDiscovery.ts`: identify observed chain/token/pool/review/wallet UI labels without assuming a specific layout.
- `W08`: collect DOM control inventory and categories with a safe injected EIP-1193 mock wallet.
- Unit tests: label classification, chain-switch rejection, and denial of raw transaction broadcasts.
- This does NOT demonstrate a functioning swap, quote, chain-selector interaction or an actual connected wallet.
- Live site could not be fetched through the available web reader; selector mapping remains unverified.
