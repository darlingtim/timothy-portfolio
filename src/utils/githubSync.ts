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

/**
 * Commits a binary file (data URL or raw base64 string) directly to a GitHub repository using GitHub's REST API.
 */
export async function commitBinaryFileToGitHub(
  owner: string,
  repo: string,
  token: string,
  filePath: string,
  dataUrlOrBase64: string,
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

    // 2. Extract raw base64 string from data URL if needed
    let base64Content = dataUrlOrBase64;
    const base64Marker = ';base64,';
    const markerIndex = dataUrlOrBase64.indexOf(base64Marker);
    if (markerIndex !== -1) {
      base64Content = dataUrlOrBase64.substring(markerIndex + base64Marker.length);
    }

    // 3. Prepare PUT payload
    const putPayload: any = {
      message: commitMessage,
      content: base64Content,
      branch: cleanBranch,
    };
    if (currentSha) {
      putPayload.sha = currentSha;
    }

    // 4. Commit file via GitHub Contents API
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

export interface GitFileCommit {
  path: string;
  content: string; // text string or raw base64 string
  encoding?: 'utf-8' | 'base64';
}

/**
 * Atomically commits multiple files (both text and binary) to a GitHub repository
 * using GitHub's Git Database API (Blobs, Trees, Commits, and Refs).
 * This supports binary files up to 100 MB and commits all files in a single atomic Git commit.
 */
export async function commitFilesAtomicToGitHub(
  owner: string,
  repo: string,
  token: string,
  files: GitFileCommit[],
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

    if (!files || files.length === 0) {
      return {
        success: false,
        error: 'No files provided for commit.',
      };
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${cleanToken}`,
      'Content-Type': 'application/json',
    };

    // 1. Get latest commit SHA on the target branch
    let refRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/ref/heads/${cleanBranch}`,
      { headers }
    );
    if (!refRes.ok) {
      refRes = await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${cleanBranch}`,
        { headers }
      );
    }
    if (!refRes.ok) {
      let msg = `Failed to get branch "${cleanBranch}" ref (${refRes.status})`;
      try {
        const j = await refRes.json();
        msg = j.message || msg;
      } catch {
        // ignore
      }
      return { success: false, error: msg };
    }
    const refData = await refRes.json();
    const latestCommitSha = refData.object?.sha;
    if (!latestCommitSha) {
      return { success: false, error: `Could not determine latest commit on branch "${cleanBranch}".` };
    }

    // 2. Get the base tree SHA of the latest commit
    const commitRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits/${latestCommitSha}`,
      { headers }
    );
    if (!commitRes.ok) {
      return { success: false, error: `Failed to fetch base commit (${commitRes.status}).` };
    }
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree?.sha;

    // 3. Create a Git Blob for each file (supports binary files up to 100 MB)
    const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];
    for (const file of files) {
      const cleanPath = file.path.replace(/^\/+/, '');
      let base64Content = file.content;
      const encoding = file.encoding || 'utf-8';

      if (encoding === 'base64') {
        const base64Marker = ';base64,';
        const markerIndex = base64Content.indexOf(base64Marker);
        if (markerIndex !== -1) {
          base64Content = base64Content.substring(markerIndex + base64Marker.length);
        }
      } else {
        base64Content = utf8ToBase64(file.content);
      }

      const blobRes = await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/blobs`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: base64Content,
            encoding: 'base64',
          }),
        }
      );

      if (!blobRes.ok) {
        let errMsg = `Failed to upload blob for ${cleanPath} (${blobRes.status})`;
        try {
          const errJson = await blobRes.json();
          errMsg = `${cleanPath}: ${errJson.message || errMsg}`;
        } catch {
          // ignore
        }
        return { success: false, error: errMsg };
      }

      const blobData = await blobRes.json();
      treeItems.push({
        path: cleanPath,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // 4. Create new Git tree incorporating all new blobs
    const treePayload: any = {
      tree: treeItems,
    };
    if (baseTreeSha) {
      treePayload.base_tree = baseTreeSha;
    }

    const newTreeRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/trees`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(treePayload),
      }
    );
    if (!newTreeRes.ok) {
      let errMsg = `Failed to create Git tree (${newTreeRes.status})`;
      try {
        const errJson = await newTreeRes.json();
        errMsg = errJson.message || errMsg;
      } catch {
        // ignore
      }
      return { success: false, error: errMsg };
    }
    const newTreeData = await newTreeRes.json();
    const newTreeSha = newTreeData.sha;

    // 5. Create new Git commit
    const newCommitRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: commitMessage,
          tree: newTreeSha,
          parents: [latestCommitSha],
        }),
      }
    );
    if (!newCommitRes.ok) {
      let errMsg = `Failed to create commit (${newCommitRes.status})`;
      try {
        const errJson = await newCommitRes.json();
        errMsg = errJson.message || errMsg;
      } catch {
        // ignore
      }
      return { success: false, error: errMsg };
    }
    const newCommitData = await newCommitRes.json();
    const newCommitSha = newCommitData.sha;

    // 6. Update target branch reference to new commit
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${cleanBranch}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: newCommitSha,
          force: false,
        }),
      }
    );
    if (!updateRefRes.ok) {
      let errMsg = `Failed to update branch ${cleanBranch} (${updateRefRes.status})`;
      try {
        const errJson = await updateRefRes.json();
        errMsg = errJson.message || errMsg;
      } catch {
        // ignore
      }
      return { success: false, error: errMsg };
    }

    return {
      success: true,
      sha: newCommitSha,
      htmlUrl: `https://github.com/${cleanOwner}/${cleanRepo}/commit/${newCommitSha}`,
      message: commitMessage,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unexpected atomic commit error' };
  }
}


