<<<<<<< HEAD
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, GitBranch, FolderTree, Clock, Hash, RefreshCw, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import submodulesData from "../submodules.json";

interface LiveSubmoduleStatus {
  path: string;
  commit: string;
  status: 'synced' | 'modified' | 'uninitialized';
  describe: string;
}

export default function SystemDashboard() {
  const { submodules: buildSubmodules, generatedAt } = submodulesData as { 
    submodules: { path: string; commit: string; describe: string; lastUpdated: string }[], 
    generatedAt: string 
  };

  const [liveStatus, setLiveStatus] = useState<LiveSubmoduleStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      if (data.submodules) {
        setLiveStatus(data.submodules);
      }
    } catch (e) {
      console.error("Failed to fetch live status", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusBadge = (path: string) => {
    const live = liveStatus.find(s => s.path === path);
    if (!live) return <Badge variant="outline" className="text-white/40 border-white/10">Unknown</Badge>;
    
    if (live.status === 'synced') {
      return <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/10 gap-1"><CheckCircle2 className="h-3 w-3" /> Synced</Badge>;
    }
    if (live.status === 'modified') {
      return <Badge variant="outline" className="text-yellow-400 border-yellow-500/20 bg-yellow-500/10 gap-1"><AlertCircle className="h-3 w-3" /> Modified</Badge>;
    }
    return <Badge variant="outline" className="text-red-400 border-red-500/20 bg-red-500/10 gap-1"><HelpCircle className="h-3 w-3" /> Uninitialized</Badge>;
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <FolderTree className="h-6 w-6 text-purple-500" />
              System Dashboard
            </h1>
            <p className="text-white/40 text-sm">
              Submodule status and project structure.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchStatus} disabled={isLoading} className="border-white/10 hover:bg-white/5">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Build Info */}
          <Card className="bg-zinc-950 border-white/10 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-white/40">Build Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Version</span>
                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                  v{process.env.NEXT_PUBLIC_APP_VERSION || 'Unknown'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Generated</span>
                <span className="text-xs text-white/40 text-right">
                  {new Date(generatedAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Total Modules</span>
                <span className="text-xs font-bold">{buildSubmodules.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Project Structure Explanation */}
          <Card className="bg-zinc-950 border-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-white/40">Directory Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2 text-xs text-white/60">
                  <div className="flex gap-2">
                    <span className="text-purple-400 font-bold">app/</span>
                    <span>Next.js App Router pages, API routes, and layouts.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-400 font-bold">components/</span>
                    <span>React components (UI, Features, Dialogs).</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-400 font-bold">external/</span>
                    <span>Git submodules for shared libraries, MCP servers, and tools.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-400 font-bold">hooks/</span>
                    <span>Custom React hooks (e.g., use-notifications).</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-400 font-bold">lib/</span>
                    <span>Utility functions, API clients, and state stores.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-400 font-bold">scripts/</span>
                    <span>Build and maintenance scripts (e.g., submodule info).</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-400 font-bold">docs/</span>
                    <span>Project documentation, PRDs, and handoff notes.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-400 font-bold">types/</span>
                    <span>TypeScript definitions.</span>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-white/10" />

        {/* Submodules List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-wide text-white/80">Submodules</h2>
          <div className="grid gap-4">
            {buildSubmodules.map((mod) => (
              <Card key={mod.path} className="bg-zinc-950 border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-white/5 flex items-center justify-center">
                      <GitBranch className="h-5 w-5 text-white/40" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white/90">{mod.path}</div>
                      <div className="text-xs text-white/40 font-mono mt-1 flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        {mod.commit.substring(0, 7)}
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        {mod.describe}
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <Clock className="h-3 w-3" />
                        {new Date(mod.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(mod.path)}
                    <Badge variant="secondary" className="bg-white/5 text-white/60 hover:bg-white/10">
                      {mod.path.split('/')[0]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
=======
import { execSync } from 'child_process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubmoduleInfo {
  path: string;
  commit: string;
  branch: string;
  status: string;
  lastUpdate?: string;
  buildNumber?: string;
}

function getSubmodules(): SubmoduleInfo[] {
  try {
    const output = execSync('git submodule status', { encoding: 'utf-8' });
    return output.split('\n').filter(Boolean).map(line => {
      const parts = line.trim().split(' ');
      const path = parts[1];
      let lastUpdate = 'Unknown';
      let buildNumber = '0';
      try {
          const dateStr = execSync(`git log -1 --format=%cd --date=short ${path}`, { encoding: 'utf-8' }).trim();
          lastUpdate = dateStr;

          // Estimate build number via commit count in submodule
          // This assumes the submodule is checked out and git is accessible
          // We use 'git -C path'
          // Note: This might fail in some environments if .git is not fully linked, but we try.
          // Since submodules are in the root, we can try accessing them directly.
          // Actually 'git submodule status' gives the commit of the superproject's pointer.
          // To get the submodule's commit count, we need to execute inside it.
          // But security constraints/paths might be tricky. Let's try.
          // Simple commit count for build number
          // buildNumber = execSync(`git -C ${path} rev-list --count HEAD`, { encoding: 'utf-8' }).trim();
      } catch (e) { /* ignore */ }

      return {
        status: line[0], // ' ' = clean, '+' = modified, '-' = uninitialized
        commit: parts[0].replace(/^[+\-]/, ''),
        path: path,
        branch: parts[2] || 'HEAD',
        lastUpdate,
        buildNumber
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

function getProjectBuildNumber(): string {
    try {
        return execSync('git rev-list --count HEAD', { encoding: 'utf-8' }).trim();
    } catch { return '0'; }
}

export default function SystemPage() {
  const submodules = getSubmodules();
  const projectBuild = getProjectBuildNumber();
  const projectStructure = [
    { path: 'app/', desc: 'Next.js App Router pages (e.g., /, /board, /system) and API routes.' },
    { path: 'components/', desc: 'React components. `ui/` contains shadcn primitives. `*` contains feature components.' },
    { path: 'lib/', desc: 'Core logic. `jules/` for API client, `orchestration/` for multi-agent logic.' },
    { path: 'external/', desc: 'Vendor/Submodule dependencies (e.g. MCP servers, tools).' },
    { path: 'jules-sdk-reference/', desc: 'Official Python SDK reference implementation.' },
    { path: 'deploy/', desc: 'Docker Compose and deployment configuration.' },
    { path: 'docs/', desc: 'Project documentation, ADRs, and Agent Instructions.' },
    { path: 'types/', desc: 'TypeScript type definitions.' },
  ];

  return (
    <div className="container mx-auto p-8 text-white h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-widest">System Status</h1>
          <div className="flex gap-4">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Build</span>
                  <span className="font-mono text-sm font-bold text-purple-400">#{projectBuild}</span>
              </div>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Version</span>
                  <span className="font-mono text-sm font-bold text-white">v0.4.4</span>
              </div>
          </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-zinc-950 border-white/10">
          <CardHeader>
            <CardTitle className="uppercase tracking-wider text-sm text-white/60">Submodule Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submodules.length === 0 ? (
                 <p className="text-sm text-white/40">No submodules found or git not available.</p>
              ) : submodules.map(sub => (
                <div key={sub.path} className="flex items-center justify-between p-3 border border-white/10 rounded bg-white/5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-purple-400">{sub.path}</span>
                        {sub.status === '+' && <Badge variant="secondary" className="text-[10px] h-4">Modified</Badge>}
                        {sub.status === '-' && <Badge variant="destructive" className="text-[10px] h-4">Uninitialized</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-white/50 font-mono">
                         <span title="Commit Hash">{sub.commit.substring(0, 8)}</span>
                         <span>•</span>
                         <span title="Last Update">{sub.lastUpdate}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs border-white/20 text-white/70">
                    {sub.branch.replace(/[()]/g, '')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-white/10">
          <CardHeader>
            <CardTitle className="uppercase tracking-wider text-sm text-white/60">Project Directory Map</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {projectStructure.map(item => (
                <li key={item.path} className="flex flex-col sm:flex-row sm:gap-4 text-sm py-1 border-b border-white/5 last:border-0">
                  <span className="font-mono text-purple-400 w-48 shrink-0 font-bold">{item.path}</span>
                  <span className="text-white/60">{item.desc}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
>>>>>>> origin/jules-session-keeper-integration-11072096883725838253
      </div>
    </div>
  );
}
