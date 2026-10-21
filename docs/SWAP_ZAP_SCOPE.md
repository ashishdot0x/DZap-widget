# DZap Widget QA — Swap / Zap only

Target: https://dzapwidget.vercel.app/ — **embedded widget**, not Studio styling controls.

## Executable first-stage cases
- E01 Swap: select Swap mode, capture embedded UI and network evidence.
- E01 Zap: select Zap mode, capture embedded UI and network evidence.
- E02: switching between Swap and Zap must not send a wallet transaction.

These are **discovery and safety tests**, not successful token-swap/zap transaction E2E tests. They explicitly gather screenshot, frame controls and wallet-method evidence so subsequent selectors can be grounded in observed UI.

## Next after CI evidence
- Identify token selectors/amount input within actual widget or iframe, not Studio form controls.
- Validate swap amount, quote route, fee, minimum received and review against API.
- Validate Zap pool/position selectors, range and review.
- Extend to mock-wallet and local Anvil fork after DOM and API mapping.
- No real-money execution unless separately authorized.

The original DZapIO/DZapTestingSuite stays read-only.
