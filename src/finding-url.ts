export interface FindingRef {
  baseUrl: string
  orgId: string
  projectId: string
  assessmentId: string
  findingId: string
}

const FINDINGS_PATH =
  /^\/orgs\/([^/]+)\/projects\/([^/]+)\/assessments\/([^/]+)\/findings\/([^/]+)\/?$/

const EXPECTED =
  'https://<host>/orgs/<orgId>/projects/<projectId>/assessments/<assessmentId>/findings/<findingId>'

export function parseFindingUrl(url: string): FindingRef {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(`Not a URL: ${url}. Expected ${EXPECTED}`)
  }

  const match = FINDINGS_PATH.exec(parsed.pathname)
  if (match == null) {
    throw new Error(
      `Not a Gunship finding URL: ${parsed.pathname}. Expected ${EXPECTED}. Open the finding in the findings list, then copy the link.`,
    )
  }

  return {
    baseUrl: parsed.origin,
    orgId: match[1],
    projectId: match[2],
    assessmentId: match[3],
    findingId: match[4],
  }
}
