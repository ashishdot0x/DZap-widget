# DZap Widget — Independent QA Automation

Target: https://dzapwidget.vercel.app/

This is the **only writable repository** for Widget QA. Reference suite `DZapIO/DZapTestingSuite` is strictly **read-only**.

## Run smoke checks

```bash
npm install
npx playwright install chromium
npm run typecheck
npm run test:list
npm run test:smoke
npm run report
```

`WIDGET_URL` overrides the target if needed. Desktop and mobile-emulated Chromium projects are configured.

## Coverage

- **W01:** page load, visible UI and controls
- **W02:** uncaught JavaScript errors at load
- **W03:** controls and API network inventory
- **W04:** document overflow at 320, 375, 768 and 1280 px
- **W05:** input inventory (not amount validation)

Tests attach screenshots and diagnostic JSON. HTML and JSON reporters are enabled. The smoke suite is **read-only**, never signs or sends transactions.

## Current limitations

The test cases are coded but must still be executed in a browser with network access. Actual widget DOM selectors, full swap/bridge/zap E2E, mock-wallet and local-fork chain verification are not yet confirmed. **No pass rate or confirmed bugs are claimed.** More detail: [porting status](docs/PORTING_STATUS.md).

Secrets and reports are excluded in `.gitignore`. Real-money scenarios are out of scope until explicit approval and cost checks.
