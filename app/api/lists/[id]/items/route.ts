import { mutate } from "@/lib/store";
import { newItem } from "@/lib/lists";
import { fail, ok, type Ctx, safe } from "@/lib/api";

export const dynamic = "force-dynamic";

async function POST_impl(req: Request, { params }: Ctx<{ id: string }>) {
  const { id } = await params;
  const { text } = await req.json().catch(() => ({}));
  const value = String(text ?? "").trim();
  if (!value) return fail("Pusty tekst");
  const res = await mutate((lists) => {
    let found = null as unknown;
    const out = lists.map((l) =>
      l.id === id ? (found = { ...l, items: [...l.items, newItem(value)] }) : l,
    );
    return { lists: out as typeof lists, result: found };
  });
  return res ? ok(res) : fail("Nie znaleziono", 404);
}

export const POST = safe(POST_impl);
