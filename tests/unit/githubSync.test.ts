import { describe, it, expect, vi, beforeEach } from 'vitest';
import { utf8ToBase64, testGitHubRepoConnection, commitFileToGitHub, commitBinaryFileToGitHub, commitFilesAtomicToGitHub } from '../../src/utils/githubSync';

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

  describe('commitBinaryFileToGitHub', () => {
    it('requires owner, repo and token', async () => {
      const res = await commitBinaryFileToGitHub('timothyododo', 'portfolio', '', 'static/images/test.png', 'data:image/png;base64,abc==', 'commit');
      expect(res.success).toBe(false);
      expect(res.error).toContain('required');
    });

    it('strips data URL prefix and commits raw base64 content', async () => {
      let passedBody: any = null;
      global.fetch = vi.fn()
        // 1st call: GET existing file
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        } as any)
        // 2nd call: PUT binary file
        .mockImplementationOnce(async (_url, options: any) => {
          passedBody = JSON.parse(options.body);
          return {
            ok: true,
            json: async () => ({
              commit: {
                sha: 'binary_sha_789',
                html_url: 'https://github.com/timothyododo/portfolio/commit/binary_sha_789',
                message: 'chore(cms): sync media asset',
              },
            }),
          };
        });

      const res = await commitBinaryFileToGitHub(
        'timothyododo',
        'portfolio',
        'ghp_sampletoken',
        'static/images/profile/avatar.png',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
        'chore(cms): sync media asset',
        'main'
      );

      expect(res.success).toBe(true);
      expect(res.sha).toBe('binary_sha_789');
      // The prefix "data:image/png;base64," must be stripped
      expect(passedBody.content).toBe('iVBORw0KGgoAAAANSUhEUg==');
    });
  });

  describe('commitFilesAtomicToGitHub', () => {
    it('requires owner, repo, token, and files', async () => {
      const res = await commitFilesAtomicToGitHub('timothyododo', 'portfolio', '', [], 'commit');
      expect(res.success).toBe(false);
      expect(res.error).toContain('required');

      const resEmpty = await commitFilesAtomicToGitHub('timothyododo', 'portfolio', 'token', [], 'commit');
      expect(resEmpty.success).toBe(false);
      expect(resEmpty.error).toContain('No files provided');
    });

    it('performs atomic Git Database API cycle (ref -> commit -> blobs -> tree -> commit -> patch ref)', async () => {
      let createdTreePayload: any = null;
      let createdCommitPayload: any = null;
      let updatedRefPayload: any = null;

      global.fetch = vi.fn().mockImplementation(async (url: string, options?: any) => {
        // 1. GET or PATCH ref
        if (url.includes('/git/ref/heads/main') || url.includes('/git/refs/heads/main')) {
          if (options?.method === 'PATCH') {
            updatedRefPayload = JSON.parse(options.body);
            return {
              ok: true,
              json: async () => ({ ref: 'refs/heads/main', object: { sha: updatedRefPayload.sha } }),
            };
          }
          return {
            ok: true,
            json: async () => ({ object: { sha: 'base_commit_sha_111' } }),
          };
        }
        // 2. GET base commit
        if (url.includes('/git/commits/base_commit_sha_111')) {
          return {
            ok: true,
            json: async () => ({ tree: { sha: 'base_tree_sha_222' } }),
          };
        }
        // 3. POST blob
        if (url.includes('/git/blobs')) {
          const body = JSON.parse(options.body);
          return {
            ok: true,
            json: async () => ({ sha: `blob_${body.encoding}_sha_333` }),
          };
        }
        // 4. POST tree
        if (url.includes('/git/trees')) {
          createdTreePayload = JSON.parse(options.body);
          return {
            ok: true,
            json: async () => ({ sha: 'new_tree_sha_444' }),
          };
        }
        // 5. POST commit
        if (url.includes('/git/commits')) {
          createdCommitPayload = JSON.parse(options.body);
          return {
            ok: true,
            json: async () => ({ sha: 'new_commit_sha_555' }),
          };
        }
        return { ok: false, status: 404 };
      });

      const res = await commitFilesAtomicToGitHub(
        'darlingtim',
        'timothy-portfolio',
        'ghp_sampletoken',
        [
          { path: 'content/portfolio_data.json', content: '{"hello":"world"}', encoding: 'utf-8' },
          { path: 'static/images/carousel/passport.jpg', content: 'data:image/jpeg;base64,abc123xyz==', encoding: 'base64' },
        ],
        'chore(cms): update portfolio content and media assets',
        'main'
      );

      expect(res.success).toBe(true);
      expect(res.sha).toBe('new_commit_sha_555');
      expect(res.htmlUrl).toBe('https://github.com/darlingtim/timothy-portfolio/commit/new_commit_sha_555');

      // Verify that tree contains both text and binary files
      expect(createdTreePayload.base_tree).toBe('base_tree_sha_222');
      expect(createdTreePayload.tree).toHaveLength(2);
      expect(createdTreePayload.tree[0].path).toBe('content/portfolio_data.json');
      expect(createdTreePayload.tree[1].path).toBe('static/images/carousel/passport.jpg');

      // Verify new commit references the new tree and parent
      expect(createdCommitPayload.tree).toBe('new_tree_sha_444');
      expect(createdCommitPayload.parents).toEqual(['base_commit_sha_111']);

      // Verify ref was updated to new commit
      expect(updatedRefPayload.sha).toBe('new_commit_sha_555');
    });
  });
});

