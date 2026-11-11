// biome-ignore-all lint/correctness/noComponentHookFactories: Test doubles are created once per isolated fixture, never during a component render.
import assert from "node:assert/strict";
import { test } from "node:test";
import { useMountEffect } from "@rutopio/ui/use-mount-effect";
import { Window } from "happy-dom";
import * as React from "react";
import * as jsx from "react/jsx-runtime";
import { loadSource } from "./helpers/load-source.mjs";

const box = ({ children }) => React.createElement("div", null, children);
const nothing = () => null;

test("outline subscriptions follow the keyed page and drawer frames end on close", async () => {
  const window = new Window();
  Object.assign(globalThis, {
    window,
    document: window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { createRoot } = await import("react-dom/client");
  window.document.body.innerHTML =
    '<main><article><h2 id="first">First</h2><h3 id="last">Last</h3></article></main><div id="controls"></div>';
  const frames = new Map();
  let frameId = 0;
  const observers = [];
  const DrawerState = React.createContext(null);
  const Drawer = ({ open, onOpenChange, children }) =>
    React.createElement(
      DrawerState,
      { value: { open, onOpenChange } },
      children
    );
  const DrawerTrigger = () => {
    const { open, onOpenChange } = React.use(DrawerState);
    return React.createElement("button", {
      id: "toggle",
      type: "button",
      onClick: () => onOpenChange(!open),
    });
  };
  const DrawerContent = ({ children }) =>
    React.use(DrawerState).open ? children : null;
  const { PageActions } = await loadSource(
    new URL("../src/components/page-actions.tsx", import.meta.url),
    {
      globals: {
        window,
        document: window.document,
        requestAnimationFrame: (callback) => {
          frames.set(++frameId, callback);
          return frameId;
        },
        cancelAnimationFrame: (id) => frames.delete(id),
        ResizeObserver: class {
          constructor(callback) {
            this.callback = callback;
            this.disconnected = false;
            observers.push(this);
          }
          observe() {}
          disconnect() {
            this.disconnected = true;
          }
        },
      },
      imports: {
        react: React,
        "react/jsx-runtime": jsx,
        "react-i18next": { useTranslation: () => ({ t: (key) => key }) },
        "@phosphor-icons/react": {
          ArrowBendRightUpIcon: nothing,
          ArrowLeftIcon: nothing,
        },
        "@rutopio/ui/action-menu": { ActionMenu: nothing },
        "@rutopio/ui/button": { Button: box },
        "@rutopio/ui/drawer": {
          Drawer,
          DrawerContent,
          DrawerHeader: box,
          DrawerTitle: box,
          DrawerTrigger,
        },
        "@rutopio/ui/outline-list": {
          OutlineList: ({ items, activeId }) =>
            React.createElement(
              "ul",
              null,
              items.map((item) =>
                React.createElement(
                  "li",
                  {
                    key: item.id,
                    "data-active": activeId === item.id ? "" : undefined,
                  },
                  item.label
                )
              )
            ),
        },
        "@rutopio/ui/outline-menu": { ReadingProgressRing: nothing },
        "@rutopio/ui/page-action-rail": {
          PageActionRail: ({ mobileOutline, actions }) =>
            React.createElement("div", null, mobileOutline, actions),
        },
        "@rutopio/ui/section-navigation": { scrollToSection() {} },
        "@rutopio/ui/use-mount-effect": { useMountEffect },
        "@/components/share-button": { ShareButton: nothing },
      },
    }
  );
  const container = window.document.getElementById("controls");
  const root = createRoot(container);
  const toggle = () =>
    React.act(() => container.querySelector("#toggle").click());
  try {
    await React.act(() =>
      root.render(React.createElement(PageActions, { key: "en" }))
    );
    await toggle();
    assert.match(container.textContent, /FirstLast/);
    assert.equal(frames.size, 1);
    await toggle();
    assert.equal(frames.size, 0);
    await toggle();
    const viewport = container.querySelector("nav");
    Object.defineProperty(viewport, "clientHeight", { value: 100 });
    viewport.getBoundingClientRect = () => ({ top: 0 });
    viewport.querySelector("[data-active]").getBoundingClientRect = () => ({
      top: 200,
      height: 20,
    });
    for (const [id, callback] of [...frames]) {
      frames.delete(id);
      callback();
    }
    assert.equal(viewport.scrollTop, 160);
    window.document.getElementById("first").textContent = "第一節";
    await React.act(() =>
      root.render(React.createElement(PageActions, { key: "zh" }))
    );
    assert.equal(observers[0].disconnected, true);
    await toggle();
    assert.match(container.textContent, /第一節/);
    window.dispatchEvent(new window.Event("scroll"));
    assert.ok(frames.size > 0);
  } finally {
    await React.act(() => root.unmount());
    assert.equal(frames.size, 0);
    assert.ok(observers.every((observer) => observer.disconnected));
    await window.happyDOM.abort();
  }
});

test("changing the glow signature remounts only the overlay and respects reduced motion", async () => {
  const window = new Window();
  Object.assign(globalThis, {
    window,
    document: window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { createRoot } = await import("react-dom/client");
  let reduced = false;
  let presenceInitial;
  let animation;
  const { GlowCard } = await loadSource(
    new URL("../src/components/glow-card.tsx", import.meta.url),
    {
      imports: {
        "react/jsx-runtime": jsx,
        "motion/react": {
          AnimatePresence: ({ initial, children }) => {
            presenceInitial = initial;
            return children;
          },
          useReducedMotion: () => reduced,
          motion: {
            div: ({ animate }) => {
              animation = animate;
              return React.createElement("div", { "data-overlay": "" });
            },
          },
        },
      },
    }
  );
  const container = window.document.createElement("div");
  const root = createRoot(container);
  const render = (signature) =>
    React.act(() =>
      root.render(
        React.createElement(
          GlowCard,
          { signature },
          React.createElement("input", { defaultValue: "keep" })
        )
      )
    );
  try {
    await render("first");
    assert.equal(presenceInitial, false);
    const overlay = container.querySelector("[data-overlay]");
    const input = container.querySelector("input");
    input.value = "edited";
    await render("next");
    assert.notEqual(container.querySelector("[data-overlay]"), overlay);
    assert.equal(container.querySelector("input"), input);
    assert.equal(input.value, "edited");
    reduced = true;
    await render("reduced");
    assert.equal(animation.opacity, 0);
  } finally {
    await React.act(() => root.unmount());
    await window.happyDOM.abort();
  }
});
