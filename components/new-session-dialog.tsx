<<<<<<< HEAD

=======
>>>>>>> origin/jules-session-keeper-integration-11072096883725838253
'use client';

import { useState } from 'react';
import { useJules } from '@/lib/jules/provider';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
=======
>>>>>>> origin/jules-session-keeper-integration-11072096883725838253
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
<<<<<<< HEAD
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from 'lucide-react';
import useSWR from 'swr';

interface NewSessionDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSessionCreated?: () => void;
    initialValues?: {
        sourceId?: string;
        title?: string;
        prompt?: string;
        startingBranch?: string;
    };
}

export function NewSessionDialog({ trigger, open: controlledOpen, onOpenChange: setControlledOpen, onSessionCreated, initialValues }: NewSessionDialogProps) {
    const { client } = useJules();
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const [title, setTitle] = useState(initialValues?.title || '');
    const [sourceId, setSourceId] = useState(initialValues?.sourceId || '');
    const [prompt, setPrompt] = useState(initialValues?.prompt || '');
    const [loading, setLoading] = useState(false);

    // Fetch available sources (repos)
    const { data: sources, isLoading: sourcesLoading } = useSWR(
        client && open ? 'sources' : null,
        () => client!.listSources()
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client || !sourceId) return;

        try {
            setLoading(true);
            await client.createSession(sourceId, prompt, title);
            setOpen?.(false);
            onSessionCreated?.();
            // Reset form
            setTitle('');
            setPrompt('');
        } catch (err) {
            console.error('Failed to create session:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        New Session
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Create New Session</DialogTitle>
                    <DialogDescription>
                        Start a new coding session with an AI agent.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="source">Repository</Label>
                        <Select value={sourceId} onValueChange={setSourceId} disabled={sourcesLoading}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Select a repository" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                {sources?.map(source => (
                                    <SelectItem key={source.id} value={source.id}>{source.name || source.id}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Session Title</Label>
                        <Input 
                            id="title" 
                            value={title} 
                            onChange={e => setTitle(e.target.value)} 
                            placeholder="e.g. Refactor Login Component"
                            className="bg-zinc-900 border-zinc-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="prompt">Initial Prompt</Label>
                        <Textarea 
                            id="prompt" 
                            value={prompt} 
                            onChange={e => setPrompt(e.target.value)} 
                            placeholder="Describe what you want the agent to do..."
                            className="min-h-[100px] bg-zinc-900 border-zinc-800"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading || !sourceId} className="bg-purple-600 hover:bg-purple-500">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Creating...' : 'Create Session'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
=======
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function NewSessionDialog({
  onSessionCreated,
  trigger,
  initialValues
}: {
  onSessionCreated?: (sessionId: string) => void;
  trigger?: React.ReactNode;
  initialValues?: any;
}) {
  const { client } = useJules();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      const session = await client!.createSession({
        title,
        description,
        status: 'active',
        prompt: description || title,
        sourceId: 'global' // simplified default
      });

      toast.success('Session created successfully');
      setOpen(false);
      setTitle('');
      setDescription('');

      if (onSessionCreated) {
        onSessionCreated(session.id);
      }
    } catch (error) {
      toast.error('Failed to create session');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-white border-white/10">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Start a new task or conversation with Jules.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Refactor Authentication"
              className="bg-black/50 border-white/10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the goal of this session..."
              className="bg-black/50 border-white/10 min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
>>>>>>> origin/jules-session-keeper-integration-11072096883725838253
}
