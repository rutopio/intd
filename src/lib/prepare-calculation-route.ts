import { redirect } from "@tanstack/react-router";
import {
  readLocalStorageValue,
  writeLocalStorageValue,
} from "@/hooks/use-local-storage";
import { DEFAULT_ITEMS } from "./constants";
import { decompose, getResultKey } from "./decomposition";
import {
  type ByMode,
  compatibleMode,
  storedByMode,
  storedSettings,
  storedSortMode,
  storedTarget,
} from "./stored-state";

/** Resolve URL/session state before rendering, without changing storage during preloads. */
export function prepareCalculationRoute({
  search,
  preload,
  location,
}: {
  search: { p?: number };
  preload: boolean;
  location: { pathname: string };
}) {
  if (preload || typeof window === "undefined") return;
  const target = readLocalStorageValue("idc:target", null, storedTarget);
  if (search.p === undefined) {
    if (target !== null)
      throw redirect({
        to: location.pathname.startsWith("/en") ? "/en" : "/",
        search: { p: target },
        replace: true,
      });
    return;
  }
  const items = readLocalStorageValue(
    "idc:settings",
    DEFAULT_ITEMS,
    storedSettings.shape.items
  );
  const mode = readLocalStorageValue("idc:sortMode", "bags", storedSortMode);
  const cached = readLocalStorageValue<ByMode>(
    "idc:byMode",
    { bags: null, balance: null },
    storedByMode
  );
  writeLocalStorageValue("idc:amount", String(search.p));
  if (target === search.p && compatibleMode(cached, mode, target, items))
    return;
  const results = decompose(search.p, items, undefined, mode);
  writeLocalStorageValue("idc:target", search.p);
  writeLocalStorageValue("idc:byMode", {
    bags: null,
    balance: null,
    [mode]: { results, seen: results.map(getResultKey), offset: 0 },
  });
}
