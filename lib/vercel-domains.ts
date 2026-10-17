import 'server-only'

/**
 * Add a custom domain to your Vercel project.
 * Requires VERCEL_API_TOKEN and VERCEL_PROJECT_ID env vars.
 *
 * Docs: https://vercel.com/docs/rest-api/endpoints/projects#add-a-domain-to-a-project
 */
export async function addDomainToVercel(domain: string): Promise<{
  success: boolean
  error?: string
}> {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID

  if (!token || !projectId) {
    console.warn('[vercel] missing API token or project ID')
    return { success: false, error: 'Vercel integration not configured' }
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/domains`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      return {
        success: false,
        error: err.error?.message ?? 'Failed to add domain to Vercel',
      }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}