import { getLists, mutate } from "@/lib/store";
import { newList } from "@/lib/lists";
import { ok, safe } from "@/lib/api";

export const dynamic = "force-dynamic";

async function GET_impl() {
  return ok(await getLists());
}

async function POST_impl(req: Request) {
  const { name } = await req.json().catch(() => ({}));
  const list = newList(String(name ?? ""));
  await mutate((l) => ({ lists: [...l, list], result: null }));
  return ok(list);
}

export const GET = safe(GET_impl);
export const POST = safe(POST_impl);
