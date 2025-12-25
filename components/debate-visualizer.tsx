'use client';

import { useSessionKeeperStore, DebateResult } from '@/lib/stores/session-keeper';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, User, Gavel } from 'lucide-react';
import { useState } from 'react';

export function DebateVisualizer() {
  const { debates } = useSessionKeeperStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (debates.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4 text-sm">
        No debates recorded yet. Enable "Council Mode" in Session Keeper settings to see multi-agent interactions here.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {debates.map((debate) => (
          <DebateCard 
            key={debate.id} 
            debate={debate} 
            isExpanded={expandedId === debate.id}
            onToggle={() => setExpandedId(expandedId === debate.id ? null : debate.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function DebateCard({ debate, isExpanded, onToggle }: { debate: DebateResult, isExpanded: boolean, onToggle: () => void }) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <Badge variant={debate.mode === 'conference' ? 'secondary' : 'default'} className="uppercase text-[10px] tracking-wider">
            {debate.mode === 'conference' ? 'Conference' : 'Council'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {format(debate.timestamp, 'MMM d, h:mm:ss a')}
          </span>
          <span className="text-xs text-muted-foreground/50 font-mono hidden sm:inline-block">
            {debate.sessionId.substring(0, 8)}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Separator />
            <CardContent className="p-4 space-y-6 bg-background/30">
              
              {/* Council Opinions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {debate.opinions.map((op, idx) => (
                  <Card key={idx} className="bg-muted/30 border-border/30 shadow-none">
                    <CardHeader className="p-3 pb-2 flex flex-row items-center gap-2 space-y-0 border-b border-border/10">
                      <User className="h-3 w-3 text-primary" />
                      <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
                        {op.participant.role || op.participant.model}
                      </div>
                      <div className="ml-auto text-[10px] text-muted-foreground font-mono">
                        {op.participant.provider}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 text-xs text-muted-foreground leading-relaxed">
                      {op.content}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Final Verdict */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                  <Gavel className="h-4 w-4" />
                  <span className="text-sm uppercase tracking-wider">Final Verdict</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed pl-1">
                  {debate.finalInstruction}
                </p>
              </div>

            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
