# Losowanie z list

Wspólne listy z losowaniem (Next.js + API routes). Każdy z linkiem widzi i edytuje te same listy.

Funkcje: tworzenie/usuwanie list i pozycji, losowanie N pozycji (wylosowane odznaczają się automatycznie),
zaznacz/odznacz wszystko, kopiowanie, łączenie 2+ list (oryginały zostają), znaczniki 1–7 przy pozycjach
wylosowanych w ostatnich 7 losowaniach danej listy (1 = ostatnie, im starsze, tym bledsze).

## Uruchomienie lokalne
    npm install && npm run dev
Bez zmiennych środowiskowych dane zapisują się w `.data/db.json`.

## Wdrożenie na Vercel (baza: Supabase, darmowa)
1. [supabase.com](https://supabase.com) → **New project** (plan Free, region np. Frankfurt).
2. **SQL Editor** → wklej zawartość `supabase/schema.sql` → **Run**.
3. **Project Settings → API**: skopiuj `Project URL` oraz klucz `service_role` (tajny, tylko serwer).
4. Vercel → projekt → **Settings → Environment Variables** dodaj (Production, Preview, Development):
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = klucz service_role
5. **Deployments → Redeploy**.

Darmowy Supabase usypia projekt po 7 dniach bez ruchu (wznawiasz jednym kliknięciem w panelu).

Testy: `npm test`.
