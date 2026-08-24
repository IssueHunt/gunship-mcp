import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readConfig } from './config.js'

let dir: string
let configPath: string
let profilesDir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'gunship-config-'))
  configPath = join(dir, 'config.yml')
  profilesDir = join(dir, 'profiles')
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

function write(contents: string): void {
  writeFileSync(configPath, contents)
}

function writeProfile(name: string, contents: string): string {
  mkdirSync(profilesDir, { recursive: true })
  const path = join(profilesDir, `${name}.yml`)
  writeFileSync(path, contents)
  return path
}

describe('readConfig, inline token', () => {
  it('reads the token and leaves baseUrl null when it is omitted', () => {
    write('token: gst_abc\n')
    expect(readConfig(configPath)).toEqual({
      token: 'gst_abc',
      baseUrl: null,
      sourcePath: configPath,
    })
  })

  it('reads baseUrl and strips its trailing slashes', () => {
    write('token: gst_abc\nbaseUrl: https://gunship.example.com//\n')
    expect(readConfig(configPath).baseUrl).toBe('https://gunship.example.com')
  })

  it('rejects a missing config file by naming the path', () => {
    expect(() => readConfig(join(dir, 'absent.yml'))).toThrow(
      /No Gunship config at .*absent\.yml/,
    )
  })

  it('rejects unparseable YAML', () => {
    write('token: [unclosed\n')
    expect(() => readConfig(configPath)).toThrow(/is not valid YAML/)
  })

  it('rejects a config with neither a token nor a defaultProfile', () => {
    write('baseUrl: https://gunship.example.com\n')
    expect(() => readConfig(configPath)).toThrow(
      /has neither a `token` key nor a `defaultProfile`/,
    )
  })

  it('rejects an empty token', () => {
    write("token: ''\n")
    expect(() => readConfig(configPath)).toThrow(/has neither a `token` key/)
  })

  it('rejects an empty config file', () => {
    write('')
    expect(() => readConfig(configPath)).toThrow(/has neither a `token` key/)
  })
})

describe('readConfig, profile layout', () => {
  it('resolves defaultProfile into the profiles directory', () => {
    write('defaultProfile: Davy\n')
    const path = writeProfile(
      'Davy',
      'baseUrl: https://gunship.example.com\ntoken: gst_profile\n',
    )
    expect(readConfig(configPath)).toEqual({
      token: 'gst_profile',
      baseUrl: 'https://gunship.example.com',
      sourcePath: path,
    })
  })

  it('ignores keys the profile carries for the removed CLI', () => {
    write('defaultProfile: Davy\n')
    writeProfile(
      'Davy',
      [
        'baseUrl: https://gunship.example.com',
        'token: gst_profile',
        'operatorGroupId: og-1',
        'operatorGroupName: Team',
        '',
      ].join('\n'),
    )
    expect(readConfig(configPath).token).toBe('gst_profile')
  })

  it('prefers defaultProfile over a token written inline', () => {
    write('defaultProfile: Davy\ntoken: gst_inline\n')
    writeProfile('Davy', 'token: gst_profile\n')
    expect(readConfig(configPath).token).toBe('gst_profile')
  })

  it('leaves baseUrl null when the profile omits it', () => {
    write('defaultProfile: Davy\n')
    writeProfile('Davy', 'token: gst_profile\n')
    expect(readConfig(configPath).baseUrl).toBeNull()
  })

  it('rejects a defaultProfile pointing at a missing file', () => {
    write('defaultProfile: Ghost\n')
    expect(() => readConfig(configPath)).toThrow(
      /`defaultProfile: Ghost`.*points at .*Ghost\.yml, which does not exist/,
    )
  })

  it('rejects a profile with no token key', () => {
    write('defaultProfile: Davy\n')
    writeProfile('Davy', 'baseUrl: https://gunship.example.com\n')
    expect(() => readConfig(configPath)).toThrow(/has no `token` key/)
  })
})
