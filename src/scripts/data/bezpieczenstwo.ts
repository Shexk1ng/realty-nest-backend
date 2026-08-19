// Dane demonstracyjne trzech modułów bezpieczeństwa: drugiego składnika logowania (TOTP),
// rejestru kopii zapasowych oraz dziennika zdarzeń bezpieczeństwa — do pracy magisterskiej.
//
// Plik zwraca GOTOWE REKORDY; nie łączy się z bazą i niczego sam nie zapisuje. Skrypt
// seedujący decyduje, kiedy i w jakiej kolejności je wstawić.
//
// ─────────────────────────────────────────────────────────────────────────────
// 1. DRUGI SKŁADNIK UWIERZYTELNIANIA (TOTP)
// ─────────────────────────────────────────────────────────────────────────────
// Kształt rekordu odwzorowuje models/users.ts (pole `twoFactor`) oraz utils/totp.ts:
//   secret      — sekret Base32 zaszyfrowany AES-256-GCM w formacie iv:szyfrogram:tag
//                 (dokładnie to, co produkuje encryptSecret; klucz z TOTP_ENCRYPT_KEY),
//   backupCodes — skróty bcrypt kodów zapasowych,
//   enabledAt   — data włączenia.
//
// Objęte konta (tylko dwa — uzasadnienie niżej):
//   • admin@wroclawcity.pl   — COMPANY_ADMIN, Wrocław City Homes
//   • admin@balticcoast.pl   — COMPANY_ADMIN, Baltic Coast Properties
//
// Konta CELOWO POMINIĘTE, mimo że zadanie je dopuszczało:
//   • administrator systemu (SEED_ADMIN_EMAIL / bartlomiejdejewski01@gmail.com) —
//     scripts/test-authz.ts w pierwszym teście robi login(SYSTEM_ADMIN_EMAIL) i sprawdza
//     `!!sysAdmin?.accessToken`; przy włączonym TOTP mutacja `login` zwraca accessToken=null
//     i twoFactorRequired=true, więc oblałby się ten test i wszystkie zależne od jego tokenu;
//   • admin@krakowpremium.pl — realty-nest/scripts/test-blackbox.mjs używa tego konta jako
//     OTHER_ADMIN w przypadkach PS-02, SEC-02 i teście plików (linie 218, 384, 504) i za
//     każdym razem sięga po `data.accessToken`.
// Pozostałe konta (admin@/manager@/agent1..6@/assistant1@/assistant2@ we wszystkich czterech
// domenach) są zablokowane wprost przez listę KONTA_ZAREZERWOWANE_DLA_TESTOW — próba
// dopisania ich do KONTA_Z_2FA kończy się wyjątkiem, a nie cichym oblaniem testów.
//
// Sekrety Base32 są STAŁE (nie losowane), żeby recenzent mógł je wpisać ręcznie w Google
// Authenticator / Aegis i faktycznie się zalogować, a ponowny seed nie unieważniał tego, co
// opisano w pracy. Kody zapasowe również są stałe i jawne — patrz KODY_ZAPASOWE_JAWNE.
//
// UWAGA — błąd zastany w utils/totp.ts (NIE poprawiany tutaj, bo to inny moduł):
// generateBackupCodes() haszuje kod RAZEM z myślnikiem ("4B7C-19DE"), natomiast
// verifyAndConsumeBackupCode() przed porównaniem myślnik usuwa ("4B7C19DE"), więc kody
// wygenerowane przez samą aplikację nigdy się nie zweryfikują. Ten plik haszuje postać
// znormalizowaną (bez myślnika, wielkimi literami), czyli tę, którą realnie sprawdza
// weryfikacja logowania — dzięki temu kody zapasowe z tego seeda DZIAŁAJĄ.
//
// ─────────────────────────────────────────────────────────────────────────────
// 2. KOPIE ZAPASOWE
// ─────────────────────────────────────────────────────────────────────────────
// Kształt rekordu odwzorowuje models/backups.ts. Rekordy są historią rotacji: cotygodniowe
// zadanie nocne + kopie ręczne przed zmianami, w tym dwie nieudane z realnymi komunikatami.
//
// Rekord kopii to tylko wpis w rejestrze — właściwy plik zrzutu leży w Cloudinary pod
// `publicId`, a api/admin/backup-download strumieniuje go administratorowi systemu. Dlatego
// zbudujKopieZapasowe() przyjmuje teraz wywołanie zwrotne `zrzut`: skrypt seedujący podaje
// zawartość pliku na dzień kopii (patrz zrzutBazyNaDzien() w seed-demo.ts), moduł wysyła go
// do magazynu dokładnie tak, jak dokumenty.ts wysyła PDF-y (podpisane REST API, zasób „raw",
// dostawa „authenticated", katalog <CLOUDINARY_UPLOAD_FOLDER>/backups) i zapisuje zwrócone
// publicId oraz rzeczywisty rozmiar pliku.
//
// DEGRADACJA (świadoma): bez zmiennych CLOUDINARY_*, bez wywołania `zrzut` albo po nieudanej
// wysyłce rekord powstaje jak dotychczas — publicId=null, rozmiary z HARMONOGRAM_KOPII,
// a przycisk „Pobierz" zwraca 404 („Backup not found."). Seed nigdy nie kończy się z tego
// powodu błędem. Dwie pozycje FAILED zostają bez pliku ZAWSZE — nieudana kopia z definicji
// niczego nie odłożyła w magazynie, a trasa pobierania odpowiada na nie 409.
//
// ─────────────────────────────────────────────────────────────────────────────
// 3. ZDARZENIA BEZPIECZEŃSTWA — DLACZEGO NIE DA SIĘ ICH ZASEEDOWAĆ
// ─────────────────────────────────────────────────────────────────────────────
// Sprawdzone: realty-nest/src/app/api/security/events/route.ts czyta wyłącznie
// getDlpEvents(), getHoneypotEvents() i getRiskEvents(), a te trzy funkcje zwracają
// `events.slice(...)` z TABLIC MODUŁOWYCH żyjących w pamięci procesu Next.js
// (lib/security/dlp.ts, honeypot.ts, risk-score.ts). Nie ma dla nich ani modelu Mongoose,
// ani kolekcji, ani żadnej ścieżki zapisu z zewnątrz — proces seedujący to inny proces niż
// serwer aplikacji, więc nie ma jak wstrzyknąć mu rekordów. Utrwalenie tych zdarzeń wymaga
// przebudowy modułu (nowy model + zapis w checkDlp/logHoneypotHit/assessRisk + odczyt
// z bazy w route.ts), czego zadanie zabrania. Dlatego trzy panele „DLP", „Honeypot"
// i „Ryzyko logowania" pozostają puste do czasu pojawienia się ruchu — i wypełniają się
// NAPRAWDĘ, na żywo, gdy recenzent:
//   • wejdzie na pułapki: GET /api/users/dump, GET /api/backup, POST /api/admin/export
//     (każde trafienie to wpis honeypota, odpowiedź to fałszywe 404),
//   • przewinie listę kontaktów tak, by w 5 minut pobrać ponad 30 rekordów (próg DLP;
//     powyżej 50 następuje zablokowanie odpowiedzi),
//   • zaloguje się kilka razy błędnym hasłem, a potem poprawnym (ocena ryzyka).
//
// W zamian ten plik dostarcza to, co DA SIĘ utrwalić bez ruszania modułu: wpisy dziennika
// audytu (models/logs.ts) opisujące te same incydenty — trafienia pułapek, masowy eksport
// kontaktów zatrzymany przez DLP, serię nieudanych logowań z obcego adresu, ocenę ryzyka
// oraz logowania drugim składnikiem. Zasilają one panel „Dziennik audytu", kafelki statystyk
// i skan anomalii AI na /dashboard/security, przetrwają restart i wchodzą w łańcuch skrótów.
//
// SKĄD SIĘ BIERZE „ŚREDNI — 47 × zapytania” OSIEM RAZY POD RZĄD (i czego seed na to nie
// poradzi): panel „Ochrona przed wyciekiem danych” renderuje getDlpEvents().slice(0, 8),
// a checkDlp() liczy UNIKALNE identyfikatory z ostatnich pięciu minut. Gdy recenzent obejrzy
// wszystkie zapytania jednej agencji (jest ich 47), każde kolejne żądanie listy w tym samym
// oknie widzi ten sam komplet 47 rekordów i dopisuje identyczne zdarzenie ŚREDNI — stąd osiem
// bliźniaczych wierszy. To zachowanie modułu, nie danych: zdarzenia powstają w pamięci
// serwera Next.js już po zalogowaniu recenzenta i zniknie po restarcie. Zróżnicowane
// (poziom, moduł, liczba, konto, data) są za to wpisy DLP w dzienniku audytu poniżej —
// to jedyna warstwa DLP, którą seed może utrwalić.
//
// SPOSÓB WSTAWIENIA WPISÓW DZIENNIKA (ważne dla łańcucha skrótów):
//   • wyłącznie sekwencyjnie i w kolejności zwracanej przez zbudujDziennikBezpieczenstwa()
//     (rosnąco po czasie), bo hook pre("save") w models/logs.ts liczy seq i prevHash
//     na podstawie ostatniego wpisu w bazie;
//   • przez `new ActivityLog(wpis).save({ timestamps: false })` — insertMany POMIJA hooki,
//     więc wpisy trafiłyby do bazy bez hasha i verify-audit-chain.ts by je odrzucił;
//     `{ timestamps: false }` zachowuje podane createdAt (ten sam wzorzec co saveAs()
//     w seed-demo.ts);
//   • najlepiej zaraz po utworzeniu użytkowników i firm, a przed masowym seedem ofert —
//     wtedy numeracja seq rośnie zgodnie z czasem zdarzeń.

