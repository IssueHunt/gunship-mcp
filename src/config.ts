import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { parse } from 'yaml'

export interface Config {
  token: string
  baseUrl: string | null
  sourcePath: string
}

const TOKEN_PAGE = 'https://gunship.issuehunt.io/settings/api-tokens'

export function defaultConfigPath(): string {
  return join(homedir(), '.gunship', 'config.yml')
}

export function readConfig(configPath: string = defaultConfigPath()): Config {
  const profilesDir = join(dirname(configPath), 'profiles')
  const config = readYaml(
    configPath,
    () =>
      new Error(
        `No Gunship config at ${configPath}. Create an API token ( ${TOKEN_PAGE} ) and write it there as \`token: <your token>\`, or point \`defaultProfile\` at a file in ${profilesDir}.`,
      ),
  )

  const defaultProfile = readString(config, 'defaultProfile')

  if (defaultProfile != null) {
    const profilePath = join(profilesDir, `${defaultProfile}.yml`)
    const profile = readYaml(
      profilePath,
      () =>
        new Error(
          `\`defaultProfile: ${defaultProfile}\` in ${configPath} points at ${profilePath}, which does not exist.`,
        ),
    )
    const token = readString(profile, 'token')

    if (token == null) {
      throw new Error(
        `${profilePath} has no \`token\` key. Create an API token ( ${TOKEN_PAGE} ) and add \`token: <your token>\`.`,
      )
    }

    return {
      token,
      baseUrl: normalizeBaseUrl(readString(profile, 'baseUrl')),
      sourcePath: profilePath,
    }
  }

  const token = readString(config, 'token')

  if (token == null) {
    throw new Error(
      `${configPath} has neither a \`token\` key nor a \`defaultProfile\`. Create an API token ( ${TOKEN_PAGE} ) and add \`token: <your token>\`, or point \`defaultProfile\` at a file in ${profilesDir}.`,
    )
  }

  return {
    token,
    baseUrl: normalizeBaseUrl(readString(config, 'baseUrl')),
    sourcePath: configPath,
  }
}

function readYaml(path: string, missing: () => Error): unknown {
  let contents: string

  try {
    contents = readFileSync(path, 'utf-8')
  } catch {
    throw missing()
  }

  try {
    return parse(contents)
  } catch {
    throw new Error(`${path} is not valid YAML.`)
  }
}

function readString(source: unknown, key: string): string | null {
  const value = (source as Record<string, unknown> | null)?.[key]
  return typeof value === 'string' && value !== '' ? value : null
}

function normalizeBaseUrl(value: string | null): string | null {
  return value == null ? null : value.replace(/\/+$/, '')
}
