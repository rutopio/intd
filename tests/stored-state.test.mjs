import assert from "node:assert/strict";
import { test } from "node:test";
import { Window } from "happy-dom";
import * as React from "react";
import { z } from "zod";
import { loadSource } from "./helpers/load-source.mjs";

const constants = await loadSource(
  new URL("../src/lib/constants.ts", import.meta.url)
);
const schema = await loadSource(
  new URL("../src/lib/schema.ts", import.meta.url),
  { imports: { zod: { z }, "@/lib/constants": constants } }
);
const stored = await loadSource(
  new URL("../src/lib/stored-state.ts", import.meta.url),
  { imports: { zod: { z }, "./constants": constants, "./schema": schema } }
);

function Probe({ read, publish }) {
  publish(read());
  return null;
}

test("stored schemas reject valid JSON with unusable calculation shapes", () => {
  const initial = { bags: null, balance: null };
  for (const value of [
    null,
    [],
    {},
    { bags: null },
    { bags: { results: [{}], seen: [], offset: 0 }, balance: null },
  ]) {
    assert.equal(
      stored.parseStoredValue(
        JSON.stringify(value),
        initial,
        stored.storedByMode
      ),
      initial
    );
  }
  for (const value of [
    null,
    [],
    [{ name: "bad", min: 0, max: 1, digits: [0] }],
  ]) {
    assert.equal(
      stored.parseStoredValue(
        JSON.stringify(value),
        constants.DEFAULT_ITEMS,
        stored.storedSettings.shape.items
      ),
      constants.DEFAULT_ITEMS
    );
  }
  assert.equal(
    stored.parseStoredValue('"unknown"', "bags", stored.storedSortMode),
    "bags"
  );
  assert.equal(
    stored.parseStoredValue('"123"', null, stored.storedTarget),
    null
  );
  assert.equal(stored.parseStoredValue("123", null, stored.storedTarget), 123);
  const valid = {
    bags: {
      results: [
        {
          lines: [{ name: "item", price: 10, qty: 2 }],
          bags: 1,
          total: 21,
          balanceScore: 0,
        },
      ],
      seen: ["one"],
      offset: 0,
    },
    balance: null,
  };
  assert.equal(
    stored.parseStoredValue(JSON.stringify(valid), initial, stored.storedByMode)
      .bags.results[0].total,
    21
  );
});

test("storage hooks tolerate malformed data, clear failed removals, and invalidate results when items change", async () => {
  const window = new Window();
  Object.assign(globalThis, {
    window,
    document: window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { createRoot } = await import("react-dom/client");
  const hooks = await loadSource(
    new URL("../src/hooks/use-local-storage.ts", import.meta.url),
    {
      globals: { window, CustomEvent: window.CustomEvent },
      imports: { react: React, "@/lib/stored-state": stored },
    }
  );
  const { useSettings } = await loadSource(
    new URL("../src/hooks/use-settings.ts", import.meta.url),
    {
      imports: {
        react: React,
        "@/lib/constants": constants,
        "@/lib/stored-state": stored,
        "./use-local-storage": hooks,
      },
    }
  );
  window.localStorage.setItem("idc:settings", "null");
  window.localStorage.setItem("idc:byMode", "null");
  let state;
  const read = () => ({
    settings: useSettings(),
    amount: hooks.useLocalStorage("idc:amount", "", stored.storedAmount),
  });
  const root = createRoot(window.document.createElement("div"));
  try {
    await React.act(() =>
      root.render(
        React.createElement(Probe, {
          read,
          publish: (next) => {
            state = next;
          },
        })
      )
    );
    assert.equal(state.settings.items, constants.DEFAULT_ITEMS);
    await React.act(() =>
      state.settings.setItems([{ name: "new", min: 10, max: 20, digits: [0] }])
    );
    assert.equal(state.settings.items[0].name, "new");
    assert.equal(window.localStorage.getItem("idc:byMode"), null);
    await React.act(() => state.amount[1]("123"));
    assert.equal(state.amount[0], "123");
    window.localStorage.removeItem = () => {
      throw new Error("Removal blocked");
    };
    await React.act(() => hooks.removeLocalStorageKey("idc:amount"));
    assert.equal(state.amount[0], "");
    await React.act(() => state.amount[1]("456"));
    assert.equal(state.amount[0], "456");
  } finally {
    await React.act(() => root.unmount());
    await window.happyDOM.abort();
  }
});

test("interleaved target and settings writes cannot reuse incompatible results or shuffle history", () => {
  const items = [{ name: "item", min: 10, max: 20, digits: [0] }];
  const mode = {
    results: [
      {
        lines: [{ name: "item", price: 10, qty: 2 }],
        bags: 1,
        total: 21,
        balanceScore: 0,
      },
    ],
    seen: ["old"],
    offset: 10,
  };
  const byMode = { bags: mode, balance: null };
  assert.equal(stored.compatibleMode(byMode, "bags", 21, items), mode);
  assert.equal(stored.compatibleMode(byMode, "bags", 31, items), null);
  assert.equal(
    stored.compatibleMode(byMode, "bags", 21, [{ ...items[0], min: 15 }]),
    null
  );
  assert.equal(stored.compatibleMode(byMode, "bags", null, items), null);
});
