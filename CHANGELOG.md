# Changelog

## [v0.8.0] - 2024-10-24

### Added
-   **Bobcoin Wallet UI:** Added a wallet interface at `/wallet` to manage balance and transaction history.
-   **System Dashboard:** Enhanced `/system/internals` to include Bobcoin submodule status.
-   **Bobcoin Submodule:** Integrated `bobcoin` (Solana/Monero hybrid) as the core blockchain submodule.
-   **Unified Instructions:** Created `INSTRUCTIONS.md` as the single source of truth for all agents.

### Fixed
-   **Build Errors:** Resolved TypeScript errors in `lib/orchestration/providers`, `session-board`, and `new-session-dialog`.
-   **Persistence:** Fixed Prisma client initialization issues (downgraded to 5.19.1 for stability).
-   **Database:** Successfully initialized SQLite database with `KeeperSettings` and `KeeperLog`.

## [v0.7.0] - 2024-10-24

### Added
-   **Session Keeper Persistence:** Moved keeper config and logs to SQLite via Prisma.
-   **Submodules:** Added `jules-agent-sdk-python`.
-   **System Dashboard:** Created `/system/internals` page.

### Changed
-   **API:** Added `/api/settings/keeper` and `/api/logs/keeper`.
-   **Store:** Updated `useSessionKeeperStore` to sync with backend.