import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { generateURI } from "otplib";
import { encryptSecret } from "../../utils/totp.js";
import { bezpiecznyKatalog, czyCloudinarySkonfigurowane } from "./dokumenty.js";

const NAZWA_APLIKACJI = "Realty Nest";

/* ══════════════════════════════════════════════════════════════════════════
 * Wspólne narzędzia
 * ══════════════════════════════════════════════════════════════════════════ */

/** Data „N dni temu" o zadanej godzinie lokalnej. Nigdy nie zwraca przyszłości. */
function oDniTemu(teraz: Date, dni: number, godzina: number, minuta: number): Date {
  const d = new Date(teraz);
  d.setDate(d.getDate() - dni);
  d.setHours(godzina, minuta, 0, 0);
  if (d.getTime() > teraz.getTime()) d.setDate(d.getDate() - 1);
  return d;
}

/** Data „N minut temu" — do zdarzeń układających się w ciasną sekwencję. */
function oMinutTemu(teraz: Date, minut: number): Date {
  return new Date(teraz.getTime() - minut * 60_000);
}

/** Poprawna forma rzeczownika „rekord" po liczebniku (30 rekordów, 74 rekordy). */
function formaRekordow(n: number): string {
  const dziesiatki = n % 100;
  const jednosci = n % 10;
  if (dziesiatki >= 12 && dziesiatki <= 14) return "rekordów";
  return jednosci >= 2 && jednosci <= 4 ? "rekordy" : "rekordów";
}

/* ══════════════════════════════════════════════════════════════════════════
 * 1. DRUGI SKŁADNIK UWIERZYTELNIANIA
 * ══════════════════════════════════════════════════════════════════════════ */

/** Domeny czterech agencji demonstracyjnych. */
export const DOMENY_AGENCJI = [
  "nestrealty.pl",
  "krakowpremium.pl",
  "wroclawcity.pl",
  "balticcoast.pl",
] as const;

/** Konta, na które logują się pakiety testowe samym hasłem — 2FA jest tu zakazane. */
const UCHWYTY_TESTOWE = [
  "manager",
  "agent1", "agent2", "agent3", "agent4", "agent5", "agent6",
  "assistant1", "assistant2",
] as const;

export const DOMYSLNY_EMAIL_ADMINISTRATORA_SYSTEMU = "bartlomiejdejewski01@gmail.com";

/**
 * Pełna lista adresów, którym NIE WOLNO włączyć drugiego składnika. Poza uchwytami
 * wymienionymi w zadaniu zawiera dwa konta administratorów firm, które okazały się
 * używane przez pakiety testowe (uzasadnienie w nagłówku pliku).
 */
export const KONTA_ZAREZERWOWANE_DLA_TESTOW: readonly string[] = [
  ...DOMENY_AGENCJI.flatMap((domena) => UCHWYTY_TESTOWE.map((uchwyt) => `${uchwyt}@${domena}`)),
  "admin@nestrealty.pl",
  "admin@krakowpremium.pl",
];

/**
 * Czy adres jest zarezerwowany dla pakietów testowych (test-blackbox.mjs, test-authz.ts,
 * perf-login.k6.js). Uwzględnia adres administratora systemu, także podmieniony
 * zmienną SEED_ADMIN_EMAIL.
 */
export function czyKontoZarezerwowaneDlaTestow(email: string): boolean {
  const adres = email.trim().toLowerCase();
  const administratorSystemu = (
    process.env.SEED_ADMIN_EMAIL ?? DOMYSLNY_EMAIL_ADMINISTRATORA_SYSTEMU
  ).trim().toLowerCase();
  return adres === administratorSystemu || KONTA_ZAREZERWOWANE_DLA_TESTOW.includes(adres);
}

interface DefinicjaSekretu {
  email: string;
  /** Sekret Base32 (RFC 4648, 32 znaki = 160 bitów) do wpisania w aplikacji TOTP. */
  sekretBase32: string;
  /** Ile dni temu użytkownik włączył drugi składnik. */
  wlaczoneDniTemu: number;
  godzina: number;
  minuta: number;
  /** Kody zapasowe w postaci jawnej; zużyte usunięto z listy, tak jak robi to aplikacja. */
  kodyZapasowe: readonly string[];
  opis: string;
}

const SEKRETY: readonly DefinicjaSekretu[] = [
  {
    email: "admin@wroclawcity.pl",
    sekretBase32: "WROCLAWCITYADMIN2FA7NESTREALTY55",
    wlaczoneDniTemu: 96,
    godzina: 10,
    minuta: 24,
    kodyZapasowe: [
      "4B7C-19DE", "A03F-6C21", "7E12-B8A4", "C5D0-3F97",
      "18AB-42EC", "9F63-D50A", "2C84-7BE1", "E6A9-051F",
    ],
    opis: "Broker prowadzący Wrocław City Homes — komplet ośmiu nieużytych kodów zapasowych.",
  },
  {
    email: "admin@balticcoast.pl",
    sekretBase32: "BALTICCOASTADMIN2FA7NESTREALTY66",
    wlaczoneDniTemu: 61,
    godzina: 15,
    minuta: 47,
    kodyZapasowe: [
      "5D1E-8AC0", "B274-F93A", "0C68-31DB",
      "AE95-7204", "63F1-D8B7", "1A40-9E52",
    ],
    opis:
      "Broker prowadzący Baltic Coast Properties — dwa z ośmiu kodów zapasowych zostały " +
      "zużyte (odpowiadają im wpisy AUTH_LOGIN metodą 2fa_backup w dzienniku).",
  },
];

/** Jawne kody zapasowe do wydruku w aneksie pracy — te same, które zaszyfrowano w bazie. */
export const KODY_ZAPASOWE_JAWNE: Readonly<Record<string, readonly string[]>> = Object.freeze(
  Object.fromEntries(SEKRETY.map((s) => [s.email, s.kodyZapasowe])),
);

/** Sekrety Base32 do ręcznego wpisania w aplikacji uwierzytelniającej. */
export const SEKRETY_JAWNE: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(SEKRETY.map((s) => [s.email, s.sekretBase32])),
);

export interface RekordDwuskladnikowy {
  /** Adres konta — klucz do wyszukania użytkownika w bazie. */
  email: string;
  /** Podpole `twoFactor` z models/users.ts, gotowe do przypisania. */
  twoFactor: {
    enabled: true;
    secret: string;
    backupCodes: string[];
    enabledAt: Date;
  };
  /** Materiał jawny — do wypisania w konsoli seeda i w aneksie pracy. */
  sekretBase32: string;
  otpauthUrl: string;
  kodyZapasowe: readonly string[];
  opis: string;
}

const WZORZEC_BASE32 = /^[A-Z2-7]{32}$/;
const WZORZEC_KODU = /^[0-9A-F]{4}-[0-9A-F]{4}$/;

