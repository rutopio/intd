"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import * as React from "react";
import { cn } from "@/lib/utils";

type TabsVariant = "default" | "underline";
type TabsSize = "default" | "lg" | "sm";

const tabSizeClassNames: Record<TabsSize, string> = {
  default: "h-8.5 px-[calc(--spacing(2.5)-1px)] sm:h-7.5",
  lg: "h-9.5 px-[calc(--spacing(3)-1px)] sm:h-8.5",
  sm: "h-7.5 px-[calc(--spacing(2)-1px)] sm:h-6.5",
};

const tabItemLayoutClassName =
  "gap-1.5 [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0";

const tabIndicatorSurfaceClassName =
  "rounded-md bg-background shadow-sm/5 dark:bg-input";

const TabsListContext: React.Context<TabsSize> =
  React.createContext<TabsSize>("default");

export function Tabs({
  className,
  ...props
}: TabsPrimitive.Root.Props): React.ReactElement {
  return (
    <TabsPrimitive.Root
      className={cn(
        "flex flex-col gap-2 data-[orientation=vertical]:flex-row",
        className
      )}
      data-slot="tabs"
      {...props}
    />
  );
}

export function TabsList({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: TabsPrimitive.List.Props & {
  size?: TabsSize;
  variant?: TabsVariant;
}): React.ReactElement {
  return (
    <TabsPrimitive.List
      className={cn(
        "text-muted-foreground relative z-0 flex w-fit items-center justify-center gap-x-0.5",
        "data-[orientation=vertical]:flex-col",
        variant === "default"
          ? "bg-muted text-muted-foreground/72 rounded-lg p-0.5"
          : "*:data-[slot=tabs-tab]:hover:bg-accent data-[orientation=horizontal]:py-1 data-[orientation=vertical]:px-1",
        className
      )}
      data-size={size}
      data-slot="tabs-list"
      {...props}
    >
      <TabsListContext.Provider value={size}>
        {children}
      </TabsListContext.Provider>
      <TabsPrimitive.Indicator
        className={cn(
          "absolute bottom-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom) transition-[width,translate] duration-200 ease-in-out motion-reduce:transition-none",
          variant === "underline"
            ? "bg-primary z-10 data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:translate-y-px data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:-translate-x-px"
            : cn("-z-1", tabIndicatorSurfaceClassName)
        )}
        data-slot="tab-indicator"
      />
    </TabsPrimitive.List>
  );
}

export function TabsTab({
  className,
  size,
  ...props
}: TabsPrimitive.Tab.Props & {
  size?: TabsSize;
}): React.ReactElement {
  const contextSize: TabsSize = React.useContext(TabsListContext);
  const resolvedSize: TabsSize = size ?? contextSize;

  return (
    <TabsPrimitive.Tab
      className={cn(
        "hover:text-muted-foreground focus-visible:ring-ring data-active:text-foreground relative flex shrink-0 grow items-center justify-center rounded-md border border-transparent text-base font-semibold whitespace-nowrap transition-[color,background-color,box-shadow] outline-none focus-visible:ring-2 data-disabled:pointer-events-none data-disabled:opacity-64 data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start sm:text-sm",
        tabItemLayoutClassName,
        tabSizeClassNames[resolvedSize],
        className
      )}
      data-size={resolvedSize}
      data-slot="tabs-tab"
      {...props}
    />
  );
}

export function TabsPanel({
  className,
  ...props
}: TabsPrimitive.Panel.Props): React.ReactElement {
  return (
    <TabsPrimitive.Panel
      className={cn("flex-1 outline-none", className)}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export {
  TabsPanel as TabsContent,
  TabsPrimitive,
  type TabsSize,
  TabsTab as TabsTrigger,
  type TabsVariant,
};
