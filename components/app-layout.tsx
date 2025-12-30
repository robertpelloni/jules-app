'use client';

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJules } from "@/lib/jules/provider";
import type { Session, Activity, SessionTemplate, Artifact } from "@/types/jules";
import { TerminalPanel } from "./terminal-panel";
import { useTerminalAvailable } from "@/hooks/use-terminal-available";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SessionKeeperManager } from "./session-keeper-manager";
import { SessionKeeper } from "./SessionKeeper";
import { useSessionKeeperStore } from "@/lib/stores/session-keeper";
import { DebateDialog } from './debate-dialog';

import { AppHeader } from "./layout/app-header";
import { AppSidebar } from "./layout/app-sidebar";
import { MainContent } from "./layout/main-content";
import { SearchCommandDialog } from "./search-command-dialog";

interface AppLayoutProps {
  initialView?: "sessions" | "analytics" | "templates" | "kanban";
}

export function AppLayout({ initialView }: AppLayoutProps) {
  const { client, apiKey, clearApiKey } = useJules();
  const { config, setConfig } = useSessionKeeperStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAvailable: terminalAvailable } = useTerminalAvailable();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [view, setView] = useState<'sessions' | 'analytics' | 'templates' | 'kanban'>('sessions');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [codeDiffSidebarCollapsed, setCodeDiffSidebarCollapsed] = useState(false);
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);
  const [showCodeDiffs, setShowCodeDiffs] = useState(false);
  const [currentActivities, setCurrentActivities] = useState<Activity[]>([]);
  const [codeSidebarWidth, setCodeSidebarWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('terminal-open') === 'true';
    }
    return false;
  });

  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [newSessionInitialValues, setNewSessionInitialValues] = useState<{
    sourceId?: string;
    title?: string;
    prompt?: string;
    startingBranch?: string;
  } | undefined>(undefined);

  // API Key Dialog State
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  useEffect(() => {
    // Only update if the value actually changes to avoid unnecessary renders
    // Use setTimeout to avoid synchronous state updates during render phase
    const timer = setTimeout(() => {
      if (!apiKey && !isApiKeyDialogOpen) {
        setIsApiKeyDialogOpen(true);
      } else if (apiKey && isApiKeyDialogOpen) {
        setIsApiKeyDialogOpen(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [apiKey, isApiKeyDialogOpen]);

  const handleApiKeySuccess = () => {
    setIsApiKeyDialogOpen(false);
  };

  // Debate Dialog State
  const [debateOpen, setDebateOpen] = useState(false);
  const [debateTopic, setDebateTopic] = useState('');
  const [debateContext, setDebateContext] = useState('');

  const handleStartDebate = (topic?: string, context?: string) => {
      setDebateTopic(topic || '');
      setDebateContext(context || '');
      setDebateOpen(true);
  };

  const handleReviewArtifact = (artifact: Artifact) => {
      const content = artifact.changeSet?.gitPatch?.unidiffPatch || artifact.changeSet?.unidiffPatch || '';
      handleStartDebate(`Code Review: ${artifact.name || 'Artifact'}`, content);
      setView('sessions');
  };

  // Sync session selection with URL query param
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId && client) {
      if (selectedSession?.id !== sessionId) {
        // Prevent infinite loop if we are already in the process of selecting this session
        // or if the session ID is invalid
        client.getSession(sessionId)
          .then(session => {
            if (session.id === sessionId) {
                // Only update if the fetched session matches the URL (handle race conditions)
                // and if it's different from current
                setSelectedSession(prev => prev?.id === session.id ? prev : session);
                setView('sessions');
            }
          })
          .catch(err => {
            console.error('Failed to load session from URL', err);
            // Optionally clear the invalid session ID from URL to prevent loop
          });
      }
    } else if (!sessionId && selectedSession) {
        // If URL has no sessionId but we have a selected session, we might want to clear it
        // Or do nothing if we want to persist state despite URL.
        // For now, let's respect the URL as the source of truth for "no session selected" ONLY if needed
        // But clicking "Sessions" in header might clear URL.
    }
  }, [searchParams, client, selectedSession?.id]);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        if (newWidth > 300 && newWidth < 1200) {
          setCodeSidebarWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const handleSessionSelect = (session: Session) => {
    // Optimistic update to prevent the useEffect loop
    if (selectedSession?.id === session.id) return;
    
    setSelectedSession(session);
    setView('sessions');
    setMobileMenuOpen(false);
    
    // Update URL without triggering a full page navigation if possible, 
    // but Next.js router.push will trigger the searchParams effect.
    // The key is ensuring the effect condition `selectedSession?.id !== sessionId` handles it.
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sessionId', session.id);
    router.push(`/?${newParams.toString()}`);
  };

  const handleSessionSelectById = (sessionId: string) => {
    if (client) {
        client.getSession(sessionId).then(handleSessionSelect).catch(console.error);
    }
  };

  const handleSessionCreated = (sessionId: string) => {
    setRefreshKey((prev) => prev + 1);
    setIsNewSessionOpen(false);
    if (client) {
      client.getSession(sessionId).then(handleSessionSelect).catch(console.error);
    }
  };

  const handleSessionArchived = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = () => {
    clearApiKey();
    setSelectedSession(null);
  };

  const handleToggleTerminal = useCallback(() => {
    setTerminalOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem('terminal-open', String(newValue));
      return newValue;
    });
  }, []);

  const handleStartSessionFromTemplate = (template: SessionTemplate) => {
    setNewSessionInitialValues({
      prompt: template.prompt,
      title: template.title
    });
    setIsNewSessionOpen(true);
  };

  const handleOpenNewSession = () => {
    setNewSessionInitialValues(undefined);
    setIsNewSessionOpen(true);
  };

  // Session Keeper Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-black max-w-full overflow-hidden">
      <SearchCommandDialog />
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">API Key Required</DialogTitle>
            <DialogDescription className="text-white/40">
              Enter your Jules API key to start a session.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">Please configure API key in settings.</div>
        </DialogContent>
      </Dialog>
      
      <SessionKeeperManager />
<<<<<<< HEAD
      
      <AppHeader
        view={view}
        setView={setView}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        refreshKey={refreshKey}
        selectedSession={selectedSession}
        onSelectSession={handleSessionSelect}
        terminalAvailable={terminalAvailable}
        terminalOpen={terminalOpen}
        onToggleTerminal={handleToggleTerminal}
        isNewSessionOpen={isNewSessionOpen}
        setIsNewSessionOpen={setIsNewSessionOpen}
        newSessionInitialValues={newSessionInitialValues}
        onSessionCreated={handleSessionCreated}
        onOpenNewSession={handleOpenNewSession}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        isLogPanelOpen={isLogPanelOpen}
        setIsLogPanelOpen={setIsLogPanelOpen}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          refreshKey={refreshKey}
          onSelectSession={handleSessionSelect}
          selectedSessionId={selectedSession?.id}
        />
=======
      <header className="border-b border-white/[0.08] bg-zinc-950/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-zinc-950 border-white/[0.08]">
                <SheetHeader className="border-b border-white/[0.08] px-3 py-2.5">
                  <SheetTitle className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SESSIONS</SheetTitle>
                </SheetHeader>
                <SessionList
                  key={refreshKey}
                  onSelectSession={handleSessionSelectById}
                  selectedSessionId={selectedSession?.id}
                />
              </SheetContent>
            </Sheet>
            <h1 className="text-sm font-bold tracking-tight text-white">JULES</h1>
            <span className="text-[10px] font-mono text-white/30 ml-2">v0.4.3</span>

            {selectedSession?.sourceId && (
              <a
                href={`https://github.com/${selectedSession.sourceId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 ml-4"
              >
                <span className="opacity-50">Repo:</span> {selectedSession.sourceId}
              </a>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 hover:bg-white/5 ${view === 'sessions' ? 'text-white' : 'text-white/60'}`}
              onClick={() => setView('sessions')}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Sessions</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 hover:bg-white/5 ${view === 'board' ? 'text-white' : 'text-white/60'}`}
              onClick={() => setView('board')}
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Board</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 hover:bg-white/5 ${view === 'artifacts' ? 'text-white' : 'text-white/60'}`}
              onClick={() => setView('artifacts')}
              title="Browse Artifacts"
            >
              <Files className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Files</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 hover:bg-white/5 ${view === 'analytics' ? 'text-white' : 'text-white/60'}`}
              onClick={() => setView('analytics')}
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Analytics</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 hover:bg-white/5 ${isLogPanelOpen ? 'text-purple-500' : 'text-white/60'}`}
              onClick={() => setIsLogPanelOpen(!isLogPanelOpen)}
              title="Toggle Auto-Pilot Logs"
            >
              <ActivityIcon className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Logs</span>
            </Button>

            {terminalAvailable && (
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 hover:bg-white/5 ${terminalOpen ? 'text-green-500' : 'text-white/60'}`}
                onClick={handleToggleTerminal}
                title="Toggle Terminal (Ctrl+`)"
              >
                <TerminalIcon className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Terminal</span>
              </Button>
            )}
            
            <NewSessionDialog 
              onSessionCreated={handleSessionCreated} 
              initialValues={newSessionInitialValues}
              trigger={
                <Button 
                  className="w-full sm:w-auto h-8 text-[10px] font-mono uppercase tracking-widest bg-purple-600 hover:bg-purple-500 text-white border-0"
                  onClick={handleOpenNewSession}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  New Session
                </Button>
              }
            />

            <SessionKeeperSettings />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5 text-white/60">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-white/[0.08]">
                <DropdownMenuItem onClick={() => setView('templates')} className="hover:bg-white/5 text-white/80">
                  <LayoutTemplate className="mr-2 h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Manage Templates</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push('/system')} className="hover:bg-white/5 text-white/80">
                  <Cpu className="mr-2 h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">System Status</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/5 text-white/80">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  <span className="text-xs uppercase tracking-wide">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <aside className={`hidden md:flex border-r border-white/[0.08] flex-col bg-zinc-950 transition-all duration-200 ${
          sidebarCollapsed ? 'md:w-12' : 'md:w-64'
        }`}>
          <div className="px-3 py-2 border-b border-white/[0.08] flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">SESSIONS</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 hover:bg-white/5 text-white/60 ${sidebarCollapsed ? 'mx-auto' : ''}`}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            {!sidebarCollapsed && (
              <SessionList
                key={refreshKey}
                onSelectSession={(sessionId) => handleSessionSelectById(sessionId)}
                selectedSessionId={selectedSession?.id}
              />
            )}
          </div>
        </aside>
