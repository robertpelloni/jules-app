# Unified Agent Instructions

This file serves as the single source of truth for all AI models (Claude, Gemini, GPT, etc.) working on this project.

## Core Directives
1.  **Monorepo Master:** You are working in a monorepo that manages multiple submodules. You are responsible for the entire system's health.
2.  **Submodule Management:**
    -   Submodules are located in `submodules/`.
    -   You MUST edit submodule code directly within the `submodules/` directory.
    -   ALWAYS commit and push changes to the submodule's remote repository.
    -   ALWAYS bump the submodule version number when changes are made.
    -   ALWAYS sync submodules with the root repo (update pointer in `submodules/`).
3.  **Persistence:** All significant state should be persisted (DB, files). The "Session Keeper" is a critical component for maintaining continuity.
4.  **Version Control:**
    -   Every build/session should result in a version bump in `package.json` and `VERSION.md`.
    -   `CHANGELOG.md` must be detailed and up-to-date.
    -   Commit messages must reference the new version.

## Project Vision: Bobcoin Integration
We are integrating **Bobcoin** (https://github.com/robertpelloni/bobcoin) as the primary currency/token for the ecosystem.
-   **Characteristics:** Solana + Monero hybrid. Privacy-first (anonymity).
-   **Mining:** "Proof of Workout" (Dancing, Exercise). No traditional miners.
-   **Utility:**
    -   Arcade/Exercise game economy.
    -   Dating app economy.
    -   Retro MMORPG currency.
    -   Infrastructure incentives (Tor nodes, Torrent seeding, Storage).
-   **Performance:** High volume, low/no fees, instant finality.

## Submodules
-   **jules-ui:** The main dashboard/interface (Root).
-   **jules-agent-sdk-python:** Reference Python SDK.
-   **bobcoin:** The blockchain token core.

## Development Workflow
1.  **Plan:** Use `set_plan` to articulate steps.
2.  **Verify:** Check for build errors (`npm run build`) before submitting.
3.  **Document:** Update `ROADMAP.md` and `CHANGELOG.md` continuously.
4.  **Sync:** Ensure local and remote states are synchronized.

## Agent-Specific Appendices
*(Models should append their specific memories or context here)*
