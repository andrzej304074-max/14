import { mutate } from "@/lib/store";
import { merge } from "@/lib/lists";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { ids, name } = await req.json().catch(() => ({}));
  if (!Array.isArray(ids) || ids.length < 2) return fail("Wybierz co najmniej 2 listy");
  const res = await mutate((lists) => {
    const src = ids.map((id: string) => lists.find((l) => l.id === id)).filter(Boolean) as typeof lists;
    if (src.length < 2) return { lists, result: null };
    const m = merge(src, String(name ?? ""));
    return { lists: [...lists, m], result: m };
  });
  return res ? ok(res) : fail("Nie znaleziono list", 404);
}
