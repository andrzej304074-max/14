# Losowanie z list

Wspólne listy z losowaniem (Next.js + API routes). Każdy z linkiem widzi i edytuje te same listy.

Funkcje: tworzenie/usuwanie list i pozycji, losowanie N pozycji (wylosowane odznaczają się automatycznie),
zaznacz/odznacz wszystko, kopiowanie, łączenie 2+ list (oryginały zostają), znaczniki 1–7 przy pozycjach
wylosowanych w ostatnich 7 losowaniach danej listy (1 = ostatnie, im starsze, tym bledsze).

## Uruchomienie lokalne
    npm install && npm run dev
Bez konfiguracji dane zapisują się w `.data/db.json`.

## Wdrożenie na Vercel
1. Zaimportuj repo w Vercel.
2. W projekcie: **Storage → Marketplace → Upstash Redis** → podłącz do projektu
   (ustawia `KV_REST_API_URL` / `KV_REST_API_TOKEN`; obsługiwane też `UPSTASH_REDIS_REST_*`).
3. Redeploy. Bez Redisa na Vercelu dane nie byłyby trwałe (brak zapisu na dysku).

Testy: `npm test`.
