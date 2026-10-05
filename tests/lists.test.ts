import { describe, expect, it } from "vitest";
import { draw, duplicate, merge, newList } from "../lib/lists";

describe("lists", () => {
  it("draws unique selected items, unselects them, caps history at 7", () => {
    let l = { ...newList("a", ["1", "2", "3", "4", "5", "6", "7", "8", "9"]), pickCount: 2 };
    const r = draw(l);
    expect(new Set(r.picked.map((p) => p.id)).size).toBe(2);
    expect(r.list.items.filter((i) => !i.selected)).toHaveLength(2);
    l = r.list;
    for (let i = 0; i < 10; i++) {
      l = { ...l, items: l.items.map((x) => ({ ...x, selected: true })) };
      l = draw(l).list;
    }
    expect(l.draws).toHaveLength(7);
    expect(l.draws.at(-1)!.n).toBe(11);
  });
  it("draws only selected and returns nothing when none", () => {
    const l = newList("a", ["x", "y"]);
    l.items[0].selected = false;
    expect(draw(l).picked.map((p) => p.text)).toEqual(["y"]);
    l.items[1].selected = false;
    expect(draw(l).picked).toHaveLength(0);
  });
  it("merge dedups and keeps originals; duplicate gets new ids", () => {
    const a = newList("A", ["x", "y"]);
    const b = newList("B", ["Y", "z"]);
    a.items[0].icon = { type: "emoji", value: "🍕" };
    const m = merge([a, b], "M");
    expect(m.items[0].icon).toEqual({ type: "emoji", value: "🍕" });
    expect(m.items.map((i) => i.text)).toEqual(["x", "y", "z"]);
    expect(a.items).toHaveLength(2);
    a.icon = { type: "emoji", value: "🍕" };
    const d = duplicate(a);
    expect(d.icon).toEqual(a.icon);
    expect(d.items[0].id).not.toBe(a.items[0].id);
    expect(d.name).toBe("A (kopia)");
  });
});
