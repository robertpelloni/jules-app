
'use client';

import { useState, useEffect } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Session } from '@/types/jules';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SessionListProps {
  onSelectSession: (session: Session) => void;
  selectedSessionId?: string;
  className?: string;
}

export function SessionList({ onSelectSession, selectedSessionId, className }: SessionListProps) {
  const { client, refreshTrigger } = useJules();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      if (!client) return;
      try {
        const data = await client.listSessions();
        // Sort by updated at desc
        const sorted = data.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setSessions(sorted);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSessions();
  }, [client, refreshTrigger]);

  if (isLoading) {
      return <div className="p-4 text-xs text-muted-foreground text-center">Loading sessions...</div>;
  }

  if (sessions.length === 0) {
      return <div className="p-4 text-xs text-muted-foreground text-center">No active sessions.</div>;
  }

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="flex flex-col gap-1 p-2">
        {sessions.map((session) => (
          <Button
            key={session.id}
            variant={selectedSessionId === session.id ? "secondary" : "ghost"}
            className={cn(
              "justify-start h-auto py-3 px-3 w-full text-left flex flex-col items-start gap-1 transition-all",
              selectedSessionId === session.id ? "bg-white/10" : "hover:bg-white/5"
            )}
            onClick={() => {
                if (selectedSessionId !== session.id) {
                    onSelectSession(session);
                }
            }}
          >
            <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-sm truncate w-[85%]">{session.title || 'Untitled Session'}</span>
                {session.status === 'active' && <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
            </div>
            
            <div className="flex items-center gap-3 w-full text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1 truncate max-w-[50%]">
                    {session.sourceId}
                </span>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
