import type { Source, Session, Activity, CreateSessionRequest, CreateActivityRequest } from '@/types/jules';

export class JulesAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'JulesAPIError';
  }
}

export class JulesClient {
  private baseURL = 'https://jules.googleapis.com/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new JulesAPIError(
          error.message || `Request failed with status ${response.status}`,
          response.status,
          error
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof JulesAPIError) {
        throw error;
      }
      // Network or other fetch errors
      throw new JulesAPIError(
        error instanceof Error ? error.message : 'Network request failed',
        undefined,
        error
      );
    }
  }

  // Sources
  async listSources(): Promise<Source[]> {
    const response = await this.request<{ sources: Source[] }>('/sources');
    return response.sources || [];
  }

  async getSource(id: string): Promise<Source> {
    return this.request<Source>(`/sources/${id}`);
  }

  // Sessions
  async listSessions(sourceId?: string): Promise<Session[]> {
    const params = sourceId ? `?sourceId=${sourceId}` : '';
    const response = await this.request<{ sessions: Session[] }>(`/sessions${params}`);
    return response.sessions || [];
  }

  async getSession(id: string): Promise<Session> {
    return this.request<Session>(`/sessions/${id}`);
  }

  async createSession(data: CreateSessionRequest): Promise<Session> {
    return this.request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: string): Promise<void> {
    await this.request<void>(`/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async listActivities(sessionId: string): Promise<Activity[]> {
    const response = await this.request<{ activities: Activity[] }>(
      `/sessions/${sessionId}/activities`
    );
    return response.activities || [];
  }

  async createActivity(data: CreateActivityRequest): Promise<Activity> {
    return this.request<Activity>(`/sessions/${data.sessionId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Helper to create a client instance
export function createJulesClient(apiKey: string): JulesClient {
  return new JulesClient(apiKey);
}
