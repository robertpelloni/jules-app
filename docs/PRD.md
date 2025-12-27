# Product Requirements Document: Jules UI

## Overview
Jules UI is a modern, developer-centric interface for interacting with Google's Jules AI agent. It provides a rich, interactive environment for managing coding sessions, visualizing progress, and collaborating with the AI.

## Key Features

### 1. Session Management
*   **Create Session:** Start new sessions from a GitHub repository URL with an initial prompt.
*   **Session List:** View active, paused, and completed sessions. Support for archiving sessions.
*   **Kanban Board:** Visual drag-and-drop interface to manage session status (Active, Paused, Completed).

### 2. Activity Feed
*   **Chat Interface:** Real-time messaging with Jules.
*   **Rich Content:** Markdown rendering, code blocks, and collapsible sections for detailed outputs.
*   **Artifacts:** Display generated code diffs, bash outputs, and media.
*   **Plan Approval:** Interactive approval flow for AI-generated plans.

### 3. Code Visualization
*   **Diff Viewer:** Side-by-side or inline view of code changes.
*   **Terminal Output:** Integrated xterm.js terminal for viewing command execution logs.

### 4. Automation & Intelligence (Session Keeper)
*   **Auto-Pilot:** Background monitoring of inactive sessions.
*   **Auto-Approval:** Configurable rules to automatically approve safe plans.
*   **Nudges:** Automated prompts to keep the agent on track.

### 5. Analytics & Insights
*   **Dashboard:** Metrics on session success rates, average duration, and activity volume.
*   **Repository Stats:** Track most active repositories.

### 6. System Status
*   **Submodule Registry:** View status and versions of integrated submodules (e.g., SDK reference).
*   **Directory Map:** Visual guide to the project structure.

## Technical Stack
*   **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui.
*   **State Management:** React Context + Hooks.
*   **Deployment:** Docker Compose.

## Future Roadmap
*   Multi-agent debate orchestration.
*   Enhanced artifact management (file browser).
*   User authentication (OAuth).
