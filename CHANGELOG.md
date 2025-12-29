# Changelog

## [v0.7.1] - 2024-10-24

### Added
-   **Bobcoin Submodule:** Integrated `bobcoin` (Solana/Monero hybrid) as the core blockchain submodule.
-   **Unified Instructions:** Created `INSTRUCTIONS.md` as the single source of truth for all agents.
-   **Dashboard:** Updated `/system/internals` to list `bobcoin` and provided a visual breakdown of project structure.

### Fixed
-   **Build Errors:** Resolved TypeScript errors in `lib/orchestration/providers`, `session-board`, and `new-session-dialog`.
-   **Persistence:** Fixed Prisma client initialization issues (removed `prisma.config.ts` conflict).

## [v0.7.0] - 2024-10-24

### Added
-   **Session Keeper Persistence:** Moved keeper config and logs to SQLite via Prisma.
-   **Submodules:** Added `jules-agent-sdk-python`.
-   **System Dashboard:** Created `/system/internals` page.

### Changed
-   **API:** Added `/api/settings/keeper` and `/api/logs/keeper`.
-   **Store:** Updated `useSessionKeeperStore` to sync with backend.
