import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SessionKeeperConfig } from '@/types/jules';

export interface Log {
  time: string;
  message: string;
  type: 'info' | 'action' | 'error' | 'skip';
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
  setConfig: (config: SessionKeeperConfig) => void;
  addLog: (message: string, type: Log['type']) => void;
  addDebate: (debate: DebateResult) => void;
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
    (set) => ({
      config: DEFAULT_CONFIG,
      logs: [],
      debates: [],
      statusSummary: { monitoringCount: 0, lastAction: 'None', nextCheckIn: 0 },
      sessionStates: {},
      stats: { totalNudges: 0, totalApprovals: 0, totalDebates: 0 },

      setConfig: (config) => set({ config }),

      addLog: (message, type) => set((state) => ({
        logs: [{
          time: new Date().toLocaleTimeString(),
          message,
          type
        }, ...state.logs].slice(0, 100)
      })),

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
      partialize: (state) => ({ config: state.config, stats: state.stats }), // Persist config AND stats
    }
  )
);
