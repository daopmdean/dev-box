import type { ComponentType } from "react";

/**
 * A single utility tool. To add a new tool, create a component and register it
 * in `registry.ts` — the sidebar and routes are generated from the registry.
 */
export interface Tool {
  /** Stable unique key. */
  id: string;
  /** Sidebar label. */
  name: string;
  /** Short subtitle shown in the sidebar and page header. */
  description: string;
  /** Route path, e.g. "/base64". */
  path: string;
  /** The tool UI. */
  component: ComponentType;
}
