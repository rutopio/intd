// Shared business constants used across routes and components. Keep values here
// when the same number means the same rule in more than one place.

import type { ItemConfig } from "@/lib/decompose"

// Upper bound for the target amount. Enforced by the input validation, the
// settings price caps, and the ?p= search param schema.
export const MAX_AMOUNT = 99999

// Upper bound on user-configurable item types. The built-in plastic bag counts
// toward a total cap of 7, so custom items max out at 6 (6 + bag = 7).
export const MAX_ITEMS = 6

// Max plastic bags ($1 each) used to cover the remaining change.
export const MAX_BAGS = 9

export const DEFAULT_ITEMS: ItemConfig[] = [
  { name: "便當", min: 90, max: 150, digits: [0, 5, 9] },
  { name: "飲料", min: 40, max: 90, digits: [0, 5] },
]

// Built-in $1 filler item; only its display name is user-configurable.
export const DEFAULT_BAG_NAME = "塑膠袋"

// Project repository (header link).
export const GITHUB_URL = "https://github.com/rutopio/intd"

// Author's GitHub profile (footer credit).
export const AUTHOR_GITHUB_URL = "https://github.com/rutopio"
