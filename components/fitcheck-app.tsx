"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { defaultFitcheckResult, rankProductsForScene } from "@/lib/fitcheck-agent";
import { roomScenes } from "@/lib/fitcheck-data";

const productVisualClasses: Record<string, string> = {
  "olive-terracotta": "from-emerald-300 via-green-500 to-stone-800",
  "snake-ceramic": "from-lime-300 via-emerald-600 to-zinc-900",
  "monstera-basket": "from-green-200 via-emerald-500 to-amber-800",
  "pothos-bowl": "from-lime-200 via-green-500 to-yellow-700",
};

const verdictClasses = {
  "Best fit": "border-emerald-400 bg-emerald-400/15 text-emerald-200",
  Fits: "border-sky-400 bg-sky-400/15 text-sky-200",
  "Tight fit": "border-amber-400 bg-amber-400/15 text-amber-100",
  "Does not fit": "border-red-400 bg-red-400/15 text-red-100",
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function FitcheckApp() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(roomScenes[0].userPrompt);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState(
    defaultFitcheckResult.rankedProducts[0].product.id,
  );

  const result = useMemo(
    () => rankProductsForScene(roomScenes[0], query),
    [query],
  );

  const selectedProduct =
    result.rankedProducts.find(
      (productFit) => productFit.product.id === selectedProductId,
    ) ?? result.rankedProducts[0];

  const previewImageUrl = uploadedImageUrl ?? result.scene.imageUrl;
  const visualScale = Math.max(
    0.18,
    selectedProduct.product.dimensions.width / result.scene.surfaceDimensions.width,
  );
  const productCircleRadius = 36 * visualScale;

  async function handleImageChange(file: File | undefined) {
    if (!file) return;
    setUploadedImageUrl(await fileToDataUrl(file));
  }

  return (
    <main className="min-h-screen bg-[#0f0d0b] text-white">
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FF5C28]">
              Wayfair · Subconscious · Beat The Clock
            </p>
            <div className="mt-3">
              <Link
                href="/"
                className="inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-[#FF5C28] hover:text-[#FF5C28]"
              >
                Back to chatbot
              </Link>
            </div>
            <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">
              FitCheck
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-300">
              Upload a room photo, ask for something specific, and the agent
              recommends Wayfair products that fit the measured surface.
            </p>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-400">
                  User-provided image
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Living room table detected
                </h2>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-[#FF5C28] px-4 py-2 text-sm font-bold text-black hover:bg-[#ff7347]"
              >
                Upload image
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleImageChange(event.target.files?.[0])}
            />

            <div className="mt-5 overflow-hidden rounded-3xl border border-zinc-800 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt="Room with table for FitCheck analysis"
                className="h-80 w-full object-cover"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-[#FF5C28]/30 bg-[#FF5C28]/10 p-4">
              <p className="text-sm font-bold text-[#FFB29C]">
                Subconscious vision pass
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                TIM-Qwen3.6 reads the image plus prompt, identifies the target
                surface, and produces a structured layout request. The local
                renderer turns that into a demo-safe 3D fit visual.
              </p>
            </div>
          </div>

          <label className="block rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5">
            <span className="text-sm font-semibold text-zinc-400">
              Shopper request
            </span>
            <textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={3}
              className="mt-3 w-full resize-none rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#FF5C28] focus:ring-2 focus:ring-[#FF5C28]/20"
            />
          </label>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF5C28]">
                  Generated 3D fit visual
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  {selectedProduct.product.name}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {selectedProduct.product.dimensions.width} in W x{" "}
                  {selectedProduct.product.dimensions.depth} in D x{" "}
                  {selectedProduct.product.dimensions.height} in H
                </p>
              </div>
              <span
                className={`rounded-full border px-4 py-2 text-sm font-black ${
                  verdictClasses[selectedProduct.verdict]
                }`}
              >
                {selectedProduct.verdict} · {selectedProduct.score}%
              </span>
            </div>

            <div className="mt-6 rounded-3xl bg-[#171412] p-4">
              <svg viewBox="0 0 720 430" className="h-[360px] w-full">
                <defs>
                  <linearGradient id="floorGradient" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4A392F" />
                    <stop offset="100%" stopColor="#211B17" />
                  </linearGradient>
                  <radialGradient id="plantGradient" cx="50%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="#C9F7B5" />
                    <stop offset="55%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#14532D" />
                  </radialGradient>
                </defs>
                <rect x="22" y="22" width="676" height="386" rx="26" fill="url(#floorGradient)" />
                <path d="M96 92H624L560 354H160L96 92Z" fill="#D7BB92" opacity="0.18" />
                <ellipse cx="360" cy="238" rx="178" ry="104" fill="#A87956" />
                <ellipse cx="360" cy="222" rx="178" ry="104" fill="#C9A984" />
                <ellipse cx="360" cy="222" rx="136" ry="78" fill="#E0C39D" opacity="0.78" />
                <ellipse
                  cx="360"
                  cy="222"
                  rx={Math.max(28, productCircleRadius)}
                  ry={Math.max(20, productCircleRadius * 0.72)}
                  fill="url(#plantGradient)"
                />
                <rect
                  x={360 - Math.max(18, productCircleRadius * 0.42)}
                  y={222 + Math.max(12, productCircleRadius * 0.34)}
                  width={Math.max(36, productCircleRadius * 0.84)}
                  height={Math.max(30, productCircleRadius * 0.62)}
                  rx="10"
                  fill="#C26435"
                />
                <path d="M360 122V222" stroke="#86EFAC" strokeWidth="8" strokeLinecap="round" />
                <path d="M360 146C310 118 286 136 274 176C322 180 346 168 360 146Z" fill="#22C55E" />
                <path d="M360 156C408 126 440 142 458 180C410 186 382 176 360 156Z" fill="#16A34A" />
                <path d="M360 186C318 178 296 196 284 232C328 232 348 214 360 186Z" fill="#15803D" />
                <path d="M360 192C406 184 434 202 450 236C406 238 380 218 360 192Z" fill="#166534" />
                <path d="M214 222H506" stroke="#FDF2D0" strokeWidth="3" strokeDasharray="10 10" />
                <path d="M360 132V312" stroke="#FDF2D0" strokeWidth="3" strokeDasharray="10 10" />
                <rect x="86" y="72" width="120" height="38" rx="19" fill="#111827" />
                <text x="146" y="97" textAnchor="middle" fill="#F8FAFC" fontSize="18" fontWeight="700">
                  Table 34 in
                </text>
                <rect x="494" y="72" width="154" height="38" rx="19" fill="#111827" />
                <text x="571" y="97" textAnchor="middle" fill="#F8FAFC" fontSize="18" fontWeight="700">
                  Product {selectedProduct.product.dimensions.width} in
                </text>
                <text x="360" y="388" textAnchor="middle" fill="#F8FAFC" fontSize="20" fontWeight="700">
                  {Math.max(0, selectedProduct.tableClearance).toFixed(0)} in clearance · {selectedProduct.heightBuffer} in sightline buffer
                </text>
              </svg>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Surface
                </p>
                <p className="mt-2 font-black">
                  {result.scene.surfaceDimensions.width} in table
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Safe zone
                </p>
                <p className="mt-2 font-black">
                  {result.tableSafeZone.width} in x {result.tableSafeZone.depth} in
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Max height
                </p>
                <p className="mt-2 font-black">{result.tableSafeZone.maxHeight} in</p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FF5C28]">
                  Scroll Wayfair matches
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Products ranked by fit
                </h2>
              </div>
              <p className="text-sm text-zinc-500">Links open Wayfair searches</p>
            </div>

            <div className="mt-5 flex gap-4 overflow-x-auto pb-3">
              {result.rankedProducts.map((productFit) => (
                <button
                  type="button"
                  key={productFit.product.id}
                  onClick={() => setSelectedProductId(productFit.product.id)}
                  className={`min-w-[280px] rounded-3xl border p-4 text-left transition hover:-translate-y-1 ${
                    selectedProductId === productFit.product.id
                      ? "border-[#FF5C28] bg-[#FF5C28]/10"
                      : "border-zinc-800 bg-black"
                  }`}
                >
                  <div
                    className={`h-36 rounded-2xl bg-gradient-to-br ${
                      productVisualClasses[productFit.product.id]
                    }`}
                  />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">{productFit.product.name}</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        {productFit.product.dimensions.width} in x{" "}
                        {productFit.product.dimensions.depth} in footprint
                      </p>
                    </div>
                    <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-bold">
                      ${productFit.product.price}
                    </span>
                  </div>
                  <p
                    className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                      verdictClasses[productFit.verdict]
                    }`}
                  >
                    {productFit.verdict}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {productFit.reasons[1]}
                  </p>
                  <a
                    href={productFit.product.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm font-bold text-[#FF5C28] hover:text-[#ff7347]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    View on Wayfair
                  </a>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