>>>>>>> origin/jules-session-keeper-integration-11072096883725838253

        {/* Resizable Panel Group (Vertical: Top = Main, Bottom = Logs) */}
        <ResizablePanelGroup 
          direction="vertical" 
          className="flex-1 min-w-0"
          key={isLogPanelOpen ? "vertical-layout-open" : "vertical-layout-closed"}
        >

          {/* Main Panel: Dashboard */}
          <ResizablePanel defaultSize={isLogPanelOpen ? 70 : 100} minSize={30} className="min-w-0">
            <MainContent
              view={view}
              selectedSession={selectedSession}
              onSessionSelect={handleSessionSelect}
              onStartSessionFromTemplate={handleStartSessionFromTemplate}
              onArchiveSession={handleSessionArchived}
              showCodeDiffs={showCodeDiffs}
              onToggleCodeDiffs={setShowCodeDiffs}
              onActivitiesChange={setCurrentActivities}
              currentActivities={currentActivities}
              codeDiffSidebarCollapsed={codeDiffSidebarCollapsed}
              onToggleCodeDiffSidebar={() => setCodeDiffSidebarCollapsed(!codeDiffSidebarCollapsed)}
              codeSidebarWidth={codeSidebarWidth}
              isResizing={isResizing}
              onStartResizing={startResizing}
              onOpenNewSession={handleOpenNewSession}
              onReviewArtifact={handleReviewArtifact}
              onStartDebate={handleStartDebate}
            />
          </ResizablePanel>

          {/* Bottom Panel: System/Logs */}
          {isLogPanelOpen && (
            <>
              <ResizableHandle 
                withHandle 
                className="min-h-[8px] w-full cursor-row-resize bg-zinc-900 border-y border-white/10 hover:bg-purple-500/20 transition-colors" 
              />
              <ResizablePanel defaultSize={30} minSize={10} maxSize={50}>
                <SessionKeeper onClose={() => setIsLogPanelOpen(false)} isSidebar={false} />
              </ResizablePanel>
            </>
          )}

        </ResizablePanelGroup>
      </div>

      {terminalAvailable && (
        <TerminalPanel
          sessionId={selectedSession?.id || 'global'}
          repositoryPath=""
          isOpen={terminalOpen}
          onToggle={handleToggleTerminal}
        />
      )}

      {selectedSession && (
        <DebateDialog
          sessionId={selectedSession.id}
          open={debateOpen}
          onOpenChange={setDebateOpen}
          initialTopic={debateTopic}
          initialContext={debateContext}
          onDebateStart={() => setRefreshKey(prev => prev + 1)}
        />
      )}
    </div>
  );
}
