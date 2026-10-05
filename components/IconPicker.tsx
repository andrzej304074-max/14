"use client";
import { useRef, useState } from "react";
import type { Icon } from "@/lib/types";

const EMOJI = [
  "🍕","🍔","🍣","🍜","🥗","🍝","🌮","🍰","☕","🍺",
  "🎬","🎮","🎵","📚","⚽","🏀","🚗","✈️","🏖️","⛰️",
  "🏠","💼","🛒","🎁","💡","⭐","❤️","🔥","🎲","🐶",
];

/** Kadruje zdjęcie do kwadratu size×size i zwraca data URL. */
async function shrink(file: File, size: number, quality: number): Promise<string> {
  const bmp = await createImageBitmap(file);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const side = Math.min(bmp.width, bmp.height);
  c.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size);
  const webp = c.toDataURL("image/webp", quality);
  return webp.startsWith("data:image/webp") ? webp : c.toDataURL("image/jpeg", quality);
}

/** Mała ikona (emoji lub miniatura zdjęcia) do wyświetlania w tekście. */
export function IconBadge({ icon, className = "" }: { icon: Icon; className?: string }) {
  return (
    <span className={`icon-badge ${className}`}>
      {icon.type === "image" ? <img src={icon.value} alt="" /> : icon.value}
    </span>
  );
}

type Props = {
  icon?: Icon;
  name?: string;
  onChange: (icon: Icon | null) => void;
  /** list: zdjęcie 480px wyświetlane jako duży kwadrat; item: mała ikona, zdjęcie 64px */
  variant: "list" | "item";
};

export default function IconPicker({ icon, name = "", onChange, variant }: Props) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const isList = variant === "list";
  const cover = isList && icon?.type === "image";

  const pick = (i: Icon | null) => {
    setOpen(false);
    onChange(i);
  };

  return (
    <div className={`icon-wrap ${variant}${cover ? " cover-wrap" : ""}`}>
      {cover ? (
        <button className="cover" onClick={() => setOpen(!open)} aria-label="Zmień zdjęcie listy" title="Zmień zdjęcie">
          <img src={icon!.value} alt="" />
        </button>
      ) : (
        <button
          className={`icon${isList ? "" : " sm"}${!icon && !isList ? " empty" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label={isList ? "Zmień ikonę listy" : "Dodaj ikonę opcji"}
          title={isList ? "Zmień ikonę" : "Ikona opcji"}
        >
          {icon?.type === "image" ? (
            <img src={icon.value} alt="" />
          ) : icon ? (
            <span className="emoji">{icon.value}</span>
          ) : isList ? (
            <span className="letter">{(name.trim()[0] ?? "?").toUpperCase()}</span>
          ) : (
            <span className="plus">+</span>
          )}
        </button>
      )}
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
                  pick({ type: "image", value: await shrink(f, isList ? 480 : 64, isList ? 0.75 : 0.8) });
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
