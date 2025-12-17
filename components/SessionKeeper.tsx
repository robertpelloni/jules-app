'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useJules } from '@/lib/jules/provider';
import { Settings, RotateCw, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getArchivedSessions } from '@/lib/archive';

// Types for configuration
export interface SessionKeeperConfig {
  isEnabled: boolean;
  autoSwitch: boolean;
  checkIntervalSeconds: number;
  inactivityThresholdMinutes: number;
  activeWorkThresholdMinutes: number;
  messages: string[]; // Fallback messages
  customMessages: Record<string, string[]>;

  // Smart Auto-Pilot Settings
  smartPilotEnabled: boolean;
  supervisorProvider: 'openai' | 'anthropic' | 'gemini';
  supervisorApiKey: string;
  supervisorModel: string;
  contextMessageCount: number;
}

// Default configuration
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
  supervisorModel: '', // Will default based on provider
  contextMessageCount: 10,
};

export function SessionKeeper() {
  const { client, apiKey } = useJules();
  const router = useRouter();
  const pathname = usePathname();
  const [config, setConfig] = useState<SessionKeeperConfig>(DEFAULT_CONFIG);
  const [logs, setLogs] = useState<{ time: string; message: string; type: 'info' | 'action' | 'error' | 'skip' }[]>([]);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('global');

  // Refs for interval and preventing race conditions
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  const hasSwitchedRef = useRef(false);

  // Load config from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('jules-session-keeper-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // Merge to ensure new fields exist
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch (e) {
        console.error('Failed to parse session keeper config', e);
      }
    }
  }, []);

  // Save config to local storage when changed
  useEffect(() => {
    localStorage.setItem('jules-session-keeper-config', JSON.stringify(config));
  }, [config]);

  // Fetch sessions for the dropdown
  useEffect(() => {
    if (client) {
      client.listSessions().then(data => {
        setSessions(data.map(s => ({ id: s.id, title: s.title || s.id })));
      }).catch(e => console.error('Failed to list sessions for config', e));
    }
  }, [client]);

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
      hasSwitchedRef.current = false;

      try {
        addLog('Checking sessions...', 'info');
        const currentSessions = await client.listSessions();
        const now = new Date();
        const archived = getArchivedSessions();

        for (const session of currentSessions) {
          if (archived.has(session.id)) continue;

          // Helper to switch session safely
          const safeSwitch = (targetId: string) => {
            const cleanId = targetId.replace('sessions/', '');
            const targetPath = `/sessions/${cleanId}`;
            if (config.autoSwitch && !hasSwitchedRef.current && pathname !== targetPath) {
              router.push(targetPath);
              hasSwitchedRef.current = true;
            }
          };

          // 1. Resume Paused/Completed/Failed
          if (session.status === 'paused' || session.status === 'completed' || session.status === 'failed') {
             addLog(`Resuming ${session.status} session ${session.id.substring(0, 8)}...`, 'action');
             safeSwitch(session.id);
             await client.resumeSession(session.id);
             addLog(`Resumed ${session.id.substring(0, 8)}`, 'action');
             continue;
          }

          // 2. Approve Plans
          if (session.status === 'awaiting_approval' || session.rawState === 'AWAITING_PLAN_APPROVAL') {
            addLog(`Approving plan for session ${session.id.substring(0, 8)}...`, 'action');
            safeSwitch(session.id);
            await client.approvePlan(session.id);
            addLog(`Plan approved for ${session.id.substring(0, 8)}`, 'action');
            continue;
          }

          // 3. Check for Inactivity & Nudge
          const lastActivityTime = session.lastActivityAt ? new Date(session.lastActivityAt) : new Date(session.updatedAt);
          const diffMs = now.getTime() - lastActivityTime.getTime();
          const diffMinutes = diffMs / 60000;

          // Determine threshold
          let threshold = config.inactivityThresholdMinutes;
          if (session.rawState === 'IN_PROGRESS') {
             threshold = config.activeWorkThresholdMinutes;
             // Guard: If actively working (<30s), always skip
             if (diffMs < 30000) {
               addLog(`Skipped ${session.id.substring(0, 8)}: Working (Active < 30s)`, 'skip');
               continue;
             }
          }

          if (diffMinutes > threshold) {
            safeSwitch(session.id);
            let messageToSend = '';

            // SMART AUTO-PILOT LOGIC
            if (config.smartPilotEnabled && config.supervisorApiKey) {
              try {
                addLog(`Asking Supervisor (${config.supervisorProvider}) for guidance...`, 'info');

                // Fetch recent activities for context
                const activities = await client.listActivities(session.id);
                // Filter and sort
                const history = activities
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .slice(-config.contextMessageCount) // Last N messages
                  .map(a => ({ role: a.role, content: a.content }));

                // Call our Proxy API
                const response = await fetch('/api/supervisor', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    messages: history,
                    provider: config.supervisorProvider,
                    apiKey: config.supervisorApiKey,
                    model: config.supervisorModel
                  })
                });

                if (response.ok) {
                  const data = await response.json();
                  if (data.content) {
                    messageToSend = data.content;
                    addLog(`Supervisor says: "${messageToSend.substring(0, 30)}..."`, 'action');
                  }
                } else {
                  addLog('Supervisor failed, falling back to static messages.', 'error');
                }
              } catch (err) {
                console.error('Supervisor Error:', err);
                addLog('Supervisor error, using fallback.', 'error');
              }
            }

            // Fallback if smart pilot disabled or failed
            if (!messageToSend) {
              let messages = config.messages;
              if (config.customMessages && config.customMessages[session.id] && config.customMessages[session.id].length > 0) {
                messages = config.customMessages[session.id];
              }

              if (messages.length === 0) {
                addLog(`Skipped ${session.id.substring(0, 8)}: No messages configured`, 'skip');
                continue;
              }
              messageToSend = messages[Math.floor(Math.random() * messages.length)];
            }

            addLog(`Sending nudge to ${session.id.substring(0, 8)} (${Math.round(diffMinutes)}m inactive)`, 'action');
            await client.createActivity({
              sessionId: session.id,
              content: messageToSend,
              type: 'message'
            });
            addLog(`Nudge sent`, 'action');
          }
        }
      } catch (error) {
        console.error('Session Keeper Error:', error);
        addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      } finally {
        processingRef.current = false;
      }
    };

    runLoop();
    intervalRef.current = setInterval(runLoop, config.checkIntervalSeconds * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [config, client, apiKey, router, pathname]);

  const addLog = (message: string, type: 'info' | 'action' | 'error' | 'skip') => {
    if (type === 'info') return;
    setLogs(prev => [{
      time: new Date().toLocaleTimeString(),
      message,
      type
    }, ...prev].slice(0, 50));
  };

  const updateMessages = (sessionId: string, newMessages: string[]) => {
    if (sessionId === 'global') {
      setConfig({ ...config, messages: newMessages });
    } else {
      setConfig({
        ...config,
        customMessages: {
          ...config.customMessages,
          [sessionId]: newMessages
        }
      });
    }
  };

  const currentMessages = selectedSessionId === 'global'
    ? config.messages
    : (config.customMessages?.[selectedSessionId] || []);

  if (!apiKey) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`fixed bottom-4 right-4 z-50 rounded-full shadow-lg h-12 w-12 border-2 ${config.isEnabled ? 'bg-green-100 dark:bg-green-900 border-green-500 animate-pulse' : 'bg-background'}`}
          title="Session Keeper Auto-Pilot"
        >
          {config.smartPilotEnabled && config.isEnabled ? <Brain className="h-6 w-6 animate-pulse text-purple-500" /> :
           config.isEnabled ? <RotateCw className="h-6 w-6 animate-spin-slow" /> : <Settings className="h-6 w-6" />}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {config.smartPilotEnabled ? <Brain className="h-5 w-5 text-purple-500" /> : <RotateCw className={`h-5 w-5 ${config.isEnabled ? 'animate-spin' : ''}`} />}
            Session Keeper Auto-Pilot
          </SheetTitle>
          <SheetDescription>
            Automatically monitors sessions, resumes work, and provides guidance.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          {/* Main Controls */}
          <div className="flex flex-col gap-4 border p-4 rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <Label htmlFor="keeper-enabled" className="flex flex-col">
                <span className="font-semibold text-base">Enable Auto-Pilot</span>
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
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-switch" className="flex flex-col">
                <span className="font-medium">Auto-Switch Session</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Navigate to the session being acted upon
                </span>
              </Label>
              <Switch
                id="auto-switch"
                checked={config.autoSwitch}
                onCheckedChange={(c) => setConfig({ ...config, autoSwitch: c })}
              />
            </div>
          </div>

          {/* Smart Supervisor Settings */}
          <div className="flex flex-col gap-4 border p-4 rounded-lg border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center justify-between">
              <Label htmlFor="smart-pilot" className="flex flex-col">
                <span className="font-semibold text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Smart Supervisor
                </span>
                <span className="font-normal text-xs text-muted-foreground">
                  Use AI to generate context-aware guidance
                </span>
              </Label>
              <Switch
                id="smart-pilot"
                checked={config.smartPilotEnabled}
                onCheckedChange={(c) => setConfig({ ...config, smartPilotEnabled: c })}
              />
            </div>

            {config.smartPilotEnabled && (
              <div className="grid gap-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                      value={config.supervisorProvider}
                      onValueChange={(v: 'openai' | 'anthropic' | 'gemini') => setConfig({ ...config, supervisorProvider: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                        <SelectItem value="gemini">Google (Gemini)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Model (Optional)</Label>
                    <Input
                      placeholder="e.g. gpt-4o"
                      value={config.supervisorModel}
                      onChange={(e) => setConfig({ ...config, supervisorModel: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder={`Enter ${config.supervisorProvider} API Key`}
                    value={config.supervisorApiKey}
                    onChange={(e) => setConfig({ ...config, supervisorApiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Context History (Messages)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={config.contextMessageCount}
                    onChange={(e) => setConfig({ ...config, contextMessageCount: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interval">Check Frequency (s)</Label>
              <Input
                id="interval"
                type="number"
                min={10}
                value={config.checkIntervalSeconds}
                onChange={(e) => setConfig({ ...config, checkIntervalSeconds: parseInt(e.target.value) || 30 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Inactivity Threshold (m)</Label>
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

          {/* Working Threshold */}
          <div className="space-y-2 border p-4 rounded-lg bg-muted/20">
            <div className="flex justify-between items-center">
              <Label>Working Session Threshold (m)</Label>
              <Input
                className="w-20 h-8"
                type="number"
                min={1}
                value={config.activeWorkThresholdMinutes}
                onChange={(e) => setConfig({ ...config, activeWorkThresholdMinutes: parseFloat(e.target.value) || 30 })}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Wait time for sessions marked &quot;In Progress&quot; before interrupting.
            </p>
          </div>

          {/* Fallback Messages */}
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <Label>
                 {config.smartPilotEnabled ? 'Fallback Messages' : 'Encouragement Messages'}
               </Label>
               <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global Defaults</SelectItem>
                    {sessions.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.title.substring(0, 20)}...</SelectItem>
                    ))}
                  </SelectContent>
               </Select>
             </div>

             <Textarea
              className="min-h-[100px] font-mono text-xs"
              value={currentMessages.join('\n')}
              onChange={(e) => updateMessages(selectedSessionId, e.target.value.split('\n').filter(line => line.trim() !== ''))}
              placeholder={selectedSessionId === 'global' ? "Enter one message per line..." : "Enter custom messages..."}
            />
          </div>

          {/* Logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Live Activity Log</Label>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setLogs([])}>Clear</Button>
            </div>
            <Card className="h-[200px] bg-black/90 text-green-400 font-mono text-xs border-green-900/50">
              <ScrollArea className="h-full p-3">
                <div className="space-y-1.5">
                  {logs.length === 0 && <div className="text-muted-foreground italic opacity-50">Waiting for activity...</div>}
                  {logs.map((log, i) => (
                    <div key={i} className={`flex gap-2 border-b border-white/5 pb-1 last:border-0 ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'action' ? 'text-green-400 font-bold' :
                      log.type === 'skip' ? 'text-yellow-500/70' :
                      'text-muted-foreground'
                    }`}>
                      <span className="opacity-50 shrink-0">[{log.time}]</span>
                      <span className="break-words">{log.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pb-6">
          <Button variant="secondary" onClick={() => setConfig(DEFAULT_CONFIG)}>Reset Defaults</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
