import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerGetFindingTool } from './tools/get-finding.js'
import packageJson from '../package.json'

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'gunship',
    version: packageJson.version,
  })

  registerGetFindingTool(server)

  return server
}
