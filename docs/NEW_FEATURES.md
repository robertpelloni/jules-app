# New Features Documentation

## Comprehensive Code Review System (v0.8.0)

A robust, multi-persona code review system has been implemented to provide structured, actionable feedback on codebases.

### Features
1.  **Multi-Persona Analysis**: The code is analyzed in parallel by three specialized AI agents:
    *   **Security Expert**: Focuses on vulnerabilities and injection risks.
    *   **Performance Engineer**: Identifies inefficiencies and scaling bottlenecks.
    *   **Clean Code Advocate**: Reviews maintainability, naming, and patterns.
2.  **Structured Scorecard**: The individual reviews are synthesized by a "Lead Architect" agent into a structured JSON format containing:
    *   **Overall Score (0-100)**
    *   **Executive Summary**
    *   **Categorized Issues** (High/Medium/Low severity).
3.  **Visual UI**: A new `ReviewScorecard` component renders the results directly in the activity feed, featuring progress bars, severity badges, and actionable suggestions.
4.  **Local Context Injection**: The review system gathers actual file content from the local repository to ensure the analysis is grounded in reality.

### Architecture
*   **Backend**: `lib/orchestration/review.ts` orchestrates the parallel LLM calls and final synthesis.
*   **API**: `/api/review` endpoint handles the request, ensuring secure execution server-side.
*   **Frontend**: `components/activity-feed.tsx` detects `ReviewResult` payloads and renders the scorecard.

## Multi-Agent Debate with Context Injection

The Multi-Agent Debate feature now supports **Local Context Injection**.
This allows the debating agents (Architect, Security Engineer, etc.) to access the actual file structure and content of key configuration files (`package.json`, `README.md`, etc.) from the local repository.

### How it works
1.  **Frontend**: When a debate is triggered in `DebateDialog`, the client calls `client.gatherRepositoryContext('.')`.
2.  **Context Injection**: This context string is prepended to the conversation history as a "SYSTEM CONTEXT" message.
3.  **Backend**: The `runDebate` function receives this enhanced history, ensuring all participants are grounded in the actual codebase reality.

### API Changes
*   **Endpoint**: `/api/debate` (No schema change, just enriched payload content).
*   **Client**: `gatherRepositoryContext` is now utilized in both Code Review and Debate workflows.

## Plan Approval

The Plan Approval workflow is fully supported via the proxy endpoint.
*   **Client Method**: `client.approvePlan(sessionId)`
*   **Endpoint**: POST `/api/jules/sessions/{sessionId}/approve-plan` -> Proxies to Google's `sessions.approvePlan`.

## Session Resume

Resuming a session is handled by sending a message to the agent, as there is no dedicated `resume` endpoint in the Google Jules API v1alpha.
*   **Client Method**: `client.resumeSession(sessionId)`
*   **Implementation**: Sends a user message "Please resume working on this task." to the session via `/api/jules/sessions/{sessionId}:sendMessage`.

## API Proxy

The Next.js API Routes at `app/api/jules/[...path]` serve as a transparent proxy to the Google Jules API, handling authentication via the session's API key.
