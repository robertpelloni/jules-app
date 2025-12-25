# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-12-24

### Added
- **Broadcast Messages**: New feature to send messages to all open sessions simultaneously. Includes templates for common instructions.
- **Kanban Board**: New view for managing sessions in a Kanban style (Running, Waiting, Done).
- **Docker Optimization**: Switched terminal server base image from `nvcr.io/nvidia/pytorch` (32GB) to `python:3.11-slim-bookworm` (<1GB), significantly reducing disk usage.

### Changed
- **Merged Feature Branches**: Integrated `jules-session-keeper-integration`, `feat-session-kanban-board`, `api-key-ux`, and `mobile-layout` into `main`.
- **Session List**: Updated to support filtering and passing sessions to the Broadcast Dialog.
- **Jules Client**: Added `updateSession` method and improved type definitions.

### Fixed
- **Build Errors**: Resolved type mismatches and missing methods in `JulesClient`.
- **Merge Conflicts**: Fixed conflicts in `session-list.tsx` and `activity-feed.tsx`.
