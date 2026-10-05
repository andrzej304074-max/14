"use client";
import { useEffect, useRef, useState } from "react";
import type { Icon, Item, List } from "@/lib/types";
import IconPicker, { IconBadge } from "./IconPicker";

type Props = {
  list: List;
  mergeMode: boolean;
  chosen: boolean;
  toggleChosen: () => void;
  onList: (l: List) => void;
  onAdd: (l: List) => void;
  onDelete: () => void;
  act: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
  call: <T = any>(url: string, method?: string, body?: unknown) => Promise<T>;
};

/** Pole tekstowe zawijające tekst i rosnące wraz z zawartością. */
function AutoText({
  className,
  initial = "",
  value,
  onChange,
  onCommit,
  placeholder,
}: {
  className?: string;
  initial?: string; // tryb niekontrolowany: zapis przy utracie fokusu
  value?: string; // tryb kontrolowany (pole dodawania)
  onChange?: (v: string) => void;
  onCommit?: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fit = () => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };
  useEffect(fit, [value, initial]);
  useEffect(() => {
    // dopasuj wysokość także gdy zmieni się szerokość (obrót telefonu, plakietka obok tekstu)
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let w = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth !== w) {
        w = el.clientWidth;
        fit();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const controlled = value !== undefined;
  return (
    <textarea
      ref={ref}
      rows={1}
      className={className}
      placeholder={placeholder}
      {...(controlled ? { value } : { defaultValue: initial })}
      onChange={(e) => {
        onChange?.(e.target.value);
        fit();
      }}
      onBlur={(e) => onCommit?.(e.target.value)}
    />
  );
}

export default function ListCard({ list, mergeMode, chosen, toggleChosen, onList, onAdd, onDelete, act, call }: Props) {
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<Item[] | null>(null);
  const base = `/api/lists/${list.id}`;

  // ile losowań temu pozycja była wylosowana (1 = ostatnie), najnowsze wygrywa
  const ago = new Map<string, number>();
  for (const d of list.draws)
    for (const id of d.itemIds) ago.set(id, list.drawCounter - d.n + 1);

  const selected = list.items.filter((i) => i.selected).length;
  const patch = async (url: string, body: unknown) => {
    const l = await act(() => call<List>(url, "PATCH", body));
    if (l) onList(l);
  };
  const post = async (url: string, body?: unknown) => {
    const l = await act(() => call<List>(url, "POST", body ?? {}));
    if (l) onList(l);
  };

  const add = async () => {
    if (!text.trim()) return;
    const t = text;
    setText("");
    await post(`${base}/items`, { text: t });
  };

  const drawNow = async () => {
    const r = await act(() => call<{ list: List; picked: Item[] }>(`${base}/draw`, "POST"));
    if (r) {
      onList(r.list);
      setPicked(r.picked);
    }
  };

  return (
    <section className={`card${chosen ? " chosen" : ""}`}>
      {list.icon?.type === "image" && (
        <IconPicker variant="list" icon={list.icon} name={list.name} onChange={(icon: Icon | null) => patch(base, { icon })} />
      )}
      <div className="card-head">
        {mergeMode && <input type="checkbox" checked={chosen} onChange={toggleChosen} aria-label="Wybierz do połączenia" />}
        {list.icon?.type !== "image" && (
          <IconPicker variant="list" icon={list.icon} name={list.name} onChange={(icon: Icon | null) => patch(base, { icon })} />
        )}
        <AutoText
          key={list.name}
          className="title"
          initial={list.name}
          onCommit={(v) => v.trim() && v !== list.name && patch(base, { name: v })}
        />
      </div>

      <div className="row controls">
        <button className="primary big" onClick={drawNow} disabled={!selected}>Losuj</button>
        <div className="stepper" title="Ile pozycji losować">
          <button onClick={() => patch(base, { pickCount: list.pickCount - 1 })} disabled={list.pickCount <= 1} aria-label="Mniej">−</button>
          <span>{list.pickCount}</span>
          <button onClick={() => patch(base, { pickCount: list.pickCount + 1 })} aria-label="Więcej">+</button>
        </div>
        <span className="muted small">{selected}/{list.items.length} zazn.</span>
      </div>

      {picked && (
        <div className="result">
          <div className="result-head">
            <span>Wylosowano</span>
            <button className="link" onClick={() => setPicked(null)} aria-label="Zamknij">×</button>
          </div>
          {picked.map((p) => (
            <div className="picked" key={p.id}>
              {p.icon && <IconBadge icon={p.icon} />}
              <strong>{p.text}</strong>
            </div>
          ))}
        </div>
      )}

      <ul>
        {list.items.map((i) => {
          const a = ago.get(i.id);
          return (
            <li key={i.id} className={i.selected ? "" : "off"}>
              <input type="checkbox" checked={i.selected} onChange={(e) => patch(`${base}/items/${i.id}`, { selected: e.target.checked })} />
              <IconPicker variant="item" icon={i.icon} onChange={(icon: Icon | null) => patch(`${base}/items/${i.id}`, { icon })} />
              <AutoText
                key={i.text}
                className="item-text"
                initial={i.text}
                onCommit={(v) => v.trim() && v !== i.text && patch(`${base}/items/${i.id}`, { text: v })}
              />
              {a && (
                <span
                  className="badge"
                  style={{ opacity: 1.05 - a * 0.12 }}
                  title={a === 1 ? "Wylosowane w ostatnim losowaniu" : `Wylosowane ${a} losowań temu`}
                >
                  {a}
                </span>
              )}
              <button className="x" aria-label="Usuń pozycję" onClick={async () => { const l = await act(() => call<List>(`${base}/items/${i.id}`, "DELETE")); if (l) onList(l); }}>×</button>
            </li>
          );
        })}
      </ul>

      <div className="add">
        <AutoText
          className="add-text"
          value={text}
          onChange={setText}
          placeholder="Nowa pozycja…"
        />
        <button className="primary" onClick={add} disabled={!text.trim()}>Dodaj</button>
      </div>

      <div className="foot">
        <button onClick={() => post(`${base}/select`, { mode: "all" })}>Zaznacz wszystko</button>
        <button onClick={() => post(`${base}/select`, { mode: "none" })}>Odznacz wszystko</button>
        <button onClick={async () => { const l = await act(() => call<List>(`${base}/duplicate`, "POST")); if (l) onAdd(l); }}>Kopiuj</button>
        <button className="danger" onClick={async () => {
          if (!confirm(`Usunąć listę „${list.name}”?`)) return;
          const ok = await act(() => call(base, "DELETE"));
          if (ok) onDelete();
        }}>Usuń</button>
      </div>
    </section>
  );
}
