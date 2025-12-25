# Jules UI Roadmap

## Completed Features
- **Project Structure**:
  - Added `jules-sdk-reference` submodule (Python SDK).
  - Configured build (tsconfig, eslint) to handle submodules correctly.
- **API Client (`lib/jules/client.ts`)**:
  - Full parity with Python SDK models (`Session`, `Activity`, `SessionOutput`, etc.).
  - Pagination support (`listActivitiesPaged`, `listSessions`, `listSources`).
  - Filtering support for `listSources`.
  - `approvePlan` implementation.
  - `Media` and `PullRequest` artifact extraction.
- **Session Keeper (Auto-Pilot)**:
  - Background monitoring loop (`SessionKeeperManager`).
  - Zero-Fetch optimization (uses `lastActivityAt`).
  - "Smart Thresholds" (Active vs Idle states).
  - "Auto-Switch" to active session.
  - "Smart Pilot" (Supervisor LLM) and "Council Debate" (Multi-agent) integrations.
  - Settings UI with visual feedback.
  - Logs Panel.
- **UI Enhancements**:
  - `ActivityFeed`: Set-based O(N) deduplication.
  - `ActivityFeed`: Rendering of Base64 images (Media) and PR links.
  - `AppLayout`: Resizable vertical split for logs.
  - `resizable.tsx`: Robust export handling for `react-resizable-panels`.

## In Progress
- **Repository Search**: Implementing server-side filtering for repositories in the "New Session" dialog to handle large GitHub organizations.

## Planned / Pending
- **Council Debate Visualization**: Visualizing the multi-agent debate process in the UI (currently logs-only).
- **Terminal Integration Polish**: Verify secure API key passing and connection resilience.
- **Template Management**: Refine template creation/editing flow.
- **Analytics Dashboard**: Integrate Session Keeper metrics (nudges sent, plans approved).
