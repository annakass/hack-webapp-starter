import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

const apiKey =
  process.env.SUBCONSCIOUS_API_KEY ||
  "sky_7jHNLPI1.NJ9X8e7vs7tsfvUBop9bJhBbinGHCeHz";

if (!apiKey) {
  throw new Error("SUBCONSCIOUS_API_KEY is required");
}

export const model = new ChatOpenAI({
  model: process.env.SUBCONSCIOUS_MODEL || "subconscious/tim-qwen3.6-27b",
  apiKey,
  configuration: {
    baseURL:
      process.env.SUBCONSCIOUS_BASE_URL || "https://api.subconscious.dev/v1",
  },
  temperature: 0.2,
  maxTokens: 1000,
  modelKwargs: {
    chat_template_kwargs: {
      enable_thinking: false,
    },
  },
});
