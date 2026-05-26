export interface SurfaceDimensions {
  width: number;
  depth: number;
  height: number;
}

export interface RoomScene {
  id: string;
  name: string;
  imageUrl: string;
  userPrompt: string;
  surfaceName: string;
  surfaceDimensions: SurfaceDimensions;
  roomDimensions: {
    width: number;
    depth: number;
  };
  constraints: string[];
}

export interface ShoppingProduct {
  id: string;
  name: string;
  category: "Plant" | "Planter" | "Lamp" | "Decor";
  price: number;
  productUrl: string;
  imageGradient: string;
  dimensions: SurfaceDimensions;
  careOrUse: string;
  evidence: string[];
}

export const roomScenes: RoomScene[] = [
  {
    id: "round-coffee-table",
    name: "Uploaded living room image",
    imageUrl: "/test-room.svg",
    userPrompt:
      "Find me a plant that will fit on this table without blocking the TV.",
    surfaceName: "round coffee table",
    surfaceDimensions: {
      width: 34,
      depth: 34,
      height: 18,
    },
    roomDimensions: {
      width: 132,
      depth: 156,
    },
    constraints: [
      "Leave at least 6 inches of tabletop clearance.",
      "Keep plant under 24 inches tall so it does not block the TV.",
      "Prefer low-maintenance plants for a living room.",
    ],
  },
];

export const shoppingProducts: ShoppingProduct[] = [
  {
    id: "olive-terracotta",
    name: "Faux Olive Tree in Terracotta Pot",
    category: "Plant",
    price: 58,
    productUrl:
      "https://www.wayfair.com/keyword.php?keyword=faux+olive+tree+terracotta+pot",
    imageGradient: "from-emerald-300 via-green-500 to-stone-800",
    dimensions: {
      width: 12,
      depth: 12,
      height: 22,
    },
    careOrUse: "No watering, medium visual height, warm terracotta base.",
    evidence: [
      "12 inch pot leaves more than 10 inches of clearance on a 34 inch table.",
      "22 inch height stays below the 24 inch TV sightline limit.",
    ],
  },
  {
    id: "snake-ceramic",
    name: "Snake Plant in White Ceramic Planter",
    category: "Plant",
    price: 46,
    productUrl:
      "https://www.wayfair.com/keyword.php?keyword=snake+plant+white+ceramic+planter",
    imageGradient: "from-lime-300 via-emerald-600 to-zinc-900",
    dimensions: {
      width: 10,
      depth: 10,
      height: 18,
    },
    careOrUse: "Compact footprint, vertical leaves, clean modern planter.",
    evidence: [
      "10 inch footprint is the safest fit for a crowded tabletop.",
      "Vertical profile adds greenery without spreading into drink space.",
    ],
  },
  {
    id: "monstera-basket",
    name: "Mini Monstera in Woven Basket",
    category: "Plant",
    price: 72,
    productUrl:
      "https://www.wayfair.com/keyword.php?keyword=mini+monstera+woven+basket",
    imageGradient: "from-green-200 via-emerald-500 to-amber-800",
    dimensions: {
      width: 18,
      depth: 18,
      height: 26,
    },
    careOrUse: "Fuller look, but wider leaves need more tabletop space.",
    evidence: [
      "18 inch spread leaves only 8 inches of clearance on a 34 inch tabletop.",
      "26 inch height exceeds the requested TV sightline limit.",
    ],
  },
  {
    id: "pothos-bowl",
    name: "Trailing Pothos Bowl",
    category: "Plant",
    price: 39,
    productUrl:
      "https://www.wayfair.com/keyword.php?keyword=trailing+pothos+bowl+plant",
    imageGradient: "from-lime-200 via-green-500 to-yellow-700",
    dimensions: {
      width: 14,
      depth: 14,
      height: 13,
    },
    careOrUse: "Low height, softer silhouette, vines can trail over the edge.",
    evidence: [
      "14 inch bowl fits, but trailing vines may take usable table edge space.",
      "13 inch height is well under the sightline limit.",
    ],
  },
];
