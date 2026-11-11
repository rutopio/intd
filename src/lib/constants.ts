import type { DecompositionItemConfig } from "@/lib/decomposition";

export const MAX_AMOUNT = 99999;

// Six custom items plus the built-in bag fit the seven-item limit.
export const MAX_ITEMS = 6;

export const MAX_BAGS = 9;

export const DEFAULT_ITEMS: DecompositionItemConfig[] = [
  { name: "便當", min: 90, max: 150, digits: [0, 5, 9] },
  { name: "飲料", min: 40, max: 90, digits: [0, 5] },
];

// Built-in $1 filler item; only its display name is user-configurable.
export const DEFAULT_BAG_NAME = "塑膠袋";

export const GITHUB_URL = "https://github.com/rutopio/intd";

export const AUTHOR_PROFILE_URL = "https://chingru.com";
