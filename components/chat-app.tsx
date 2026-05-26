"use client";

import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo, useRef, useState } from "react";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface FitDimensions {
  width: number;
  depth: number;
  height: number;
}

interface RankedFitProduct {
  id: string;
  name: string;
  verdict: string;
  fitConfidence: number;
  score: number;
  dimensions: FitDimensions;
  productUrl: string;
  reasons: string[];
}

interface FindFittingProductsOutput {
  query: string;
  surfaceDetection: {
    sceneId: string;
    surfaceName: string;
    confidence: number;
    confidenceLabel: string;
    dimensions: FitDimensions;
    constraints: string[];
    evidence: string[];
  };
  rankedProducts: RankedFitProduct[];
  generatedVisualFitReasoning: {
    provider: string;
    prompt: string;
    status: string;
    highlights: string[];
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFindFittingProductsOutput(
  value: unknown,
): value is FindFittingProductsOutput {
  if (!isRecord(value)) return false;
  if (!isRecord(value.surfaceDetection)) return false;
  if (!Array.isArray(value.rankedProducts)) return false;
  return (
    typeof value.query === "string" &&
    typeof value.surfaceDetection.surfaceName === "string"
  );
}

function MessagePart({
  part,
  messageId,
  index,
}: {
  part: UIMessage["parts"][number];
  messageId: string;
  index: number;
}) {
  if (part.type === "text") {
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{part.text}</p>
    );
  }

  if (part.type === "file" && part.mediaType?.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={part.url}
        alt={part.filename ?? "Uploaded image"}
        className="mt-2 max-h-48 rounded-lg border border-zinc-800 object-contain"
      />
    );
  }

  if (part.type.startsWith("tool-")) {
    const label = part.type.replace("tool-", "");
    const state = "state" in part ? part.state : "unknown";

    if (
      label === "findFittingProducts" &&
      state === "output-available" &&
      "output" in part &&
      isFindFittingProductsOutput(part.output)
    ) {
      const fitcheck = part.output;
      const confidencePercent = Math.round(fitcheck.surfaceDetection.confidence * 100);
      const topProducts = fitcheck.rankedProducts.slice(0, 3);

      return (
        <div
          key={`${messageId}-tool-${index}`}
          className="mt-2 space-y-3 rounded-xl border border-[#FF5C28]/30 bg-[rgb(255_92_40/0.12)] px-3 py-3"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#FFB29C]">
              Fitcheck tool result
            </p>
            <p className="mt-1 text-sm text-zinc-100">
              Detected{" "}
              <span className="font-semibold">{fitcheck.surfaceDetection.surfaceName}</span>{" "}
              with {confidencePercent}% confidence.
            </p>
            <p className="mt-1 text-xs text-zinc-300">
              Surface size: {fitcheck.surfaceDetection.dimensions.width} in x{" "}
              {fitcheck.surfaceDetection.dimensions.depth} in x{" "}
              {fitcheck.surfaceDetection.dimensions.height} in
            </p>
          </div>

          <div className="space-y-2">
            {topProducts.map((product, productIndex) => (
              <div
                key={product.id}
                className="rounded-lg border border-zinc-700/70 bg-black/30 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-100">
                    {productIndex + 1}. {product.name}
                  </p>
                  <span className="rounded-full border border-zinc-600 px-2 py-0.5 text-xs text-zinc-200">
                    {product.fitConfidence}% confidence
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {product.verdict} · {product.dimensions.width} in x{" "}
                  {product.dimensions.depth} in x {product.dimensions.height} in
                </p>
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-xs font-medium text-[#FFB29C] hover:text-[#ff7347]"
                >
                  View on Wayfair
                </a>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-300">
            {fitcheck.generatedVisualFitReasoning.highlights[0] ??
              fitcheck.generatedVisualFitReasoning.status}
          </p>
        </div>
      );
    }

    return (
      <div
        key={`${messageId}-tool-${index}`}
        className="mt-2 rounded-lg border border-[#FF5C28]/30 bg-[rgb(255_92_40/0.12)] px-3 py-2 text-xs"
      >
        <div className="font-medium text-[#FF5C28]">Tool: {label}</div>
        <div className="mt-1 text-zinc-400">
          {state === "input-available" && "Calling…"}
          {state === "output-available" && "Done"}
          {state === "output-error" && "Error"}
        </div>
      </div>
    );
  }

  return null;
}

export function ChatApp() {
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { mode: "chat" },
      }),
    [],
  );

  const { messages, sendMessage, status, error, stop } = useChat({ transport });

  const isBusy = status === "streaming" || status === "submitted";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text && !imageFile) return;

