
import { runCodeReview } from './review';
import { getProvider } from './providers';

// Mock dependencies
jest.mock('./providers', () => ({
  getProvider: jest.fn(),
}));

describe('Code Review Orchestration', () => {
  const mockProvider = {
    complete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getProvider as jest.Mock).mockReturnValue(mockProvider);
  });

  describe('runCodeReview', () => {
    const defaultRequest = {
      codeContext: 'const x = 1;',
      provider: 'openai',
      model: 'gpt-4',
      apiKey: 'key',
    };

    it('should run a simple review', async () => {
      mockProvider.complete.mockResolvedValue({ content: 'Review comments' });

      const result = await runCodeReview(defaultRequest);

      expect(result).toBe('Review comments');
      expect(mockProvider.complete).toHaveBeenCalledTimes(1);
    });

    it('should run a comprehensive review', async () => {
      mockProvider.complete.mockResolvedValue({ content: 'Section review' });

      const result = await runCodeReview({ ...defaultRequest, reviewType: 'comprehensive' });

      // 3 personas
      expect(mockProvider.complete).toHaveBeenCalledTimes(3);
      expect(result).toContain('# Comprehensive Code Review');
      expect(result).toContain('Security Expert');
      expect(result).toContain('Performance Engineer');
      expect(result).toContain('Clean Code Advocate');
    });

    it('should throw error if provider not found', async () => {
      (getProvider as jest.Mock).mockReturnValue(undefined);

      await expect(runCodeReview(defaultRequest))
        .rejects.toThrow('Provider openai not found');
    });

    it('should handle failures in comprehensive review personas gracefully', async () => {
      mockProvider.complete
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValueOnce({ content: 'Success 2' })
        .mockResolvedValueOnce({ content: 'Success 3' });

      const result = await runCodeReview({ ...defaultRequest, reviewType: 'comprehensive' });

      expect(result).toContain('(Failed to generate review: Fail 1)');
      expect(result).toContain('Success 2');
    });
  });
});
