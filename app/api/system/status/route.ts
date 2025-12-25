import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const rootDir = process.cwd();
    
    // Get submodule status
    const { stdout: statusOutput } = await execAsync('git submodule status --recursive', { cwd: rootDir });
    
    // Parse output
    // Format: -d23456 path/to/module (describe)
    // - = uninitialized, + = modified/out of sync, space = clean
    const submodules = statusOutput.trim().split('\n').map(line => {
      const match = line.match(/^([ +-])([0-9a-f]+)\s+(\S+)(?:\s+\((.+)\))?/);
      if (!match) return null;
      
      const [_, statusChar, commit, path, describe] = match;
      
      let status = 'synced';
      if (statusChar === '-') status = 'uninitialized';
      if (statusChar === '+') status = 'modified';
      
      return {
        path,
        commit,
        status,
        describe: describe || 'unknown'
      };
    }).filter(Boolean);

    return NextResponse.json({ 
      submodules,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('System Status API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch system status' }, { status: 500 });
  }
}
