// Vercel Serverless Function: GET /api/version
// Returns deployment metadata to identify which build is running.

export default async function handler(req, res) {
  try {
    const data = {
      ok: true,
      app: 'website-builder',
      now: new Date().toISOString(),
      vercel: {
        env: process.env.VERCEL_ENV || null,            // production | preview | development
        url: process.env.VERCEL_URL || null,            // <deployment>.vercel.app
        region: process.env.VERCEL_REGION || null,
        projectId: process.env.VERCEL_PROJECT_ID || null
      },
      git: {
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
        commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || null,
        branch: process.env.VERCEL_GIT_COMMIT_REF || null,
        repoOwner: process.env.VERCEL_GIT_REPO_OWNER || null,
        repoSlug: process.env.VERCEL_GIT_REPO_SLUG || null
      }
    };

    res.setHeader('Cache-Control', 'public, max-age=5');
    return res.status(200).json(data);
  } catch (e) {
    try {
      // Fallback to plain text to avoid any JSON/headers issues
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`ok\nerror:${e?.message || e}`);
    } catch {
      res.status(200).end('ok');
    }
  }
}
