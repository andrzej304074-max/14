import { mutate } from "@/lib/store";
import { newItem } from "@/lib/lists";
import { fail, ok, type Ctx } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: Ctx<{ id: string }>) {
  const { id } = await params;
  const { text } = await req.json().catch(() => ({}));
  const lines = String(text ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  if (!lines.length) return fail("Pusty tekst");
  const res = await mutate((lists) => {
    let found = null as unknown;
    const out = lists.map((l) =>
      l.id === id ? (found = { ...l, items: [...l.items, ...lines.map(newItem)] }) : l,
    );
    return { lists: out as typeof lists, result: found };
  });
  return res ? ok(res) : fail("Nie znaleziono", 404);
}
