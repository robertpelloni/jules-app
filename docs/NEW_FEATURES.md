# New Features - Dec 2025

## 1. Structured Code Review
- **Backend**: `/api/review` endpoint running structured analysis via LLM.
- **Frontend**: `ReviewScorecard` component visualizing score (0-100), summary, and categorized issues.
- **Integration**: Triggered via "Start Code Review" in Activity Feed; results render automatically as interactive scorecards.

## 2. Multi-Agent Debate
- **Backend**: `/api/debate` endpoint orchestrating multi-turn debates between specialized agents (e.g., Architect vs. Security Engineer).
- **Frontend**: `DebateViewer` component displaying rounds and turns in an accordion layout.
- **Integration**: Triggered via "Start Debate" dialog; results render as a collapsible debate view in the feed.

## 3. Submodule Dashboard
- **Feature**: dedicated page at `/dashboard/submodules` to view the status of all monorepo submodules.
- **Implementation**: Generated `app/submodules.json` during build time via `scripts/get-submodule-info.js`.

## 4. Plan Approval Workflow
- **UI**: `PlanContent` component renders structured agent plans with steps and descriptions.
- **Flow**: Users can review generated plans in the feed and approve them to proceed with execution.
