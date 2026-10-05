import { mutate } from "@/lib/store";
import { fail, ok, type Ctx, safe } from "@/lib/api";

export const dynamic = "force-dynamic";

async function POST_impl(req: Request, { params }: Ctx<{ id: string }>) {
  const { id } = await params;
  const { mode } = await req.json().catch(() => ({}));
  if (mode !== "all" && mode !== "none") return fail("Zły tryb");
  const res = await mutate((lists) => {
    let found = null as unknown;
    const out = lists.map((l) =>
      l.id !== id
        ? l
        : (found = { ...l, items: l.items.map((i) => ({ ...i, selected: mode === "all" })) }),
    );
    return { lists: out as typeof lists, result: found };
  });
  return res ? ok(res) : fail("Nie znaleziono", 404);
}

export const POST = safe(POST_impl);
