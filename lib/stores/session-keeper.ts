import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessionKeeperConfig } from '@/types/jules';

export interface Log {
  id?: string;
  time: string;
  message: string;
  type: 'info' | 'action' | 'error' | 'skip';
  details?: any;
}

export interface DebateOpinion {
  participant: {
    provider: string;
    model: string;
    role?: string;
  };
  content: string;
  error?: string;
}

export interface DebateResult {
  id: string;
  sessionId: string;
  timestamp: number;
  mode: 'debate' | 'conference';
  opinions: DebateOpinion[];
  finalInstruction: string;
}

export interface StatusSummary {
  monitoringCount: number;
  lastAction: string;
  nextCheckIn: number;
}

export interface SessionState {
  error?: { code: number; message: string; timestamp: number };
  ignoreUntil?: number;
  lastActivitySnippet?: string;
}

export interface SessionKeeperStats {
  totalNudges: number;
  totalApprovals: number;
  totalDebates: number;
}

interface SessionKeeperState {
  config: SessionKeeperConfig;
  logs: Log[];
  debates: DebateResult[];
  statusSummary: StatusSummary;
  sessionStates: Record<string, SessionState>;
  stats: SessionKeeperStats;
<<<<<<< HEAD
  setConfig: (config: SessionKeeperConfig) => void;
  addLog: (message: string, type: Log['type']) => void;
  addDebate: (debate: DebateResult) => void;
=======
  isLoading: boolean;

  // Actions
  loadConfig: () => Promise<void>;
  saveConfig: (config: SessionKeeperConfig) => Promise<void>;

  loadLogs: () => Promise<void>;
  addLog: (message: string, type: Log['type'], details?: any) => Promise<void>;
>>>>>>> origin/jules-session-keeper-integration-11072096883725838253
  clearLogs: () => void;

  setStatusSummary: (summary: Partial<StatusSummary>) => void;
  updateSessionState: (sessionId: string, state: Partial<SessionState>) => void;
  incrementStat: (stat: keyof SessionKeeperStats) => void;
}

const DEFAULT_CONFIG: SessionKeeperConfig = {
  isEnabled: false,
  autoSwitch: true,
  checkIntervalSeconds: 30,
  inactivityThresholdMinutes: 1,
  activeWorkThresholdMinutes: 30,
  messages: [
    "Great! Please keep going as you advise!",
    "Yes! Please continue to proceed as you recommend!",
    "This looks correct. Please proceed.",
    "Excellent plan. Go ahead.",
    "Looks good to me. Continue.",
  ],
  customMessages: {},
  smartPilotEnabled: false,
  supervisorProvider: 'openai',
  supervisorApiKey: '',
  supervisorModel: '',
  contextMessageCount: 20,
  debateEnabled: false,
  debateParticipants: []
};

export const useSessionKeeperStore = create<SessionKeeperState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      logs: [],
      debates: [],
      statusSummary: { monitoringCount: 0, lastAction: 'None', nextCheckIn: 0 },
      sessionStates: {},
      stats: { totalNudges: 0, totalApprovals: 0, totalDebates: 0 },
      isLoading: false,

      loadConfig: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/settings/keeper');
          if (res.ok) {
            const config = await res.json();
            set({ config });
          }
        } catch (error) {
          console.error('Failed to load keeper config:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      saveConfig: async (config) => {
        set({ config, isLoading: true });
        try {
          await fetch('/api/settings/keeper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
          });
        } catch (error) {
          console.error('Failed to save keeper config:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadLogs: async () => {
        try {
          const res = await fetch('/api/logs/keeper');
          if (res.ok) {
            const dbLogs = await res.json();
            // Map DB logs to store Logs
            const mappedLogs: Log[] = dbLogs.map((l: any) => ({
              id: l.id,
              time: new Date(l.timestamp).toLocaleTimeString(),
              message: l.message,
              type: l.type as Log['type'],
              details: l.details ? JSON.parse(l.details) : undefined
            }));
            set({ logs: mappedLogs });
          }
        } catch (error) {
          console.error('Failed to load logs:', error);
        }
      },

      addLog: async (message, type, details) => {
        // Optimistic update
        const newLog: Log = {
          time: new Date().toLocaleTimeString(),
          message,
          type,
          details
        };

        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 100)
        }));

        // Fire and forget persistence
        try {
          await fetch('/api/logs/keeper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message,
              type,
              details,
              sessionId: 'global' // simplified for now
            }),
          });
        } catch (error) {
          console.error('Failed to persist log:', error);
        }
      },

      addDebate: (debate) => set((state) => ({
        debates: [debate, ...state.debates].slice(0, 50) // Keep last 50 debates
      })),

      clearLogs: () => set({ logs: [] }),

      setStatusSummary: (summary) => set((state) => ({
        statusSummary: { ...state.statusSummary, ...summary }
      })),

      updateSessionState: (sessionId, newState) => set((state) => ({
        sessionStates: {
          ...state.sessionStates,
          [sessionId]: {
            ...state.sessionStates[sessionId],
            ...newState
          }
        }
      })),

      incrementStat: (stat) => set((state) => ({
        stats: { ...state.stats, [stat]: state.stats[stat] + 1 }
      })),
    }),
    {
      name: 'jules-session-keeper-store',
      partialize: (state) => ({ stats: state.stats }), // Only persist stats locally now, config comes from DB
    }
  )
);
