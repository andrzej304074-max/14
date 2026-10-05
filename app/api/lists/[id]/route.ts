import { mutate } from "@/lib/store";
import { fail, ok, type Ctx } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: Ctx<{ id: string }>) {
  const { id } = await params;
  const b = await req.json().catch(() => ({}));
  const res = await mutate((lists) => {
    let found = null as unknown;
    const out = lists.map((l) => {
      if (l.id !== id) return l;
      const n = { ...l };
      if (typeof b.name === "string" && b.name.trim()) n.name = b.name.trim();
      if (Number.isFinite(b.pickCount)) n.pickCount = Math.max(1, Math.min(999, Math.floor(b.pickCount)));
      found = n;
      return n;
    });
    return { lists: out, result: found };
  });
  return res ? ok(res) : fail("Nie znaleziono", 404);
}

export async function DELETE(_: Request, { params }: Ctx<{ id: string }>) {
  const { id } = await params;
  await mutate((lists) => ({ lists: lists.filter((l) => l.id !== id), result: null }));
  return ok({ ok: true });
}
