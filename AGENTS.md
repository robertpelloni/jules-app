# Universal Agent Instructions

This file serves as the master guide for all AI models (Claude, Gemini, GPT, Copilot) working on the Jules UI repository.

## 1. Core Workflow & Versioning

-   **Versioning**: Every significant update (feature, fix, or build) **MUST** increment the version number in `package.json`.
-   **Changelog**: You **MUST** update `CHANGELOG.md` for every version bump, describing the changes clearly.
-   **Commit Messages**:
    -   Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `chore:`).
    -   Reference the new version number in the commit message if applicable (e.g., `chore(release): bump version to 0.3.0`).
    -   Commit frequently (logical units).

## 2. Project Architecture

-   **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui.
-   **State Management**: React Hooks + specialized Stores (e.g., `lib/stores/session-keeper.ts`).
-   **API Integration**:
    -   `lib/jules/client.ts`: Main client for Jules API. **Must match** `jules-sdk-reference` models.
    -   `/api/jules`: Proxy to handle CORS and API key injection for Jules API.
    -   `/api/supervisor`: Endpoint for LLM-based orchestration (Debate, Smart Pilot).
-   **Submodules**:
    -   Located in `external/` and `jules-sdk-reference`.
    -   Run `git submodule update --remote --merge` to sync.
    -   Do not modify external files directly unless contributing upstream.

## 3. Key Features Implementation Details

### Session Keeper (Auto-Pilot)
-   **Logic**: `components/session-keeper-manager.tsx`.
-   **Behavior**: Zero-fetch monitoring loop. Triggers `approvePlan` and `createActivity` (nudges).
-   **Constraint**: All LLM calls (Debate, Smart Pilot) **MUST** go through `/api/supervisor` (Server-Side) to avoid client-side CORS errors.

### System Dashboard
-   **Location**: `app/system/page.tsx`.
-   **Purpose**: Displays submodule versions and project structure using server-side git commands.

### Session Board (Kanban)
-   **Location**: `components/session-board.tsx`.
-   **Purpose**: Drag-and-drop management of session states.

## 4. Testing & Verification

-   **Unit Tests**: Use `npm test`.
    -   Client/Logic tests: `lib/jules/client.test.ts`, `components/session-keeper-manager.test.tsx`.
    -   Note: `components/session-keeper-manager.test.tsx` requires `/** @jest-environment jsdom */`.
-   **Frontend**: UI changes should be verified with Playwright if requested.

## 5. Documentation

-   Keep `ROADMAP.md` current.
-   Keep `README.md` current with feature usage.
-   Refer to `AGENTS.md` (this file) for protocol.

---
*Derived from GEMINI.md and project consensus.*
