"use client";
import { useRef, useState } from "react";
import type { Icon } from "@/lib/types";

const EMOJI = [
  "🍕","🍔","🍣","🍜","🥗","🍝","🌮","🍰","☕","🍺",
  "🎬","🎮","🎵","📚","⚽","🏀","🚗","✈️","🏖️","⛰️",
  "🏠","💼","🛒","🎁","💡","⭐","❤️","🔥","🎲","🐶",
];

/** Kadruje zdjęcie do kwadratu 96×96 i zwraca mały data URL. */
async function shrink(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const size = 96;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const side = Math.min(bmp.width, bmp.height);
  c.getContext("2d")!.drawImage(
    bmp,
    (bmp.width - side) / 2,
    (bmp.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  const webp = c.toDataURL("image/webp", 0.8);
  return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/jpeg", 0.8);
}

export default function IconPicker({
  icon,
  name,
  onChange,
}: {
  icon?: Icon;
  name: string;
  onChange: (icon: Icon | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const pick = (i: Icon | null) => {
    setOpen(false);
    onChange(i);
  };

  return (
    <div className="icon-wrap">
      <button className="icon" onClick={() => setOpen(!open)} aria-label="Zmień ikonę listy" title="Zmień ikonę">
        {icon?.type === "image" ? (
          <img src={icon.value} alt="" />
        ) : icon ? (
          <span className="emoji">{icon.value}</span>
        ) : (
          <span className="letter">{(name.trim()[0] ?? "?").toUpperCase()}</span>
        )}
      </button>
      {open && (
        <>
          <div className="backdrop" onClick={() => setOpen(false)} />
          <div className="popover">
            <div className="emoji-grid">
              {EMOJI.map((e) => (
                <button key={e} onClick={() => pick({ type: "emoji", value: e })}>{e}</button>
              ))}
            </div>
            <div className="popover-actions">
              <button onClick={() => file.current?.click()}>Wgraj zdjęcie</button>
              {icon && <button className="danger" onClick={() => pick(null)}>Usuń ikonę</button>}
            </div>
            {err && <p className="error">{err}</p>}
            <input
              ref={file}
              type="file"
              accept="image/*"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                try {
                  pick({ type: "image", value: await shrink(f) });
                } catch {
                  setErr("Nie udało się wczytać zdjęcia");
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
