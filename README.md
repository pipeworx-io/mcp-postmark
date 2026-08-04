# @pipeworx/postmark

[Postmark](https://postmarkapp.com/developer) MCP — transactional email send + lookups. Free trial 100/mo, free *forever* for non-marketing testing.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Postmark data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
