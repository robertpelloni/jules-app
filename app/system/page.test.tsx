/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import SystemDashboard from './page';

// Mock the JSON data
jest.mock('../submodules.json', () => ({
  generatedAt: '2025-12-27T00:00:00Z',
  submodules: [
    {
      path: 'external/test-module',
      commit: 'abc1234',
      describe: 'v1.0.0',
      lastUpdated: '2025-12-26T00:00:00Z'
    }
  ]
}));

// Mock fetch
global.fetch = jest.fn();

describe('SystemDashboard', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ submodules: [] })
    });
  });

  it('renders build-time submodule info', () => {
    render(<SystemDashboard />);
    expect(screen.getByText('external/test-module')).toBeInTheDocument();
    expect(screen.getByText(/abc1234/)).toBeInTheDocument();
  });

  it('fetches and displays live status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        submodules: [
          {
            path: 'external/test-module',
            status: 'modified',
            commit: 'abc1234',
            describe: 'v1.0.0'
          }
        ]
      })
    });

    render(<SystemDashboard />);

    // Wait for the fetch to update the UI
    await waitFor(() => {
      expect(screen.getByText('Modified')).toBeInTheDocument();
    });
  });
});
