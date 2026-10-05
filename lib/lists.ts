import { randomUUID, randomInt } from "node:crypto";
import { HISTORY_SIZE, type Item, type List } from "./types";

export const uid = () => randomUUID().slice(0, 8);

export function newItem(text: string): Item {
  return { id: uid(), text: text.trim(), selected: true };
}

export function newList(name: string, texts: string[] = []): List {
  return {
    id: uid(),
    name: name.trim() || "Nowa lista",
    items: texts.map(newItem),
    pickCount: 1,
    drawCounter: 0,
    draws: [],
    createdAt: Date.now(),
  };
}

export function shuffle<T>(arr: T[], rnd: (n: number) => number = randomInt): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Losuje pickCount zaznaczonych pozycji, odznacza je i zapisuje w historii. */
export function draw(list: List, rnd?: (n: number) => number): { list: List; picked: Item[] } {
  const pool = list.items.filter((i) => i.selected);
  const picked = shuffle(pool, rnd).slice(0, Math.max(1, list.pickCount));
  if (picked.length === 0) return { list, picked };
  const ids = new Set(picked.map((p) => p.id));
  const n = list.drawCounter + 1;
  return {
    picked,
    list: {
      ...list,
      drawCounter: n,
      items: list.items.map((i) => (ids.has(i.id) ? { ...i, selected: false } : i)),
      draws: [...list.draws, { n, itemIds: [...ids], at: Date.now() }].slice(-HISTORY_SIZE),
    },
  };
}

export function duplicate(list: List): List {
  return {
    ...newList(`${list.name} (kopia)`, []),
    pickCount: list.pickCount,
    ...(list.icon ? { icon: list.icon } : {}),
    items: list.items.map((i) => ({ ...i, id: uid() })),
  };
}

/** Łączy listy w nową (deduplikacja po tekście); oryginały pozostają. */
export function merge(lists: List[], name: string): List {
  const seen = new Set<string>();
  const items: Item[] = [];
  for (const l of lists)
    for (const i of l.items) {
      const k = i.text.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        items.push({ ...newItem(i.text), ...(i.icon ? { icon: i.icon } : {}) });
      }
    }
  return { ...newList(name || lists.map((l) => l.name).join(" + ")), items };
}
