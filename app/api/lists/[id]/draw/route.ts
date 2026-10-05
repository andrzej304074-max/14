import { mutate } from "@/lib/store";
import { draw } from "@/lib/lists";
import type { Item, List } from "@/lib/types";
import { fail, ok, type Ctx } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: Ctx<{ id: string }>) {
  const { id } = await params;
  const res = await mutate((lists) => {
    const cur = lists.find((l) => l.id === id);
    if (!cur) return { lists, result: null as null | { list: List; picked: Item[] } };
    const r = draw(cur);
    return { lists: lists.map((l) => (l.id === id ? r.list : l)), result: r };
  });
  if (!res) return fail("Nie znaleziono", 404);
  if (!res.picked.length) return fail("Brak zaznaczonych pozycji do losowania");
  return ok(res);
}
