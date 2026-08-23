export interface Config {
  token: string
  baseUrl: string | null
}

export function readConfig(): Config {
  const token = process.env.GUNSHIP_TOKEN
  const baseUrl = process.env.GUNSHIP_BASE_URL
  if (token == null || token === '') {
    throw new Error(
      `GUNSHIP_TOKEN is not set. Create an API token ( ${baseUrl ?? 'https://gunship.issuehunt.io'}/settings/api-tokens ) and pass it to this server in its MCP configuration.`,
    )
  }

  return {
    token,
    baseUrl:
      baseUrl == null || baseUrl === '' ? null : baseUrl.replace(/\/+$/, ''),
  }
}
