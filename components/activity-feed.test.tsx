/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivityFeed } from './activity-feed';
import { Session, Activity } from '@/types/jules';

// Mock dependencies
jest.mock('@/lib/jules/provider', () => ({
  useJules: jest.fn()
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.mock('@/hooks/use-notifications', () => ({
  useNotifications: () => ({
    sendNotification: jest.fn(),
    permission: 'granted',
    requestPermission: jest.fn()
  })
}));

jest.mock('./activity-content', () => ({
  ActivityContent: ({ content }: { content: string }) => <div>{content}</div>
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

import { useJules } from '@/lib/jules/provider';
import useSWR from 'swr';
import { TooltipProvider } from '@/components/ui/tooltip';
import { isSessionArchived } from '@/lib/archive';

jest.mock('@/lib/archive', () => ({
  isSessionArchived: jest.fn(),
  archiveSession: jest.fn(),
  unarchiveSession: jest.fn()
}));

describe('ActivityFeed', () => {
  const mockSession: Session = {
    id: 'session-1',
    sourceId: 'repo/test',
    title: 'Test Session',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    prompt: 'Initial prompt'
  };

  const mockActivities: Activity[] = [
    {
      id: 'act-1',
      sessionId: 'session-1',
      type: 'message',
      role: 'user',
      content: 'Hello Jules',
      createdAt: new Date().toISOString()
    },
    {
      id: 'act-2',
      sessionId: 'session-1',
      type: 'message',
      role: 'agent',
      content: 'Hello User',
      createdAt: new Date().toISOString()
    }
  ];

  const mockClient = {
    listActivities: jest.fn(),
    createActivity: jest.fn(),
    approvePlan: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useJules as jest.Mock).mockReturnValue({ client: mockClient });
    (useSWR as jest.Mock).mockReturnValue({
      data: mockActivities,
      error: null,
      mutate: jest.fn(),
      isLoading: false
    });
    (isSessionArchived as jest.Mock).mockReturnValue(false);
  });

  it('renders activities correctly', () => {
    render(
      <TooltipProvider>
        <ActivityFeed
          session={mockSession}
          showCodeDiffs={false}
          onToggleCodeDiffs={jest.fn()}
          onActivitiesChange={jest.fn()}
        />
      </TooltipProvider>
    );

    expect(screen.getByText('Hello Jules')).toBeInTheDocument();
    expect(screen.getByText('Hello User')).toBeInTheDocument();
  });

  it('handles sending a message', async () => {
    const mutateMock = jest.fn();
    (useSWR as jest.Mock).mockReturnValue({
      data: mockActivities,
      error: null,
      mutate: mutateMock,
      isLoading: false
    });

    mockClient.createActivity.mockResolvedValue({
      id: 'act-3',
      sessionId: 'session-1',
      type: 'message',
      role: 'user',
      content: 'New message',
      createdAt: new Date().toISOString()
    });

    render(
      <TooltipProvider>
        <ActivityFeed
          session={mockSession}
          showCodeDiffs={false}
          onToggleCodeDiffs={jest.fn()}
          onActivitiesChange={jest.fn()}
        />
      </TooltipProvider>
    );

    const input = screen.getByPlaceholderText('Send a message to Jules...');
    fireEvent.change(input, { target: { value: 'New message' } });
    
    // Find the send button (it might be an icon button, so we look for the form submission or button)
    // The ActivityInput component likely has a button.
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockClient.createActivity).toHaveBeenCalledWith({
        sessionId: 'session-1',
        content: 'New message'
      });
    });
  });

  it('groups progress activities', () => {
    const progressActivities: Activity[] = [
      {
        id: 'prog-1',
        sessionId: 'session-1',
        type: 'progress',
        role: 'agent',
        content: 'Step 1',
        createdAt: new Date().toISOString()
      },
      {
        id: 'prog-2',
        sessionId: 'session-1',
        type: 'progress',
        role: 'agent',
        content: 'Step 2',
        createdAt: new Date().toISOString()
      }
    ];

    (useSWR as jest.Mock).mockReturnValue({
      data: progressActivities,
      error: null,
      mutate: jest.fn(),
      isLoading: false
    });

    render(
      <TooltipProvider>
        <ActivityFeed
          session={mockSession}
          showCodeDiffs={false}
          onToggleCodeDiffs={jest.fn()}
          onActivitiesChange={jest.fn()}
        />
      </TooltipProvider>
    );

    // Should see "2 updates" badge or text
    expect(screen.getByText('2 updates')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('shows archived state', () => {
    (isSessionArchived as jest.Mock).mockReturnValue(true);

    render(
      <TooltipProvider>
        <ActivityFeed
          session={mockSession}
          showCodeDiffs={false}
          onToggleCodeDiffs={jest.fn()}
          onActivitiesChange={jest.fn()}
        />
      </TooltipProvider>
    );

    expect(screen.getByText('Archived Session (Read-only)')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Send a message to Jules...')).not.toBeInTheDocument();
  });

  it('shows approve plan button when awaiting approval', () => {
    const planActivity: Activity = {
      id: 'plan-1',
      sessionId: 'session-1',
      type: 'plan',
      role: 'agent',
      content: 'Here is the plan',
      createdAt: new Date().toISOString()
    };

    (useSWR as jest.Mock).mockReturnValue({
      data: [planActivity],
      error: null,
      mutate: jest.fn(),
      isLoading: false
    });

    const awaitingSession = { ...mockSession, status: 'awaiting_approval' as const };

    render(
      <TooltipProvider>
        <ActivityFeed
          session={awaitingSession}
          showCodeDiffs={false}
          onToggleCodeDiffs={jest.fn()}
          onActivitiesChange={jest.fn()}
        />
      </TooltipProvider>
    );

    expect(screen.getByText('Approve Plan')).toBeInTheDocument();
  });
});
