import type { Item } from "@/lib/types";
import { mutate } from "@/lib/store";
import { fail, ok, type Ctx, safe } from "@/lib/api";
import { MAX_ITEM_IMAGE, parseIcon } from "@/lib/icon";

export const dynamic = "force-dynamic";
type P = Ctx<{ id: string; itemId: string }>;

function applyIcon(item: Item, ic: ReturnType<typeof parseIcon> | null): Item {
  if (!ic) return item;
  const { icon: _drop, ...rest } = item;
  return ic.icon ? { ...rest, icon: ic.icon } : rest;
}

async function PATCH_impl(req: Request, { params }: P) {
  const { id, itemId } = await params;
  const b = await req.json().catch(() => ({}));
  const ic = "icon" in b ? parseIcon(b.icon, MAX_ITEM_IMAGE) : null;
  if (ic && !ic.ok) return fail("Nieprawidłowa ikona");
  const res = await mutate((lists) => {
    let found = null as unknown;
    const out = lists.map((l) =>
      l.id !== id
        ? l
        : (found = {
            ...l,
            items: l.items.map((i) =>
              i.id !== itemId
                ? i
                : applyIcon(
                    {
                      ...i,
                      text: typeof b.text === "string" && b.text.trim() ? b.text.trim() : i.text,
                      selected: typeof b.selected === "boolean" ? b.selected : i.selected,
                    },
                    ic,
                  ),
            ),
          }),
    );
    return { lists: out as typeof lists, result: found };
  });
  return res ? ok(res) : fail("Nie znaleziono", 404);
}

async function DELETE_impl(_: Request, { params }: P) {
  const { id, itemId } = await params;
  const res = await mutate((lists) => {
    let found = null as unknown;
    const out = lists.map((l) =>
      l.id !== id
        ? l
        : (found = {
            ...l,
            items: l.items.filter((i) => i.id !== itemId),
            draws: l.draws.map((d) => ({ ...d, itemIds: d.itemIds.filter((x) => x !== itemId) })),
          }),
    );
    return { lists: out as typeof lists, result: found };
  });
  return res ? ok(res) : fail("Nie znaleziono", 404);
}

export const PATCH = safe(PATCH_impl);
export const DELETE = safe(DELETE_impl);
