# Changelog

## [v0.8.1] - 2024-10-24

### Added
-   **Bobcoin Vision:** Updated `INSTRUCTIONS.md` with detailed Bobcoin ecosystem goals (Proof of Workout, Privacy).
-   **Dashboard Build Numbers:** System Internals now displays the build number (commit count) for each submodule.

### Fixed
-   **Build Stability:** Resolved lingering TypeScript errors in `app-layout.tsx` (event handler types) and `templates/route.ts` (implicit any).
-   **New Session Dialog:** Fixed arguments for `createSession` to match the updated client signature.
-   **Prisma:** Pinned Prisma version to 5.19.1 and fixed `schema.prisma` configuration for stable builds.

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
