<<<<<<< HEAD

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
=======
'use client';

import { useEffect, useState } from 'react';
import { useJules } from '@/lib/jules/provider';
import type { Session } from '@/types/jules';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Clock, CheckCircle2, XCircle, PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SessionListProps {
  onSelectSession?: (sessionId: string) => void;
  selectedSessionId?: string | null;
}

export function SessionList({ onSelectSession, selectedSessionId }: SessionListProps) {
  const { client } = useJules();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    const loadSessions = async () => {
        try {
            const data = await client.listSessions();
            setSessions(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    loadSessions();
    const interval = setInterval(loadSessions, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [client]);

  if (loading) {
     return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-zinc-500" /></div>;
  }

  const getStatusIcon = (status: string) => {
     switch(status) {
         case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
         case 'failed': return <XCircle className="h-3 w-3 text-red-500" />;
         default: return <PlayCircle className="h-3 w-3 text-blue-500" />;
     }
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession?.(session.id)}
            className={cn(
               "group flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/5",
               selectedSessionId === session.id
                 ? "bg-white/10 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                 : "bg-zinc-950/50 border-white/5"
            )}
          >
            <div className="flex justify-between items-start">
               <span className="font-semibold text-sm text-zinc-200 line-clamp-1">{session.title || 'Untitled Session'}</span>
               {getStatusIcon(session.status)}
            </div>

            <div className="flex justify-between items-end mt-1">
               <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
               </span>
               <Badge variant="outline" className="text-[10px] h-4 px-1 border-white/10 text-zinc-400">
                  {session.status}
               </Badge>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
            <div className="text-center py-8 text-zinc-500 text-sm">No sessions found.</div>
        )}
>>>>>>> origin/jules-session-keeper-integration-11072096883725838253
      </div>
    </ScrollArea>
  );
}
