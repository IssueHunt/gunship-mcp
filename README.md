# @gunship/mcp

An MCP server that pulls a [Gunship](https://gunship.issuehunt.io) finding into your coding agent. Paste the URL of a finding, get its description, severity, CVSS vector, and the endpoints and attack scenarios it is linked to — without copying anything out of the web app by hand.

It exposes one tool:

| Tool          | Input | Returns                                                                |
| ------------- | ----- | ---------------------------------------------------------------------- |
| `get_finding` | `url` | The finding, plus the target specs and scenarios linked to it, as JSON |

## Install

```bash
npm i -g @gunship/mcp
```

That puts a `gunship-mcp` command on your PATH.

## Configure

You need an API token. In Gunship, open **Settings → API tokens**, create one, and copy it.

Then point your MCP client at the command. For Claude Code, that is `.mcp.json` in your project:

```json
{
  "mcpServers": {
    "gunship": {
      "command": "gunship-mcp",
      "env": {
        "GUNSHIP_TOKEN": "your-token-here"
      }
    }
  }
}
```

| Variable        | Required | Meaning                              |
| --------------- | -------- | ------------------------------------ |
| `GUNSHIP_TOKEN` | yes      | API token from Settings → API tokens |

## Use

Copy a finding's link with the **Copy link** button on the findings page, then hand it to your agent:

> Fetch this finding and fix it: https://gunship.issuehunt.io/orgs/…/findings/…

The URL has to identify a single finding — that is what the **Copy link** button gives you.
