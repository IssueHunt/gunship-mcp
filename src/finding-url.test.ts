import { describe, expect, it } from 'vitest'
import { parseFindingUrl } from './finding-url.js'

const VALID =
  'https://gunship.issuehunt.io/orgs/org-1/projects/proj-2/assessments/assess-3/findings/find-4'

describe('parseFindingUrl', () => {
  it('pulls the ids and origin out of a copied finding URL', () => {
    expect(parseFindingUrl(VALID)).toEqual({
      baseUrl: 'https://gunship.issuehunt.io',
      orgId: 'org-1',
      projectId: 'proj-2',
      assessmentId: 'assess-3',
      findingId: 'find-4',
    })
  })

  it('keeps the origin of a self-hosted instance', () => {
    expect(
      parseFindingUrl(
        VALID.replace('https://gunship.issuehunt.io', 'http://localhost:5173'),
      ).baseUrl,
    ).toBe('http://localhost:5173')
  })

  it('accepts a trailing slash after the finding id', () => {
    expect(parseFindingUrl(`${VALID}/`).findingId).toBe('find-4')
  })

  it('ignores a query string on the finding URL', () => {
    expect(parseFindingUrl(`${VALID}?sort=identifier`).findingId).toBe('find-4')
  })

  it('rejects the findings list URL', () => {
    expect(() => parseFindingUrl(VALID.replace('/find-4', ''))).toThrow(
      /Not a Gunship finding URL/,
    )
  })

  it('rejects the retired tab and sel query form', () => {
    expect(() =>
      parseFindingUrl(
        VALID.replace('/findings/find-4', '/findings?tab=findings&sel=find-4'),
      ),
    ).toThrow(/Not a Gunship finding URL/)
  })

  it('rejects a URL pointing at another page', () => {
    expect(() =>
      parseFindingUrl(VALID.replace('/findings/', '/target-specs/')),
    ).toThrow(/Not a Gunship finding URL/)
  })

  it('rejects the spec URL', () => {
    expect(() =>
      parseFindingUrl(VALID.replace('/findings/', '/specs/')),
    ).toThrow(/Not a Gunship finding URL/)
  })

  it('rejects the operator-side findings URL', () => {
    expect(() =>
      parseFindingUrl(
        'https://gunship.issuehunt.io/operator-groups/g-1/assessments/a-1/findings/f-1',
      ),
    ).toThrow(/Not a Gunship finding URL/)
  })

  it('rejects a string that is not a URL', () => {
    expect(() => parseFindingUrl('find-4')).toThrow(/Not a URL/)
  })
})
