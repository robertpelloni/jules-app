import { execSync } from 'child_process';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubmoduleInfo {
  path: string;
  commit: string;
  branch: string;
  status: string;
  lastUpdate?: string;
}

function getSubmodules(): SubmoduleInfo[] {
  try {
    const output = execSync('git submodule status', { encoding: 'utf-8' });
    return output.split('\n').filter(Boolean).map(line => {
      const parts = line.trim().split(' ');
      const path = parts[1];
      let lastUpdate = 'Unknown';
      try {
          // Try to get the last commit date for the submodule
          const dateStr = execSync(`git log -1 --format=%cd --date=short ${path}`, { encoding: 'utf-8' }).trim();
          lastUpdate = dateStr;
      } catch (e) { /* ignore */ }

      return {
        status: line[0], // ' ' = clean, '+' = modified, '-' = uninitialized
        commit: parts[0].replace(/^[+\-]/, ''),
        path: path,
        branch: parts[2] || 'HEAD',
        lastUpdate
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default function SystemPage() {
  const submodules = getSubmodules();
  const projectStructure = [
    { path: 'app/', desc: 'Next.js App Router pages and API routes (e.g., /api/supervisor, /api/jules)' },
    { path: 'components/', desc: 'React components (UI, features like SessionBoard, ActivityFeed)' },
    { path: 'lib/', desc: 'Utilities, API client (lib/jules), Orchestration (lib/orchestration)' },
    { path: 'external/', desc: 'Submodules and external dependencies' },
    { path: 'jules-sdk-reference/', desc: 'Python SDK Reference (Submodule)' },
    { path: 'deploy/', desc: 'Docker Compose and deployment configuration' },
    { path: 'docs/', desc: 'Project documentation' },
  ];

  return (
    <div className="container mx-auto p-8 text-white h-full overflow-auto">
      <h1 className="text-2xl font-bold mb-6 uppercase tracking-widest">System Status</h1>

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
                         <span>{sub.commit.substring(0, 8)}</span>
                         <span>•</span>
                         <span>{sub.lastUpdate}</span>
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
      </div>
    </div>
  );
}
