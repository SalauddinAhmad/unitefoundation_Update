// NOTE: Static demo posts removed. All blog data now comes from the live API
// via `usePostsPublic` / `usePostPublic`. This file only exports shared types.

export type ContentBlock =
  | { type: "paragraph"; text: string; lead?: boolean }
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "image"; src: string; caption?: string; alt?: string; float?: "left" | "right" | "full" }
  | { type: "gallery"; images: { src: string; alt?: string }[] }
  | { type: "quote"; text: string; author?: string }
  | { type: "callout"; title?: string; text: string; variant?: "info" | "success" | "warn" }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "cta"; title: string; text?: string; buttonLabel: string; href: string }
  | { type: "divider" };

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  cover: string;
  banner?: string;
  date: string;
  readMin: number;
  body: (string | ContentBlock)[];
}

