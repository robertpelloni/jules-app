'use client';

import { useState, useEffect, useRef } from 'react';
import { useJules } from '@/lib/jules/provider';
import { Settings, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types for configuration
export interface SessionKeeperConfig {
  isEnabled: boolean;
  checkIntervalSeconds: number; // How often to check sessions (in seconds)
  inactivityThresholdMinutes: number; // How long before sending a nudge (in minutes)
  messages: string[]; // List of messages to randomly choose from
}

// Default configuration
const DEFAULT_CONFIG: SessionKeeperConfig = {
  isEnabled: false,
  checkIntervalSeconds: 30,
  inactivityThresholdMinutes: 1,
  messages: [
    "Great! Please keep going as you advise!",
    "Yes! Please continue to proceed as you recommend!",
    "This looks correct. Please proceed.",
    "Excellent plan. Go ahead.",
    "Looks good to me. Continue.",
  ],
};

export function SessionKeeper() {
  const { client, apiKey } = useJules();
  const [config, setConfig] = useState<SessionKeeperConfig>(DEFAULT_CONFIG);
  const [logs, setLogs] = useState<{ time: string; message: string; type: 'info' | 'action' | 'error' }[]>([]);
  const [open, setOpen] = useState(false);

  // Refs for interval and preventing race conditions
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

  // Load config from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('jules-session-keeper-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse session keeper config', e);
      }
    }
  }, []);

  // Save config to local storage when changed
  useEffect(() => {
    localStorage.setItem('jules-session-keeper-config', JSON.stringify(config));
  }, [config]);

  // Main Loop
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!config.isEnabled || !client || !apiKey) {
      return;
    }

    const runLoop = async () => {
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        addLog('Checking sessions...', 'info');
        const sessions = await client.listSessions();
        const now = new Date();

        for (const session of sessions) {
          // Skip completed, failed, paused sessions unless waiting for approval which might appear as something else if we didn't map it correctly,
          // but we mapped 'AWAITING_PLAN_APPROVAL' to 'awaiting_approval'.
          // We also want to nudge 'active' sessions.

          if (session.status === 'completed' || session.status === 'failed' || session.status === 'paused') {
            continue;
          }

          // 1. Check for Plan Approval
          if (session.status === 'awaiting_approval') {
            addLog(`Approving plan for session ${session.id.substring(0, 8)}...`, 'action');
            await client.approvePlan(session.id);
            addLog(`Plan approved for ${session.id.substring(0, 8)}`, 'action');
            continue; // Skip inactivity check if we just acted
          }

          // 2. Check for Inactivity
          // Ensure we have a valid last activity time
          const lastActivityTime = session.lastActivityAt ? new Date(session.lastActivityAt) : new Date(session.updatedAt);
          const diffMs = now.getTime() - lastActivityTime.getTime();
          const diffMinutes = diffMs / 60000;

          if (diffMinutes > config.inactivityThresholdMinutes) {
            // Pick a random message
            const message = config.messages[Math.floor(Math.random() * config.messages.length)];

            addLog(`Sending nudge to ${session.id.substring(0, 8)} (${Math.round(diffMinutes)}m inactive)`, 'action');
            await client.createActivity({
              sessionId: session.id,
              content: message,
              type: 'message'
            });
            addLog(`Nudge sent to ${session.id.substring(0, 8)}: "${message.substring(0, 20)}..."`, 'action');
          }
        }
      } catch (error) {
        console.error('Session Keeper Error:', error);
        addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      } finally {
        processingRef.current = false;
      }
    };

    // Run immediately then on interval
    runLoop();
    intervalRef.current = setInterval(runLoop, config.checkIntervalSeconds * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // We intentionally exclude messages from dependency array to avoid resetting timer on edit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.isEnabled, config.checkIntervalSeconds, config.inactivityThresholdMinutes, client, apiKey]);

  const addLog = (message: string, type: 'info' | 'action' | 'error') => {
    // Only log actions and errors to UI to avoid spam, unless debugging
    // if (type === 'info') return;
    setLogs(prev => [{
      time: new Date().toLocaleTimeString(),
      message,
      type
    }, ...prev].slice(0, 50));
  };

  if (!apiKey) return null;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={`fixed bottom-4 right-4 z-50 rounded-full shadow-lg ${config.isEnabled ? 'bg-green-100 dark:bg-green-900 border-green-500' : ''}`}
        onClick={() => setOpen(true)}
        title="Session Keeper Settings"
      >
        {config.isEnabled ? <RotateCw className="h-4 w-4 animate-spin-slow" /> : <Settings className="h-4 w-4" />}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Session Keeper (Auto-Pilot)</DialogTitle>
            <DialogDescription>
              Automatically keep sessions active and approve plans.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 overflow-y-auto pr-2">
            <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
              <Label htmlFor="keeper-enabled" className="flex flex-col space-y-1">
                <span className="font-medium">Enable Auto-Pilot</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Continuously monitor active sessions
                </span>
              </Label>
              <Switch
                id="keeper-enabled"
                checked={config.isEnabled}
                onCheckedChange={(c) => setConfig({ ...config, isEnabled: c })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interval">Check Frequency (seconds)</Label>
                <Input
                  id="interval"
                  type="number"
                  min={10}
                  value={config.checkIntervalSeconds}
                  onChange={(e) => setConfig({ ...config, checkIntervalSeconds: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Inactivity Threshold (minutes)</Label>
                <Input
                  id="threshold"
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={config.inactivityThresholdMinutes}
                  onChange={(e) => setConfig({ ...config, inactivityThresholdMinutes: parseFloat(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="messages">Encouragement Messages (one per line)</Label>
              <Textarea
                id="messages"
                className="min-h-[100px]"
                value={config.messages.join('\n')}
                onChange={(e) => setConfig({ ...config, messages: e.target.value.split('\n').filter(line => line.trim() !== '') })}
              />
            </div>

            <div className="space-y-2">
              <Label>Activity Log</Label>
              <Card className="h-[150px] bg-muted/50">
                <ScrollArea className="h-full p-2">
                  <div className="space-y-1 text-xs font-mono">
                    {logs.length === 0 && <div className="text-muted-foreground italic">No activity yet</div>}
                    {logs.map((log, i) => (
                      <div key={i} className={`flex gap-2 ${
                        log.type === 'error' ? 'text-red-500' :
                        log.type === 'action' ? 'text-green-500 font-bold' :
                        'text-muted-foreground'
                      }`}>
                        <span className="opacity-50">[{log.time}]</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfig(DEFAULT_CONFIG)}>Reset Defaults</Button>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
