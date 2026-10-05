import { mutate } from "@/lib/store";
import { fail, ok, type Ctx, safe } from "@/lib/api";
import { MAX_LIST_IMAGE, parseIcon } from "@/lib/icon";

export const dynamic = "force-dynamic";

async function PATCH_impl(req: Request, { params }: Ctx<{ id: string }>) {
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  const ic = "icon" in b ? parseIcon(b.icon, MAX_LIST_IMAGE) : null;
  if (ic && !ic.ok) return fail("Nieprawidłowa ikona");
  const res = await mutate((lists) => {
    let found = null as unknown;
    const out = lists.map((l) => {
      if (l.id !== id) return l;
      const n = { ...l };
      if (typeof b.name === "string" && b.name.trim()) n.name = b.name.trim();
      if (Number.isFinite(b.pickCount)) n.pickCount = Math.max(1, Math.min(999, Math.floor(b.pickCount)));
      if (ic) { if (ic.icon) n.icon = ic.icon; else delete n.icon; }
      found = n;
      return n;
    });
    return { lists: out, result: found };
  });
  return res ? ok(res) : fail("Nie znaleziono", 404);
}

async function DELETE_impl(_: Request, { params }: Ctx<{ id: string }>) {
  const { id } = await params;
  await mutate((lists) => ({ lists: lists.filter((l) => l.id !== id), result: null }));
  return ok({ ok: true });
}

export const PATCH = safe(PATCH_impl);
export const DELETE = safe(DELETE_impl);