    const parts: Array<
      | { type: "text"; text: string }
      | { type: "file"; mediaType: string; url: string; filename?: string }
    > = [];

    if (imageFile) {
      parts.push({
        type: "file",
        mediaType: imageFile.type || "image/png",
        url: await fileToDataUrl(imageFile),
        filename: imageFile.name,
      });
    }

    if (text) {
      parts.push({ type: "text", text });
    }

    sendMessage({ parts });
    setInput("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex min-h-full flex-col bg-black">
      <header className="border-b border-zinc-800 bg-black">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#FF5C28]">
              Hackathon Starter
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              FitCheck Conversational Chatbot
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Wayfair · Subconscious TIM-Qwen3.6 · Dimensions-first fit logic
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-300">
              Chatbot-first flow
            </span>
            <Link
              href="/fitcheck-demo"
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300 transition hover:border-[#FF5C28] hover:text-[#FF5C28]"
            >
              Open standalone Fitcheck demo
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
          <p>
            <span className="font-medium text-[#FF5C28]">Ask in chat</span> and the
            assistant runs fitcheck tools: detects the surface, scores product fit
            confidence, ranks Wayfair options, and generates visual-fit reasoning.
            Attach a room image anytime.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          {messages.length === 0 && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center text-zinc-500">
              <p className="text-lg font-medium text-zinc-200">
                Start with a conversational shopping request
              </p>
              <ul className="mt-4 max-w-md space-y-2 text-sm">
                <li>“Find me a plant that fits on this table.”</li>
                <li>“Use this image and rank options by fit confidence.”</li>
                <li>
                  “Which product leaves the most tabletop clearance and why?”
                </li>
                <li>Attach a room image, then ask for recommendations.</li>
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-[#FF5C28] text-black"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-100"
                }`}
              >
                <div
                  className={`mb-1 text-xs font-medium uppercase tracking-wide ${
                    message.role === "user"
                      ? "text-black/60"
                      : "text-[#FF5C28]"
                  }`}
                >
                  {message.role}
                </div>
                {message.parts.map((part, index) => (
                  <MessagePart
                    key={`${message.id}-${index}`}
                    part={part}
                    messageId={message.id}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ))}

          {isBusy && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#FF5C28]" />
              Running fit logic…
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-400">
            {error.message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {imageFile && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>
                Image:{" "}
                <span className="text-[#FF5C28]">{imageFile.name}</span>
              </span>
              <button
                type="button"
                className="text-[#FF5C28] hover:text-[#ff7347] hover:underline"
                onClick={() => {
                  setImageFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setImageFile(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-medium text-zinc-200 hover:border-[#FF5C28] hover:text-[#FF5C28]"
              title="Attach image for multimodal reasoning"
            >
              Image
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask FitCheck what product fits your uploaded room photo…"
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#FF5C28] focus:ring-2 focus:ring-[#FF5C28]/30"
              disabled={isBusy}
            />
            {isBusy ? (
              <button
                type="button"
                onClick={() => stop()}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-[#FF5C28]"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() && !imageFile}
                className="rounded-xl bg-[#FF5C28] px-4 py-2 text-sm font-medium text-black hover:bg-[#ff7347] disabled:opacity-40"
              >
                Send
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
