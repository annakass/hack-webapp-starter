import {
  RoomScene,
  ShoppingProduct,
  roomScenes,
  shoppingProducts,
} from "@/lib/fitcheck-data";

export type FitVerdict = "Best fit" | "Fits" | "Tight fit" | "Does not fit";

export interface ProductFitResult {
  product: ShoppingProduct;
  verdict: FitVerdict;
  score: number;
  tableClearance: number;
  heightBuffer: number;
  reasons: string[];
}

export interface VisualGenerationPlan {
  provider: "Subconscious TIM-Qwen3.6 + local 3D renderer";
  prompt: string;
  status: string;
}

export interface FitcheckResult {
  scene: RoomScene;
  query: string;
  tableSafeZone: {
    width: number;
    depth: number;
    maxHeight: number;
  };
  rankedProducts: ProductFitResult[];
  visualPlan: VisualGenerationPlan;
}

const MIN_TABLE_CLEARANCE = 6;
const MAX_TABLETOP_HEIGHT = 24;

const getVerdict = (
  tableClearance: number,
  heightBuffer: number,
  score: number,
): FitVerdict => {
  if (tableClearance < 0 || heightBuffer < 0) {
    return "Does not fit";
  }

  if (score >= 90) {
    return "Best fit";
  }

  if (score >= 74) {
    return "Fits";
  }

  return "Tight fit";
};

export const rankProductsForScene = (
  scene: RoomScene,
  query: string,
): FitcheckResult => {
  const tableSafeZone = {
    width: scene.surfaceDimensions.width - MIN_TABLE_CLEARANCE * 2,
    depth: scene.surfaceDimensions.depth - MIN_TABLE_CLEARANCE * 2,
    maxHeight: MAX_TABLETOP_HEIGHT,
  };

  const rankedProducts = shoppingProducts
    .map((product): ProductFitResult => {
      const widthClearance = tableSafeZone.width - product.dimensions.width;
      const depthClearance = tableSafeZone.depth - product.dimensions.depth;
      const tableClearance = Math.min(widthClearance, depthClearance);
      const heightBuffer = tableSafeZone.maxHeight - product.dimensions.height;
      const score = Math.max(
        0,
        Math.min(100, 86 + tableClearance * 1.4 + heightBuffer * 1.2),
      );

      const reasons = [
        `${product.dimensions.width}" x ${product.dimensions.depth}" footprint on a ${scene.surfaceDimensions.width}" ${scene.surfaceName}.`,
        `${Math.max(0, tableClearance).toFixed(0)}" tabletop clearance after the safety margin.`,
        heightBuffer >= 0
          ? `${heightBuffer}" below the TV sightline limit.`
          : `${Math.abs(heightBuffer)}" taller than the TV sightline limit.`,
        ...product.evidence,
      ];

      return {
        product,
        verdict: getVerdict(tableClearance, heightBuffer, score),
        score: Math.round(score),
        tableClearance,
        heightBuffer,
        reasons,
      };
    })
    .sort((left, right) => right.score - left.score);

  return {
    scene,
    query,
    tableSafeZone,
    rankedProducts,
    visualPlan: {
      provider: "Subconscious TIM-Qwen3.6 + local 3D renderer",
      prompt: [
        "Analyze the user-provided room image and generate a 3D room-fit visualization.",
        `User request: ${query}`,
        `Detected surface: ${scene.surfaceName}, ${scene.surfaceDimensions.width}" wide by ${scene.surfaceDimensions.depth}" deep.`,
        `Safe tabletop zone: ${tableSafeZone.width}" by ${tableSafeZone.depth}", max object height ${tableSafeZone.maxHeight}".`,
        `Recommended product: ${rankedProducts[0]?.product.name}.`,
        "Show the product footprint, remaining clearance, and sightline risk.",
      ].join(" "),
      status:
        "Subconscious handles visual reasoning from the uploaded image; the demo renders the generated layout locally so it works without an image-generation endpoint.",
    },
  };
};

export const defaultFitcheckResult = rankProductsForScene(
  roomScenes[0],
  roomScenes[0].userPrompt,
);
