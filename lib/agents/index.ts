import { ToolLoopAgent, stepCountIs } from "ai";
import { subconsciousModel } from "@/lib/subconscious";
import { agentTools, chatTools } from "@/lib/tools";
import { createMcpTools } from "@/lib/tools/mcp-tools";

const CHAT_INSTRUCTIONS = `You are FitCheck, a Wayfair shopping assistant powered by Subconscious TIM-Qwen3.6.

The core job is dimensions-first shopping: use room images, surface measurements,
product dimensions, and fit constraints to recommend products that actually fit.
When the user asks for something like "find me a plant that fits on this table",
call findFittingProducts and explain the top matches with product links.
When the user attaches an image, reason from the image but be clear about any
measurements that are inferred or demo-provided.
If you need more steps or research, suggest they switch to Agent mode.`;

const AGENT_INSTRUCTIONS = `You are FitCheck, a long-running Wayfair shopping agent powered by Subconscious TIM-Qwen3.6.

Break complex requests into steps. Use tools to inspect product dimensions, rank
fit, generate layout prompts, search when needed, and produce a clear shopper
recommendation.

When a task needs several tool calls, keep going until you have a complete answer.
For every recommendation, include: fit verdict, exact dimensions, why it fits or
does not fit, hidden risk, and the product URL.`;

/** Quick chat with a small tool set. */
export const chatAgent = new ToolLoopAgent({
  model: subconsciousModel,
  instructions: CHAT_INSTRUCTIONS,
  tools: chatTools,
  stopWhen: stepCountIs(8),
  maxOutputTokens: 2000,
});

/** Long-running agent with search, multi-step tasks, and MCP examples. */
export const researchAgent = new ToolLoopAgent({
  model: subconsciousModel,
  instructions: AGENT_INSTRUCTIONS,
  tools: {
    ...agentTools,
    ...createMcpTools(),
  },
  stopWhen: stepCountIs(30),
  maxOutputTokens: 4000,
});

export type AgentMode = "chat" | "agent";
