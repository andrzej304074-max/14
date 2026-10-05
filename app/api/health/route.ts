import { getLists, storageMode } from "@/lib/store";
import { ok, safe } from "@/lib/api";

export const dynamic = "force-dynamic";

async function GET_impl() {
  const lists = await getLists();
  return ok({ storage: storageMode(), lists: lists.length });
}
export const GET = safe(GET_impl);
