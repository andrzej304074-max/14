import type { Icon } from "./types";

const IMG = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
export const MAX_LIST_IMAGE = 150_000;
export const MAX_ITEM_IMAGE = 20_000;

/** Waliduje ikonę z żądania: null = usuń, ok:false = błąd. */
export function parseIcon(v: any, maxImage: number): { ok: boolean; icon?: Icon } {
  if (v === null) return { ok: true };
  if (v?.type === "emoji" && typeof v.value === "string" && v.value.length > 0 && v.value.length <= 16)
    return { ok: true, icon: { type: "emoji", value: v.value } };
  if (v?.type === "image" && typeof v.value === "string" && v.value.length <= maxImage && IMG.test(v.value))
    return { ok: true, icon: { type: "image", value: v.value } };
  return { ok: false };
}
