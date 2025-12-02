# Product Requirements Document: Jules Task Manager

## Vision
A modern, mobile-friendly web application for managing multiple Jules AI agent tasks and sessions with a superior user experience compared to the official Jules web interface.

## MoSCoW Prioritization

### MUST HAVE (P0 - Critical)

#### Core Functionality
- **AUTH-001**: API Key Management
  - Secure storage of Jules API key in localStorage
  - Input validation and error handling
  - Ability to logout and clear credentials

- **SESSION-001**: Session List View
  - Display all user sessions with status badges
  - Sort by last activity (newest first)
  - Show session title and creation timestamp
  - Click to view session details

- **SESSION-002**: Session Detail View
  - Display activity feed for selected session
  - Show user messages vs agent responses
  - Real-time activity updates
  - Scroll to latest activity

- **SESSION-003**: Create New Session
  - Form to create new Jules session
  - Repository/source selection
  - Session title (optional)
  - Initial prompt/instructions (required)

- **ACTIVITY-001**: Send Messages to Session
  - Text input for new messages
  - Submit via button or Enter key
  - Visual feedback during sending
  - Error handling for failed messages

- **UI-001**: Mobile-Responsive Layout
  - Mobile-first design approach
  - Sheet navigation for mobile (<768px)
  - Sidebar navigation for desktop (≥768px)
  - Touch-optimized interactions

### SHOULD HAVE (P1 - Important)

#### Enhanced Features
- **SESSION-004**: Delete/Archive Sessions
  - Ability to delete completed sessions
  - Confirmation dialog before deletion
  - Archive functionality for later reference

- **ACTIVITY-002**: Activity Type Indicators
  - Visual badges for different activity types (plan, progress, error, result)
  - Color-coded status indicators
  - Icons for activity types

- **SOURCE-001**: Repository Management
  - View connected GitHub repositories
  - Link to connect new repositories
  - Repository metadata display

- **UI-002**: Dark Mode Support
  - System preference detection
  - Manual toggle option
  - Persistent user preference

- **UI-003**: Loading States
  - Skeleton loaders for session list
  - Loading indicators for activities
  - Optimistic UI updates

- **SEARCH-001**: Session Search
  - Search sessions by title
  - Filter by status (active, completed, failed)
  - Filter by repository/source

- **NOTIF-001**: Error Notifications
  - Toast notifications for API errors
  - User-friendly error messages
  - Retry mechanisms

### COULD HAVE (P2 - Nice to Have)

#### Advanced Features
- **SESSION-005**: Session Templates
  - Save common prompts as templates
  - Quick-start sessions from templates
  - Template management (create, edit, delete)

- **ACTIVITY-003**: Rich Message Formatting
  - Markdown rendering in messages
  - Syntax highlighting for code blocks
  - Link previews

- **ACTIVITY-004**: Activity Filtering
  - Filter activities by type
  - Show/hide system messages
  - Collapse/expand activity groups

- **EXPORT-001**: Export Sessions
  - Export session history as JSON
  - Export as Markdown report
  - Copy activities to clipboard

- **ANALYTICS-001**: Usage Analytics
  - Session statistics dashboard
  - Activity type breakdown
  - Average session duration
  - Most used repositories

- **COLLAB-001**: Session Sharing
  - Generate shareable session links
  - Read-only view for shared sessions
  - Permission management

- **UI-004**: Customization Options
  - Theme customization
  - Font size adjustments
  - Layout preferences (compact/comfortable)

- **OFFLINE-001**: Offline Support
  - Service worker for offline access
  - Queue messages when offline
  - Sync when connection restored

### WON'T HAVE (Out of Scope)

#### Explicitly Excluded
- **Native mobile apps** - Web app only for now
- **Real-time collaboration** - Multiple users in same session
- **Video/audio integration** - Text-based only
- **Custom AI models** - Jules API only
- **On-premise deployment** - Cloud-first approach
- **SSO/OAuth integration** - API key auth only
- **Billing/payment features** - Free tier only
- **Admin panel** - User-facing app only

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Native fetch API

### API Integration
- **Jules API**: v1 (Alpha)
- **Authentication**: X-Goog-Api-Key header
- **Base URL**: https://jules.googleapis.com/v1

### Data Flow
1. User authenticates with API key (stored in localStorage)
2. App fetches sessions and sources from Jules API
3. User creates/views sessions
4. Activities stream from API to UI
5. User sends messages back to sessions

## User Flows

### First-Time User
1. Land on app → API key prompt
2. Enter API key → Store in localStorage
3. See session list (empty state)
4. Click "New Session" → Create first session
5. View activity feed → Send first message

### Returning User
1. Land on app → Auto-authenticated
2. See session list with latest on top
3. Click session → View activities
4. Send message or create new session

### Mobile User
1. Open app on mobile device
2. Tap menu icon → Session sheet opens
3. Select session → Sheet closes, activity feed shown
4. Type message → Send via button
5. Create new session → Full-screen dialog

## Success Metrics

### Primary KPIs
- **User Engagement**: Daily active users
- **Session Activity**: Average messages per session
- **Performance**: Time to first paint < 1s
- **Mobile Usage**: >40% traffic from mobile

### Secondary KPIs
- **Error Rate**: <1% API request failures
- **Session Creation**: Average sessions created per user
- **Retention**: Weekly return rate
- **Load Time**: Lighthouse score >90

## Future Roadmap

### Phase 2 (Should Have Items)
- Dark mode support
- Session search and filtering
- Repository management
- Delete/archive sessions

### Phase 3 (Could Have Items)
- Session templates
- Rich markdown rendering
- Export functionality
- Usage analytics

### Phase 4 (Exploration)
- Real-time WebSocket updates
- Browser extension
- Desktop app (Electron)
- Team workspaces

## Dependencies

### Critical Dependencies
- Jules API availability and stability
- GitHub app installation for sources
- Modern browser support (ES6+)

### External Services
- Vercel for hosting (recommended)
- GitHub for version control
- Jules API (Google)

## Risks and Mitigations

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Jules API changes | High | Medium | Version API calls, monitor changelog |
| API rate limits | Medium | Low | Implement caching, request throttling |
| localStorage limits | Low | Low | Add data size monitoring |
| Browser compatibility | Medium | Low | Use progressive enhancement |

### Product Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Jules API sunset | High | Low | Monitor official announcements |
| User adoption | Medium | Medium | Focus on mobile UX, marketing |
| Competing tools | Low | Medium | Differentiate with superior UX |

## Open Questions

1. Should we support multiple API keys (team accounts)?
2. What's the ideal session refresh interval?
3. Should we implement activity pagination or infinite scroll?
4. Do we need session export before launch?
5. What analytics platform should we integrate?

## Appendix

### API Endpoints Used
- `GET /sources` - List repositories
- `GET /sessions` - List sessions
- `POST /sessions` - Create session
- `DELETE /sessions/:id` - Delete session
- `GET /sessions/:id/activities` - List activities
- `POST /sessions/:id/activities` - Send message

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+
