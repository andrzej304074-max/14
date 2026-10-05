import { describe, expect, it } from "vitest";
import { mutateWith, type Backend } from "../lib/store";
import { newList } from "../lib/lists";
import type { List } from "../lib/types";

function fake(): Backend & { lists: List[]; version: number; conflicts: number } {
  const s = {
    lists: [] as List[],
    version: 0,
    conflicts: 2,
    async read() {
      return { lists: s.lists, version: s.version };
    },
    async write(lists: List[], v: number) {
      if (s.conflicts > 0) {
        s.conflicts--;
        s.version++; // symulacja równoległego zapisu
        return false;
      }
      if (v !== s.version) return false;
      s.lists = lists;
      s.version++;
      return true;
    },
  };
  return s;
}

describe("mutateWith", () => {
  it("retries on version conflict and applies the change on fresh data", async () => {
    const b = fake();
    const l = newList("x");
    await mutateWith(b, (lists) => ({ lists: [...lists, l], result: null }));
    expect(b.lists).toHaveLength(1);
    expect(b.conflicts).toBe(0);
  });
});
