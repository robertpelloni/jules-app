'use client';

import { useState } from 'react';
import { SessionKeeperConfig } from '@/types/jules';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionKeeperSettingsContent } from './session-keeper-settings-content';

interface SessionKeeperSettingsProps {
  config: SessionKeeperConfig;
  onConfigChange: (config: SessionKeeperConfig) => void;
  sessions: { id: string; title: string }[];
  onClearMemory: (sessionId: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function SessionKeeperSettings({
  config,
  onConfigChange,
  sessions,
  onClearMemory,
  open: propOpen,
  onOpenChange: propOnOpenChange,
  trigger: propTrigger
}: Partial<SessionKeeperSettingsProps>) {
  const [isOpen, setIsOpen] = useState(false);
<<<<<<< HEAD
  
  const open = propOpen !== undefined ? propOpen : isOpen;
  const onOpenChange = propOnOpenChange || setIsOpen;
=======
  const [localConfig, setLocalConfig] = useState<SessionKeeperConfig>(DEFAULT_CONFIG);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('global');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Use props if available (controlled), otherwise local (uncontrolled)
  const config = propConfig || localConfig;
  const sessions = propSessions || []; // Fallback to empty if not provided in standalone mode

  // NOTE: We rely on the parent (SystemDashboard) or store to provide the initial config via props.
  // We no longer sync from localStorage here for standalone mode as we moved to server-side persistence.

  const handleConfigChange = (newConfig: SessionKeeperConfig) => {
      if (propOnChange) {
          propOnChange(newConfig);
      } else {
          // If used uncontrolled (unlikely now), just set local state
          setLocalConfig(newConfig);
      }
  };

  const handleClearMemory = (sessionId: string) => {
      if (propOnClearMemory) {
          propOnClearMemory(sessionId);
      } else {
          const savedState = localStorage.getItem('jules_supervisor_state');
          if (savedState) {
              const state = JSON.parse(savedState);
              if (state[sessionId]) {
                  delete state[sessionId];
                  localStorage.setItem('jules_supervisor_state', JSON.stringify(state));
              }
          }
      }
  };

  // New Participant State
  const [newPart, setNewPart] = useState({ provider: 'openai', model: '', apiKey: '', role: 'Advisor' });

  const updateMessages = (sessionId: string, newMessages: string[]) => {
    if (sessionId === 'global') {
      handleConfigChange({ ...config, messages: newMessages });
    } else {
      handleConfigChange({
        ...config,
        customMessages: {
          ...config.customMessages,
          [sessionId]: newMessages
        }
      });
    }
  };

  const handleLoadModels = async (provider?: string, apiKey?: string) => {
    const p = provider || config.supervisorProvider;
    const k = apiKey || config.supervisorApiKey;
    if (!k || !p) return;

    setLoadingModels(true);
    try {
      const response = await fetch('/api/supervisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list_models',
          provider: p,
          apiKey: k
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.models && Array.isArray(data.models)) {
          setAvailableModels(data.models);
          if (!provider) { // Main Supervisor
             if (!config.supervisorModel && data.models.length > 0) {
               handleConfigChange({ ...config, supervisorModel: data.models[0] });
             }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load models', err);
    } finally {
      setLoadingModels(false);
    }
  };

  const addParticipant = () => {
      const participants = config.debateParticipants || [];
      handleConfigChange({
          ...config,
          debateParticipants: [
              ...participants,
              { ...newPart, id: crypto.randomUUID() }
          ]
      });
      setNewPart({ provider: 'openai', model: '', apiKey: '', role: 'Advisor' });
  };

  const removeParticipant = (index: number) => {
      const participants = config.debateParticipants || [];
      handleConfigChange({
          ...config,
          debateParticipants: participants.filter((_, i) => i !== index)
      });
  };

  const currentMessages = selectedSessionId === 'global'
    ? config.messages
    : (config.customMessages?.[selectedSessionId] || []);
>>>>>>> origin/jules-session-keeper-integration-11072096883725838253

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {propTrigger !== null && (
        <DialogTrigger asChild>
          {propTrigger || (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 hover:bg-white/10 transition-colors",
                config?.isEnabled ? "text-green-400 hover:text-green-300" : "text-white/60 hover:text-white"
              )}
              title={config?.isEnabled ? "Auto-Pilot Active" : "Auto-Pilot Settings"}
            >
              <Settings className={cn("h-4 w-4", config?.isEnabled && "animate-spin [animation-duration:3s]")} />
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl bg-zinc-950 border-white/10 text-white max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-white/10">
          <DialogTitle className="text-lg font-bold tracking-wide">Auto-Pilot Configuration</DialogTitle>
          <DialogDescription className="text-white/40 text-xs">
            Configure how Jules monitors and interacts with your sessions.
          </DialogDescription>
        </DialogHeader>

        <SessionKeeperSettingsContent 
          config={config}
          onConfigChange={onConfigChange}
          sessions={sessions}
          onClearMemory={onClearMemory}
        />
      </DialogContent>
    </Dialog>
  );
}
