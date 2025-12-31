
import { POST } from './route';

// Mock clearSession
jest.mock('@/lib/session', () => ({
  clearSession: jest.fn(),
}));

import { clearSession } from '@/lib/session';

describe('Logout API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear session and return success', async () => {
    (clearSession as jest.Mock).mockResolvedValue(undefined);

    const res = await POST();
    const data = await res.json();

    expect(clearSession).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(data).toEqual({ success: true });
  });
});
