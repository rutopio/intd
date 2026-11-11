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

test("calculation results are validated at the storage boundary before reaching the UI", async () => {
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
  const solver = await loadSource(
    new URL("../src/lib/decomposition.ts", import.meta.url),
    { imports: { "@/lib/constants": constants } }
  );
  const items = [{ name: "item", min: 10, max: 10, digits: [0] }];
  const { useDecomposition } = await loadSource(
    new URL("../src/hooks/use-decomposition.ts", import.meta.url),
    {
      imports: {
        react: React,
        "@tanstack/react-router": { useNavigate: () => () => {} },
        "react-i18next": { useTranslation: () => ({ t: (key) => key }) },
        sonner: { toast: {} },
        "@/hooks/use-lang": { useLang: () => "en" },
        "@/hooks/use-local-storage": hooks,
        "@/hooks/use-settings": {
          useSettings: () => ({ items, bagName: "bag" }),
        },
        "@/lib/calculation-session": { clearCalculationSession: () => {} },
        "@/lib/decomposition": solver,
        "@/lib/schema": schema,
        "@/lib/stored-state": stored,
      },
    }
  );
  const results = solver.decompose(21, items);
  const mode = { results, seen: results.map(solver.getResultKey), offset: 0 };
  hooks.writeLocalStorageValue("idc:target", 21);
  hooks.writeLocalStorageValue("idc:byMode", { bags: mode, balance: null });
  let state;
  const root = createRoot(window.document.createElement("div"));
  try {
    await React.act(() =>
      root.render(
        React.createElement(Probe, {
          read: useDecomposition,
          publish: (next) => {
            state = next;
          },
        })
      )
    );
    assert.ok(state.results.length > 0);
    assert.equal(state.results[0].total, 21);
    const { lines: _lines, ...withoutLines } = results[0];
    await React.act(() =>
      hooks.writeLocalStorageValue("idc:byMode", {
        bags: { ...mode, results: [withoutLines] },
        balance: null,
      })
    );
    assert.equal(state.results, null);
    await React.act(() =>
      hooks.writeLocalStorageValue("idc:byMode", { bags: mode, balance: null })
    );
    assert.equal(state.results[0].total, 21);
  } finally {
    await React.act(() => root.unmount());
    await window.happyDOM.abort();
  }
});

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

test("route initialization honors URL state, retains compatible history, and skips preloads", async () => {
  const window = new Window();
  const hooks = await loadSource(
    new URL("../src/hooks/use-local-storage.ts", import.meta.url),
    {
      globals: { window, CustomEvent: window.CustomEvent },
      imports: { react: React, "@/lib/stored-state": stored },
    }
  );
  let calls = 0;
  const solver = {
    decompose(target) {
      calls++;
      return [
        {
          lines: [{ name: "item", price: target - 1, qty: 1 }],
          bags: 1,
          total: target,
          balanceScore: 0,
        },
      ];
    },
    getResultKey(result) {
      return String(result.total);
    },
  };
  const { prepareCalculationRoute: prepare } = await loadSource(
    new URL("../src/lib/prepare-calculation-route.ts", import.meta.url),
    {
      globals: { window },
      imports: {
        "@tanstack/react-router": {
          redirect: (options) => ({ redirect: options }),
        },
        "@/hooks/use-local-storage": hooks,
        "./constants": constants,
        "./decomposition": solver,
        "./stored-state": stored,
      },
    }
  );
  const run = (p, preload = false) =>
    prepare({ search: { p }, preload, location: { pathname: "/en/" } });
  try {
    hooks.writeLocalStorageValue("idc:settings", [
      { name: "item", min: 10, max: 90, digits: [0] },
    ]);
    run(21, true);
    assert.equal(calls, 0);
    assert.equal(window.localStorage.getItem("idc:target"), null);
    run(21);
    assert.equal(calls, 1);
    assert.equal(
      hooks.readLocalStorageValue("idc:amount", "", stored.storedAmount),
      "21"
    );
    const byMode = hooks.readLocalStorageValue(
      "idc:byMode",
      null,
      stored.storedByMode
    );
    byMode.bags.offset = 12;
    byMode.bags.seen.push("history");
    hooks.writeLocalStorageValue("idc:byMode", byMode);
    run(21);
    assert.equal(calls, 1);
    assert.equal(
      hooks.readLocalStorageValue("idc:byMode", null, stored.storedByMode).bags
        .offset,
      12
    );
    run(31);
    assert.equal(calls, 2);
    assert.equal(
      hooks.readLocalStorageValue("idc:target", null, stored.storedTarget),
      31
    );
    assert.throws(
      () => run(undefined),
      (error) =>
        error.redirect.to === "/en" &&
        error.redirect.search.p === 31 &&
        error.redirect.replace
    );
    hooks.removeLocalStorageKey("idc:target");
    run(undefined);
    assert.equal(calls, 2);
    hooks.writeLocalStorageValue("idc:byMode", null);
    run(41);
    assert.equal(calls, 3);
  } finally {
    await window.happyDOM.abort();
  }
});
