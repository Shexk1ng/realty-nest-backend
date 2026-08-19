# Realty Nest — warstwa danych

Serwer GraphQL systemu CRM/CMS dla biur pośrednictwa nieruchomości. Odpowiada za model danych,
logikę dziedzinową, kontrolę dostępu opartą na rolach, izolację danych między firmami oraz
dziennik audytu zabezpieczony łańcuchem skrótów.

Aplikacja powstała jako część pracy magisterskiej w Instytucie Bezpieczeństwa i Informatyki
Uniwersytetu Komisji Edukacji Narodowej w Krakowie. Warstwa prezentacji znajduje się w osobnym
repozytorium: **realty-nest-crm**.

## Wymagania

| Składnik | Wersja | Uwagi |
|---|---|---|
| Node.js | 22.18 lub nowszy | Wersja minimalna wynika z natywnej obsługi plików `.ts`, której używa pakiet testów bezpieczeństwa |
| npm | 10 lub nowszy | |
| MongoDB | 6 lub nowszy | Instancja lokalna albo MongoDB Atlas |

## Uruchomienie

```bash
npm install
cp .env.example .env
npm run seed:demo
npm start
```

Serwer nasłuchuje na porcie 4000 (zmienna `PORT`). Adres punktu końcowego: `http://localhost:4000/graphql`.

### Konfiguracja

Trzy zmienne są obowiązkowe — bez nich serwer nie wystartuje, ponieważ `validateEnv()` przerywa
uruchomienie przed nawiązaniem połączenia z bazą:

| Zmienna | Znaczenie |
|---|---|
| `MONGO_URI` | Adres połączenia z bazą MongoDB |
| `JWT_SECRET` | Klucz podpisujący tokeny dostępowe |
| `TOTP_ENCRYPT_KEY` | Klucz szyfrujący sekrety drugiego składnika — **dokładnie 64 znaki szesnastkowe** |

Wartości kluczy generują polecenia:

```bash
openssl rand -base64 48   # JWT_SECRET
openssl rand -hex 32      # TOTP_ENCRYPT_KEY
```

Pozostałe zmienne są opcjonalne i opisane w `.env.example`.

## Dane demonstracyjne

```bash
npm run seed:demo            # wymaga pustej bazy
npm run seed:demo -- --reset # czyści kolekcje i wypełnia je od nowa
```

Skrypt zakłada cztery agencje wraz z firmą operatora platformy oraz komplet kont dla każdej roli
modelu uprawnień. Wszystkie konta mają hasło `DemoPass123!`.

| Adres | Rola | Zakres |
|---|---|---|
| `admin@nestrealty.pl` | COMPANY_ADMIN | Pełny zakres własnej firmy |
| `manager@nestrealty.pl` | MANAGER | Dane całej firmy, kolejka przydziału zapytań |
| `agent1@nestrealty.pl` | AGENT | Wyłącznie rekordy własne |
| `assistant1@nestrealty.pl` | AGENT_ASSISTANT | Rekordy agenta, do którego jest przypisany |
| `assistant2@nestrealty.pl` | AGENT_ASSISTANT | **Celowo nieprzypisany** — ilustruje regułę pustego zakresu |

Analogiczne konta istnieją w domenach `krakowpremium.pl`, `wroclawcity.pl` i `balticcoast.pl`,
co pozwala sprawdzić izolację danych między firmami.

Dane generowane są losowo, więc kolejne uruchomienia dają różne wartości liczbowe. Daty rekordów
wyznaczane są względem chwili uruchomienia skryptu.

## Testy

```bash
npm run test:authz      # 31 asercji kontroli dostępu i izolacji firm — wymaga działającego serwera
npm run test:security   # 23 asercje mechanizmów ochronnych — nie wymaga serwera
npm run verify:audit    # weryfikacja integralności łańcucha skrótów dziennika audytu
```

Pakiet `test:authz` przy niezgodnych zmiennych środowiskowych **pomija** testy zamiast je oblewać —
w podsumowaniu należy sprawdzać nie tylko liczbę PASS, ale i liczbę pominiętych.

## Struktura

```
src/
  config/     połączenie z bazą
  models/     schematy Mongoose wraz z wtyczką dziennika audytu
  graphql/    schemat i resolwery w podziale na moduły dziedzinowe
    modules/_shared/  wspólna fabryka operacji CRUD z filtrem izolacji firm
  utils/      tokeny, szyfrowanie sekretów, łańcuch skrótów, walidacja
  scripts/    wypełnianie bazy i pakiety testowe
```

## Uwaga o kluczach

Klucze użyte w środowisku deweloperskim nie znajdują się w repozytorium. Plik `.env` jest
ignorowany; śledzony jest wyłącznie szablon `.env.example`.

## Licencja

MIT — zob. `LICENSE`.
