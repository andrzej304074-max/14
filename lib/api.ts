import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const ok = (data: unknown) =>
  NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
export const fail = (msg: string, status = 400) => NextResponse.json({ error: msg }, { status });
export type Ctx<P> = { params: Promise<P> };
