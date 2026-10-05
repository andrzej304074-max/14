import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const ok = (data: unknown) =>
  NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
export const fail = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });
export type Ctx<P> = { params: Promise<P> };

/** Zamienia wyjątki (np. błąd bazy) na czytelny JSON z komunikatem. */
export function safe<A extends unknown[]>(fn: (...a: A) => Promise<Response>) {
  return async (...a: A): Promise<Response> => {
    try {
      return await fn(...a);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("API error:", msg);
      return fail(`Błąd bazy: ${msg}`, 500);
    }
  };
}
