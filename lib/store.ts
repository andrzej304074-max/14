import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { List } from "./types";

const KEY = "lists:v1";
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;
const FILE = path.join(process.cwd(), ".data", "db.json");

export async function getLists(): Promise<List[]> {
  if (redis) return (await redis.get<List[]>(KEY)) ?? [];
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

async function save(lists: List[]) {
  if (redis) return void (await redis.set(KEY, lists));
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(lists));
}

// Serializuje zapisy w obrębie jednej instancji, by nie gubić zmian.
let chain: Promise<unknown> = Promise.resolve();

export function mutate<T>(fn: (lists: List[]) => { lists: List[]; result: T }): Promise<T> {
  const run = chain.then(async () => {
    const { lists, result } = fn(await getLists());
    await save(lists);
    return result;
  });
  chain = run.catch(() => {});
  return run;
}

export const storageMode = () => (redis ? "redis" : "file");
