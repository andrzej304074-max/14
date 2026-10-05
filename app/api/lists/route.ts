import { getLists, mutate } from "@/lib/store";
import { newList } from "@/lib/lists";
import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await getLists());
}

export async function POST(req: Request) {
  const { name } = await req.json().catch(() => ({}));
  const list = newList(String(name ?? ""));
  await mutate((l) => ({ lists: [...l, list], result: null }));
  return ok(list);
}
