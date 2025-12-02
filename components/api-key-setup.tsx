'use client';

import { useState } from 'react';
import { useJules } from '@/lib/jules/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ApiKeySetup() {
  const { setApiKey } = useJules();
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setApiKey(key.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Jules Task Manager</CardTitle>
          <CardDescription>
            Enter your Jules API key to get started. Get your key from the Jules web app settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter your Jules API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full"
            />
            <Button type="submit" className="w-full" disabled={!key.trim()}>
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