/**
 * Buduje rekordy drugiego składnika dla kont dopuszczonych do 2FA.
 *
 * Wymaga ustawionej zmiennej TOTP_ENCRYPT_KEY (64 znaki szesnastkowe = 32 bajty) —
 * tego samego klucza używa serwer GraphQL przy odszyfrowaniu sekretu podczas logowania.
 * Rzuca wyjątkiem, jeśli którykolwiek adres jest zarezerwowany dla pakietów testowych.
 */
export async function zbudujDwuskladnikowe(
  opcje: { teraz?: Date } = {},
): Promise<RekordDwuskladnikowy[]> {
  const teraz = opcje.teraz ?? new Date();

  const klucz = process.env.TOTP_ENCRYPT_KEY;
  if (!klucz || !/^[0-9a-fA-F]{64}$/.test(klucz)) {
    throw new Error(
      "bezpieczenstwo.ts: TOTP_ENCRYPT_KEY musi być ustawiony i mieć 64 znaki szesnastkowe " +
        "(32 bajty). Bez niego sekretu TOTP nie da się zaszyfrować tak, by serwer GraphQL " +
        "go odczytał.",
    );
  }

  const rekordy: RekordDwuskladnikowy[] = [];

  for (const def of SEKRETY) {
    if (czyKontoZarezerwowaneDlaTestow(def.email)) {
      throw new Error(
        `bezpieczenstwo.ts: konto ${def.email} jest używane przez pakiety testowe ` +
          "(test-blackbox.mjs / test-authz.ts / perf-login.k6.js), które logują się samym " +
          "hasłem. Włączenie drugiego składnika oblałoby te testy.",
      );
    }
    if (!WZORZEC_BASE32.test(def.sekretBase32)) {
      throw new Error(`bezpieczenstwo.ts: sekret dla ${def.email} nie jest poprawnym Base32.`);
    }

    const zleKody = def.kodyZapasowe.filter((kod) => !WZORZEC_KODU.test(kod));
    if (zleKody.length > 0) {
      throw new Error(
        `bezpieczenstwo.ts: kody zapasowe ${zleKody.join(", ")} (${def.email}) mają zły format.`,
      );
    }

    // Weryfikacja logowania normalizuje kod (usuwa myślniki, wielkie litery) i dopiero
    // wtedy porównuje go z haszem — haszujemy więc dokładnie postać znormalizowaną.
    const backupCodes = await Promise.all(
      def.kodyZapasowe.map((kod) => bcrypt.hash(kod.replace(/-/g, "").toUpperCase(), 10)),
    );

    rekordy.push({
      email: def.email,
      twoFactor: {
        enabled: true,
        secret: encryptSecret(def.sekretBase32),
        backupCodes,
        enabledAt: oDniTemu(teraz, def.wlaczoneDniTemu, def.godzina, def.minuta),
      },
      sekretBase32: def.sekretBase32,
      otpauthUrl: generateURI({
        issuer: NAZWA_APLIKACJI,
        label: def.email,
        secret: def.sekretBase32,
      }),
      kodyZapasowe: def.kodyZapasowe,
      opis: def.opis,
    });
  }

  return rekordy;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 2. KOPIE ZAPASOWE
 * ══════════════════════════════════════════════════════════════════════════ */

export interface RekordKopiiZapasowej {
  publicId: string | null;
  status: "COMPLETE" | "FAILED";
  errorMessage: string | null;
  sizeBytes: number;
  collectionsCount: number;
  docCount: number;
  createdById: string | null;
  createdByName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PozycjaKopii {
  dniTemu: number;
  godzina: number;
  minuta: number;
  status: "COMPLETE" | "FAILED";
  docCount: number;
  sizeBytes: number;
  collectionsCount: number;
  /** true — zadanie nocne z harmonogramu, false — kopia uruchomiona ręcznie. */
  automatyczna: boolean;
  errorMessage: string | null;
}

// Dziesięć tygodni rotacji: kopia nocna w każdą noc z soboty na niedzielę o 02:15
// plus kopie ręczne przed zmianami w systemie. Rozmiar rośnie razem z liczbą dokumentów
// (zrzut to JSON, średnio ok. 0,5 kB na dokument). Dwie pozycje nieudane — timeout
// magazynu i przekroczony limit planu — pokazują obsługę błędu w panelu.
//
// docCount i sizeBytes są WARTOŚCIAMI ZAPASOWYMI: gdy seed poda zrzut bazy, obie liczby
// biorą się z prawdziwego pliku, żeby panel nie obiecywał 4,4 MB przy pliku o innym
// rozmiarze. Bez zrzutu (brak kluczy do magazynu) zostają te niżej.
const HARMONOGRAM_KOPII: readonly PozycjaKopii[] = [
  { dniTemu: 63, godzina: 2,  minuta: 15, status: "COMPLETE", docCount: 6118, sizeBytes: 3_168_442, collectionsCount: 16, automatyczna: true,  errorMessage: null },
  { dniTemu: 58, godzina: 11, minuta: 20, status: "COMPLETE", docCount: 6240, sizeBytes: 3_231_908, collectionsCount: 17, automatyczna: false, errorMessage: null },
  { dniTemu: 56, godzina: 2,  minuta: 15, status: "COMPLETE", docCount: 6287, sizeBytes: 3_255_610, collectionsCount: 17, automatyczna: true,  errorMessage: null },
  { dniTemu: 49, godzina: 2,  minuta: 15, status: "COMPLETE", docCount: 6402, sizeBytes: 3_314_977, collectionsCount: 17, automatyczna: true,  errorMessage: null },
  { dniTemu: 45, godzina: 16, minuta: 5,  status: "COMPLETE", docCount: 6511, sizeBytes: 3_371_268, collectionsCount: 17, automatyczna: false, errorMessage: null },
  { dniTemu: 42, godzina: 2,  minuta: 15, status: "COMPLETE", docCount: 6588, sizeBytes: 3_410_553, collectionsCount: 17, automatyczna: true,  errorMessage: null },
  {
    dniTemu: 35, godzina: 2, minuta: 15, status: "FAILED", docCount: 6744, sizeBytes: 3_490_111,
    collectionsCount: 17, automatyczna: true,
    errorMessage: "Request Timeout — przesyłanie zrzutu do magazynu przerwane po 60 s (Cloudinary: 499).",
  },
  { dniTemu: 34, godzina: 9,  minuta: 5,  status: "COMPLETE", docCount: 6751, sizeBytes: 3_494_088, collectionsCount: 17, automatyczna: false, errorMessage: null },
  { dniTemu: 28, godzina: 2,  minuta: 15, status: "COMPLETE", docCount: 6903, sizeBytes: 3_572_641, collectionsCount: 17, automatyczna: true,  errorMessage: null },
  {
    dniTemu: 26, godzina: 14, minuta: 12, status: "FAILED", docCount: 7010, sizeBytes: 3_628_033,
    collectionsCount: 17, automatyczna: false,
    errorMessage: "Storage quota exceeded — magazyn kopii zapasowych osiągnął limit planu (Cloudinary: 420).",
  },
  { dniTemu: 21, godzina: 2,  minuta: 15, status: "COMPLETE", docCount: 7188, sizeBytes: 3_719_402, collectionsCount: 17, automatyczna: true,  errorMessage: null },
  { dniTemu: 14, godzina: 2,  minuta: 15, status: "COMPLETE", docCount: 7460, sizeBytes: 3_860_155, collectionsCount: 17, automatyczna: true,  errorMessage: null },
  { dniTemu: 12, godzina: 9,  minuta: 40, status: "COMPLETE", docCount: 7604, sizeBytes: 3_934_690, collectionsCount: 17, automatyczna: false, errorMessage: null },
  { dniTemu: 7,  godzina: 2,  minuta: 15, status: "COMPLETE", docCount: 7902, sizeBytes: 4_088_913, collectionsCount: 17, automatyczna: true,  errorMessage: null },
  { dniTemu: 3,  godzina: 18, minuta: 25, status: "COMPLETE", docCount: 8355, sizeBytes: 4_323_470, collectionsCount: 17, automatyczna: false, errorMessage: null },
  { dniTemu: 1,  godzina: 2,  minuta: 15, status: "COMPLETE", docCount: 8618, sizeBytes: 4_459_552, collectionsCount: 17, automatyczna: true,  errorMessage: null },
];

/** Nazwa autora kopii wykonywanych z harmonogramu (nie ma dla niej konta w bazie). */
export const AUTOR_HARMONOGRAM = "Zadanie nocne (harmonogram)";

/** Zawartość pliku kopii wraz z tym, co o niej mówi rejestr. */
export interface ZrzutBazy {
  /** Dokładnie te bajty trafiają do magazynu i tyle samo pobierze recenzent. */
  bytes: Buffer;
  docCount: number;
  collectionsCount: number;
}

/* ── Wysyłka pliku kopii do magazynu ───────────────────────────────────────────
   Ta sama droga co w dokumenty.ts (podpisane REST API Cloudinary, bez pakietu
   `cloudinary`, który jest zależnością aplikacji, a nie tego repozytorium): zasób „raw",
   dostawa „authenticated". Konwencje katalogu odpowiadają api/admin/backup/route.ts,
   który przy ręcznym „Utwórz kopię" wrzuca plik do <UPLOAD_FOLDER>/backups. Osobne
   liczniki, żeby podsumowanie seeda nie mieszało kopii z dokumentami. */

let wyslaneKopie = 0;
let bledyKopii = 0;
let ostrzezenieOKopiach = false;

/** Podpis żądania zgodny z algorytmem SDK Cloudinary: sha1(sorted(params) + api_secret). */
function podpiszParametryKopii(parametry: Record<string, string>, sekret: string): string {
  const doPodpisu = Object.keys(parametry)
    .sort()
    .map((klucz) => `${klucz}=${parametry[klucz]}`)
    .join("&");
  return createHash("sha1").update(`${doPodpisu}${sekret}`, "utf8").digest("hex");
}

/**
 * Wysyła plik zrzutu do magazynu i zwraca publicId wraz z rozmiarem policzonym przez
 * Cloudinary. Zwraca `null`, gdy brakuje kluczy albo wysyłka się nie powiodła —
 * nigdy nie rzuca wyjątkiem, bo seed ma dojść do końca również bez sieci.
 */
export async function przeslijKopieDoCloudinary(
  zrzut: ZrzutBazy,
  nazwaPliku: string,
  opcje: { folder?: string | null; timeoutMs?: number } = {},
): Promise<{ publicId: string; sizeBytes: number } | null> {
  if (!czyCloudinarySkonfigurowane()) {
    if (!ostrzezenieOKopiach) {
      ostrzezenieOKopiach = true;
      console.warn(
        [
          "",
          "  ⚠ [kopie] Brak konfiguracji Cloudinary — pliki kopii zapasowych nie zostaną wysłane.",
          "    Rekordy powstaną z publicId = null, czyli tak jak dotychczas, a „Pobierz” zwróci 404.",
          "",
        ].join("\n"),
      );
    }
    return null;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const parametryPodpisywane: Record<string, string> = {
    folder: bezpiecznyKatalog(opcje.folder ?? "backups"),
    timestamp: String(Math.floor(Date.now() / 1000)),
    type: "authenticated",
    unique_filename: "1",
    use_filename: "1",
  };
  const podpis = podpiszParametryKopii(parametryPodpisywane, apiSecret);

  const formularz = new FormData();
  for (const [klucz, wartosc] of Object.entries(parametryPodpisywane)) formularz.append(klucz, wartosc);
  formularz.append("api_key", apiKey);
  formularz.append("signature", podpis);
  formularz.append(
    "file",
    new Blob([new Uint8Array(zrzut.bytes)], { type: "application/json" }),
    nazwaPliku,
  );

  try {
    const odpowiedz = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: "POST",
      body: formularz,
      signal: AbortSignal.timeout(opcje.timeoutMs ?? 120_000),
    });
    const tresc = (await odpowiedz.json()) as {
      public_id?: string;
      bytes?: number;
      error?: { message?: string };
    };

    if (!odpowiedz.ok || !tresc.public_id) {
      bledyKopii++;
      console.warn(
        `  ⚠ [kopie] Nie udało się wysłać „${nazwaPliku}”: ${tresc.error?.message ?? `HTTP ${odpowiedz.status}`}`,
      );
      return null;
    }

    wyslaneKopie++;
    return { publicId: tresc.public_id, sizeBytes: tresc.bytes ?? zrzut.bytes.length };
  } catch (blad) {
    bledyKopii++;
    console.warn(
      `  ⚠ [kopie] Błąd sieci przy wysyłce „${nazwaPliku}”: ${blad instanceof Error ? blad.message : String(blad)}`,
    );
    return null;
  }
}

/** Krótkie podsumowanie wysyłki kopii do wypisania na końcu seeda. */
export function podsumowanieKopii(): { wyslane: number; bledy: number; skonfigurowane: boolean } {
  return { wyslane: wyslaneKopie, bledy: bledyKopii, skonfigurowane: czyCloudinarySkonfigurowane() };
}

/** Nazwa pliku zgodna z tym, co przy ręcznej kopii tworzy api/admin/backup/route.ts. */
function nazwaPlikuKopii(kiedy: Date): string {
  return `backup-${kiedy.toISOString().replace(/[:.]/g, "-")}.json`;
}

/**
 * Rejestr kopii zapasowych z ostatnich dziesięciu tygodni — szesnaście pozycji
 * uporządkowanych od najstarszej do najnowszej.
 *
 * Kopie ręczne przypisywane są administratorowi systemu (jedyna rola, która w aplikacji
 * może je tworzyć), nocne — harmonogramowi, bez identyfikatora użytkownika.
 *
 * `zrzut` (opcjonalne) dostarcza zawartość pliku na dzień kopii; gdy jest podane i magazyn
 * jest skonfigurowany, pozycje COMPLETE dostają prawdziwy plik i publicId, a docCount
 * oraz sizeBytes biorą się z tego pliku, nie z harmonogramu. `zapisz` (opcjonalne) jest
 * wołane zaraz po zbudowaniu każdego rekordu — dzięki temu kolejny zrzut widzi już
 * poprzednie pozycje rejestru, tak jak zobaczyłby je zrzut wykonany naprawdę.
 */
export async function zbudujKopieZapasowe(opcje: {
  administratorSystemuId: string;
  administratorSystemuNazwa: string;
  teraz?: Date;
  zrzut?: ((kiedy: Date) => Promise<ZrzutBazy | null>) | undefined;
  zapisz?: (rekord: RekordKopiiZapasowej) => Promise<void>;
}): Promise<RekordKopiiZapasowej[]> {
  const teraz = opcje.teraz ?? new Date();
  const wysylkaMozliwa = Boolean(opcje.zrzut) && czyCloudinarySkonfigurowane();
  const rekordy: RekordKopiiZapasowej[] = [];

  for (const poz of HARMONOGRAM_KOPII) {
    const kiedy = oDniTemu(teraz, poz.dniTemu, poz.godzina, poz.minuta);

    let publicId: string | null = null;
    let sizeBytes = poz.sizeBytes;
    let docCount = poz.docCount;
    let collectionsCount = poz.collectionsCount;

    if (wysylkaMozliwa) {
      const zrzut = await opcje.zrzut!(kiedy);
      if (zrzut) {
        docCount = zrzut.docCount;
        collectionsCount = zrzut.collectionsCount;
        sizeBytes = zrzut.bytes.length;
        // Pozycja nieudana nie odkłada pliku — rejestr zapamiętuje tylko rozmiar zrzutu,
        // którego nie udało się wysłać (tak samo robi api/admin/backup/route.ts w catch).
        if (poz.status === "COMPLETE") {
          const wyslane = await przeslijKopieDoCloudinary(zrzut, nazwaPlikuKopii(kiedy));
          if (wyslane) {
            publicId = wyslane.publicId;
            sizeBytes = wyslane.sizeBytes;
          }
        }
      }
    }

    const rekord: RekordKopiiZapasowej = {
      publicId,
      status: poz.status,
      errorMessage: poz.errorMessage,
      sizeBytes,
      collectionsCount,
      docCount,
      createdById: poz.automatyczna ? null : opcje.administratorSystemuId,
      createdByName: poz.automatyczna ? AUTOR_HARMONOGRAM : opcje.administratorSystemuNazwa,
      createdAt: kiedy,
      updatedAt: kiedy,
    };
    rekordy.push(rekord);
    if (opcje.zapisz) await opcje.zapisz(rekord);
  }

  return rekordy;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3. ZDARZENIA BEZPIECZEŃSTWA W DZIENNIKU AUDYTU
 * ══════════════════════════════════════════════════════════════════════════ */

/** Dane użytkownika potrzebne do opisania go jako sprawcy wpisu. */
export interface UczestnikDziennika {
  id: string;
  shortId: number;
  name: string;
  email: string;
  role: string;
  companyId: string | null;
}

/** Wpis gotowy do `new ActivityLog(wpis).save({ timestamps: false })`. */
export interface WpisDziennikaBezpieczenstwa {
  type: string;
  /** Wartości z LOG_CATEGORIES w models/logs.ts — schemat wymusza je enumem. */
  category: "AUTH" | "SYSTEM" | "CONTACT" | "USER" | "PROPERTY" | "ENQUIRY" | "DOCUMENT";
  messageKey: string;
  messageParams: Record<string, unknown>;
  fallbackText: string;
  actorId: string | null;
  actorShortId: number | null;
  actorName: string | null;
  actorRole: string | null;
  targetType: "User" | "None";
  targetId: string | null;
  targetShortId: number | null;
  userId: string | null;
  userShortId: number | null;
  companyId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UA_PRZEGLADARKA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const UA_TELEFON =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1";
const UA_SKANER = "python-requests/2.31.0";
const UA_CURL = "curl/8.7.1";

/** Adresy publiczne z zakresów dokumentacyjnych i realnych sieci skanujących. */
const IP_BIURO_WARSZAWA = "31.11.180.44";
const IP_BIURO_KRAKOW = "178.42.96.15";
const IP_BIURO_WROCLAW = "89.64.12.7";
const IP_BIURO_GDANSK = "213.5.208.19";
const IP_DOMOWY_AGENTA = "83.11.244.130";
const IP_OBCY = "185.243.115.24";
const IP_SKANERA = "45.148.10.92";
/** Dwie kolejne sieci skanujące — żeby trafienia pułapek nie pochodziły z jednego adresu. */
const IP_SKANERA_AZJA = "103.147.9.61";
const IP_SKANERA_TOR = "171.25.193.78";

interface KontekstWpisu {
  aktor: UczestnikDziennika | null;
  ip: string | null;
  ua: string | null;
  kiedy: Date;
}

function wpis(
  ctx: KontekstWpisu,
  dane: {
    type: string;
    category: WpisDziennikaBezpieczenstwa["category"];
    messageKey: string;
    messageParams: Record<string, unknown>;
    fallbackText: string;
    celUzytkownik?: UczestnikDziennika | null;
    companyId?: string | null;
  },
): WpisDziennikaBezpieczenstwa {
  const cel = dane.celUzytkownik ?? null;
  return {
    type: dane.type,
    category: dane.category,
    messageKey: dane.messageKey,
    messageParams: dane.messageParams,
    fallbackText: dane.fallbackText,
    actorId: ctx.aktor?.id ?? null,
    actorShortId: ctx.aktor?.shortId ?? null,
    actorName: ctx.aktor?.name ?? null,
    actorRole: ctx.aktor?.role ?? null,
    targetType: cel ? "User" : "None",
    targetId: cel?.id ?? null,
    targetShortId: cel?.shortId ?? null,
    userId: cel?.id ?? null,
    userShortId: cel?.shortId ?? null,
    companyId:
      dane.companyId !== undefined ? dane.companyId : (cel?.companyId ?? ctx.aktor?.companyId ?? null),
    ipAddress: ctx.ip,
    userAgent: ctx.ua,
    createdAt: ctx.kiedy,
    updatedAt: ctx.kiedy,
  };
}

/* ── Kontrola DLP: progi i słownictwo ──────────────────────────────────────────
   Progi są przepisane 1:1 z realty-nest/src/lib/security/dlp.ts (THRESHOLDS), więc
   liczby w dzienniku odpowiadają temu, co moduł naprawdę uznaje za ostrzeżenie (>= warn)
   i za blokadę (>= block). Poziom „LOW” tu nie występuje, bo checkDlp() w ogóle nie
   rejestruje zdarzenia poniżej progu ostrzegawczego — zmyślanie takich pozycji
   rozjechałoby demonstrację z zachowaniem modułu. */
const PROGI_DLP = {
  contacts:   { ostrzezenie: 30, blokada: 50,  kategoria: "CONTACT"  as const, mnoga: "kontakty",   dopelniacz: "kontaktów"  },
  properties: { ostrzezenie: 60, blokada: 100, kategoria: "PROPERTY" as const, mnoga: "oferty",     dopelniacz: "ofert"      },
  enquiries:  { ostrzezenie: 40, blokada: 80,  kategoria: "ENQUIRY"  as const, mnoga: "zapytania",  dopelniacz: "zapytań"    },
  documents:  { ostrzezenie: 20, blokada: 50,  kategoria: "DOCUMENT" as const, mnoga: "dokumenty",  dopelniacz: "dokumentów" },
} as const;

type ModulDlp = keyof typeof PROGI_DLP;

/** Poprawna forma rzeczownika po liczebniku: 24 dokumenty, 63 oferty, 31 kontaktów. */
function poLiczebniku(n: number, mnoga: string, dopelniacz: string): string {
  const dziesiatki = n % 100;
  const jednosci = n % 10;
  if (dziesiatki >= 12 && dziesiatki <= 14) return dopelniacz;
  return jednosci >= 2 && jednosci <= 4 ? mnoga : dopelniacz;
}

interface IncydentDlp {
  dniTemu: number;
  godzina: number;
  minuta: number;
  modul: ModulDlp;
  /** Ile rekordów wydało samo zapytanie. */
  wZapytaniu: number;
  /** Ile UNIKALNYCH rekordów zebrało się w oknie pięciu minut — to liczy checkDlp(). */
  wOknie: number;
  ip: string;
  ua: string;
  /** Co użytkownik robił — bez tego wpis jest suchą liczbą. */
  powod: string;
}

/**
 * Wpisy dziennika opisujące zdarzenia bezpieczeństwa z ostatnich dwunastu miesięcy:
 * masowe pobrania zatrzymywane (albo tylko odnotowywane) przez kontrolę DLP, trafienia
 * pułapek adresowych, serie nieudanych logowań wraz z oceną ryzyka, włączenie drugiego
 * składnika oraz logowania TOTP i kodem zapasowym.
 *
 * Rozkład w czasie i różnorodność są tu celowe: panel pokazywał wcześniej osiem
 * identycznych wierszy („ŚREDNI — 47 × zapytania”), bo wszystkie zdarzenia dotyczyły
 * jednego konta, jednego modułu i jednej chwili. Teraz zmieniają się poziom, moduł,
 * liczba rekordów, konto sprawcy, adres IP i data.
 *
 * Zwraca listę uporządkowaną ROSNĄCO po czasie — w takiej kolejności trzeba ją zapisać,
 * żeby numeracja seq i łańcuch skrótów odpowiadały chronologii zdarzeń.
 */
export function zbudujDziennikBezpieczenstwa(opcje: {
  /** admin@nestrealty.pl — broker prowadzący Nest Realty Warszawa. */
  administratorWarszawa: UczestnikDziennika;
  /** admin@krakowpremium.pl — broker prowadzący Kraków Premium Estates. */
  administratorKrakow: UczestnikDziennika;
  /** admin@wroclawcity.pl — konto z włączonym TOTP. */
  administratorWroclaw: UczestnikDziennika;
  /** admin@balticcoast.pl — konto z TOTP i dwoma zużytymi kodami zapasowymi. */
  administratorGdansk: UczestnikDziennika;
  /** agent1@nestrealty.pl — sprawca najświeższego masowego eksportu kontaktów. */
  agentWarszawa: UczestnikDziennika;
  /** agent1@krakowpremium.pl — dwukrotnie przekroczył próg przy przeglądaniu ofert. */
  agentKrakow: UczestnikDziennika;
  /** agent1@balticcoast.pl — pobierał kartotekę i zapytania. */
  agentGdansk: UczestnikDziennika;
  /** manager@wroclawcity.pl — kierownik sprzedaży, raport z kartoteki. */
  kierownikWroclaw: UczestnikDziennika;
  /** Asystent agenta, na którego konto trafiła seria nieudanych logowań. */
  asystent: UczestnikDziennika;
  teraz?: Date;
}): WpisDziennikaBezpieczenstwa[] {
  const teraz = opcje.teraz ?? new Date();
  const {
    administratorWarszawa,
    administratorKrakow,
    administratorWroclaw,
    administratorGdansk,
    agentWarszawa,
    agentKrakow,
    agentGdansk,
    kierownikWroclaw,
    asystent,
  } = opcje;
  const wpisy: WpisDziennikaBezpieczenstwa[] = [];

  /* ══ Kontrola DLP — dwanaście miesięcy masowych pobrań ═══════════════════════
     Każda pozycja to inne konto, inny moduł i inna liczba rekordów. Trzy z nich
     przekraczają próg blokady i dostają dodatkowy wpis SYSTEM_NOTE — dokładnie tak,
     jak zachowuje się aplikacja: najpierw odnotowuje pobranie, potem blokadę. */
  const incydentyDlp: { aktor: UczestnikDziennika; incydent: IncydentDlp }[] = [
    {
      aktor: agentKrakow,
      incydent: {
        dniTemu: 322, godzina: 16, minuta: 5, modul: "properties", wZapytaniu: 40, wOknie: 63,
        ip: IP_BIURO_KRAKOW, ua: UA_PRZEGLADARKA,
        powod: "przeglądanie katalogu ofert stronami po 40 pozycji przed spotkaniem z inwestorem",
      },
    },
    {
      aktor: asystent,
      incydent: {
        dniTemu: 288, godzina: 11, minuta: 40, modul: "documents", wZapytaniu: 12, wOknie: 24,
        ip: IP_BIURO_WARSZAWA, ua: UA_PRZEGLADARKA,
        powod: "kompletowanie teczek do archiwizacji kwartalnej",
      },
    },
    {
      aktor: kierownikWroclaw,
      incydent: {
        dniTemu: 241, godzina: 9, minuta: 12, modul: "contacts", wZapytaniu: 20, wOknie: 34,
        ip: IP_BIURO_WROCLAW, ua: UA_PRZEGLADARKA,
        powod: "raport skuteczności zespołu za poprzedni miesiąc",
      },
    },
    {
      aktor: agentGdansk,
      incydent: {
        dniTemu: 205, godzina: 20, minuta: 48, modul: "enquiries", wZapytaniu: 25, wOknie: 45,
        ip: IP_DOMOWY_AGENTA, ua: UA_TELEFON,
        powod: "wieczorne nadrabianie zaległych zapytań z telefonu",
      },
    },
    {
      aktor: agentKrakow,
      incydent: {
        dniTemu: 176, godzina: 13, minuta: 27, modul: "properties", wZapytaniu: 60, wOknie: 104,
        ip: IP_OBCY, ua: UA_CURL,
        powod: "seryjne zapytania z nieznanego adresu, w tempie nieosiągalnym dla przeglądarki",
      },
    },
    {
      aktor: administratorKrakow,
      incydent: {
        dniTemu: 141, godzina: 18, minuta: 2, modul: "documents", wZapytaniu: 30, wOknie: 52,
        ip: IP_BIURO_KRAKOW, ua: UA_PRZEGLADARKA,
        powod: "próba pobrania całego archiwum umów przed audytem wewnętrznym",
      },
    },
    {
      aktor: agentGdansk,
      incydent: {
        dniTemu: 96, godzina: 10, minuta: 31, modul: "contacts", wZapytaniu: 18, wOknie: 31,
        ip: IP_BIURO_GDANSK, ua: UA_PRZEGLADARKA,
        powod: "przewijanie kartoteki w poszukiwaniu klienta bez zapisanego numeru",
      },
    },
    {
      aktor: asystent,
      incydent: {
        dniTemu: 63, godzina: 22, minuta: 14, modul: "enquiries", wZapytaniu: 45, wOknie: 83,
        ip: IP_OBCY, ua: UA_SKANER,
        powod: "nocne pobieranie listy zapytań skryptem, spoza sieci biura",
      },
    },
    {
      aktor: agentWarszawa,
      incydent: {
        dniTemu: 38, godzina: 15, minuta: 56, modul: "properties", wZapytaniu: 35, wOknie: 71,
        ip: IP_BIURO_WARSZAWA, ua: UA_PRZEGLADARKA,
        powod: "porównywanie cen ofert z sąsiednich dzielnic",
      },
    },
  ];

  for (const { aktor, incydent } of incydentyDlp) {
    const prog = PROGI_DLP[incydent.modul];
    const zablokowany = incydent.wOknie >= prog.blokada;
    const poziom = zablokowany ? "HIGH" : "MEDIUM";
    const kiedy = oDniTemu(teraz, incydent.dniTemu, incydent.godzina, incydent.minuta);
    const ile = (n: number) => `${n} ${poLiczebniku(n, prog.mnoga, prog.dopelniacz)}`;

    wpisy.push(
      wpis(
        { aktor, ip: incydent.ip, ua: incydent.ua, kiedy },
        {
          type: incydent.modul === "contacts" ? "CONTACT_DATA_EXPORTED" : "SYSTEM_NOTE",
          category: prog.kategoria,
          messageKey: incydent.modul === "contacts" ? "log.contact.dataExported" : "log.system.dlpExport",
          messageParams: {
            dataType: incydent.modul,
            count: incydent.wZapytaniu,
            windowCount: incydent.wOknie,
            threshold: prog.ostrzezenie,
            blockThreshold: prog.blokada,
            blocked: zablokowany,
            severity: poziom,
          },
          // Teksty są bezosobowe celowo: imiona agentów losuje seed, więc „Anna Kowalska
          // pobrał” albo „przez Tomasz Wójcik” trafiałoby się co drugi wpis. Kto jest sprawcą,
          // panel i tak pokazuje osobno (actorName), tu wystarczy adres konta.
          fallbackText: zablokowany
            ? `Masowe pobranie danych: ${ile(incydent.wZapytaniu)} w jednym zapytaniu, łącznie ${ile(incydent.wOknie)} ` +
              `w oknie 5 minut — odpowiedź ZABLOKOWANA przez kontrolę DLP (próg blokady ${prog.blokada}). ` +
              `Konto ${aktor.email}, adres ${incydent.ip}; ${incydent.powod}`
            : `Masowe pobranie danych: ${ile(incydent.wZapytaniu)} w jednym zapytaniu, łącznie ${ile(incydent.wOknie)} ` +
              `w oknie 5 minut (próg ostrzegawczy ${prog.ostrzezenie}). ` +
              `Konto ${aktor.email}, adres ${incydent.ip}; ${incydent.powod}`,
          celUzytkownik: aktor,
          companyId: aktor.companyId,
        },
      ),
    );

    if (zablokowany) {
      wpisy.push(
        wpis(
          { aktor, ip: incydent.ip, ua: incydent.ua, kiedy: new Date(kiedy.getTime() + 60_000) },
          {
            type: "SYSTEM_NOTE",
            category: "SYSTEM",
            messageKey: "log.system.dlpBlock",
            messageParams: {
              dataType: incydent.modul,
              recordCount: incydent.wOknie,
              threshold: prog.blokada,
              severity: "HIGH",
            },
            fallbackText:
              `Kontrola DLP zablokowała odpowiedź: ${ile(incydent.wOknie)} pobrane w ciągu 5 minut ` +
              `z adresu ${incydent.ip} (próg blokady ${prog.blokada}) — konto ${aktor.email}`,
            celUzytkownik: aktor,
            companyId: aktor.companyId,
          },
        ),
      );
    }
  }

  /* ══ Pułapki adresowe rozłożone w roku ═══════════════════════════════════════
     Skanowania przychodzą falami z różnych adresów i różnymi narzędziami. Każde
     trafienie to fałszywe 404 po stronie aplikacji i wpis krytyczny w dzienniku. */
  const pulapkiHistoryczne: { dniTemu: number; godzina: number; minuta: number; endpoint: string; metoda: string; ip: string; ua: string }[] = [
    { dniTemu: 297, godzina: 2,  minuta: 18, endpoint: "/api/backup",        metoda: "GET",  ip: IP_SKANERA_AZJA, ua: UA_SKANER },
    { dniTemu: 297, godzina: 2,  minuta: 19, endpoint: "/api/users/dump",    metoda: "GET",  ip: IP_SKANERA_AZJA, ua: UA_SKANER },
    { dniTemu: 198, godzina: 23, minuta: 51, endpoint: "/api/admin/export",  metoda: "POST", ip: IP_SKANERA_TOR,  ua: UA_CURL   },
    { dniTemu: 112, godzina: 4,  minuta: 6,  endpoint: "/api/users/dump",    metoda: "GET",  ip: IP_SKANERA_TOR,  ua: UA_SKANER },
    { dniTemu: 54,  godzina: 1,  minuta: 33, endpoint: "/api/backup",        metoda: "GET",  ip: IP_SKANERA,      ua: UA_CURL   },
  ];
  for (const p of pulapkiHistoryczne) {
    wpisy.push(
      wpis(
        { aktor: null, ip: p.ip, ua: p.ua, kiedy: oDniTemu(teraz, p.dniTemu, p.godzina, p.minuta) },
        {
          type: "SYSTEM_NOTE",
          category: "SYSTEM",
          messageKey: "log.system.honeypot",
          messageParams: { endpoint: p.endpoint, method: p.metoda, ip: p.ip, severity: "CRITICAL" },
          fallbackText: `Pułapka bezpieczeństwa: ${p.metoda} ${p.endpoint} z adresu ${p.ip} (${p.ua}) — odpowiedziano fałszywym 404`,
          companyId: null,
        },
      ),
    );
  }

  /* ══ Serie nieudanych logowań i ocena ryzyka ═════════════════════════════════
     Trzy epizody o różnym natężeniu, na trzech różnych kontach — stąd trzy różne
     wyniki oceny ryzyka (55 / 78 / 85 punktów) zamiast jednego powtórzonego. */
  const epizodyLogowania: {
    cel: UczestnikDziennika;
    dniTemu: number;
    godzina: number;
    minuta: number;
    proby: number;
    punkty: number;
    poziom: "MEDIUM" | "HIGH";
    ip: string;
    ipPoprawnego: string;
    uaPoprawnego: string;
    powody: string[];
    metodaPotwierdzenia: string;
    /** Ile minut po serii nastąpiło poprawne logowanie — bez tego opis rozjeżdżał się z godziną. */
    poMinutach: number;
    opisPotwierdzenia: string;
  }[] = [
    {
      cel: agentKrakow,
      dniTemu: 251, godzina: 12, minuta: 3, proby: 3, punkty: 55, poziom: "MEDIUM",
      ip: IP_SKANERA_AZJA, ipPoprawnego: IP_BIURO_KRAKOW, uaPoprawnego: UA_PRZEGLADARKA,
      powody: ["Nietypowa pora logowania", "3 nieudane próby w ostatnich 10 min"],
      metodaPotwierdzenia: "password",
      poMinutach: 16,
      opisPotwierdzenia: "kilkanaście minut po serii nieudanych prób, z komputera w biurze",
    },
    {
      cel: administratorGdansk,
      dniTemu: 118, godzina: 3, minuta: 41, proby: 4, punkty: 78, poziom: "HIGH",
      ip: IP_SKANERA_TOR, ipPoprawnego: IP_BIURO_GDANSK, uaPoprawnego: UA_PRZEGLADARKA,
      powody: ["Adres z sieci anonimizującej", "Logowanie poza godzinami pracy", "4 nieudane próby w ostatnich 12 min"],
      metodaPotwierdzenia: "email_otp",
      poMinutach: 305,
      opisPotwierdzenia: "tożsamość potwierdzona kodem z poczty dopiero rano, z komputera w biurze",
    },
    {
      cel: asystent,
      dniTemu: 3, godzina: 22, minuta: 58, proby: 5, punkty: 85, poziom: "HIGH",
      ip: IP_OBCY, ipPoprawnego: IP_DOMOWY_AGENTA, uaPoprawnego: UA_TELEFON,
      powody: ["Nowy adres IP", "5 nieudanych prób logowania w ostatnich 15 min"],
      metodaPotwierdzenia: "email_otp",
      poMinutach: 28,
      opisPotwierdzenia: "tożsamość potwierdzona kodem z poczty, adres znany z wcześniejszych logowań",
    },
  ];

  for (const e of epizodyLogowania) {
    for (let i = 0; i < e.proby; i++) {
      wpisy.push(
        wpis(
          { aktor: e.cel, ip: e.ip, ua: UA_PRZEGLADARKA, kiedy: oDniTemu(teraz, e.dniTemu, e.godzina, e.minuta + i) },
          {
            type: "AUTH_LOGIN_FAILED",
            category: "AUTH",
            messageKey: "auth.loginFailed",
            messageParams: { email: e.cel.email, reason: "bad_password", attempt: i + 1, ip: e.ip },
            fallbackText: `Nieudane logowanie na konto ${e.cel.email} z adresu ${e.ip} (próba ${i + 1} z ${e.proby})`,
            celUzytkownik: e.cel,
          },
        ),
      );
    }
    wpisy.push(
      wpis(
        { aktor: e.cel, ip: e.ip, ua: UA_PRZEGLADARKA, kiedy: oDniTemu(teraz, e.dniTemu, e.godzina, e.minuta + e.proby + 1) },
        {
          type: "SYSTEM_NOTE",
          category: "AUTH",
          messageKey: "log.system.riskAssessment",
          messageParams: {
            email: e.cel.email,
            ip: e.ip,
            score: e.punkty,
            level: e.poziom,
            factors: e.powody,
            stepUpRequired: true,
          },
          fallbackText:
            `Ocena ryzyka logowania: ${e.punkty} pkt (${e.poziom}) dla ${e.cel.email} — ` +
            `${e.powody.join(", ").toLowerCase()}; wymuszono dodatkowe potwierdzenie tożsamości`,
          celUzytkownik: e.cel,
        },
      ),
    );
    wpisy.push(
      wpis(
        {
          aktor: e.cel,
          ip: e.ipPoprawnego,
          ua: e.uaPoprawnego,
          kiedy: oDniTemu(teraz, e.dniTemu, e.godzina, e.minuta + e.poMinutach),
        },
        {
          type: "AUTH_LOGIN",
          category: "AUTH",
          messageKey: "auth.login",
          messageParams: { email: e.cel.email, method: e.metodaPotwierdzenia, ip: e.ipPoprawnego },
          fallbackText: `Poprawne logowanie na konto ${e.cel.email} z adresu ${e.ipPoprawnego} — ${e.opisPotwierdzenia}`,
          celUzytkownik: e.cel,
        },
      ),
    );
  }

  /* ══ Drugi składnik: włączenie i późniejsze logowania ════════════════════════
     Daty włączenia są te same, co `twoFactor.enabledAt` zapisane w bazie przez
     zbudujDwuskladnikowe() — dziennik i profil użytkownika mówią to samo. */
  for (const sekret of SEKRETY) {
    const konto =
      sekret.email === administratorWroclaw.email
        ? administratorWroclaw
        : sekret.email === administratorGdansk.email
          ? administratorGdansk
          : null;
    if (!konto) continue;
    wpisy.push(
      wpis(
        {
          aktor: konto,
          ip: konto === administratorWroclaw ? IP_BIURO_WROCLAW : IP_BIURO_GDANSK,
          ua: UA_PRZEGLADARKA,
          kiedy: oDniTemu(teraz, sekret.wlaczoneDniTemu, sekret.godzina, sekret.minuta),
        },
        {
          type: "AUTH_2FA_ENABLED",
          category: "AUTH",
          messageKey: "auth.2faEnabled",
          messageParams: { email: konto.email, method: "totp", backupCodes: sekret.kodyZapasowe.length },
          fallbackText:
            `Włączono logowanie dwuskładnikowe (TOTP) na koncie ${konto.email} — ` +
            `pobrano ${sekret.kodyZapasowe.length} kodów zapasowych`,
          celUzytkownik: konto,
        },
      ),
    );
  }

  /* — Logowanie kodem zapasowym: pierwszy z dwóch zużytych kodów ——————————— */
  wpisy.push(
    wpis(
      { aktor: administratorGdansk, ip: IP_BIURO_GDANSK, ua: UA_PRZEGLADARKA, kiedy: oDniTemu(teraz, 5, 8, 47) },
      {
        type: "AUTH_LOGIN",
        category: "AUTH",
        messageKey: "auth.login",
        messageParams: { email: administratorGdansk.email, method: "2fa_backup" },
        fallbackText: `Logowanie kodem zapasowym na koncie ${administratorGdansk.email} — telefon z aplikacją uwierzytelniającą był niedostępny`,
        celUzytkownik: administratorGdansk,
      },
    ),
  );

  /* — Trafienia pułapek adresowych (skanowanie automatyczne) ————————————————— */
  const pulapki: { endpoint: string; metoda: string; minuta: number; ua: string; ip: string }[] = [
    { endpoint: "/api/users/dump", metoda: "GET", minuta: 41, ua: UA_SKANER, ip: IP_SKANERA },
    { endpoint: "/api/backup", metoda: "GET", minuta: 41, ua: UA_SKANER, ip: IP_SKANERA },
    { endpoint: "/api/admin/export", metoda: "POST", minuta: 43, ua: UA_CURL, ip: IP_SKANERA },
  ];
  for (const p of pulapki) {
    wpisy.push(
      wpis(
        { aktor: null, ip: p.ip, ua: p.ua, kiedy: oDniTemu(teraz, 4, 3, p.minuta) },
        {
          type: "SYSTEM_NOTE",
          category: "SYSTEM",
          messageKey: "log.system.honeypot",
          messageParams: { endpoint: p.endpoint, method: p.metoda, ip: p.ip, severity: "CRITICAL" },
          fallbackText: `Pułapka bezpieczeństwa: ${p.metoda} ${p.endpoint} z adresu ${p.ip} (${p.ua}) — odpowiedziano fałszywym 404`,
          companyId: null,
        },
      ),
    );
  }

  /* — Nocne logowanie administratora Wrocławia drugim składnikiem ——————————— */
  wpisy.push(
    wpis(
      { aktor: administratorWroclaw, ip: IP_BIURO_WROCLAW, ua: UA_PRZEGLADARKA, kiedy: oDniTemu(teraz, 2, 3, 11) },
      {
        type: "AUTH_2FA_FAILED",
        category: "AUTH",
        messageKey: "auth.2faFailed",
        messageParams: { email: administratorWroclaw.email, reason: "bad_totp_code" },
        fallbackText: `Odrzucony kod TOTP przy logowaniu ${administratorWroclaw.email} — kod wygasł`,
        celUzytkownik: administratorWroclaw,
      },
    ),
  );
  wpisy.push(
    wpis(
      { aktor: administratorWroclaw, ip: IP_BIURO_WROCLAW, ua: UA_PRZEGLADARKA, kiedy: oDniTemu(teraz, 2, 3, 12) },
      {
        type: "AUTH_LOGIN",
        category: "AUTH",
        messageKey: "auth.login",
        messageParams: { email: administratorWroclaw.email, method: "2fa_totp" },
        fallbackText: `Logowanie drugim składnikiem (TOTP) o 03:12 na koncie ${administratorWroclaw.email} — poza godzinami pracy`,
        celUzytkownik: administratorWroclaw,
      },
    ),
  );

  /* — Logowanie kodem zapasowym: drugi z dwóch zużytych kodów ———————————————— */
  wpisy.push(
    wpis(
      { aktor: administratorGdansk, ip: IP_BIURO_GDANSK, ua: UA_TELEFON, kiedy: oDniTemu(teraz, 2, 19, 2) },
      {
        type: "AUTH_2FA_FAILED",
        category: "AUTH",
        messageKey: "auth.2faFailed",
        messageParams: { email: administratorGdansk.email, reason: "bad_totp_code" },
        fallbackText: `Odrzucony kod TOTP przy logowaniu ${administratorGdansk.email} — rozjechany zegar telefonu`,
        celUzytkownik: administratorGdansk,
      },
    ),
  );
  wpisy.push(
    wpis(
      { aktor: administratorGdansk, ip: IP_BIURO_GDANSK, ua: UA_TELEFON, kiedy: oDniTemu(teraz, 2, 19, 3) },
      {
        type: "AUTH_LOGIN",
        category: "AUTH",
        messageKey: "auth.login",
        messageParams: { email: administratorGdansk.email, method: "2fa_backup" },
        fallbackText: `Logowanie drugim kodem zapasowym na koncie ${administratorGdansk.email} (pozostało 6 z 8)`,
        celUzytkownik: administratorGdansk,
      },
    ),
  );

  /* — Masowy eksport kontaktów zatrzymany przez kontrolę DLP ————————————————— */
  const eksporty: { minuta: number; liczba: number; laczne: number; zablokowany: boolean }[] = [
    { minuta: 22, liczba: 30, laczne: 30, zablokowany: false },
    { minuta: 24, liczba: 28, laczne: 58, zablokowany: false },
    { minuta: 26, liczba: 16, laczne: 74, zablokowany: true },
  ];
  for (const e of eksporty) {
    wpisy.push(
      wpis(
        { aktor: agentWarszawa, ip: IP_DOMOWY_AGENTA, ua: UA_PRZEGLADARKA, kiedy: oDniTemu(teraz, 1, 14, e.minuta) },
        {
          type: "CONTACT_DATA_EXPORTED",
          category: "CONTACT",
          messageKey: "log.contact.dataExported",
          messageParams: {
            count: e.liczba,
            windowCount: e.laczne,
            dataType: "contacts",
            threshold: PROGI_DLP.contacts.ostrzezenie,
            blockThreshold: PROGI_DLP.contacts.blokada,
            blocked: e.zablokowany,
            severity: e.zablokowany ? "HIGH" : "MEDIUM",
          },
          fallbackText: e.zablokowany
            ? `Eksport ${e.liczba} kontaktów, łącznie ${e.laczne} ${formaRekordow(e.laczne)} w 5 minut — odpowiedź ZABLOKOWANA przez kontrolę DLP (próg blokady 50). Konto ${agentWarszawa.email}`
            : `Eksport ${e.liczba} kontaktów, łącznie ${e.laczne} ${formaRekordow(e.laczne)} w oknie 5 minut (próg ostrzegawczy 30). Konto ${agentWarszawa.email}`,
          companyId: agentWarszawa.companyId,
        },
      ),
    );
  }
  wpisy.push(
    wpis(
      { aktor: agentWarszawa, ip: IP_DOMOWY_AGENTA, ua: UA_PRZEGLADARKA, kiedy: oDniTemu(teraz, 1, 14, 27) },
      {
        type: "SYSTEM_NOTE",
        category: "SYSTEM",
        messageKey: "log.system.dlpBlock",
        messageParams: { dataType: "contacts", recordCount: 74, threshold: 50, severity: "HIGH" },
        fallbackText: `Kontrola DLP zablokowała odpowiedź: 74 unikalne kontakty pobrane w ciągu 5 minut z adresu ${IP_DOMOWY_AGENTA} (próg blokady 50)`,
        celUzytkownik: agentWarszawa,
        companyId: agentWarszawa.companyId,
      },
    ),
  );

  /* — Ostatnia próba skanowania, kilkadziesiąt minut przed seedem ———————————— */
  wpisy.push(
    wpis(
      { aktor: null, ip: IP_SKANERA, ua: UA_SKANER, kiedy: oMinutTemu(teraz, 47) },
      {
        type: "SYSTEM_NOTE",
        category: "SYSTEM",
        messageKey: "log.system.honeypot",
        messageParams: { endpoint: "/api/users/dump", method: "GET", ip: IP_SKANERA, severity: "CRITICAL" },
        fallbackText: `Pułapka bezpieczeństwa: GET /api/users/dump z adresu ${IP_SKANERA} (${UA_SKANER}) — odpowiedziano fałszywym 404`,
        companyId: null,
      },
    ),
  );

  // Administrator Warszawy nie jest sprawcą żadnego incydentu — pojawia się jako konto,
  // które zauważyło blokadę DLP i odnotowało wyjaśnienie. Bez tego wpisu jedyną rolą
  // widoczną przy zdarzeniach DLP byłby agent i asystent.
  wpisy.push(
    wpis(
      { aktor: administratorWarszawa, ip: IP_BIURO_WARSZAWA, ua: UA_PRZEGLADARKA, kiedy: oDniTemu(teraz, 1, 16, 10) },
      {
        type: "SYSTEM_NOTE",
        category: "SYSTEM",
        messageKey: "log.system.dlpReviewed",
        messageParams: { dataType: "contacts", recordCount: 74, outcome: "wyjaśnione", severity: "LOW" },
        fallbackText:
          `Przegląd blokady DLP z godziny 14:27 — pobranie 74 kontaktów okazało się przygotowaniem listy ` +
          `do kampanii mailowej. Konto ${agentWarszawa.email} pozostaje aktywne, progi bez zmian`,
        celUzytkownik: agentWarszawa,
        companyId: administratorWarszawa.companyId,
      },
    ),
  );

  return wpisy.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
