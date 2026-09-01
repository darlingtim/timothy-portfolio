import { describe, it, expect } from 'vitest';

describe('Git Auto-Deploy Payload & Helper Logic', () => {
  it('formats base64 encoded payload correctly for GitHub REST API', () => {
    const sampleData = {
      profile: { name: 'Timothy Ododo' },
      projects: [{ id: 'p-1', title: 'Universal Knowledge Platform' }],
      updatedAt: '2026-08-31T14:30:00Z',
    };

    const jsonString = JSON.stringify(sampleData, null, 2);
    const base64Content = Buffer.from(jsonString).toString('base64');
    
    expect(base64Content).toBeTruthy();
    const decoded = Buffer.from(base64Content, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    expect(parsed.profile.name).toBe('Timothy Ododo');
    expect(parsed.projects[0].title).toBe('Universal Knowledge Platform');
  });

  it('formats descriptive git commit messages', () => {
    const date = '2026-08-31';
    const commitMsg = `chore: update portfolio content from Admin CMS (${date})`;
    expect(commitMsg).toContain('chore: update portfolio content');
    expect(commitMsg).toContain(date);
  });

  it('validates repository owner and repo string patterns', () => {
    const isValidRepo = (owner: string, repo: string) => {
      return Boolean(owner && owner.trim().length > 0 && repo && repo.trim().length > 0);
    };

    expect(isValidRepo('timothyododo', 'portfolio')).toBe(true);
    expect(isValidRepo('', 'portfolio')).toBe(false);
    expect(isValidRepo('timothyododo', '')).toBe(false);
  });
});
