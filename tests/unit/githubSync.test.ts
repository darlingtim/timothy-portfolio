import { describe, it, expect, vi, beforeEach } from 'vitest';
import { utf8ToBase64, testGitHubRepoConnection, commitFileToGitHub } from '../../src/utils/githubSync';

describe('GitHub Synchronization Utility (githubSync)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('utf8ToBase64', () => {
    it('encodes ASCII text properly', () => {
      const encoded = utf8ToBase64('Hello, World!');
      expect(encoded).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('handles unicode, accented characters and symbols', () => {
      const text = 'Timothy Ododo — Software Engineer 🚀';
      const encoded = utf8ToBase64(text);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
    });
  });

  describe('testGitHubRepoConnection', () => {
    it('returns error when repository name or owner is missing', async () => {
      const res = await testGitHubRepoConnection('', '');
      expect(res.success).toBe(false);
      expect(res.error).toContain('required');
    });

    it('handles successful repository connection response', async () => {
      const mockRepoData = {
        full_name: 'timothyododo/portfolio',
        default_branch: 'main',
        private: false,
        html_url: 'https://github.com/timothyododo/portfolio',
        pushed_at: '2026-09-01T12:00:00Z',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRepoData,
      } as any);

      const res = await testGitHubRepoConnection('timothyododo', 'portfolio', 'ghp_token123');
      expect(res.success).toBe(true);
      expect(res.repository?.fullName).toBe('timothyododo/portfolio');
      expect(res.repository?.defaultBranch).toBe('main');
    });

    it('handles 404 repository not found response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not Found' }),
      } as any);

      const res = await testGitHubRepoConnection('timothyododo', 'nonexistent-repo');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Repository not found');
    });
  });

  describe('commitFileToGitHub', () => {
    it('requires owner, repo and token', async () => {
      const res = await commitFileToGitHub('timothyododo', 'portfolio', '', 'test.json', '{}', 'commit');
      expect(res.success).toBe(false);
      expect(res.error).toContain('required');
    });

    it('performs file commit cycle and returns commit SHA', async () => {
      global.fetch = vi.fn()
        // 1st call: GET existing file
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sha: 'old_sha_123' }),
        } as any)
        // 2nd call: PUT updated file
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            commit: {
              sha: 'new_commit_sha_456',
              html_url: 'https://github.com/timothyododo/portfolio/commit/new_commit_sha_456',
              message: 'chore(cms): update portfolio content',
            },
          }),
        } as any);

      const res = await commitFileToGitHub(
        'timothyododo',
        'portfolio',
        'ghp_sampletoken',
        'content/portfolio_data.json',
        JSON.stringify({ test: true }),
        'chore(cms): update portfolio content',
        'main'
      );

      expect(res.success).toBe(true);
      expect(res.sha).toBe('new_commit_sha_456');
    });
  });
});
