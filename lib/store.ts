import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { List } from "./types";

export type Backend = {
  read(): Promise<{ lists: List[]; version: number }>;
  /** Zapisuje tylko jeśli wersja się zgadza; zwraca false przy konflikcie. */
  write(lists: List[], expectedVersion: number): Promise<boolean>;
};

const ID = "lists";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

function supabaseBackend(): Backend {
  const db = createClient(url!, key!, { auth: { persistSession: false } });
  return {
    async read() {
      const { data, error } = await db.from("app_state").select("data,version").eq("id", ID).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? { lists: data.data as List[], version: data.version } : { lists: [], version: -1 };
    },
    async write(lists, v) {
      if (v < 0) {
        const { error } = await db.from("app_state").insert({ id: ID, data: lists, version: 0 });
        if (!error) return true;
        if (error.code === "23505") return false; // ktoś wstawił wiersz równolegle
        throw new Error(error.message);
      }
      const { data, error } = await db
        .from("app_state")
        .update({ data: lists, version: v + 1 })
        .eq("id", ID)
        .eq("version", v)
        .select("version");
      if (error) throw new Error(error.message);
      return (data?.length ?? 0) > 0;
    },
  };
}

const FILE = path.join(process.cwd(), ".data", "db.json");
const fileBackend: Backend = {
  async read() {
    try {
      return { lists: JSON.parse(await fs.readFile(FILE, "utf8")), version: 0 };
    } catch {
      return { lists: [], version: 0 };
    }
  },
  async write(lists) {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(lists));
    return true;
  },
};

const backend: Backend = url && key ? supabaseBackend() : fileBackend;

export async function getLists(): Promise<List[]> {
  return (await backend.read()).lists;
}

// Serializuje zapisy w obrębie jednej instancji; między instancjami chroni wersjonowanie.
let chain: Promise<unknown> = Promise.resolve();

export async function mutateWith<T>(
  b: Backend,
  fn: (lists: List[]) => { lists: List[]; result: T },
): Promise<T> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { lists: cur, version } = await b.read();
    const { lists, result } = fn(cur);
    if (await b.write(lists, version)) return result;
  }
  throw new Error("Konflikt zapisu, spróbuj ponownie");
}

export function mutate<T>(fn: (lists: List[]) => { lists: List[]; result: T }): Promise<T> {
  const run = chain.then(() => mutateWith(backend, fn));
  chain = run.catch(() => {});
  return run;
}

export const storageMode = () => (url && key ? "supabase" : "file");
