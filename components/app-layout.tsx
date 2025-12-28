'use client';

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJules } from "@/lib/jules/provider";
import type { Session, Activity, SessionTemplate } from "@/types/jules";
import { TerminalPanel } from "./terminal-panel";
import { useTerminalAvailable } from "@/hooks/use-terminal-available";
import { ApiKeySetupForm } from "./api-key-setup";
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

  // State for New Session Dialog (Controlled)
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

  // Sync session selection with URL query param
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId && client) {
      if (selectedSession?.id !== sessionId) {
        // Load session details
        client.getSession(sessionId)
          .then(session => {
            setSelectedSession(session);
            setView('sessions');
          })
          .catch(err => {
            console.error('Failed to load session from URL', err);
            // Optionally clear param if invalid
          });
      }
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
    setSelectedSession(session);
    setView('sessions');
    setMobileMenuOpen(false);
    // Update URL without refreshing
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sessionId', session.id);
    router.push(`/?${newParams.toString()}`);
  };

  const handleSessionCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setIsNewSessionOpen(false);
  };

  const handleSessionArchived = () => {
    // Refresh the session list to update the archived/active status
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
          <ApiKeySetupForm onSuccess={handleApiKeySuccess} />
        </DialogContent>
      </Dialog>
      
      <SessionKeeperManager />
      
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

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          refreshKey={refreshKey}
          onSelectSession={handleSessionSelect}
          selectedSessionId={selectedSession?.id}
        />

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

      {/* Terminal Panel */}
      {terminalAvailable && (
        <TerminalPanel
          sessionId={selectedSession?.id || 'global'}
          repositoryPath=""
          isOpen={terminalOpen}
          onToggle={handleToggleTerminal}
        />
      )}
    </div>
  );
}
