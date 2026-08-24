import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod/v3'
import { fetchFinding, type ShowFindingResBody } from '../api.js'
import { readConfig } from '../config.js'
import { parseFindingUrl } from '../finding-url.js'

const outputSchema = {
  finding: z.object({
    id: z.string(),
    identifier: z.string(),
    title: z.string(),
    severity: z.string(),
    vulnerabilityType: z.string().nullable(),
    description: z.string().nullable(),
    cvss: z.string().nullable(),
  }),
  targetSpecs: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      identifier: z.string(),
      description: z.string().nullable(),
    }),
  ),
  scenarios: z.array(
    z.object({
      id: z.string(),
      identifier: z.string(),
      title: z.string(),
      description: z.string().nullable(),
    }),
  ),
} satisfies {
  [K in keyof ShowFindingResBody]: z.ZodType<ShowFindingResBody[K]>
}

type FindingOutput = z.infer<z.ZodObject<typeof outputSchema>>

export function registerGetFindingTool(server: McpServer): void {
  server.registerTool(
    'get_finding',
    {
      description:
        'Fetch one Gunship finding — its description, severity, CVSS, and the target specs and scenarios it is linked to — from the URL of that finding in the Gunship web app.',
      inputSchema: {
        url: z
          .string()
          .describe(
            'The finding URL copied from the Gunship findings page, e.g. https://gunship.issuehunt.io/orgs/<orgId>/projects/<projectId>/assessments/<assessmentId>/findings/<findingId>',
          ),
      },
      outputSchema,
    },
    async ({ url }) => {
      try {
        const ref = parseFindingUrl(url)
        const structuredContent: FindingOutput = await fetchFinding(
          ref,
          readConfig(),
        )
        return { content: [], structuredContent, isError: false }
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        }
      }
    },
  )
}
