# GitHub Actions smoke evidence — 2026-10-21

Source: uploaded `widget-smoke-evidence.zip` from the GitHub Actions run.

## Verified automated results
- Playwright JSON summary: **22 expected, 0 unexpected, 0 skipped, 0 flaky**.
- Desktop and mobile projects ran W01–W08 plus 4 viewport variations of W04.
- Report test execution duration: ~28.9 seconds (excluding setup/upload time).

## Screenshot interpretation
- Both desktop and mobile show the **DZap Widget Studio** outer shell.
- Visible UI includes Swap / Zap mode, Connect Wallet, Get code, background palette, and Component / Button control.
- The actual embedded widget content appears as a **skeleton/loading placeholder**, not a visibly functioning token/amount entry UI.
- W01–W08 checked mostly the surrounding Studio; their green result is **not evidence of successful swap, quote, bridge or zap functionality**.
- This is a suspected readiness issue, **not a confirmed bug** without a longer readiness wait and request inspection.

## Corrective action
- W09 now asserts observed Studio controls.
- W10 explicitly waits for real amount/asset interaction affordances and fails with screenshot evidence if absent.
- Do not classify W10 as a product bug until reviewed against the current widget DOM and network requests.
- Transaction flow automation remains pending.
