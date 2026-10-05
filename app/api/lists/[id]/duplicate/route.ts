import { mutate } from "@/lib/store";
import { duplicate } from "@/lib/lists";
import { fail, ok, type Ctx, safe } from "@/lib/api";

export const dynamic = "force-dynamic";

async function POST_impl(_: Request, { params }: Ctx<{ id: string }>) {
  const { id } = await params;
  const res = await mutate((lists) => {
    const cur = lists.find((l) => l.id === id);
    if (!cur) return { lists, result: null };
    const copy = duplicate(cur);
    return { lists: [...lists, copy], result: copy };
  });
  return res ? ok(res) : fail("Nie znaleziono", 404);
}

export const POST = safe(POST_impl);
