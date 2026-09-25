# @pipeworx/postmark

[Postmark](https://postmarkapp.com/developer) MCP — transactional email send + lookups. Free trial 100/mo, free *forever* for non-marketing testing.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1679+ live data sources.

## Auth

- Platform: `PLATFORM_POSTMARK_KEY` (server token). BYO: `?_apiKey=…`.

## Tools

- `send(from, to, subject?, htmlbody?, textbody?, tag?, replyto?, cc?, bcc?, headers?, trackopens?, trackLinks?, messagestream?)` — send a single email
- `send_batch(emails)` — send up to 500 emails
- `delivery_stats()` — server-level delivery stats
- `messages_outbound(count?, offset?, recipient?, fromEmail?, tag?, status?, fromDate?, toDate?, subject?, mailboxHash?, metadata_*?)` — outbound history
- `message_outbound_detail(messageId)` — single outbound detail
- `message_outbound_dump(messageId)` — raw MIME dump
- `bounces(count?, offset?, type?, inactive?, emailFilter?, tag?, messageID?, fromDate?, toDate?)` — bounces
- `bounce(id)` — single bounce
- `bounce_activate(id)` — re-activate a bounced address
- `server()` — current server info

## Data source

`https://api.postmarkapp.com`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "postmark": {
      "url": "https://gateway.pipeworx.io/postmark/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/postmark/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1679+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/send \
  -H 'Content-Type: application/json' \
  -d '{"from":"sender@example.com","to":"recipient@example.com","subject":"Welcome to our service","htmlbody":"<html><body><p>Hello!</p></body></html>","textbody":"Hello!"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/send`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

```json
{
  "mcpServers": {
    "postmark": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-postmark"]
    }
  }
}
```

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-postmark
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Postmark data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
