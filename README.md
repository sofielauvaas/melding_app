# 💬 MeldingApp & 🛒 Handleliste – Expo & Supabase

Dette prosjektet er et teknisk case som demonstrerer sanntidskommunikasjon og dynamisk datahåndtering ved bruk av moderne webteknologier.

## 📱 Funksjonalitet

- **Sanntids meldinger:** Send og motta meldinger umiddelbart via Supabase.
- **Smart handleliste:**
  - Søk i produktkatalog (f.eks. "appelsin", "agurk").
  - Legg til varer med emoji og kategori.
  - Juster antall (+/-) og marker varer som fullført.
  - Mulighet for å tømme hele listen.

## 🚀 Teknologier

- **Frontend:** React Native med Expo Router
- **Backend:** Supabase (PostgreSQL)
- **Sikkerhet:** Miljøvariabler (`.env`) for beskyttelse av API-nøkler.

## 🛠 Slik kjører du prosjektet lokalt

1. **Klone repoet:**
   ```bash
   git clone https://github.com/sofielauvaas/melding_app.git
   cd melding_app
   ```

2. **Installer avhengigheter:**
   ```bash
   npm install
   ```

3. **Konfigurer miljøvariabler:**
   Opprett en `.env`-fil i rotmappen og legg til dine egne Supabase-nøkler:
   ```
   EXPO_PUBLIC_SUPABASE_URL=din_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=din_anon_key
   ```

4. **Start utviklingsserveren:**
   ```bash
   npx expo start
   ```
