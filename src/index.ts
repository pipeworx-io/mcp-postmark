interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Postmark MCP.
 */


const BASE = 'https://api.postmarkapp.com';
const UA = 'pipeworx-mcp-postmark/1.0 (+https://pipeworx.io)';

const passthrough = { type: 'object' as const, properties: {}, additionalProperties: true };

const tools: McpToolExport['tools'] = [
  {
    name: 'send',
    description: 'Send a single email.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string' },
        to: { type: 'string' },
        subject: { type: 'string' },
        htmlbody: { type: 'string' },
        textbody: { type: 'string' },
        tag: { type: 'string' },
        replyto: { type: 'string' },
        cc: { type: 'string' },
        bcc: { type: 'string' },
        headers: { type: 'array' },
        trackopens: { type: 'boolean' },
        trackLinks: { type: 'string' },
        messagestream: { type: 'string' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'send_batch',
    description: 'Send up to 500 emails.',
    inputSchema: { type: 'object', properties: { emails: { type: 'array' } }, required: ['emails'] },
  },
  { name: 'delivery_stats', description: 'Server-level delivery stats.', inputSchema: { type: 'object', properties: {} } },
  { name: 'messages_outbound', description: 'Outbound history.', inputSchema: passthrough },
  { name: 'message_outbound_detail', description: 'Single outbound detail.', inputSchema: { type: 'object', properties: { messageId: { type: 'string' } }, required: ['messageId'] } },
  { name: 'message_outbound_dump', description: 'Raw MIME dump.', inputSchema: { type: 'object', properties: { messageId: { type: 'string' } }, required: ['messageId'] } },
  { name: 'bounces', description: 'Bounces.', inputSchema: passthrough },
  { name: 'bounce', description: 'Single bounce.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'bounce_activate', description: 'Re-activate a bounced address.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] } },
  { name: 'server', description: 'Current server info.', inputSchema: { type: 'object', properties: {} } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('Postmark requires a server token. Set PLATFORM_POSTMARK_KEY or pass ?_apiKey=… (free at https://postmarkapp.com).');
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': UA, 'X-Postmark-Server-Token': apiKey };
  const get = async (path: string, params?: Record<string, unknown>) => {
    const p = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (k !== '_apiKey' && v != null) p.set(k, String(v));
    const res = await fetch(`${BASE}${path}${[...p].length ? `?${p}` : ''}`, { headers });
    if (res.status === 401 || res.status === 403) throw new Error('Postmark: invalid server token.');
    if (!res.ok) throw new Error(`Postmark: ${res.status}`);
    return res.json();
  };
  const post = async (path: string, body: unknown) => {
    const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.status === 401 || res.status === 403) throw new Error('Postmark: invalid server token.');
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Postmark: ${res.status} ${text.slice(0, 200)}`);
    }
    return res.json();
  };
  const put = async (path: string) => {
    const res = await fetch(`${BASE}${path}`, { method: 'PUT', headers });
    if (!res.ok) throw new Error(`Postmark: ${res.status}`);
    return res.json();
  };
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  const upperKey = (o: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    const map: Record<string, string> = {
      from: 'From', to: 'To', subject: 'Subject', htmlbody: 'HtmlBody', textbody: 'TextBody',
      tag: 'Tag', replyto: 'ReplyTo', cc: 'Cc', bcc: 'Bcc', headers: 'Headers',
      trackopens: 'TrackOpens', trackLinks: 'TrackLinks', messagestream: 'MessageStream',
    };
    for (const [k, v] of Object.entries(o)) {
      if (k === '_apiKey' || v == null) continue;
      out[map[k] ?? k] = v;
    }
    return out;
  };
  switch (name) {
    case 'send':
      return post('/email', upperKey(args));
    case 'send_batch':
      return post('/email/batch', args.emails);
    case 'delivery_stats':
      return get('/deliverystats');
    case 'messages_outbound':
      return get('/messages/outbound', args);
    case 'message_outbound_detail':
      return get(`/messages/outbound/${encodeURIComponent(reqStr('messageId', '"<id>"'))}/details`);
    case 'message_outbound_dump':
      return get(`/messages/outbound/${encodeURIComponent(reqStr('messageId', '"<id>"'))}/dump`);
    case 'bounces':
      return get('/bounces', args);
    case 'bounce':
      return get(`/bounces/${encodeURIComponent(reqStr('id', '"<id>"'))}`);
    case 'bounce_activate':
      return put(`/bounces/${encodeURIComponent(reqStr('id', '"<id>"'))}/activate`);
    case 'server':
      return get('/server');
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
