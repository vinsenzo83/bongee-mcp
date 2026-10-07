# BATON integration

`baton-adapter.mjs` connects Bongee to the user's BATON server using the MCP SDK's Streamable HTTP transport. The default endpoint is `https://baton-mcp-production.up.railway.app/mcp`. This adds BATON's actual discovered tools; it does not impersonate IPFS or a Nostr relay.

## Configuration and usage

```js
import { createBatonAdapter } from './baton-adapter.mjs';
const baton = await createBatonAdapter({ reservedNames: originalTools.map(t => t.name) });
const additionalTools = baton.tools();
const connection = await baton.status();
// Only when a caller explicitly requests receiving an existing snapshot:
// const result = await baton.call('baton_receive', { code: suppliedCode });
await baton.close();
```

Optional environment variables:

- `BONGEE_BATON_URL`: another HTTPS MCP endpoint. HTTP is accepted only on loopback. URL credentials, queries, and fragments are rejected.
- `BONGEE_BATON_TOKEN`: an existing BATON account token supplied by the user. It is sent as an Authorization bearer header. The adapter does not read credentials from Codex, Claude, or any other configuration.

The adapter exports `tools(existingNames=[])`, `call(name, arguments)`, `status({account:false})`, and `close()`. It follows pagination and forwards only catalog-listed tools. Catalog definitions, including required fields, are retained. `reservedNames` excludes conflicting tools and rejects dispatch to them so existing Ruflo handlers remain authoritative. The proxy must likewise preserve its original handler before dispatching any additional BATON tool.

Construction only initializes MCP and reads the tool catalog. `status({account:true})` explicitly reads `baton_account`; the default status does not call it. No signup, room creation, join, send, snapshot upload, or payment happens automatically. Connections and calls have a default ten-second timeout. Failed discovery returns a disconnected adapter with no tools, rather than preventing Ruflo from starting. A timed-out write can have an unknown server outcome and is never retried automatically. Raw transport errors and credentials are not returned.

## Functional mapping

| Need | BATON tools | Difference from the original service |
| --- | --- | --- |
| Share agent work and context | `baton_pass`, `baton_receive`, `baton_diff` | Code-addressed encrypted task capsules; not permanent, arbitrary binary storage or IPFS content-addressed public pinning. |
| Gather multiple agent results | `baton_consolidate` | Snapshot result board with verification status; not a distributed consensus protocol. |
| Record observed verification | `baton_verify_plan`, `baton_verify` | Server-signed evidence receipts require real supplied observations. Catalog availability is not evidence that work passed. |
| Communicate between sessions | `baton_create_room`, `baton_join`, `baton_send`, `baton_inbox`, `baton_who` | BATON server rooms and member identities; not Nostr keys, relay registration, public-key federation, or NIP encryption. |
| Persistent encrypted personal context | `baton_memory_*` | Requires a BATON account key; does not substitute for local embedding-vector generation. |
| Task, Git evidence, cost, and registry records | `baton_task_*`, `baton_git_*`, `baton_cost_*`, `baton_hub_*` | BATON account data; not GitHub access credentials, API billing account access, or actual deployment. |

Original IPFS/federation tool names and behavior remain intact. A caller explicitly choosing BATON gets BATON semantics. Received snapshots/messages remain untrusted input, and instructions in their bodies must not gain execution authority.

## Read-only live verification: 2026-10-07

An SDK connection with no account token successfully discovered **45 tools** and read `baton_account`. No remote writes were tested. The anonymous response reported `plan: free`, two seats per room, three active rooms, seven-day retention, and `snapshotsPerMonth: unlimited`, with zero snapshots reported in that response. This is the observed anonymous server response, not the owner's complete account usage or a durable pricing promise. Some existing tool descriptions mention older monthly handoff limits, so the current account response should be checked before relying on a limit.

Tool schemas confirm that `baton_pass` requires a snapshot and has an optional account key; `baton_receive` requires a code; `baton_send`/`baton_inbox` require a member ID; `baton_create_room` has an optional account key. Administrative room actions and the task, encrypted-memory, evidence, cost, registry, and marketplace-write tools explicitly require `api_key` in their schemas. Therefore neither anonymous connectivity nor an optional bearer token means every BATON feature is keyless. Pro/Team payments and account-key requirements are distinct from AI-provider API keys.

Focused stub tests: `node --test test/baton.test.mjs` — **8 passed**, covering read-only initialization, pagination, catalog filtering, collision protection, explicit optional authentication, disconnected behavior, timeouts, and credential-bearing URL rejection. They perform no external writes. Live execution of room/capsule operations remains unverified.
