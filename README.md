# FitCheck: Dimension-First Shopping Agent

FitCheck is a Wayfair customer-track hack built on this Subconscious starter.
The demo flow is: upload or use a room image, ask for a product like “find me a
plant that will fit on this table,” then scroll ranked Wayfair product matches
while a generated 3D-style visual shows how the selected product fits.

The app uses `subconscious/tim-qwen3.6-27b` through `lib/subconscious.ts`.
Subconscious handles the vision/reasoning story from a user-provided image; the
demo renders the visual layout locally from dimensions so it remains reliable
without a separate image-generation endpoint.

## Demo Path

```bash
pnpm install
cp .env.example .env.local
# Set SUBCONSCIOUS_API_KEY in .env.local for live chat/tool calls
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The bundled test image is
`public/test-room.svg`.

60-second script:

1. “A shopper uploads a living room photo and asks for a plant that fits on this
   table.”
2. FitCheck detects a 34 inch round coffee table and applies clearance and
   sightline constraints.
3. It ranks plant products by exact dimensions and links Wayfair searches.
4. Selecting each product updates the generated 3D fit visual.
5. The outcome is a confident purchase decision instead of dimension anxiety.

---

# Wayfair × Subconscious Hackathon Starter

Build AI agents on **Subconscious** (TIM-Qwen3.6) with the **Vercel AI SDK**. This repo gives you a working chat UI, long-running agent mode, example tools, and an MCP template — so you can focus on your track, not boilerplate.

**Sponsors:** Wayfair · Subconscious · Baseten · Cloudflare

---

## Pick your track

Choose one challenge. Your agent should use tools (APIs, MCP, functions) and talk to users through the built-in UI.

### Track 1 — Consumer Shopping Experience

Millions of customers shop for furniture on Wayfair every day.

**Challenge:** Build an agent that improves discovery and the buyer experience.

**Ideas to explore:**
- Style or room-based product recommendations
- “Help me furnish this room” from a photo or description
- Compare options, explain tradeoffs, answer sizing questions
- Guided search instead of endless filters

### Track 2 — Supply Chain

Wayfair and its supplier network move huge volumes of furniture worldwide.

**Challenge:** Build an agent that improves Wayfair’s ability to manage its supply chain.

**Ideas to explore:**
- Track shipments, flag delays, summarize status
- Answer “where is order X?” or “what’s at risk this week?”
- Coordinate supplier updates, inventory, or routing decisions
- Turn messy ops data into clear next steps

### Track 3 — FinOps & Customer Service

Wayfair runs ~$12B in revenue and serves ~22M customers a year.

**Challenge:** Build an agent system that improves internal operations — financial operations or customer service.

**Ideas to explore:**
- Triage support tickets and draft responses
- Look up order/billing history and explain charges
- Summarize finance or ops metrics for a team
- Route issues to the right team with context

---

## Quick start

**1. Get a Subconscious API key**

Sign up at [subconscious.dev/platform](https://www.subconscious.dev/platform) and copy your key (`sky_...`).

**2. Create a .env.local file with your Subconscious API key**

```bash
pnpm install
cp .env.example .env.local
# Set SUBCONSCIOUS_API_KEY in .env.local
```

**3. Run the app**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**4. Try the two modes**

- **Chat** — fast Q&A with demo tools (good for prototyping UX)
- **Agent** — multi-step runs with search, long tasks, and MCP stubs (good for track demos)

Use **Image** to attach a photo (e.g. a photo of a room or box).

---

## How to build on this repo

You mostly edit three places:

| What | Where |
|------|--------|
| Tools (APIs, data, actions) | `lib/tools/index.ts` |
| Agent behavior & prompts | `lib/agents/index.ts` |
| MCP integrations | `lib/tools/mcp-tools.ts` |

### Add a tool

Tools are functions your agent can call. Example:

```typescript
// lib/tools/index.ts
export const searchProducts = tool({
  description: "Search furniture by style, room, or keyword",
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    // Call your API, mock data, or Cloudflare Worker
    return { results: [] };
  },
});
```

Add it to `agentTools` in the same file, then customize the prompt in `lib/agents/index.ts` for your track.

### Connect MCP

MCP servers expose tools (files, APIs, databases). Wrap them as AI SDK tools — see `lib/tools/mcp-tools.ts`.

```bash
pnpm add @modelcontextprotocol/sdk
```

### Images (multimodal)

The UI sends images as data URLs. Useful for room photos, screenshots, or docs. Details: `.agents/skills/subconscious-dev/references/multimodal.md`.

### Long-running agents

**Agent** mode runs up to 30 tool steps (`lib/agents/index.ts`). The API allows 5-minute runs (`app/api/chat/route.ts`). Increase either if your demo needs it.

---

## What’s included

- **Subconscious provider** — `lib/subconscious.ts`
- **Chat + research agents** — `lib/agents/index.ts`
- **Example tools** — weather, calculator, web search stub, long task
- **Streaming API** — `app/api/chat/route.ts`
- **Chat UI** — `components/chat-app.tsx`
- **Subconscious API skill** — `.agents/skills/subconscious-dev/` (for Cursor/Codex)

Re-install the skill anytime:

```bash
npx skills add https://github.com/subconscious-systems/skills --skill subconscious-dev
```

---

## Environment

| Variable | Required |
|----------|----------|
| `SUBCONSCIOUS_API_KEY` | Yes — [get one here](https://www.subconscious.dev/platform) |

---

## Deploy

Set `SUBCONSCIOUS_API_KEY` on your host, then:

```bash
pnpm build && pnpm start
```

Works on Vercel, Cloudflare, or any Node host.

---

## Links

- [Subconscious Platform](https://www.subconscious.dev/platform) — API keys
- [Subconscious Docs](https://docs.subconscious.dev)
- [Vercel AI SDK — Agents](https://ai-sdk.dev/docs/agents/overview)
- [Subconscious skills repo](https://github.com/subconscious-systems/skills)
