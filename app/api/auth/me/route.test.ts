
import { GET } from './route';

// Mock getSession
jest.mock('@/lib/session', () => ({
  getSession: jest.fn(),
}));

import { getSession } from '@/lib/session';

describe('Me API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return authenticated true if session exists', async () => {
    (getSession as jest.Mock).mockResolvedValue({ apiKey: 'valid-key' });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ authenticated: true });
  });

  it('should return authenticated false and 401 if session is missing', async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data).toEqual({ authenticated: false });
  });
});
