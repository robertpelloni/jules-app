
'use client';

import { useState } from 'react';
import { useJules } from '@/lib/jules/provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
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
}
