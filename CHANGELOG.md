# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2024-05-23

### Added
- **Session Board (Kanban)**: Drag-and-drop interface for managing session states (Active/Paused/Completed).
- **System Dashboard**: New `/system` page displaying submodule versions, directory structure, and git status.
- **Combined Layout**: Unified navigation for Sessions list, Kanban Board, and Analytics.

## [0.2.0] - 2024-05-23

### Added
- **Session Keeper (Auto-Pilot)**: Automated session monitoring, nudging, and plan approval.
- **Council Debate Mode**: Multi-agent decision making process for next steps.
- **API Client Parity**: Full synchronization with Python SDK models and features.
- **Archive Support**: Client-side archiving of sessions to declutter the workspace.
- **Server-side Search**: Enhanced repository search performance.
- **Logs Panel**: Dedicated UI for viewing Auto-Pilot decisions and actions.

### Changed
- **Activity Feed**: Optimized rendering performance and added support for Media artifacts and PR links.
- **App Layout**: Improved vertical space management with resizable panels.
- **Dependencies**: Updated `react-resizable-panels` to resolve build issues.

### Fixed
- Fixed horizontal overflow issues in the chat interface.
- Fixed missing messages in history due to pagination support.

## [0.1.0] - Initial Release
- Basic session management (Create, List, Delete).
- Real-time activity feed.
- Integrated terminal.
- Code diff viewer.
