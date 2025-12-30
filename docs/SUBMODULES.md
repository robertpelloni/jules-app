# Jules UI - Submodule Dashboard

This document provides a real-time overview of all submodules integrated into the Jules UI project.

## Directory Structure

The project follows a strict directory layout:

*   **`app/`**: Next.js App Router pages and API routes.
*   **`components/`**: React components (UI, Layout, Features).
*   **`lib/`**: Core utilities, database clients, and business logic.
*   **`external/`**: **ALL** Git submodules are located here. This isolates external dependencies from the main application code.
*   **`jules-sdk-reference/`**: Specific SDK reference submodule (sometimes at root for legacy reasons, check path).

## Submodule Status (Generated: 2025-12-30)

| Submodule | Path | Version/Commit | Branch |
| :--- | :--- | :--- | :--- |
| **antigravity-jules-orchestration** | `external/antigravity-jules-orchestration` | `71f92ab` (v2.6.1-11) | `HEAD` |
| **gemini-cli-jules** | `external/gemini-cli-jules` | `9f2fc14` (v0.1.0-3) | `HEAD` |
| **google-jules-mcp** | `external/google-jules-mcp` | `39b4251` | `main` |
| **jules-action** | `external/jules-action` | `bff7875` | `ai-assisted` |
| **jules-awesome-list** | `external/jules-awesome-list` | `0118486` | `main` |
| **jules-mcp-server** | `external/jules-mcp-server` | `5779789` (v0.1.6) | `HEAD` |
| **jules-system-prompt** | `external/jules-system-prompt` | `de4a2bf` (v1.0.0-alpha-2) | `HEAD` |
| **jules-task-queue** | `external/jules-task-queue` | `f11d2ad` | `main` |
| **jules_mcp** | `external/jules_mcp` | `db11576` | `main` |
| **jules-sdk-reference** | `jules-sdk-reference` | `51685d6` | `main` |

## Integration Notes

*   **Orchestration**: The `antigravity` module is used for complex multi-agent flows (Debates).
*   **MCP**: Multiple MCP servers (`google-jules-mcp`, `jules-mcp-server`) are included to test Model Context Protocol compatibility.
*   **SDK**: The `jules-sdk-reference` is a Python reference implementation often used for cross-checking logic.
