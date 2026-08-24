import { createApiClient, HTTPError } from '@gunship/api/client'
import type { ShowFindingResBody } from '@gunship/api'
import type { Config } from './config.js'
import type { FindingRef } from './finding-url.js'

export type { ShowFindingResBody }

export async function fetchFinding(
  ref: FindingRef,
  config: Config,
): Promise<ShowFindingResBody> {
  const client = createApiClient({
    prefixUrl: config.baseUrl ?? ref.baseUrl,
    token: config.token,
  })

  try {
    return await client.projects.findings.show(
      ref.orgId,
      ref.projectId,
      ref.assessmentId,
      ref.findingId,
    )
  } catch (err) {
    if (!(err instanceof HTTPError)) {
      throw err
    }

    const { status } = err.response

    if (status === 401 || status === 403) {
      throw new Error(
        `Rejected (${status}). Check the token in ${config.sourcePath} is current and belongs to an account with access to this project.`,
      )
    }

    if (status === 404) {
      throw new Error(
        'Finding not found. The URL may point at another organization, or the finding may have been removed.',
      )
    }

    throw new Error(
      `Gunship returned ${status} for ${err.request.url}: ${await err.response.text().catch(() => '')}`,
    )
  }
}
