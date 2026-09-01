/**
 * Direct GitHub REST API Synchronization Utility
 * Enables seamless Git commits directly from the browser (or server proxy)
 * without requiring any specific backend hosting infrastructure.
 */

export interface GitHubRepoInfo {
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
  pushedAt: string;
}

export interface CommitResult {
  success: boolean;
  sha?: string;
  htmlUrl?: string;
  message?: string;
  error?: string;
}

/**
 * Safely converts UTF-8 strings to Base64 across all browsers and environments.
 */
export function utf8ToBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Tests connection to a GitHub repository using the provided credentials.
 */
export async function testGitHubRepoConnection(
  owner: string,
  repo: string,
  token?: string
): Promise<{ success: boolean; repository?: GitHubRepoInfo; error?: string }> {
  try {
    const cleanOwner = owner.trim();
    const cleanRepo = repo.trim();
    const cleanToken = token?.trim();

    if (!cleanOwner || !cleanRepo) {
      return { success: false, error: 'Repository owner and name are required.' };
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (cleanToken) {
      headers['Authorization'] = `token ${cleanToken}`;
    }

    const response = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, {
      headers,
    });

    if (!response.ok) {
      let errMsg = `GitHub API Error (${response.status})`;
      try {
        const errJson = await response.json();
        errMsg = errJson.message || errMsg;
      } catch {
        // ignore
      }
      if (response.status === 404) {
        errMsg = 'Repository not found. If this is a private repository, ensure your Personal Access Token (PAT) has the "repo" scope.';
      } else if (response.status === 401) {
        errMsg = 'Authentication failed. Please verify that your GitHub Personal Access Token is valid.';
      }
      return { success: false, error: errMsg };
    }

    const data = await response.json();
    return {
      success: true,
      repository: {
        fullName: data.full_name,
        defaultBranch: data.default_branch,
        isPrivate: data.private,
        htmlUrl: data.html_url,
        pushedAt: data.pushed_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error reaching GitHub API.' };
  }
}

/**
 * Commits a file directly to a GitHub repository using GitHub's REST API.
 */
export async function commitFileToGitHub(
  owner: string,
  repo: string,
  token: string,
  filePath: string,
  contentStr: string,
  commitMessage: string,
  branch: string = 'main'
): Promise<CommitResult> {
  try {
    const cleanOwner = owner.trim();
    const cleanRepo = repo.trim();
    const cleanToken = token.trim();
    const cleanBranch = branch.trim() || 'main';

    if (!cleanOwner || !cleanRepo || !cleanToken) {
      return {
        success: false,
        error: 'Owner, repo, and Personal Access Token (PAT) are required to commit.',
      };
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${cleanToken}`,
      'Content-Type': 'application/json',
    };

    // 1. Fetch current file SHA if it exists
    let currentSha: string | undefined;
    try {
      const getFileRes = await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${filePath}?ref=${cleanBranch}`,
        { headers }
      );
      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        currentSha = fileData.sha;
      }
    } catch {
      // File may not exist yet in the repo
    }

    // 2. Prepare PUT payload
    const base64Content = utf8ToBase64(contentStr);
    const putPayload: any = {
      message: commitMessage,
      content: base64Content,
      branch: cleanBranch,
    };
    if (currentSha) {
      putPayload.sha = currentSha;
    }

    // 3. Commit file via GitHub Contents API
    const putRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(putPayload),
      }
    );

    if (!putRes.ok) {
      let errMsg = `Commit failed (${putRes.status})`;
      try {
        const errJson = await putRes.json();
        errMsg = errJson.message || errMsg;
      } catch {
        const errText = await putRes.text();
        errMsg = errText || errMsg;
      }
      return { success: false, error: errMsg };
    }

    const resData = await putRes.json();
    return {
      success: true,
      sha: resData.commit?.sha,
      htmlUrl: resData.commit?.html_url,
      message: resData.commit?.message,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unexpected commit error' };
  }
}
