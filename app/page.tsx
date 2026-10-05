"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { List } from "@/lib/types";
import ListCard from "@/components/ListCard";

async function call<T = any>(url: string, method = "GET", body?: unknown): Promise<T> {
  const r = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Błąd");
  return data;
}

export default function Page() {
  const [lists, setLists] = useState<List[] | null>(null);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [mergeMode, setMergeMode] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  const [mergeName, setMergeName] = useState("");
  const busy = useRef(0);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    try {
      setLists(await call<List[]>("/api/lists"));
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(() => !document.hidden && refresh(), 10000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const replace = (l: List) =>
    setLists((cur) => (cur ?? []).map((x) => (x.id === l.id ? l : x)));

  // wykonuje akcję, wstrzymując odświeżanie w tle na czas jej trwania
  const act = async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    busy.current++;
    setErr("");
    try {
      return await fn();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      busy.current--;
    }
  };

  const create = async () => {
    const l = await act(() => call<List>("/api/lists", "POST", { name }));
    if (l) {
      setLists((c) => [...(c ?? []), l]);
      setName("");
    }
  };

  const doMerge = async () => {
    const l = await act(() => call<List>("/api/lists/merge", "POST", { ids: chosen, name: mergeName }));
    if (l) {
      setLists((c) => [...(c ?? []), l]);
      setMergeMode(false);
      setChosen([]);
      setMergeName("");
    }
  };

  return (
    <main>
      <header>
        <h1>Losowanie z list</h1>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            create();
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nazwa nowej listy" />
          <button className="primary">Dodaj listę</button>
          {(lists?.length ?? 0) > 1 && (
            <button type="button" onClick={() => { setMergeMode(!mergeMode); setChosen([]); }}>
              {mergeMode ? "Anuluj łączenie" : "Połącz listy"}
            </button>
          )}
        </form>
        {mergeMode && (
          <div className="row merge">
            <span className="muted">Zaznacz co najmniej 2 listy ({chosen.length})</span>
            <input value={mergeName} onChange={(e) => setMergeName(e.target.value)} placeholder="Nazwa połączonej listy" />
            <button className="primary" disabled={chosen.length < 2} onClick={doMerge}>
              Połącz
            </button>
          </div>
        )}
        {err && <p className="error">{err}</p>}
      </header>

      {lists === null && <p className="muted">Ładowanie…</p>}
      {lists?.length === 0 && <p className="muted">Brak list. Dodaj pierwszą powyżej.</p>}
      <div className="grid">
        {lists?.map((l) => (
          <ListCard
            key={l.id}
            list={l}
            mergeMode={mergeMode}
            chosen={chosen.includes(l.id)}
            toggleChosen={() =>
              setChosen((c) => (c.includes(l.id) ? c.filter((x) => x !== l.id) : [...c, l.id]))
            }
            onList={replace}
            onAdd={(l2) => setLists((c) => [...(c ?? []), l2])}
            onDelete={() => setLists((c) => (c ?? []).filter((x) => x.id !== l.id))}
            act={act}
            call={call}
          />
        ))}
      </div>
    </main>
  );
}
