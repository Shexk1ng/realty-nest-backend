// Generator prawdziwych plików PDF do danych demonstracyjnych + wysyłka do Cloudinary.
//
// Po co ten plik istnieje
// -----------------------
// Seed tworzył dotąd rekordy kolekcji `documents` z publicId = null i url = null, więc przycisk
// „pobierz” w panelu kończył się błędem 503/404 (patrz realty-nest/src/app/api/files/route.ts —
// bez publicId trasa zwraca 404, bez kluczy Cloudinary 503). Ten moduł składa realny plik PDF
// z treścią dopasowaną do konkretnej oferty i — jeśli są klucze — odkłada go w magazynie.
//
// Zależności: ŻADNYCH nowych paczek npm. PDF jest składany ręcznie ze struktury obiektów
// (katalog → drzewo stron → strumienie treści + tablica xref), a wysyłka do Cloudinary idzie
// przez podpisane REST API (multipart/form-data + fetch + SHA-1 z node:crypto), bo pakiet
// `cloudinary` jest zależnością aplikacji realty-nest, a nie realty-nest-db.
//
// Konwencje zgodne z realty-nest/src/lib/cloudinary.ts oraz src/app/api/upload/route.ts:
//   resource_type = "raw", type = "authenticated", folder = safeFolder(...), use_filename,
//   unique_filename. Zwracany kształt odpowiada polom modelu ../../models/documents.ts,
//   więc wynik można wprost rozpakować do `new Document({ ... })`.
//
// UWAGA O POLSKICH ZNAKACH (wymóg „zadbaj o kodowanie”)
// -----------------------------------------------------
// Standardowe kodowanie WinAnsiEncoding (cp1252) nie ma kodów dla ą ć ę ł ń ś ź ż, ale
// *glify* o tych nazwach są w komplecie Adobe Standard Latin, który mają wszystkie fonty
// bazowe PDF (Helvetica/Times/Courier). Dlatego zamiast transliterować tekst, moduł deklaruje
// własne kodowanie: /BaseEncoding /WinAnsiEncoding + /Differences, w którym 18 polskich liter
// siedzi pod kodami ISO-8859-2 (ą = 0xB9, ł = 0xB3, ż = 0xBF itd.), a encoder zamienia znaki
// Unicode na te bajty. Efekt: w pliku jest prawdziwe „Świętokrzyska”, nie „Swietokrzyska”.
// Znaki spoza tej mapy (np. cyrylica) i tak przechodzą przez transliterację do ASCII, żeby
// nigdy nie trafił do strumienia bajt bez glifu.
// Gdyby jakaś nietypowa przeglądarka PDF nie podstawiła glifów z /Differences, wystarczy
// uruchomić seed ze zmienną SEED_PDF_TRANSLITERACJA=1 — wtedy cała treść jest transliterowana
// do czystego ASCII (ą→a, ł→l, ż→z, ó→o …) i plik działa nawet w najprostszym czytniku.
// Oba tryby sprawdzono, wyciągając tekst z gotowych plików parserem poppler (`pdftotext -enc
// UTF-8`): w trybie domyślnym diakrytyki wracają poprawnie, a żaden znak nie gubi glifu.
//
// Wszystkie dokumenty są jawnie oznaczone w nagłówku i stopce jako demonstracyjne i pozbawione
// skutków prawnych — to załącznik do pracy magisterskiej, a nie obrót prawdziwymi dokumentami.

import { createHash } from "node:crypto";

/* ────────────────────────────────────────────────────────────────────────────
   1. TYPY PUBLICZNE
   ──────────────────────────────────────────────────────────────────────────── */

export type DokumentRodzaj =
  | "UMOWA_POSREDNICTWA"
  | "AKT_NOTARIALNY"
  | "ZASWIADCZENIE_O_NIEZALEGANIU"
  | "PROTOKOL_ZDAWCZO_ODBIORCZY"
  | "SWIADECTWO_ENERGETYCZNE";

/** Kategorie z modelu ../../models/documents.ts */
export type DokumentKategoria = "CONTRACT" | "LISTING" | "REPORT" | "MARKETING" | "LEGAL" | "OTHER";

/** Podzbiór pól oferty, którego potrzebują szablony. Zgodny z modelem properties.ts. */
export interface NieruchomoscDoDokumentu {
  title: string;
  propertyType?: string | null;
  transactionType?: string | null;
  status?: string | null;
  location?: string | null;
  address?: {
    street?: string | null;
    district?: string | null;
    city?: string | null;
    postalCode?: string | null;
  } | null;
  area?: unknown;
  plotArea?: unknown;
  rooms?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  yearBuilt?: number | null;
  price?: unknown;
  monthlyRent?: unknown;
  heating?: string | null;
  energyClass?: string | null;
  ownership?: string | null;
  condition?: string | null;
}

export interface StronaDokumentu {
  name: string;
  email?: string | null;
  phone?: string | null;
  licenseNumber?: string | null;
}

export interface FirmaDoDokumentu {
  name: string;
  city?: string | null;
  street?: string | null;
  postalCode?: string | null;
  nip?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  licenseNumber?: string | null;
}

export interface KontekstDokumentu {
  rodzaj: DokumentRodzaj;
  firma: FirmaDoDokumentu;
  nieruchomosc: NieruchomoscDoDokumentu;
  /** Agent prowadzący sprawę — reprezentant biura. */
  agent: StronaDokumentu;
  /** Klient (zamawiający / sprzedający / najemca) — zależnie od rodzaju dokumentu. */
  klient: StronaDokumentu;
  /** Druga strona transakcji, jeśli rodzaj dokumentu jej wymaga (kupujący, przyjmujący). */
  kontrahent?: StronaDokumentu | null;
  /** Data widniejąca na dokumencie. Domyślnie „dzisiaj”. */
  data?: Date | null;
}

export interface WygenerowanyDokument {
  rodzaj: DokumentRodzaj;
  /** Numer dokumentu, np. „UP/2026/0042”. */
  numer: string;
  /** Nazwa do pola Document.name — po polsku, z rozszerzeniem. */
  name: string;
  /** Nazwa pliku wysyłanego do magazynu — ASCII, bezpieczna dla Cloudinary. */
  fileName: string;
  category: DokumentKategoria;
  fileType: "PDF";
  mimeType: "application/pdf";
  format: "pdf";
  bytes: Uint8Array;
  sizeBytes: number;
  /** Liczba stron — przydaje się w logach seeda. */
  strony: number;
}

/** Kształt zgodny z polami modelu Document — można wprost rozpakować do `new Document({...})`. */
export interface WynikPrzeslania {
  publicId: string;
  url: string;
  resourceType: "raw";
  deliveryType: "authenticated";
  fileType: "PDF";
  mimeType: string;
  format: string | null;
  originalName: string;
  sizeBytes: number;
}

export const RODZAJE_DOKUMENTOW: readonly DokumentRodzaj[] = [
  "UMOWA_POSREDNICTWA",
  "AKT_NOTARIALNY",
  "ZASWIADCZENIE_O_NIEZALEGANIU",
  "PROTOKOL_ZDAWCZO_ODBIORCZY",
  "SWIADECTWO_ENERGETYCZNE",
] as const;

const OPIS_RODZAJU: Record<DokumentRodzaj, { tytul: string; kategoria: DokumentKategoria; prefiks: string }> = {
  UMOWA_POSREDNICTWA: { tytul: "Umowa pośrednictwa", kategoria: "CONTRACT", prefiks: "UP" },
  AKT_NOTARIALNY: { tytul: "Akt notarialny", kategoria: "LEGAL", prefiks: "REP-A" },
  ZASWIADCZENIE_O_NIEZALEGANIU: { tytul: "Zaświadczenie o niezaleganiu", kategoria: "LEGAL", prefiks: "ZN" },
  PROTOKOL_ZDAWCZO_ODBIORCZY: { tytul: "Protokół zdawczo-odbiorczy", kategoria: "CONTRACT", prefiks: "PZO" },
  SWIADECTWO_ENERGETYCZNE: { tytul: "Świadectwo charakterystyki energetycznej", kategoria: "REPORT", prefiks: "SCHE" },
};

/* ────────────────────────────────────────────────────────────────────────────
   2. KODOWANIE TEKSTU DLA FONTÓW BAZOWYCH PDF
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Kody (ISO-8859-2) → nazwy glifów Adobe. Trafiają do /Differences w słowniku /Encoding.
 * Nadpisywane kody WinAnsi (¡ £ ¦ ¬ ¯ ³ ¶ ¹ ¼ ¿ Æ Ê Ñ æ ê ñ) nie występują w polskich
 * dokumentach, więc podmiana jest bezpieczna. ó/Ó są już w WinAnsi pod 0xF3/0xD3.
 */
const ROZNICE_KODOWANIA: ReadonlyArray<readonly [number, string]> = [
  // 0x81 jest w WinAnsiEncoding nieprzypisane — wykorzystujemy je na „³", którego macierzysty
  // kod 0xB3 zabrało /lslash. Glif threesuperior też należy do Adobe Standard Latin.
  [0x81, "threesuperior"],
  [0xa1, "Aogonek"],
  [0xa3, "Lslash"],
  [0xa6, "Sacute"],
  [0xac, "Zacute"],
  [0xaf, "Zdotaccent"],
  [0xb3, "lslash"],
  [0xb6, "sacute"],
  [0xb9, "aogonek"],
  [0xbc, "zacute"],
  [0xbf, "zdotaccent"],
  [0xc6, "Cacute"],
  [0xca, "Eogonek"],
  [0xd1, "Nacute"],
  [0xe6, "cacute"],
  [0xea, "eogonek"],
  [0xf1, "nacute"],
];

/** Unicode → bajt w naszym kodowaniu (polskie litery + typografia z WinAnsi). */
const MAPA_BAJTOW = new Map<string, number>([
  ["Ą", 0xa1], ["ą", 0xb9],
  ["Ć", 0xc6], ["ć", 0xe6],
  ["Ę", 0xca], ["ę", 0xea],
  ["Ł", 0xa3], ["ł", 0xb3],
  ["Ń", 0xd1], ["ń", 0xf1],
  ["Ó", 0xd3], ["ó", 0xf3],
  ["Ś", 0xa6], ["ś", 0xb6],
  ["Ź", 0xac], ["ź", 0xbc],
  ["Ż", 0xaf], ["ż", 0xbf],
  // typografia dostępna wprost w WinAnsiEncoding
  ["–", 0x96], ["—", 0x97], ["…", 0x85],
  ["„", 0x84], ["”", 0x94], ["“", 0x93],
  ["‚", 0x82], ["‘", 0x91], ["’", 0x92],
  ["§", 0xa7], ["°", 0xb0], ["·", 0xb7], ["•", 0x95], ["²", 0xb2],
  ["³", 0x81], // patrz ROZNICE_KODOWANIA — 0xB3 zajął /lslash
  ["€", 0x80], ["«", 0xab], ["»", 0xbb], ["±", 0xb1], ["×", 0xd7],
]);

/** Transliteracja awaryjna — używana dla znaków spoza mapy oraz w trybie SEED_PDF_TRANSLITERACJA. */
const TRANSLITERACJA: Record<string, string> = {
  Ą: "A", ą: "a", Ć: "C", ć: "c", Ę: "E", ę: "e", Ł: "L", ł: "l", Ń: "N", ń: "n",
  Ó: "O", ó: "o", Ś: "S", ś: "s", Ź: "Z", ź: "z", Ż: "Z", ż: "z",
  "–": "-", "—": "-", "…": "...", "„": '"', "”": '"', "“": '"',
  "‚": "'", "‘": "'", "’": "'", "§": "par.", "·": "*", "•": "-", "²": "2", "³": "3",
  "₂": "2", "◀": "<", "▶": ">", "≥": ">=", "≤": "<=", "→": "->",
  "°": " st.", "±": "+/-", "×": "x", "«": "<<", "»": ">>", "€": "EUR", " ": " ", " ": " ",
};

function transliteruj(tekst: string): string {
  let out = "";
  for (const znak of tekst) {
    const zamiana = TRANSLITERACJA[znak];
    if (zamiana !== undefined) {
      out += zamiana;
      continue;
    }
    if (znak.charCodeAt(0) < 127) {
      out += znak;
      continue;
    }
    const rozlozony = znak.normalize("NFD").replace(/[̀-ͯ]/g, "");
    out += rozlozony.charCodeAt(0) < 127 ? rozlozony : "?";
  }
  return out;
}

function trybTransliteracji(): boolean {
  const v = process.env.SEED_PDF_TRANSLITERACJA;
  return v === "1" || v === "true" || v === "yes";
}

/** Zamienia tekst na bajty zgodne z zadeklarowanym w PDF kodowaniem. */
function naBajtyPdf(tekst: string): number[] {
  const zrodlo = trybTransliteracji() ? transliteruj(tekst) : tekst;
  const bajty: number[] = [];
  for (const znak of zrodlo) {
    const kod = znak.charCodeAt(0);
    if (kod === 0x0a || kod === 0x0d || kod === 0x09) {
      bajty.push(0x20);
      continue;
    }
    if (kod >= 0x20 && kod <= 0x7e) {
      bajty.push(kod);
      continue;
    }
    const zmapowany = MAPA_BAJTOW.get(znak);
    if (zmapowany !== undefined) {
      bajty.push(zmapowany);
      continue;
    }
    for (const zastepczy of transliteruj(znak)) {
      const k = zastepczy.charCodeAt(0);
      bajty.push(k >= 0x20 && k <= 0x7e ? k : 0x3f);
    }
  }
  return bajty;
}

/** Literał tekstowy PDF: `(...)` z ucieczkami, wyłącznie znaki ASCII w wyniku. */
function literalPdf(tekst: string): string {
  let out = "(";
  for (const b of naBajtyPdf(tekst)) {
    if (b === 0x28) out += "\\(";
    else if (b === 0x29) out += "\\)";
    else if (b === 0x5c) out += "\\\\";
    else if (b < 0x20 || b > 0x7e) out += `\\${b.toString(8).padStart(3, "0")}`;
    else out += String.fromCharCode(b);
  }
  return `${out})`;
}

/* ────────────────────────────────────────────────────────────────────────────
   3. METRYKI FONTÓW (Helvetica / Helvetica-Bold, jednostki 1/1000 em)
   ──────────────────────────────────────────────────────────────────────────── */

type Krój = "F1" | "F2" | "F3";

// szerokości znaków ASCII 32..126
const SZEROKOSCI_REGULAR = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
] as const;

const SZEROKOSCI_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
] as const;

/** Litery akcentowane mają szerokość litery bazowej; reszta znaków specjalnych — wprost. */
const SZEROKOSCI_SPECJALNE: Record<string, readonly [number, number]> = {
  "–": [556, 556], "—": [1000, 1000], "…": [1000, 1000],
  "„": [333, 500], "”": [333, 500], "“": [333, 500],
  "‚": [222, 278], "‘": [222, 278], "’": [222, 278],
  "§": [556, 556], "°": [400, 400], "·": [278, 278], "•": [350, 350],
  "²": [333, 333], "³": [333, 333],
  "±": [584, 584], "×": [584, 584], "«": [500, 556], "»": [500, 556], "€": [556, 556],
};

const BAZA_LITERY: Record<string, string> = {
  Ą: "A", ą: "a", Ć: "C", ć: "c", Ę: "E", ę: "e", Ł: "L", ł: "l", Ń: "N", ń: "n",
  Ó: "O", ó: "o", Ś: "S", ś: "s", Ź: "Z", ź: "z", Ż: "Z", ż: "z",
};

function szerokoscZnaku(znak: string, kroj: Krój): number {
  const bold = kroj === "F2";
  const tablica = bold ? SZEROKOSCI_BOLD : SZEROKOSCI_REGULAR;
  const specjalna = SZEROKOSCI_SPECJALNE[znak];
  if (specjalna) return specjalna[bold ? 1 : 0];
  const podstawa = BAZA_LITERY[znak] ?? znak;
  const kod = podstawa.charCodeAt(0);
  if (kod >= 32 && kod <= 126) return tablica[kod - 32] ?? 556;
  return tablica[("x".charCodeAt(0)) - 32] ?? 500;
}

/**
 * Zwraca tekst dokładnie w takiej postaci, w jakiej trafi do strumienia PDF — dzięki temu
 * pomiar szerokości zgadza się z tym, co widać na stronie (także w trybie transliteracji,
 * gdzie „§" zamienia się na dłuższe „par.").
 */
function tekstDoPomiaru(tekst: string): string {
  if (trybTransliteracji()) return transliteruj(tekst);
  let out = "";
  for (const znak of tekst) {
    const kod = znak.charCodeAt(0);
    out += kod >= 0x20 && kod <= 0x7e ? znak : MAPA_BAJTOW.has(znak) ? znak : transliteruj(znak);
  }
  return out;
}

function szerokoscTekstu(tekst: string, kroj: Krój, rozmiar: number): number {
  let suma = 0;
  for (const znak of tekstDoPomiaru(tekst)) suma += szerokoscZnaku(znak, kroj);
  return (suma * rozmiar) / 1000;
}

function zawinTekst(tekst: string, szerokosc: number, kroj: Krój, rozmiar: number): string[] {
  const linie: string[] = [];
  for (const akapit of tekst.split("\n")) {
    const slowa = akapit.split(/\s+/).filter(Boolean);
    if (slowa.length === 0) {
      linie.push("");
      continue;
    }
    let biezaca = "";
    for (const slowo of slowa) {
      const kandydat = biezaca ? `${biezaca} ${slowo}` : slowo;
      if (szerokoscTekstu(kandydat, kroj, rozmiar) <= szerokosc || !biezaca) {
        biezaca = kandydat;
      } else {
        linie.push(biezaca);
        biezaca = slowo;
      }
    }
    if (biezaca) linie.push(biezaca);
  }
  return linie;
}

/* ────────────────────────────────────────────────────────────────────────────
   4. SKŁADANIE PLIKU PDF
   ──────────────────────────────────────────────────────────────────────────── */

const A4 = { szerokosc: 595.28, wysokosc: 841.89 };
const MARGINES = { lewy: 56, prawy: 56 };
const SZEROKOSC_TRESCI = A4.szerokosc - MARGINES.lewy - MARGINES.prawy;
const PRAWA_KRAWEDZ = A4.szerokosc - MARGINES.prawy;
const GORA_TRESCI = A4.wysokosc - 82;
const DOL_TRESCI = 84;

const CZARNY = "0.13 0.15 0.18";
const SZARY = "0.42 0.46 0.51";
const JASNY_SZARY = "0.62 0.66 0.70";
const AKCENT = "0.11 0.35 0.55";
const TLO_TABELI = "0.94 0.95 0.97";
const LINIA = "0.78 0.81 0.85";

const num = (v: number): string => (Math.round(v * 100) / 100).toString();

interface StronaPdf {
  ops: string[];
}

interface OpcjeAkapitu {
  kroj?: Krój;
  rozmiar?: number;
  kolor?: string;
  interlinia?: number;
  odstepPo?: number;
  wciecie?: number;
  wyrownanie?: "left" | "center" | "right";
}

class BudowniczyPdf {
  private readonly strony: StronaPdf[] = [];
  private y = GORA_TRESCI;

  constructor(
    private readonly naglowekLewy: string,
    private readonly naglowekPrawy: string,
    private readonly stopkaLewa: string,
    private readonly tytulPdf: string,
    private readonly autorPdf: string,
    private readonly dataUtworzenia: Date,
  ) {
    this.nowaStrona();
  }

  get liczbaStron(): number {
    return this.strony.length;
  }

  private get biezaca(): StronaPdf {
    return this.strony[this.strony.length - 1]!;
  }

  private op(fragment: string): void {
    this.biezaca.ops.push(fragment);
  }

  private tekstNaPozycji(
    tekst: string,
    x: number,
    y: number,
    kroj: Krój,
    rozmiar: number,
    kolor: string,
  ): void {
    if (!tekst) return;
    this.op(`${kolor} rg BT /${kroj} ${num(rozmiar)} Tf 1 0 0 1 ${num(x)} ${num(y)} Tm ${literalPdf(tekst)} Tj ET`);
  }

  private linia(x1: number, y1: number, x2: number, y2: number, kolor = LINIA, grubosc = 0.6): void {
    this.op(`${num(grubosc)} w ${kolor} RG ${num(x1)} ${num(y1)} m ${num(x2)} ${num(y2)} l S`);
  }

  private prostokat(x: number, y: number, w: number, h: number, kolor: string): void {
    this.op(`${kolor} rg ${num(x)} ${num(y)} ${num(w)} ${num(h)} re f`);
  }

  private nowaStrona(): void {
    this.strony.push({ ops: [] });
    this.y = GORA_TRESCI;
    // pasek nagłówka
    this.prostokat(MARGINES.lewy, A4.wysokosc - 47, 3, 13, AKCENT);
    this.tekstNaPozycji(this.naglowekLewy, MARGINES.lewy + 9, A4.wysokosc - 44, "F2", 9.5, CZARNY);
    const szer = szerokoscTekstu(this.naglowekPrawy, "F1", 8.5);
    this.tekstNaPozycji(this.naglowekPrawy, PRAWA_KRAWEDZ - szer, A4.wysokosc - 44, "F1", 8.5, SZARY);
    this.linia(MARGINES.lewy, A4.wysokosc - 54, PRAWA_KRAWEDZ, A4.wysokosc - 54);
  }

  /** Zapewnia miejsce na blok o wysokości `wysokosc`, w razie potrzeby łamiąc stronę. */
  private zapewnMiejsce(wysokosc: number): void {
    if (this.y - wysokosc < DOL_TRESCI) this.nowaStrona();
  }

  odstep(h: number): void {
    this.y -= h;
  }

  tytul(tekst: string, podtytul?: string | null): void {
    this.zapewnMiejsce(60);
    const linie = zawinTekst(tekst, SZEROKOSC_TRESCI, "F2", 17);
    for (const l of linie) {
      const szer = szerokoscTekstu(l, "F2", 17);
      this.tekstNaPozycji(l, MARGINES.lewy + (SZEROKOSC_TRESCI - szer) / 2, this.y - 17, "F2", 17, CZARNY);
      this.y -= 21;
    }
    if (podtytul) {
      this.y -= 3;
      const szer = szerokoscTekstu(podtytul, "F1", 10);
      this.tekstNaPozycji(podtytul, MARGINES.lewy + (SZEROKOSC_TRESCI - szer) / 2, this.y - 10, "F1", 10, SZARY);
      this.y -= 15;
    }
    this.y -= 6;
    this.linia(MARGINES.lewy + SZEROKOSC_TRESCI / 2 - 40, this.y, MARGINES.lewy + SZEROKOSC_TRESCI / 2 + 40, this.y, AKCENT, 1.2);
    this.y -= 18;
  }

  paragraf(numerParagrafu: number, tytulParagrafu: string): void {
    this.zapewnMiejsce(34);
    this.y -= 8;
    const etykieta = `§ ${numerParagrafu}`;
    this.tekstNaPozycji(etykieta, MARGINES.lewy, this.y - 11, "F2", 11, AKCENT);
    const przesuniecie = szerokoscTekstu(etykieta, "F2", 11) + 8;
    const linie = zawinTekst(tytulParagrafu, SZEROKOSC_TRESCI - przesuniecie, "F2", 11);
    linie.forEach((l, i) => {
      this.tekstNaPozycji(l, MARGINES.lewy + przesuniecie, this.y - 11 - i * 14, "F2", 11, CZARNY);
    });
    this.y -= 11 + (linie.length - 1) * 14 + 10;
  }

  naglowekSekcji(tekst: string): void {
    this.zapewnMiejsce(30);
    this.y -= 8;
    this.tekstNaPozycji(tekst.toUpperCase(), MARGINES.lewy, this.y - 9, "F2", 9, AKCENT);
    this.y -= 13;
    this.linia(MARGINES.lewy, this.y, PRAWA_KRAWEDZ, this.y);
    this.y -= 12;
  }

  akapit(tekst: string, opcje: OpcjeAkapitu = {}): void {
    const kroj = opcje.kroj ?? "F1";
    const rozmiar = opcje.rozmiar ?? 9.5;
    const kolor = opcje.kolor ?? CZARNY;
    const interlinia = opcje.interlinia ?? rozmiar * 1.45;
    const wciecie = opcje.wciecie ?? 0;
    const szerokosc = SZEROKOSC_TRESCI - wciecie;
    const linie = zawinTekst(tekst, szerokosc, kroj, rozmiar);
    for (const l of linie) {
      this.zapewnMiejsce(interlinia);
      let x = MARGINES.lewy + wciecie;
      if (opcje.wyrownanie === "center") x += (szerokosc - szerokoscTekstu(l, kroj, rozmiar)) / 2;
      else if (opcje.wyrownanie === "right") x += szerokosc - szerokoscTekstu(l, kroj, rozmiar);
      this.tekstNaPozycji(l, x, this.y - rozmiar, kroj, rozmiar, kolor);
      this.y -= interlinia;
    }
    this.y -= opcje.odstepPo ?? 6;
  }

  lista(pozycje: readonly string[], numerowana = false): void {
    const rozmiar = 9.5;
    pozycje.forEach((pozycja, idx) => {
      const znacznik = numerowana ? `${idx + 1}.` : "•";
      const przesuniecie = numerowana ? 20 : 14;
      const linie = zawinTekst(pozycja, SZEROKOSC_TRESCI - przesuniecie - 6, "F1", rozmiar);
      this.zapewnMiejsce(linie.length * rozmiar * 1.4 + 3);
      this.tekstNaPozycji(znacznik, MARGINES.lewy + 4, this.y - rozmiar, "F1", rozmiar, AKCENT);
      linie.forEach((l, i) => {
        this.tekstNaPozycji(l, MARGINES.lewy + przesuniecie + 4, this.y - rozmiar - i * rozmiar * 1.4, "F1", rozmiar, CZARNY);
      });
      this.y -= linie.length * rozmiar * 1.4 + 3;
    });
    this.y -= 5;
  }

  /** Dwukolumnowa lista „etykieta → wartość”. */
  pary(wiersze: ReadonlyArray<readonly [string, string]>): void {
    const rozmiar = 9;
    const szerEtykiety = 162;
    const interlinia = rozmiar * 1.45;
    for (const [etykieta, wartosc] of wiersze) {
      // etykieta też się zawija — inaczej długie nazwy pól nachodziłyby na kolumnę wartości
      const linieEtykiety = zawinTekst(etykieta, szerEtykiety - 10, "F1", rozmiar);
      const linieWartosci = zawinTekst(wartosc, SZEROKOSC_TRESCI - szerEtykiety - 6, "F1", rozmiar);
      const wysokosc = Math.max(1, linieEtykiety.length, linieWartosci.length) * interlinia + 2;
      this.zapewnMiejsce(wysokosc);
      linieEtykiety.forEach((l, i) => {
        this.tekstNaPozycji(l, MARGINES.lewy, this.y - rozmiar - i * interlinia, "F1", rozmiar, SZARY);
      });
      linieWartosci.forEach((l, i) => {
        this.tekstNaPozycji(l, MARGINES.lewy + szerEtykiety, this.y - rozmiar - i * interlinia, "F2", rozmiar, CZARNY);
      });
      this.y -= wysokosc;
    }
    this.y -= 6;
  }

  tabela(
    naglowki: readonly string[],
    wiersze: ReadonlyArray<readonly string[]>,
    udzialy: readonly number[],
    wyrownaniaProcent: readonly boolean[] = [],
  ): void {
    const rozmiar = 8.5;
    const sumaUdzialow = udzialy.reduce((a, b) => a + b, 0);
    const szerokosci = udzialy.map((u) => (u / sumaUdzialow) * SZEROKOSC_TRESCI);
    const wysokoscWiersza = 17;

    const rysujNaglowek = (): void => {
      this.zapewnMiejsce(wysokoscWiersza + 4);
      this.prostokat(MARGINES.lewy, this.y - wysokoscWiersza + 3, SZEROKOSC_TRESCI, wysokoscWiersza, TLO_TABELI);
      let x = MARGINES.lewy;
      naglowki.forEach((naglowek, i) => {
        const szer = szerokosci[i] ?? 60;
        const doPrawej = wyrownaniaProcent[i] === true;
        const tekstX = doPrawej ? x + szer - szerokoscTekstu(naglowek, "F2", rozmiar) - 6 : x + 6;
        this.tekstNaPozycji(naglowek, tekstX, this.y - rozmiar - 2, "F2", rozmiar, CZARNY);
        x += szer;
      });
      this.y -= wysokoscWiersza + 1;
    };

    rysujNaglowek();
    for (const wiersz of wiersze) {
      const linieKomorek = wiersz.map((komorka, i) =>
        zawinTekst(komorka, (szerokosci[i] ?? 60) - 12, "F1", rozmiar),
      );
      const liczbaLinii = Math.max(1, ...linieKomorek.map((l) => l.length));
      const wysokosc = Math.max(wysokoscWiersza, liczbaLinii * rozmiar * 1.35 + 7);
      if (this.y - wysokosc < DOL_TRESCI) {
        this.nowaStrona();
        rysujNaglowek();
      }
      let x = MARGINES.lewy;
      linieKomorek.forEach((linie, i) => {
        const szer = szerokosci[i] ?? 60;
        const doPrawej = wyrownaniaProcent[i] === true;
        linie.forEach((l, j) => {
          const tekstX = doPrawej ? x + szer - szerokoscTekstu(l, "F1", rozmiar) - 6 : x + 6;
          this.tekstNaPozycji(l, tekstX, this.y - rozmiar - 3 - j * rozmiar * 1.35, "F1", rozmiar, CZARNY);
        });
        x += szer;
      });
      this.y -= wysokosc;
      this.linia(MARGINES.lewy, this.y + 2, PRAWA_KRAWEDZ, this.y + 2);
    }
    this.y -= 10;
  }

  ramkaInformacyjna(tekst: string): void {
    const rozmiar = 8.5;
    const linie = zawinTekst(tekst, SZEROKOSC_TRESCI - 26, "F1", rozmiar);
    const wysokosc = linie.length * rozmiar * 1.4 + 16;
    this.zapewnMiejsce(wysokosc + 6);
    this.prostokat(MARGINES.lewy, this.y - wysokosc, SZEROKOSC_TRESCI, wysokosc, TLO_TABELI);
    this.prostokat(MARGINES.lewy, this.y - wysokosc, 2.5, wysokosc, AKCENT);
    linie.forEach((l, i) => {
      this.tekstNaPozycji(l, MARGINES.lewy + 14, this.y - 13 - i * rozmiar * 1.4, "F1", rozmiar, CZARNY);
    });
    this.y -= wysokosc + 10;
  }

  podpisy(lewyOpis: string, prawyOpis: string, lewaOsoba?: string | null, prawaOsoba?: string | null): void {
    this.zapewnMiejsce(64);
    this.y -= 26;
    const szerKolumny = (SZEROKOSC_TRESCI - 40) / 2;
    const kolumny: ReadonlyArray<readonly [number, string, string | null]> = [
      [MARGINES.lewy, lewyOpis, lewaOsoba ?? null],
      [MARGINES.lewy + szerKolumny + 40, prawyOpis, prawaOsoba ?? null],
    ];
    for (const [x, opis, osoba] of kolumny) {
      this.linia(x, this.y, x + szerKolumny, this.y, JASNY_SZARY, 0.8);
      const opisSzer = szerokoscTekstu(opis, "F1", 8);
      this.tekstNaPozycji(opis, x + (szerKolumny - opisSzer) / 2, this.y - 11, "F1", 8, SZARY);
      if (osoba) {
        const osobaSzer = szerokoscTekstu(osoba, "F2", 8.5);
        this.tekstNaPozycji(osoba, x + (szerKolumny - osobaSzer) / 2, this.y - 23, "F2", 8.5, CZARNY);
      }
    }
    this.y -= 34;
  }

  /** Dopisuje stopki (znają dopiero teraz łączną liczbę stron) i serializuje plik. */
  zbuduj(): Uint8Array {
    const razem = this.strony.length;
    this.strony.forEach((strona, idx) => {
      const ops = strona.ops;
      ops.push(`0.6 w ${LINIA} RG ${num(MARGINES.lewy)} 64 m ${num(PRAWA_KRAWEDZ)} 64 l S`);
      ops.push(
        `${JASNY_SZARY} rg BT /F1 7.2 Tf 1 0 0 1 ${num(MARGINES.lewy)} 52 Tm ${literalPdf(this.stopkaLewa)} Tj ET`,
      );
      ops.push(
        `${JASNY_SZARY} rg BT /F1 7.2 Tf 1 0 0 1 ${num(MARGINES.lewy)} 42 Tm ${literalPdf(
          "Dokument demonstracyjny wygenerowany przez system Realty Nest — dane fikcyjne, dokument nie wywołuje skutków prawnych.",
        )} Tj ET`,
      );
      const numeracja = `Strona ${idx + 1} z ${razem}`;
      const szer = szerokoscTekstu(numeracja, "F1", 7.2);
      ops.push(
        `${JASNY_SZARY} rg BT /F1 7.2 Tf 1 0 0 1 ${num(PRAWA_KRAWEDZ - szer)} 52 Tm ${literalPdf(numeracja)} Tj ET`,
      );
    });
    return serializujPdf(this.strony, {
      tytul: this.tytulPdf,
      autor: this.autorPdf,
      data: this.dataUtworzenia,
    });
  }
}

function dataPdf(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `D:${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}${p(
    d.getUTCMinutes(),
  )}${p(d.getUTCSeconds())}Z`;
}

function serializujPdf(
  strony: readonly StronaPdf[],
  meta: { tytul: string; autor: string; data: Date },
): Uint8Array {
  const liczbaStron = strony.length;
  // numeracja obiektów: 1 katalog, 2 drzewo stron, 3-5 fonty, 6 kodowanie, 7 info,
  // dalej parami: strona i jej strumień treści
  const PIERWSZY_OBIEKT_STRONY = 8;
  const idStrony = (i: number) => PIERWSZY_OBIEKT_STRONY + i * 2;
  const idTresci = (i: number) => PIERWSZY_OBIEKT_STRONY + i * 2 + 1;
  const liczbaObiektow = 7 + liczbaStron * 2;

  const ciala: string[] = new Array<string>(liczbaObiektow).fill("");
  const ustaw = (numerObiektu: number, cialo: string): void => {
    ciala[numerObiektu - 1] = cialo;
  };

  const kids = strony.map((_, i) => `${idStrony(i)} 0 R`).join(" ");
  ustaw(1, "<< /Type /Catalog /Pages 2 0 R >>");
  ustaw(2, `<< /Type /Pages /Kids [${kids}] /Count ${liczbaStron} >>`);
  ustaw(3, "<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica /Encoding 6 0 R >>");
  ustaw(4, "<< /Type /Font /Subtype /Type1 /Name /F2 /BaseFont /Helvetica-Bold /Encoding 6 0 R >>");
  ustaw(5, "<< /Type /Font /Subtype /Type1 /Name /F3 /BaseFont /Helvetica-Oblique /Encoding 6 0 R >>");

  const roznice = ROZNICE_KODOWANIA.map(([kod, glif]) => `${kod} /${glif}`).join(" ");
  ustaw(6, `<< /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [${roznice}] >>`);

  ustaw(
    7,
    `<< /Title ${literalPdf(meta.tytul)} /Author ${literalPdf(meta.autor)} ` +
      `/Subject ${literalPdf("Dokument demonstracyjny — dane fikcyjne")} ` +
      `/Creator ${literalPdf("Realty Nest — generator danych demonstracyjnych")} ` +
      `/Producer ${literalPdf("Realty Nest seed (dokumenty.ts)")} ` +
      `/CreationDate (${dataPdf(meta.data)}) /ModDate (${dataPdf(meta.data)}) >>`,
  );

  strony.forEach((strona, i) => {
    const tresc = strona.ops.join("\n");
    ustaw(
      idStrony(i),
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(A4.szerokosc)} ${num(A4.wysokosc)}] ` +
        `/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> /ProcSet [/PDF /Text] >> ` +
        `/Contents ${idTresci(i)} 0 R >>`,
    );
    ustaw(idTresci(i), `<< /Length ${tresc.length} >>\nstream\n${tresc}\nendstream`);
  });

  const fragmenty: string[] = [];
  let offset = 0;
  const dopisz = (s: string): void => {
    fragmenty.push(s);
    offset += s.length; // wszystkie fragmenty są latin1 → 1 znak = 1 bajt
  };

  dopisz("%PDF-1.7\n");
  dopisz(`%${String.fromCharCode(0xe2, 0xe3, 0xcf, 0xd3)}\n`);

  const offsety: number[] = new Array<number>(liczbaObiektow).fill(0);
  ciala.forEach((cialo, idx) => {
    offsety[idx] = offset;
    dopisz(`${idx + 1} 0 obj\n${cialo}\nendobj\n`);
  });

  const offsetXref = offset;
  let xref = `xref\n0 ${liczbaObiektow + 1}\n0000000000 65535 f \n`;
  for (const o of offsety) xref += `${String(o).padStart(10, "0")} 00000 n \n`;
  dopisz(xref);

  const odcisk = createHash("md5").update(fragmenty.join(""), "latin1").digest("hex").toUpperCase();
  dopisz(
    `trailer\n<< /Size ${liczbaObiektow + 1} /Root 1 0 R /Info 7 0 R /ID [<${odcisk}> <${odcisk}>] >>\n` +
      `startxref\n${offsetXref}\n%%EOF\n`,
  );

  return new Uint8Array(Buffer.from(fragmenty.join(""), "latin1"));
}

/* ────────────────────────────────────────────────────────────────────────────
   5. POMOCNICZE: LICZBY, DATY, DETERMINISTYCZNY LOSOWNIK
   ──────────────────────────────────────────────────────────────────────────── */

function liczba(v: unknown, domyslna = 0): number {
  if (v === null || v === undefined) return domyslna;
  if (typeof v === "number") return Number.isFinite(v) ? v : domyslna;
  const n = Number(typeof v === "object" ? String(v) : v);
  return Number.isFinite(n) ? n : domyslna;
}

function formatujLiczbe(v: number, miejsca = 0): string {
  const zaokraglona = miejsca > 0 ? v.toFixed(miejsca) : String(Math.round(v));
  const [calosc = "0", ulamek] = zaokraglona.split(".");
  const zGrupami = calosc.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return ulamek ? `${zGrupami},${ulamek}` : zGrupami;
}

const zl = (v: number, miejsca = 2): string => `${formatujLiczbe(v, miejsca)} zł`;

/* Liczebniki polskie — akt notarialny musi podawać cenę słownie. */
const JEDNOSCI = ["", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć"] as const;
const NASCIE = [
  "dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście",
  "piętnaście", "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście",
] as const;
const DZIESIATKI = [
  "", "", "dwadzieścia", "trzydzieści", "czterdzieści",
  "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt",
] as const;
const SETKI = [
  "", "sto", "dwieście", "trzysta", "czterysta",
  "pięćset", "sześćset", "siedemset", "osiemset", "dziewięćset",
] as const;
const GRUPY: ReadonlyArray<readonly [string, string, string]> = [
  ["", "", ""],
  ["tysiąc", "tysiące", "tysięcy"],
  ["milion", "miliony", "milionów"],
  ["miliard", "miliardy", "miliardów"],
];

/** 0 = liczba pojedyncza, 1 = mnoga „2–4", 2 = dopełniacz mnogi. */
function formaLiczebnika(n: number): 0 | 1 | 2 {
  if (n === 1) return 0;
  const jednosci = n % 10;
  const dziesiatki = n % 100;
  if (jednosci >= 2 && jednosci <= 4 && !(dziesiatki >= 12 && dziesiatki <= 14)) return 1;
  return 2;
}

function trzycyfrowaSlownie(n: number): string {
  const czesci: string[] = [];
  const s = Math.floor(n / 100);
  const reszta = n % 100;
  if (s > 0) czesci.push(SETKI[s]!);
  if (reszta >= 10 && reszta <= 19) czesci.push(NASCIE[reszta - 10]!);
  else {
    const d = Math.floor(reszta / 10);
    const j = reszta % 10;
    if (d > 0) czesci.push(DZIESIATKI[d]!);
    if (j > 0) czesci.push(JEDNOSCI[j]!);
  }
  return czesci.join(" ");
}

/** „1 042 000" → „jeden milion czterdzieści dwa tysiące złotych". */
function slownieZlote(kwota: number): string {
  let reszta = Math.floor(Math.abs(kwota));
  if (reszta === 0) return "zero złotych";
  const grupy: number[] = [];
  while (reszta > 0) {
    grupy.push(reszta % 1000);
    reszta = Math.floor(reszta / 1000);
  }
  const slowa: string[] = [];
  for (let i = grupy.length - 1; i >= 0; i--) {
    const g = grupy[i]!;
    if (g === 0) continue;
    if (i === 0) {
      slowa.push(trzycyfrowaSlownie(g));
      continue;
    }
    const nazwa = GRUPY[i]?.[formaLiczebnika(g)] ?? "";
    slowa.push(g === 1 ? nazwa : `${trzycyfrowaSlownie(g)} ${nazwa}`);
  }
  const waluta = ["złoty", "złote", "złotych"][formaLiczebnika(Math.floor(Math.abs(kwota)))] ?? "złotych";
  return `${slowa.join(" ")} ${waluta}`;
}

const MIESIACE_DOPELNIACZ = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
] as const;

function formatujDate(d: Date): string {
  return `${d.getDate()} ${MIESIACE_DOPELNIACZ[d.getMonth()]} ${d.getFullYear()} r.`;
}

function formatujDateKrotko(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function przesunDni(d: Date, dni: number): Date {
  return new Date(d.getTime() + dni * 86_400_000);
}

function skrot(tekst: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < tekst.length; i++) {
    h ^= tekst.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Deterministyczny generator — te same dane wejściowe dają ten sam dokument. */
function losownik(ziarno: string): () => number {
  let stan = skrot(ziarno) || 1;
  return () => {
    stan = (stan + 0x6d2b79f5) >>> 0;
    let t = stan;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function zakres(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function wybierz<T>(rng: () => number, tablica: readonly T[]): T {
  return tablica[zakres(rng, 0, tablica.length - 1)]!;
}

function doAscii(tekst: string): string {
  return transliteruj(tekst)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/* ────────────────────────────────────────────────────────────────────────────
   6. SŁOWNIKI DZIEDZINOWE
   ──────────────────────────────────────────────────────────────────────────── */

const TYP_PL: Record<string, string> = {
  APARTMENT: "lokal mieszkalny",
  HOUSE: "budynek mieszkalny jednorodzinny",
  STUDIO: "lokal mieszkalny (kawalerka)",
  OFFICE: "lokal biurowy",
  COMMERCIAL: "lokal użytkowy",
  PLOT: "nieruchomość gruntowa niezabudowana",
  GARAGE: "garaż / miejsce postojowe",
  ROOM: "pokój w lokalu mieszkalnym",
};

const TYP_KROTKO: Record<string, string> = {
  APARTMENT: "mieszkanie",
  HOUSE: "dom",
  STUDIO: "kawalerka",
  OFFICE: "biuro",
  COMMERCIAL: "lokal użytkowy",
  PLOT: "działka",
  GARAGE: "garaż",
  ROOM: "pokój",
};

const WLASNOSC_PL: Record<string, string> = {
  FULL_OWNERSHIP: "prawo własności",
  COOPERATIVE: "spółdzielcze własnościowe prawo do lokalu",
  COOPERATIVE_LAND: "spółdzielcze prawo do lokalu na gruncie w użytkowaniu wieczystym",
  SHARE: "udział we współwłasności nieruchomości",
};

const OGRZEWANIE_PL: Record<string, string> = {
  DISTRICT: "miejska sieć ciepłownicza",
  GAS: "kocioł gazowy kondensacyjny",
  ELECTRIC: "ogrzewanie elektryczne",
  HEAT_PUMP: "pompa ciepła powietrze-woda",
  SOLID_FUEL: "kocioł na paliwo stałe",
  COAL: "kocioł na paliwo stałe",
  SOLAR: "instalacja solarna ze wspomaganiem elektrycznym",
  OTHER: "inne źródło ciepła",
};

const STAN_PL: Record<string, string> = {
  READY_TO_MOVE: "do zamieszkania",
  GOOD: "dobry",
  AFTER_RENOVATION: "po remoncie",
  TO_RENOVATE: "do remontu",
  FOR_FINISHING: "do wykończenia",
  DEVELOPER_STATE: "stan deweloperski",
};

/** Miejscownik nazw miast — „w Krakowie", nie „w Kraków". */
const MIEJSCOWNIK_MIAST: Record<string, string> = {
  Warszawa: "Warszawie",
  Kraków: "Krakowie",
  Wrocław: "Wrocławiu",
  Gdańsk: "Gdańsku",
  Gdynia: "Gdyni",
  Sopot: "Sopocie",
  Poznań: "Poznaniu",
  Łódź: "Łodzi",
  Katowice: "Katowicach",
  Szczecin: "Szczecinie",
  Lublin: "Lublinie",
  Białystok: "Białymstoku",
};

/** Zwraca formę miejscownika, a dla nieznanego miasta bezpieczne „w mieście X". */
function wMiescie(miasto: string): string {
  const forma = MIEJSCOWNIK_MIAST[miasto];
  return forma ? `w ${forma}` : `w mieście ${miasto}`;
}

const SADY_REJONOWE: Record<string, { sad: string; wydzial: string; kod: string }> = {
  Warszawa: { sad: "Sąd Rejonowy dla Warszawy-Mokotowa w Warszawie", wydzial: "XIII Wydział Ksiąg Wieczystych", kod: "WA1M" },
  Kraków: { sad: "Sąd Rejonowy dla Krakowa-Podgórza w Krakowie", wydzial: "IV Wydział Ksiąg Wieczystych", kod: "KR2P" },
  Wrocław: { sad: "Sąd Rejonowy dla Wrocławia-Krzyków we Wrocławiu", wydzial: "IV Wydział Ksiąg Wieczystych", kod: "WR1K" },
  Gdańsk: { sad: "Sąd Rejonowy Gdańsk-Północ w Gdańsku", wydzial: "III Wydział Ksiąg Wieczystych", kod: "GD1G" },
};

const NOTARIUSZE = [
  "Agnieszka Wróblewska",
  "Marcin Zawadzki",
  "Elżbieta Sikorska",
  "Paweł Głowacki",
  "Joanna Michalak",
  "Tomasz Baran",
] as const;

const AUDYTORZY = [
  "Katarzyna Dębska",
  "Rafał Ostrowski",
  "Monika Jaworska",
  "Sebastian Piątek",
] as const;

const ZARZADCY = [
  "Administrator Nieruchomości „Kamienica” Sp. z o.o.",
  "Zarząd Wspólnoty Mieszkaniowej",
  "Biuro Zarządzania Nieruchomościami PROMYK Sp. z o.o.",
  "Spółdzielnia Mieszkaniowa „Przyszłość”",
] as const;

/* ────────────────────────────────────────────────────────────────────────────
   7. WYPROWADZENIE DANYCH Z OFERTY
   ──────────────────────────────────────────────────────────────────────────── */

interface DaneWyprowadzone {
  rng: () => number;
  miasto: string;
  dzielnica: string;
  ulica: string;
  kod: string;
  adresPelny: string;
  typ: string;
  typPl: string;
  typKrotko: string;
  najem: boolean;
  powierzchnia: number;
  powierzchniaDzialki: number;
  pokoje: number | null;
  pietro: number | null;
  kondygnacje: number | null;
  rokBudowy: number;
  cena: number;
  czynsz: number;
  numerKW: string;
  sad: { sad: string; wydzial: string; kod: string };
  numerLokalu: number;
  numerDzialki: string;
  obreb: string;
  wlasnosc: string;
  ogrzewanie: string;
  stan: string;
  klasaEnergetyczna: string;
}

function wyprowadz(n: NieruchomoscDoDokumentu, rodzaj: DokumentRodzaj): DaneWyprowadzone {
  // Dwa niezależne strumienie losowe:
  //  • `stale` zależy wyłącznie od tożsamości oferty, więc numer księgi wieczystej, numer lokalu
  //    czy numer działki są IDENTYCZNE we wszystkich dokumentach tej samej nieruchomości,
  //  • `rng` zależy dodatkowo od rodzaju dokumentu i obsługuje to, co ma się różnić
  //    (nazwisko notariusza, odczyty liczników, stawki prowizji).
  const stale = losownik(`nieruchomosc|${n.title}|${n.location ?? ""}|${n.address?.street ?? ""}`);
  const rng = losownik(`dokument|${n.title}|${n.location ?? ""}|${rodzaj}`);
  const miasto = n.address?.city ?? n.location?.split(",")[0]?.trim() ?? "Warszawa";
  const dzielnica = n.address?.district ?? n.location?.split(",")[1]?.trim() ?? "Śródmieście";
  const ulica = n.address?.street ?? `ul. Przykładowa ${zakres(stale, 1, 60)}`;
  const kod = n.address?.postalCode ?? "00-001";
  const typ = n.propertyType ?? "APARTMENT";
  const powierzchnia = Math.round(liczba(n.area, 0) * 10) / 10;
  const powierzchniaDzialki = Math.round(liczba(n.plotArea, 0));
  const sad = SADY_REJONOWE[miasto] ?? { sad: `Sąd Rejonowy w ${miasto}`, wydzial: "Wydział Ksiąg Wieczystych", kod: "PL1X" };
  const numerLokalu = zakres(stale, 1, 84);
  const oznaczenieLokalu =
    typ === "HOUSE" || typ === "PLOT" || powierzchnia <= 0
      ? ""
      : typ === "GARAGE"
        ? ` miejsce postojowe nr ${numerLokalu}`
        : ` lok. ${numerLokalu}`;
  const adresPelny = `${ulica}${oznaczenieLokalu}, ${kod} ${miasto}`;

  return {
    rng,
    miasto,
    dzielnica,
    ulica,
    kod,
    adresPelny,
    typ,
    typPl: TYP_PL[typ] ?? "nieruchomość",
    typKrotko: TYP_KROTKO[typ] ?? "nieruchomość",
    najem: (n.transactionType ?? "SALE") === "RENT",
    powierzchnia,
    powierzchniaDzialki,
    pokoje: n.rooms ?? null,
    pietro: n.floor ?? null,
    kondygnacje: n.totalFloors ?? null,
    rokBudowy: n.yearBuilt ?? zakres(stale, 1968, 2023),
    cena: Math.round(liczba(n.price, 0)),
    czynsz: Math.round(liczba(n.monthlyRent, 0)),
    numerKW: `${sad.kod}/${String(zakres(stale, 10_000, 99_999)).padStart(5, "0")}${zakres(stale, 100, 999)}/${zakres(stale, 1, 9)}`,
    sad,
    numerLokalu,
    numerDzialki: `${zakres(stale, 10, 320)}/${zakres(stale, 1, 24)}`,
    obreb: `${String(zakres(stale, 1, 60)).padStart(4, "0")} ${dzielnica}`,
    wlasnosc: WLASNOSC_PL[n.ownership ?? "FULL_OWNERSHIP"] ?? "prawo własności",
    ogrzewanie: OGRZEWANIE_PL[n.heating ?? "DISTRICT"] ?? "miejska sieć ciepłownicza",
    stan: STAN_PL[n.condition ?? "GOOD"] ?? "dobry",
    klasaEnergetyczna: n.energyClass ?? "C",
  };
}

function opisNieruchomosciJednymZdaniem(d: DaneWyprowadzone): string {
  const czesci: string[] = [d.typPl];
  if (d.powierzchnia > 0) czesci.push(`o powierzchni użytkowej ${formatujLiczbe(d.powierzchnia, 1)} m²`);
  if (d.powierzchniaDzialki > 0 && d.typ === "PLOT") czesci.push(`o powierzchni ${formatujLiczbe(d.powierzchniaDzialki)} m²`);
  else if (d.powierzchniaDzialki > 0) czesci.push(`posadowiony na działce o powierzchni ${formatujLiczbe(d.powierzchniaDzialki)} m²`);
  if (d.pokoje) czesci.push(`składający się z ${d.pokoje} ${d.pokoje === 1 ? "pomieszczenia" : "pomieszczeń"}`);
  if (d.pietro !== null && d.typ !== "HOUSE" && d.typ !== "PLOT") {
    czesci.push(
      d.pietro === 0
        ? "położony na parterze"
        : d.pietro < 0
          ? `położony na ${Math.abs(d.pietro)}. kondygnacji podziemnej`
          : `położony na ${d.pietro}. piętrze`,
    );
  }
  czesci.push(`przy ${d.adresPelny}`);
  return czesci.join(", ");
}

function adresFirmy(f: FirmaDoDokumentu): string {
  const ulica = f.street ?? "ul. Przykładowa 1";
  const kod = f.postalCode ?? "00-001";
  const miasto = f.city ?? "Warszawa";
  return `${ulica}, ${kod} ${miasto}`;
}

/* ────────────────────────────────────────────────────────────────────────────
   8. SZABLONY DOKUMENTÓW
   ──────────────────────────────────────────────────────────────────────────── */

function szablonUmowaPosrednictwa(
  b: BudowniczyPdf,
  ctx: Required<Pick<KontekstDokumentu, "firma" | "nieruchomosc" | "agent" | "klient">> & { data: Date; numer: string },
  d: DaneWyprowadzone,
): void {
  const { firma, agent, klient, data, numer } = ctx;
  const rng = d.rng;
  const stawka = wybierz(rng, [1.5, 1.8, 2.0, 2.2, 2.5, 3.0]);
  const wynagrodzenieNetto = d.najem ? d.cena : Math.round((d.cena * stawka) / 100);
  const wynagrodzenieBrutto = Math.round(wynagrodzenieNetto * 1.23);
  const czasTrwania = wybierz(rng, [3, 6, 6, 12]);
  const doDnia = przesunDni(data, czasTrwania * 30);
  const naWylacznosc = rng() < 0.55;
  const czynnosc = d.najem ? "najmu" : "sprzedaży";

  b.tytul(
    `Umowa pośrednictwa w ${czynnosc} nieruchomości`,
    `nr ${numer}${naWylacznosc ? " — umowa na wyłączność" : ""}`,
  );

  b.akapit(
    `zawarta w dniu ${formatujDate(data)} ${wMiescie(d.miasto)} pomiędzy:`,
    { odstepPo: 10 },
  );

  b.akapit(
    `${firma.name} z siedzibą pod adresem ${adresFirmy(firma)}, NIP ${firma.nip ?? "000-000-00-00"}, ` +
      `wpisaną do rejestru przedsiębiorców, posiadającą polisę odpowiedzialności cywilnej pośrednika ` +
      `nr ${firma.licenseNumber ?? "PL-RE-00000"}, reprezentowaną przez ${agent.name} ` +
      `(licencja zawodowa nr ${agent.licenseNumber ?? "LIC-000000"}, tel. ${agent.phone ?? "—"}, ${agent.email ?? "—"}), ` +
      `zwaną dalej „Pośrednikiem”,`,
    { odstepPo: 8 },
  );
  b.akapit("a", { odstepPo: 8, kroj: "F2" });
  b.akapit(
    `${klient.name}, adres do korespondencji: ${d.adresPelny}, tel. ${klient.phone ?? "—"}, ` +
      `e-mail: ${klient.email ?? "—"}, zwanym/zwaną dalej „Zamawiającym”,`,
    { odstepPo: 8 },
  );
  b.akapit("łącznie zwanymi dalej „Stronami”, o następującej treści:", { odstepPo: 4 });

  b.paragraf(1, "Przedmiot umowy");
  b.akapit(
    `Zamawiający zleca, a Pośrednik przyjmuje do wykonania czynności zmierzające do zawarcia umowy ` +
      `${czynnosc} nieruchomości, którą stanowi ${opisNieruchomosciJednymZdaniem(d)}.`,
  );
  b.pary([
    ["Rodzaj nieruchomości", d.typPl],
    ["Adres", d.adresPelny],
    ["Dzielnica / obręb", `${d.dzielnica} (obręb ewid. ${d.obreb})`],
    ...(d.powierzchnia > 0
      ? ([["Powierzchnia użytkowa", `${formatujLiczbe(d.powierzchnia, 1)} m²`]] as ReadonlyArray<readonly [string, string]>)
      : []),
    ...(d.powierzchniaDzialki > 0
      ? ([["Powierzchnia działki", `${formatujLiczbe(d.powierzchniaDzialki)} m²`]] as ReadonlyArray<readonly [string, string]>)
      : []),
    ...(d.pokoje ? ([["Liczba pomieszczeń", String(d.pokoje)]] as ReadonlyArray<readonly [string, string]>) : []),
    ...(d.pietro !== null && d.typ !== "HOUSE" && d.typ !== "PLOT"
      ? ([["Kondygnacja", `${d.pietro} z ${d.kondygnacje ?? d.pietro}`]] as ReadonlyArray<readonly [string, string]>)
      : []),
    ["Rok budowy", String(d.rokBudowy)],
    ["Stan prawny", d.wlasnosc],
    ["Księga wieczysta", `nr ${d.numerKW}, ${d.sad.sad}, ${d.sad.wydzial}`],
    ...(d.czynsz > 0
      ? ([["Czynsz administracyjny", `${zl(d.czynsz, 0)} miesięcznie`]] as ReadonlyArray<readonly [string, string]>)
      : []),
    [d.najem ? "Oczekiwany czynsz najmu" : "Oczekiwana cena ofertowa", zl(d.cena, 0)],
  ]);

  b.paragraf(2, "Zakres czynności Pośrednika");
  b.akapit("W ramach niniejszej umowy Pośrednik zobowiązuje się w szczególności do:", { odstepPo: 6 });
  b.lista(
    [
      "sporządzenia opisu nieruchomości oraz wykonania dokumentacji fotograficznej i rzutu lokalu,",
      `ustalenia rekomendowanej ceny ${d.najem ? "najmu" : "transakcyjnej"} w oparciu o analizę porównawczą ofert w dzielnicy ${d.dzielnica},`,
      "publikacji oferty w serwisach ogłoszeniowych oraz na stronie internetowej Pośrednika,",
      "prowadzenia prezentacji nieruchomości i obsługi zapytań osób zainteresowanych,",
      "weryfikacji stanu prawnego nieruchomości na podstawie treści księgi wieczystej i dokumentów przekazanych przez Zamawiającego,",
      "uczestnictwa w negocjacjach oraz przygotowania dokumentów do umowy przedwstępnej,",
      "koordynacji terminu i przebiegu czynności u notariusza.",
    ],
  );

  b.paragraf(3, "Wynagrodzenie Pośrednika");
  if (d.najem) {
    b.akapit(
      `Strony ustalają wynagrodzenie Pośrednika w wysokości równowartości jednomiesięcznego czynszu najmu, ` +
        `tj. ${zl(wynagrodzenieNetto, 0)} netto (${zl(wynagrodzenieBrutto, 0)} brutto, przy stawce VAT 23%).`,
    );
  } else {
    b.akapit(
      `Strony ustalają wynagrodzenie Pośrednika w wysokości ${formatujLiczbe(stawka, 1)}% ceny ` +
        `${d.najem ? "najmu" : "sprzedaży"} nieruchomości. Przy cenie ofertowej ${zl(d.cena, 0)} wynagrodzenie wynosi ` +
        `${zl(wynagrodzenieNetto, 0)} netto, tj. ${zl(wynagrodzenieBrutto, 0)} brutto (stawka VAT 23%).`,
    );
  }
  b.akapit(
    "Wynagrodzenie staje się wymagalne z dniem zawarcia umowy przenoszącej własność nieruchomości albo umowy najmu " +
      "i jest płatne przelewem w terminie 7 dni od dnia doręczenia faktury VAT.",
  );

  b.paragraf(4, "Czas trwania umowy");
  b.akapit(
    `Umowa zostaje zawarta na czas określony ${czasTrwania} ${czasTrwania === 12 ? "miesięcy" : "miesięcy"}, ` +
      `tj. do dnia ${formatujDate(doDnia)}. ` +
      (naWylacznosc
        ? "W okresie obowiązywania umowy Zamawiający powierza obsługę nieruchomości wyłącznie Pośrednikowi. "
        : "Umowa ma charakter otwarty — Zamawiający może powierzyć nieruchomość również innym pośrednikom. ") +
      "Po upływie tego okresu umowa wygasa, o ile Strony nie postanowią inaczej w formie pisemnej.",
  );

  b.paragraf(5, "Obowiązki Zamawiającego");
  b.lista([
    "przekazanie Pośrednikowi kompletu dokumentów dotyczących nieruchomości, w tym numeru księgi wieczystej i podstawy nabycia,",
    "udostępnianie nieruchomości w uzgodnionych terminach prezentacji,",
    "niezwłoczne informowanie o zmianie ceny, stanu prawnego lub o zawarciu umowy z osobą wskazaną przez Pośrednika,",
    "przekazanie ważnego świadectwa charakterystyki energetycznej najpóźniej w dniu zawarcia umowy przenoszącej własność.",
  ]);

  b.paragraf(6, "Ochrona danych osobowych");
  b.akapit(
    `Administratorem danych osobowych Zamawiającego jest ${firma.name}, ${adresFirmy(firma)}. ` +
      "Dane przetwarzane są w celu wykonania niniejszej umowy (art. 6 ust. 1 lit. b RODO) oraz w celu wypełnienia " +
      "obowiązków prawnych ciążących na administratorze (art. 6 ust. 1 lit. c RODO). Zamawiającemu przysługuje prawo " +
      "dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz wniesienia skargi do Prezesa " +
      "Urzędu Ochrony Danych Osobowych. Dane przechowywane są przez okres wynikający z przepisów o rachunkowości.",
  );

  b.paragraf(7, "Postanowienia końcowe");
  b.akapit(
    "W sprawach nieuregulowanych niniejszą umową zastosowanie mają przepisy Kodeksu cywilnego oraz ustawy " +
      "o gospodarce nieruchomościami. Wszelkie zmiany umowy wymagają formy pisemnej pod rygorem nieważności. " +
      "Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze Stron.",
  );

  b.podpisy("Zamawiający", "Pośrednik", klient.name, `${firma.name} — ${agent.name}`);
}

function szablonAktNotarialny(
  b: BudowniczyPdf,
  ctx: Required<Pick<KontekstDokumentu, "firma" | "nieruchomosc" | "agent" | "klient">> & {
    data: Date;
    numer: string;
    kontrahent: StronaDokumentu;
  },
  d: DaneWyprowadzone,
): void {
  const { firma, klient, kontrahent, agent, data, numer } = ctx;
  const rng = d.rng;
  const notariusz = wybierz(rng, NOTARIUSZE);
  const cena = d.cena > 0 ? d.cena : 450_000;
  const zadatek = Math.round((cena * 0.1) / 1000) * 1000;
  const pcc = Math.round(cena * 0.02);
  const taksa = Math.round((1010 + (cena - 60_000) * 0.004) / 10) * 10;
  const taksaBrutto = Math.round(taksa * 1.23);
  const terminWydania = przesunDni(data, wybierz(rng, [7, 14, 21, 30]));

  b.tytul("Wypis aktu notarialnego", `Repertorium A numer ${numer}`);

  b.akapit(
    `Dnia ${formatujDate(data)} w Kancelarii Notarialnej ${wMiescie(d.miasto)}, przy ${wybierz(rng, [
      "ul. Grodzkiej",
      "ul. Świętokrzyskiej",
      "al. Niepodległości",
      "ul. Floriańskiej",
    ])} ${zakres(rng, 2, 48)}, przed notariuszem — w osobie: ${notariusz} — stawili się:`,
    { odstepPo: 10 },
  );

  b.lista(
    [
      `${klient.name}, legitymujący(a) się dowodem osobistym seria i numer ${wybierz(rng, ["ABC", "CDE", "DAF", "ZAB"])}${zakres(
        rng,
        100,
        999,
      )}***, PESEL ${zakres(rng, 6_000_000, 9_999_999)}****, zamieszkały(a) ${wMiescie(d.miasto)} — zwany(a) dalej „Sprzedającym”,`,
      `${kontrahent.name}, legitymujący(a) się dowodem osobistym seria i numer ${wybierz(rng, [
        "BKM",
        "CFH",
        "DPR",
        "ELM",
      ])}${zakres(rng, 100, 999)}***, PESEL ${zakres(rng, 6_000_000, 9_999_999)}****, zamieszkały(a) ${wMiescie(
        d.miasto,
      )} — zwany(a) dalej „Kupującym”.`,
    ],
    true,
  );

  b.akapit(
    "Tożsamość stawających notariusz ustalił na podstawie okazanych dokumentów tożsamości. Stawający oświadczyli, " +
      "że posiadają pełną zdolność do czynności prawnych i nie są ograniczeni w rozporządzaniu swoim majątkiem.",
    { odstepPo: 4 },
  );

  b.paragraf(1, "Oświadczenie o stanie prawnym");
  b.akapit(
    `Sprzedający oświadcza, że przysługuje mu ${d.wlasnosc} nieruchomości stanowiącej ` +
      `${opisNieruchomosciJednymZdaniem(d)}, dla której ${d.sad.sad}, ${d.sad.wydzial}, prowadzi księgę wieczystą ` +
      `nr ${d.numerKW}.`,
  );
  b.pary([
    ["Numer księgi wieczystej", d.numerKW],
    ["Sąd prowadzący księgę", `${d.sad.sad}, ${d.sad.wydzial}`],
    ["Numer działki ewidencyjnej", `${d.numerDzialki}, obręb ${d.obreb}`],
    ["Podstawa nabycia", `umowa ${wybierz(rng, ["sprzedaży", "darowizny", "o dział spadku"])} z dnia ${formatujDateKrotko(
      przesunDni(data, -zakres(rng, 900, 6200)),
    )}`],
    ["Obciążenia hipoteczne", wybierz(rng, ["brak wpisów w dziale IV", "brak wpisów w dziale IV", "hipoteka umowna — wykreślenie po spłacie"])],
    ["Prawa i roszczenia (dział III)", "brak wpisów"],
  ]);
  b.akapit(
    "Sprzedający oświadcza ponadto, że nieruchomość jest wolna od praw i roszczeń osób trzecich, nie jest przedmiotem " +
      "postępowania egzekucyjnego ani zabezpieczającego, a wszelkie należności publicznoprawne i opłaty eksploatacyjne " +
      "są uregulowane, co potwierdza okazanym zaświadczeniem zarządcy nieruchomości.",
  );

  b.paragraf(2, "Umowa sprzedaży");
  b.akapit(
    `Sprzedający sprzedaje Kupującemu opisaną w § 1 nieruchomość za cenę ${zl(cena, 0)} ` +
      `(słownie: ${slownieZlote(cena)}), a Kupujący nieruchomość tę za podaną cenę kupuje.`,
  );
  b.tabela(
    ["Tytuł płatności", "Termin", "Kwota"],
    [
      ["Zadatek wpłacony przy umowie przedwstępnej", formatujDateKrotko(przesunDni(data, -zakres(rng, 25, 70))), zl(zadatek, 0)],
      ["Pozostała część ceny — przelew na rachunek Sprzedającego", formatujDateKrotko(przesunDni(data, 3)), zl(cena - zadatek, 0)],
      ["Razem cena sprzedaży", "—", zl(cena, 0)],
    ],
    [3, 1.4, 1.3],
    [false, false, true],
  );

  b.paragraf(3, "Wydanie nieruchomości");
  b.akapit(
    `Wydanie nieruchomości w posiadanie Kupującego nastąpi w terminie do dnia ${formatujDate(terminWydania)} ` +
      "na podstawie protokołu zdawczo-odbiorczego zawierającego stan liczników mediów. Z dniem wydania na Kupującego " +
      "przechodzą korzyści i ciężary związane z nieruchomością oraz ryzyko jej przypadkowej utraty lub uszkodzenia.",
  );

  b.paragraf(4, "Koszty aktu");
  b.tabela(
    ["Pozycja", "Podstawa", "Kwota"],
    [
      ["Taksa notarialna", "§ 3 rozporządzenia w sprawie maksymalnych stawek taksy notarialnej", zl(taksa, 0)],
      ["Podatek VAT od taksy", "23%", zl(taksaBrutto - taksa, 0)],
      ["Podatek od czynności cywilnoprawnych", "2% wartości rynkowej", zl(pcc, 0)],
      ["Opłata sądowa — wpis prawa własności", "art. 42 ust. 1 u.k.s.c.", zl(200, 0)],
      ["Wypisy aktu (4 egzemplarze)", "6 zł za stronę + VAT", zl(zakres(rng, 120, 260), 0)],
    ],
    [2.6, 2.2, 1.1],
    [false, false, true],
  );
  b.akapit("Koszty niniejszego aktu ponosi Kupujący.", { kroj: "F2" });

  b.paragraf(5, "Wnioski wieczystoksięgowe");
  b.akapit(
    `Strony wnoszą, aby ${d.sad.sad}, ${d.sad.wydzial}, w księdze wieczystej nr ${d.numerKW} w dziale II ` +
      `wpisał jako właściciela ${kontrahent.name}. Wypis niniejszego aktu wraz z wnioskiem notariusz prześle ` +
      "sądowi wieczystoksięgowemu za pośrednictwem systemu teleinformatycznego.",
  );

  b.naglowekSekcji("Pouczenia i informacje końcowe");
  b.akapit(
    "Notariusz pouczył stawających o treści art. 155, 158 i 389 Kodeksu cywilnego, o skutkach podatkowych czynności " +
      "oraz o obowiązku złożenia deklaracji PCC-3. Wypis niniejszego aktu wydano Sprzedającemu i Kupującemu.",
  );
  b.pary([
    ["Transakcję obsługiwał", `${agent.name}, ${firma.name}`],
    ["Kontakt do biura", `${firma.phone ?? "—"} · ${firma.email ?? "—"}`],
    ["Repertorium A numer", numer],
  ]);

  b.ramkaInformacyjna(
    "Dokument demonstracyjny na potrzeby prezentacji systemu Realty Nest. Dane stron, numery repertorium, " +
      "numery ksiąg wieczystych i kwoty są fikcyjne. Dokument nie stanowi wypisu aktu notarialnego " +
      "w rozumieniu ustawy Prawo o notariacie i nie wywołuje żadnych skutków prawnych.",
  );

  b.podpisy("Notariusz", "Za zgodność wypisu z oryginałem", `Notariusz ${notariusz}`, `Notariusz ${notariusz}`);
}

function szablonZaswiadczenie(
  b: BudowniczyPdf,
  ctx: Required<Pick<KontekstDokumentu, "firma" | "nieruchomosc" | "agent" | "klient">> & { data: Date; numer: string },
  d: DaneWyprowadzone,
): void {
  const { klient, data, numer } = ctx;
  const rng = d.rng;
  const zarzadca = wybierz(rng, ZARZADCY);
  const pow = d.powierzchnia > 0 ? d.powierzchnia : 52;
  const eksploatacja = Math.round(pow * wybierz(rng, [4.2, 4.8, 5.4, 6.1]) * 100) / 100;
  const fundusz = Math.round(pow * wybierz(rng, [1.4, 1.8, 2.2]) * 100) / 100;
  const zaliczkaCO = Math.round(pow * wybierz(rng, [3.1, 3.9, 4.6]) * 100) / 100;
  const woda = Math.round((zakres(rng, 48, 130) + rng() * 0.99) * 100) / 100;
  const odpady = zakres(rng, 28, 62);
  const winda = d.kondygnacje && d.kondygnacje >= 5 ? Math.round(pow * 0.6 * 100) / 100 : 0;
  const razem = Math.round((eksploatacja + fundusz + zaliczkaCO + woda + odpady + winda) * 100) / 100;

  b.tytul("Zaświadczenie o niezaleganiu z opłatami", `nr ${numer}`);

  b.akapit(`${d.miasto}, dnia ${formatujDate(data)}`, { wyrownanie: "right", rozmiar: 9, kolor: SZARY, odstepPo: 14 });

  b.naglowekSekcji("Wystawca zaświadczenia");
  b.pary([
    ["Zarządca nieruchomości", zarzadca],
    ["Nieruchomość wspólna", `${d.ulica}, ${d.kod} ${d.miasto}`],
    ["NIP wspólnoty / spółdzielni", String(zakres(rng, 1_000_000_000, 9_999_999_999))],
    ["Osoba upoważniona", wybierz(rng, ["Marta Sienkiewicz", "Andrzej Kubiak", "Renata Grabowska", "Piotr Malinowski"])],
  ]);

  b.naglowekSekcji("Treść zaświadczenia");
  b.akapit(
    `Niniejszym zaświadcza się, że ${klient.name} — właściciel(ka) lokalu nr ${d.numerLokalu} ` +
      `o powierzchni użytkowej ${formatujLiczbe(pow, 1)} m², położonego przy ${d.ulica} ${wMiescie(d.miasto)} ` +
      `(księga wieczysta nr ${d.numerKW}) — według stanu na dzień ${formatujDateKrotko(data)} ` +
      "nie zalega z opłatami na rzecz nieruchomości wspólnej.",
  );
  b.akapit(
    "Powyższe obejmuje zaliczki na koszty zarządu nieruchomością wspólną, wpłaty na fundusz remontowy, " +
      "zaliczki na centralne ogrzewanie i ciepłą wodę oraz opłaty za gospodarowanie odpadami komunalnymi.",
  );

  b.naglowekSekcji("Struktura miesięcznych opłat");
  b.tabela(
    ["Składnik opłaty", "Stawka", "Kwota miesięczna"],
    [
      ["Zaliczka na koszty zarządu nieruchomością wspólną", `${formatujLiczbe(eksploatacja / pow, 2)} zł/m²`, zl(eksploatacja)],
      ["Fundusz remontowy", `${formatujLiczbe(fundusz / pow, 2)} zł/m²`, zl(fundusz)],
      ["Zaliczka na centralne ogrzewanie", `${formatujLiczbe(zaliczkaCO / pow, 2)} zł/m²`, zl(zaliczkaCO)],
      ["Zimna i ciepła woda oraz kanalizacja", "wg wskazań wodomierzy", zl(woda)],
      ["Gospodarowanie odpadami komunalnymi", `${zakres(rng, 1, 4)} os. × stawka gminna`, zl(odpady)],
      ...(winda > 0
        ? [["Eksploatacja dźwigu osobowego", "0,60 zł/m²", zl(winda)] as readonly string[]]
        : []),
      ["Razem", "—", zl(razem)],
    ],
    [3.2, 1.7, 1.4],
    [false, false, true],
  );

  b.naglowekSekcji("Rozliczenie za ostatnie 12 miesięcy");
  b.tabela(
    ["Okres", "Naliczono", "Wpłacono", "Saldo"],
    Array.from({ length: 4 }, (_, i) => {
      const kwartal = 4 - i;
      const naliczono = Math.round(razem * 3 * 100) / 100;
      return [
        `${kwartal} kwartał ${data.getFullYear() - (kwartal > Math.ceil((data.getMonth() + 1) / 3) ? 1 : 0)}`,
        zl(naliczono),
        zl(naliczono),
        zl(0),
      ] as readonly string[];
    }),
    [1.6, 1.4, 1.4, 1.2],
    [false, true, true, true],
  );

  b.akapit(
    "Zaświadczenie wydaje się na wniosek właściciela lokalu w celu przedłożenia u notariusza przy czynności " +
      "przeniesienia własności. Zaświadczenie zachowuje ważność 30 dni od daty wystawienia.",
    { odstepPo: 4 },
  );

  b.ramkaInformacyjna(
    "Dokument demonstracyjny systemu Realty Nest. Wspólnota, zarządca, kwoty i salda są fikcyjne — " +
      "zaświadczenie nie potwierdza żadnego rzeczywistego stanu rozliczeń.",
  );

  b.podpisy("Zarządca nieruchomości", "Odbiór zaświadczenia", zarzadca, klient.name);
}

function szablonProtokol(
  b: BudowniczyPdf,
  ctx: Required<Pick<KontekstDokumentu, "firma" | "nieruchomosc" | "agent" | "klient">> & {
    data: Date;
    numer: string;
    kontrahent: StronaDokumentu;
  },
  d: DaneWyprowadzone,
): void {
  const { agent, klient, kontrahent, data, numer } = ctx;
  const rng = d.rng;
  const przekazujacy = d.najem ? "Wynajmujący" : "Zbywca";
  const przyjmujacy = d.najem ? "Najemca" : "Nabywca";

  b.tytul("Protokół zdawczo-odbiorczy", `nr ${numer} · ${d.najem ? "wydanie lokalu do najmu" : "wydanie nieruchomości nabywcy"}`);

  b.akapit(
    `Sporządzony w dniu ${formatujDate(data)} o godzinie ${String(zakres(rng, 9, 17)).padStart(2, "0")}:${wybierz(rng, [
      "00",
      "15",
      "30",
      "45",
    ])} w lokalu położonym przy ${d.adresPelny}.`,
    { odstepPo: 10 },
  );

  b.naglowekSekcji("Strony protokołu");
  b.pary([
    [`${przekazujacy} (przekazujący)`, klient.name],
    [`${przyjmujacy} (przyjmujący)`, kontrahent.name],
    ["Przedstawiciel biura", `${agent.name}, tel. ${agent.phone ?? "—"}`],
    ["Przedmiot przekazania", opisNieruchomosciJednymZdaniem(d)],
    ["Księga wieczysta", d.numerKW],
  ]);

  // Zestaw liczników, kluczy i pomieszczeń zależy od typu nieruchomości — w garażu nie ma
  // wodomierzy ani łazienki, a w biurze zamiast salonu jest open space i zaplecze socjalne.
  const garaz = d.typ === "GARAGE";
  const uzytkowy = d.typ === "OFFICE" || d.typ === "COMMERCIAL";
  const licznikEnergii: readonly string[] = [
    "Energia elektryczna",
    `${zakres(rng, 10_000_000, 99_999_999)}`,
    `${formatujLiczbe(zakres(rng, 8_000, 42_000) + rng(), 1)}`,
    "kWh",
  ];
  const licznikiWody: ReadonlyArray<readonly string[]> = [
    ["Woda zimna", `${zakres(rng, 100_000, 999_999)}`, `${formatujLiczbe(zakres(rng, 120, 890) + rng(), 3)}`, "m³"],
    ["Woda ciepła", `${zakres(rng, 100_000, 999_999)}`, `${formatujLiczbe(zakres(rng, 60, 420) + rng(), 3)}`, "m³"],
  ];
  const licznikCiepla: readonly string[] = d.ogrzewanie.includes("gazowy")
    ? ["Gaz ziemny", `${zakres(rng, 100_000, 999_999)}`, `${formatujLiczbe(zakres(rng, 900, 9_400) + rng(), 2)}`, "m³"]
    : ["Ciepło (podzielniki)", `${zakres(rng, 1000, 9999)}`, `${formatujLiczbe(zakres(rng, 40, 260))}`, "jedn."];

  b.naglowekSekcji("Stan liczników mediów");
  b.tabela(
    ["Medium", "Numer licznika", "Odczyt", "Jednostka"],
    garaz ? [licznikEnergii] : [licznikEnergii, ...licznikiWody, licznikCiepla],
    [2.2, 1.8, 1.4, 1.0],
    [false, false, true, false],
  );

  b.naglowekSekcji("Przekazane klucze i urządzenia");
  const klucze: ReadonlyArray<readonly string[]> = garaz
    ? [
        ["Pilot do bramy garażowej", String(zakres(rng, 1, 2)), "sprawny, baterie wymienione"],
        ["Karta wjazdowa do hali garażowej", String(zakres(rng, 1, 2)), "aktywna"],
        ["Klucz do wrót / kłódki stanowiska", String(zakres(rng, 1, 2)), "wkładka sprawna"],
      ]
    : [
        [
          uzytkowy ? "Klucze do wejścia do lokalu (komplet)" : "Klucze do drzwi wejściowych (komplet)",
          String(zakres(rng, 2, 3)),
          "wkładka klasy B",
        ],
        ["Klucze do drzwi wejściowych do budynku", String(zakres(rng, 1, 3)), "—"],
        ["Pilot do bramy garażowej", String(zakres(rng, 0, 2)), zakres(rng, 0, 1) === 1 ? "sprawny" : "nie dotyczy"],
        [
          uzytkowy ? "Karta dostępu / kod do systemu alarmowego" : "Karta / breloczek domofonowy",
          String(zakres(rng, 1, 2)),
          "aktywna",
        ],
        ...(uzytkowy
          ? ([["Klucz do rozdzielni i licznika", "1", "—"]] as ReadonlyArray<readonly string[]>)
          : ([
              ["Klucz do skrzynki pocztowej", "1", "—"],
              [
                "Klucz do komórki lokatorskiej",
                zakres(rng, 0, 1) === 1 ? "1" : "0",
                zakres(rng, 0, 1) === 1 ? `piwnica nr ${zakres(rng, 1, 40)}` : "nie dotyczy",
              ],
            ] as ReadonlyArray<readonly string[]>)),
      ];
  b.tabela(["Pozycja", "Ilość", "Uwagi"], klucze, [3.0, 0.9, 2.1], [false, true, false]);

  b.naglowekSekcji(garaz ? "Stan techniczny stanowiska" : "Stan techniczny pomieszczeń");
  const zuzycie = d.stan === "do remontu" ? "widoczne zużycie powłok" : "bez uwag";
  const pomieszczenia: ReadonlyArray<readonly string[]> = garaz
    ? [
        ["Posadzka stanowiska", zuzycie, "nie dotyczy", wybierz(rng, ["—", "drobne plamy oleju", "—"])],
        ["Ściany i strop", "bez uszkodzeń", "nie dotyczy", "—"],
        ["Brama / wrota", "bez uwag", "sprawna", wybierz(rng, ["napęd sprawny", "wymaga smarowania prowadnic", "—"])],
        ["Instalacja elektryczna", "bez uwag", "nie dotyczy", "gniazdo 230 V sprawne"],
      ]
    : uzytkowy
      ? [
          ["Wejście / recepcja", "bez uszkodzeń", "sprawna", "—"],
          ["Powierzchnia biurowa (open space)", zuzycie, "sprawna", wybierz(rng, ["—", "wykładzina do czyszczenia", "—"])],
          ["Zaplecze socjalne", "bez uwag", "sprawna", wybierz(rng, ["aneks kuchenny sprawny", "—", "lodówka pozostaje w lokalu"])],
          ["Sanitariaty", "bez uwag", "sprawna", wybierz(rng, ["—", "silikon do wymiany", "armatura sprawna"])],
          ["Pomieszczenie techniczne", "bez uwag", "sprawna", "rozdzielnia opisana"],
        ]
      : [
          ["Przedpokój", "bez uszkodzeń", "sprawna", "—"],
          ["Salon", zuzycie, "sprawna", wybierz(rng, ["—", "drobne rysy na parapecie", "—"])],
          ["Kuchnia", "bez uwag", "sprawna", wybierz(rng, ["zabudowa pozostaje w lokalu", "sprzęt AGD sprawny", "—"])],
          ["Łazienka", "bez uwag", "sprawna", wybierz(rng, ["silikon do wymiany", "—", "bateria sprawna"])],
          ...(d.pokoje && d.pokoje > 2
            ? ([["Pokój dodatkowy", "bez uwag", "sprawna", "—"]] as ReadonlyArray<readonly string[]>)
            : []),
        ];
  b.tabela(
    [garaz ? "Element" : "Pomieszczenie", "Stan ścian i podłóg", "Stolarka", "Uwagi"],
    pomieszczenia,
    [1.6, 2.0, 1.2, 2.0],
  );

  b.naglowekSekcji("Uwagi i ustalenia stron");
  b.lista([
    `Stan techniczny lokalu określono jako: ${d.stan}. Strony nie zgłaszają zastrzeżeń wykraczających poza uwagi wpisane do tabeli powyżej.`,
    `${przyjmujacy} zobowiązuje się do przepisania umów z dostawcami mediów w terminie 14 dni od daty niniejszego protokołu.`,
    d.najem
      ? `Kaucja zabezpieczająca w kwocie ${zl(d.cena * 2, 0)} została wpłacona przed wydaniem lokalu i podlega zwrotowi po zakończeniu najmu.`
      : "Rozliczenie opłat eksploatacyjnych następuje proporcjonalnie do dnia wydania nieruchomości.",
    "Protokół sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze Stron.",
  ]);

  b.podpisy(`${przekazujacy} — przekazujący`, `${przyjmujacy} — przyjmujący`, klient.name, kontrahent.name);
}

function szablonSwiadectwo(
  b: BudowniczyPdf,
  ctx: Required<Pick<KontekstDokumentu, "firma" | "nieruchomosc" | "agent" | "klient">> & { data: Date; numer: string },
  d: DaneWyprowadzone,
): void {
  const { klient, data, numer } = ctx;
  const rng = d.rng;
  const audytor = wybierz(rng, AUDYTORZY);
  const wazneDo = new Date(data.getFullYear() + 10, data.getMonth(), data.getDate());
  const pow = d.powierzchnia > 0 ? d.powierzchnia : 58;

  const wgKlasy: Record<string, readonly [number, number]> = {
    "A+": [28, 42], A: [45, 62], B: [63, 84], C: [85, 112],
    D: [113, 145], E: [146, 185], F: [186, 235], G: [236, 310],
  };
  const [minEP, maxEP] = wgKlasy[d.klasaEnergetyczna] ?? [85, 112];
  const EP = Math.round(minEP + rng() * (maxEP - minEP));
  const EK = Math.round(EP * (0.78 + rng() * 0.16));
  const EU = Math.round(EK * (0.72 + rng() * 0.14));
  const udzialOZE = Math.round(rng() * (d.ogrzewanie.includes("pompa") ? 62 : 14));
  const emisjaCO2 = Math.round((EK * pow * 0.24) / 1000 * 100) / 100;
  const referencja = d.rokBudowy >= 2021 ? 65 : d.rokBudowy >= 2014 ? 95 : 120;

  b.tytul("Świadectwo charakterystyki energetycznej", `nr ${numer}`);

  b.naglowekSekcji("Dane budynku / części budynku");
  b.pary([
    ["Rodzaj obiektu", d.typPl],
    ["Adres", d.adresPelny],
    ["Rok oddania do użytkowania", String(d.rokBudowy)],
    ["Powierzchnia o regulowanej temperaturze", `${formatujLiczbe(pow, 1)} m²`],
    ["Kubatura ogrzewana", `${formatujLiczbe(Math.round(pow * 2.62), 1)} m³`],
    ["Źródło ciepła", d.ogrzewanie],
    ["Wentylacja", wybierz(rng, ["grawitacyjna", "grawitacyjna", "mechaniczna wywiewna", "mechaniczna nawiewno-wywiewna z odzyskiem ciepła"])],
    ["Właściciel / zamawiający", klient.name],
    ["Data wystawienia", formatujDate(data)],
    ["Termin ważności", `${formatujDate(wazneDo)} (10 lat)`],
  ]);

  b.naglowekSekcji("Wskaźniki charakterystyki energetycznej");
  b.tabela(
    ["Wskaźnik", "Oznaczenie", "Wartość", "Jednostka"],
    [
      ["Zapotrzebowanie na nieodnawialną energię pierwotną", "EP", formatujLiczbe(EP), "kWh/(m²·rok)"],
      ["Zapotrzebowanie na energię końcową", "EK", formatujLiczbe(EK), "kWh/(m²·rok)"],
      ["Zapotrzebowanie na energię użytkową", "EU", formatujLiczbe(EU), "kWh/(m²·rok)"],
      ["Udział odnawialnych źródeł energii", "U(OZE)", `${udzialOZE}`, "%"],
      ["Jednostkowa emisja dwutlenku węgla", "ECO2", formatujLiczbe(emisjaCO2, 2), "t CO2/rok"],
      ["Wartość referencyjna EP dla warunków technicznych", "EP(WT)", formatujLiczbe(referencja), "kWh/(m²·rok)"],
    ],
    [3.0, 1.0, 1.1, 1.5],
    [false, false, true, false],
  );

  b.akapit(
    EP <= referencja
      ? `Obliczony wskaźnik EP = ${EP} kWh/(m²·rok) jest niższy od wartości referencyjnej ${referencja} kWh/(m²·rok), ` +
          "co oznacza, że obiekt spełnia wymagania techniczne obowiązujące dla nowych budynków."
      : `Obliczony wskaźnik EP = ${EP} kWh/(m²·rok) przekracza wartość referencyjną ${referencja} kWh/(m²·rok). ` +
          "Poniżej wskazano zalecenia, których realizacja pozwoli obniżyć zapotrzebowanie na energię.",
  );

  b.naglowekSekcji("Klasa energetyczna");
  const skala: ReadonlyArray<readonly [string, string]> = [
    ["A+", "poniżej 45"], ["A", "45 – 62"], ["B", "63 – 84"], ["C", "85 – 112"],
    ["D", "113 – 145"], ["E", "146 – 185"], ["F", "186 – 235"], ["G", "powyżej 236"],
  ];
  b.tabela(
    ["Klasa", "Zakres EP [kWh/(m²·rok)]", "Ocena"],
    skala.map(([klasa, zakresEP]) => [
      klasa,
      zakresEP,
      klasa === d.klasaEnergetyczna ? "« klasa ocenianego obiektu" : "",
    ]),
    [1.0, 2.4, 1.6],
  );

  b.naglowekSekcji("Zalecenia dotyczące opłacalnej poprawy charakterystyki energetycznej");
  b.lista(
    [
      d.rokBudowy < 2000
        ? "Docieplenie ścian zewnętrznych styropianem grafitowym o grubości 15 cm — szacowana redukcja EP o 18–24%."
        : "Uszczelnienie połączeń stolarki okiennej i regulacja nawiewników — szacowana redukcja EP o 4–7%.",
      d.ogrzewanie.includes("paliwo stałe")
        ? "Wymiana źródła ciepła na kocioł gazowy kondensacyjny lub pompę ciepła — szacowana redukcja EP o 30–40%."
        : "Modernizacja instalacji c.w.u. wraz z izolacją pionów — szacowana redukcja EP o 5–9%.",
      "Montaż zaworów termostatycznych z głowicami programowalnymi w pomieszczeniach o zmiennym użytkowaniu.",
      "Wymiana opraw oświetleniowych na źródła LED w częściach wspólnych i pomieszczeniach technicznych.",
      udzialOZE < 20
        ? "Instalacja fotowoltaiczna o mocy 3–5 kWp — wzrost udziału OZE do ok. 35% i obniżenie EP o 12–18%."
        : "Utrzymanie sprawności istniejącej instalacji OZE — coroczny przegląd i czyszczenie.",
    ],
    true,
  );

  b.naglowekSekcji("Osoba sporządzająca świadectwo");
  b.pary([
    ["Imię i nazwisko", audytor],
    ["Numer uprawnień", `${zakres(rng, 10_000, 29_999)}`],
    ["Wpis w centralnym rejestrze", `CHE/${data.getFullYear()}/${zakres(rng, 100_000, 999_999)}`],
    ["Metodyka obliczeń", "metoda zużyciowa z korektą na warunki klimatyczne (stacja meteo Warszawa-Okęcie)"],
    ["Numer świadectwa", numer],
  ]);

  b.ramkaInformacyjna(
    "Dokument demonstracyjny systemu Realty Nest. Wskaźniki, numer świadectwa i numer uprawnień są fikcyjne. " +
      "Dokument nie jest świadectwem charakterystyki energetycznej w rozumieniu ustawy o charakterystyce " +
      "energetycznej budynków i nie może być wykorzystany w obrocie prawnym.",
  );

  b.podpisy("Osoba sporządzająca", "Odbiór świadectwa", audytor, klient.name);
}

/* ────────────────────────────────────────────────────────────────────────────
   9. API GENEROWANIA
   ──────────────────────────────────────────────────────────────────────────── */

/** Rodzaje dokumentów, które mają sens dla danej oferty (np. świadectwo nie dotyczy działki). */
export function dopuszczalneRodzaje(n: NieruchomoscDoDokumentu): DokumentRodzaj[] {
  const typ = n.propertyType ?? "APARTMENT";
  const najem = (n.transactionType ?? "SALE") === "RENT";
  const rodzaje: DokumentRodzaj[] = ["UMOWA_POSREDNICTWA"];

  // Świadectwo energetyczne sporządza się dla samodzielnych lokali i budynków o regulowanej
  // temperaturze — nie dla działki, garażu ani pojedynczego pokoju w cudzym mieszkaniu.
  const zSwiadectwem =
    typ === "APARTMENT" || typ === "HOUSE" || typ === "STUDIO" || typ === "OFFICE" || typ === "COMMERCIAL";
  // Zaświadczenie o niezaleganiu wydaje wspólnota lub spółdzielnia — dotyczy lokali w budynku
  // wielolokalowym, nie domu jednorodzinnego ani działki.
  const weWspolnocie =
    typ === "APARTMENT" || typ === "STUDIO" || typ === "ROOM" || typ === "OFFICE" || typ === "COMMERCIAL";

  if (zSwiadectwem) rodzaje.push("SWIADECTWO_ENERGETYCZNE");
  if (weWspolnocie) rodzaje.push("ZASWIADCZENIE_O_NIEZALEGANIU");
  if (!najem) rodzaje.push("AKT_NOTARIALNY");
  if (typ !== "PLOT") rodzaje.push("PROTOKOL_ZDAWCZO_ODBIORCZY");

  return rodzaje;
}

/** Deterministyczny wybór rodzaju dokumentu dla oferty — rozkłada rodzaje równomiernie. */
export function wybierzRodzaj(n: NieruchomoscDoDokumentu, indeks: number): DokumentRodzaj {
  const dostepne = dopuszczalneRodzaje(n);
  return dostepne[indeks % dostepne.length]!;
}

let licznikDokumentow = 0;

/** Buduje kompletny plik PDF wraz z metadanymi gotowymi do zapisania w kolekcji `documents`. */
export function zbudujDokumentPdf(ctx: KontekstDokumentu): WygenerowanyDokument {
  const data = ctx.data ?? new Date();
  const opis = OPIS_RODZAJU[ctx.rodzaj];
  const d = wyprowadz(ctx.nieruchomosc, ctx.rodzaj);
  const kolejny = ++licznikDokumentow;
  const numer =
    ctx.rodzaj === "AKT_NOTARIALNY"
      ? `${zakres(d.rng, 1000, 9999)}/${data.getFullYear()}`
      : `${opis.prefiks}/${data.getFullYear()}/${String(kolejny).padStart(4, "0")}`;

  const kontrahent: StronaDokumentu =
    ctx.kontrahent ?? {
      name: wybierz(d.rng, [
        "Marta Lewandowska",
        "Krzysztof Adamczyk",
        "Aleksandra Pawlak",
        "Michał Duda",
        "Barbara Stępień",
        "Wojciech Sadowski",
      ]),
      email: null,
      phone: null,
      licenseNumber: null,
    };

  const budowniczy = new BudowniczyPdf(
    ctx.firma.name,
    `${opis.tytul} · nr ${numer}`,
    `${ctx.firma.name} · ${adresFirmy(ctx.firma)} · ${ctx.firma.email ?? ""}`.trim(),
    `${opis.tytul} — ${ctx.nieruchomosc.title}`,
    ctx.firma.name,
    data,
  );

  const wspolne = {
    firma: ctx.firma,
    nieruchomosc: ctx.nieruchomosc,
    agent: ctx.agent,
    klient: ctx.klient,
    data,
    numer,
  };

  switch (ctx.rodzaj) {
    case "UMOWA_POSREDNICTWA":
      szablonUmowaPosrednictwa(budowniczy, wspolne, d);
      break;
    case "AKT_NOTARIALNY":
      szablonAktNotarialny(budowniczy, { ...wspolne, kontrahent }, d);
      break;
    case "ZASWIADCZENIE_O_NIEZALEGANIU":
      szablonZaswiadczenie(budowniczy, wspolne, d);
      break;
    case "PROTOKOL_ZDAWCZO_ODBIORCZY":
      szablonProtokol(budowniczy, { ...wspolne, kontrahent }, d);
      break;
    case "SWIADECTWO_ENERGETYCZNE":
      szablonSwiadectwo(budowniczy, wspolne, d);
      break;
  }

  const strony = budowniczy.liczbaStron;
  const bytes = budowniczy.zbuduj();
  const nazwaPolska = `${opis.tytul} — ${ctx.nieruchomosc.title}.pdf`;
  const nazwaPliku = `${doAscii(opis.tytul)}-${doAscii(`${d.dzielnica}-${d.typKrotko}`)}-${String(kolejny).padStart(4, "0")}.pdf`;

  return {
    rodzaj: ctx.rodzaj,
    numer,
    name: nazwaPolska,
    fileName: nazwaPliku,
    category: opis.kategoria,
    fileType: "PDF",
    mimeType: "application/pdf",
    format: "pdf",
    bytes,
    sizeBytes: bytes.length,
    strony,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   10. WYSYŁKA DO CLOUDINARY (podpisane REST API, bez pakietu `cloudinary`)
   ──────────────────────────────────────────────────────────────────────────── */

// Zmienne środowiskowe czytamy leniwie: seed-demo.ts woła dotenv.config() dopiero po
// zaimportowaniu modułów, więc odczyt na poziomie modułu widziałby jeszcze pusty process.env.

/** Odpowiednik isCloudinaryConfigured() z realty-nest/src/lib/cloudinary.ts. */
export function czyCloudinarySkonfigurowane(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

/** Odpowiednik safeFolder() z realty-nest/src/lib/cloudinary.ts. */
export function bezpiecznyKatalog(podkatalog?: string | null): string {
  const glowny = process.env.CLOUDINARY_UPLOAD_FOLDER ?? "realty-nest";
  const oczyszczony = (podkatalog ?? "").replace(/[^a-z0-9/_-]/gi, "");
  return oczyszczony ? `${glowny}/${oczyszczony}` : glowny;
}

/** Podpis żądania zgodny z algorytmem SDK Cloudinary: sha1(sorted(params) + api_secret). */
function podpiszParametry(parametry: Record<string, string>, sekret: string): string {
  const doPodpisu = Object.keys(parametry)
    .sort()
    .map((klucz) => `${klucz}=${parametry[klucz]}`)
    .join("&");
  return createHash("sha1").update(`${doPodpisu}${sekret}`, "utf8").digest("hex");
}

let ostrzezenieWypisane = false;
let bledyWysylki = 0;
let wyslanePliki = 0;

function ostrzezBrakKluczy(): void {
  if (ostrzezenieWypisane) return;
  ostrzezenieWypisane = true;
  console.warn(
    [
      "",
      "  ⚠ [dokumenty] Brak konfiguracji Cloudinary — pliki PDF nie zostaną wysłane do magazynu.",
      "    Brakujące zmienne: " +
        (["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const)
          .filter((k) => !process.env[k])
          .join(", "),
      "    Seed zapisze same rekordy metadanych (publicId = null, url = null) — dokładnie tak jak dotychczas,",
      "    więc uruchomienie seeda bez kluczy nie kończy się błędem.",
      "    Aby recenzent mógł pobierać dokumenty, ustaw powyższe zmienne w pliku .env i uruchom seed ponownie.",
      "",
    ].join("\n"),
  );
}

export interface OpcjeWysylki {
  /** Podkatalog wewnątrz CLOUDINARY_UPLOAD_FOLDER. Domyślnie „dokumenty”. */
  folder?: string | null;
  /** Limit czasu żądania w milisekundach. */
  timeoutMs?: number;
}

/**
 * Wysyła wygenerowany PDF do Cloudinary jako zasób „raw” z dostawą „authenticated”.
 *
 * Zwraca `null`, gdy:
 *   • brakuje zmiennych CLOUDINARY_* (wtedy jednorazowo wypisuje czytelny komunikat), albo
 *   • wysyłka się nie powiodła (komunikat błędu trafia do konsoli).
 * Nigdy nie rzuca wyjątkiem — seed ma się wykonać do końca również bez kluczy i bez sieci.
 */
export async function przeslijDokumentDoCloudinary(
  dokument: WygenerowanyDokument,
  opcje: OpcjeWysylki = {},
): Promise<WynikPrzeslania | null> {
  if (!czyCloudinarySkonfigurowane()) {
    ostrzezBrakKluczy();
    return null;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000);
  // Zestaw parametrów odwzorowuje wywołanie uploader.upload() z api/upload/route.ts.
  const parametryPodpisywane: Record<string, string> = {
    folder: bezpiecznyKatalog(opcje.folder ?? "dokumenty"),
    timestamp: String(timestamp),
    type: "authenticated",
    unique_filename: "1",
    use_filename: "1",
  };
  const podpis = podpiszParametry(parametryPodpisywane, apiSecret);

  const formularz = new FormData();
  for (const [klucz, wartosc] of Object.entries(parametryPodpisywane)) formularz.append(klucz, wartosc);
  formularz.append("api_key", apiKey);
  formularz.append("signature", podpis);
  formularz.append(
    "file",
    new Blob([new Uint8Array(dokument.bytes)], { type: "application/pdf" }),
    dokument.fileName,
  );

  try {
    const odpowiedz = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: "POST",
      body: formularz,
      signal: AbortSignal.timeout(opcje.timeoutMs ?? 30_000),
    });

    const tresc = (await odpowiedz.json()) as {
      public_id?: string;
      secure_url?: string;
      url?: string;
      bytes?: number;
      format?: string;
      error?: { message?: string };
    };

    if (!odpowiedz.ok || !tresc.public_id) {
      bledyWysylki++;
      const powod = tresc.error?.message ?? `HTTP ${odpowiedz.status}`;
      console.warn(`  ⚠ [dokumenty] Nie udało się wysłać „${dokument.fileName}”: ${powod}`);
      return null;
    }

    wyslanePliki++;
    return {
      publicId: tresc.public_id,
      url: tresc.secure_url ?? tresc.url ?? "",
      resourceType: "raw",
      deliveryType: "authenticated",
      fileType: "PDF",
      mimeType: "application/pdf",
      // Dla zasobów „raw” Cloudinary zwykle zwraca public_id z rozszerzeniem i pomija `format`;
      // signedDeliveryUrl() radzi sobie z obydwoma przypadkami (patrz test na rozszerzenie).
      format: tresc.format ?? "pdf",
      originalName: dokument.name,
      sizeBytes: tresc.bytes ?? dokument.sizeBytes,
    };
  } catch (blad) {
    bledyWysylki++;
    const powod = blad instanceof Error ? blad.message : String(blad);
    console.warn(`  ⚠ [dokumenty] Błąd sieci przy wysyłce „${dokument.fileName}”: ${powod}`);
    return null;
  }
}

/** Krótkie podsumowanie do wypisania na końcu seeda. */
export function podsumowanieWysylki(): { wyslane: number; bledy: number; skonfigurowane: boolean } {
  return { wyslane: wyslanePliki, bledy: bledyWysylki, skonfigurowane: czyCloudinarySkonfigurowane() };
}

/** Reset liczników — przydatny, gdy seed uruchamiany jest wielokrotnie w jednym procesie. */
export function zerujLiczniki(): void {
  licznikDokumentow = 0;
  wyslanePliki = 0;
  bledyWysylki = 0;
  ostrzezenieWypisane = false;
}

/**
 * Skrót używany przez seed: buduje PDF i (jeśli są klucze) wysyła go do magazynu.
 * Zwraca komplet pól gotowych do `new Document({ ...pola })` — bez publicId/url,
 * gdy magazyn jest niedostępny.
 */
export async function przygotujDokumentDoZapisu(
  ctx: KontekstDokumentu,
  opcje: OpcjeWysylki = {},
): Promise<{
  name: string;
  fileType: "PDF";
  category: DokumentKategoria;
  sizeBytes: number;
  mimeType: "application/pdf";
  format: string | null;
  originalName: string;
  resourceType: "raw";
  deliveryType: "authenticated";
  publicId: string | null;
  url: string | null;
  rodzaj: DokumentRodzaj;
  numer: string;
  strony: number;
}> {
  const dokument = zbudujDokumentPdf(ctx);
  const przeslany = await przeslijDokumentDoCloudinary(dokument, opcje);

  return {
    name: dokument.name,
    fileType: "PDF",
    category: dokument.category,
    sizeBytes: przeslany?.sizeBytes ?? dokument.sizeBytes,
    mimeType: "application/pdf",
    format: przeslany ? przeslany.format : null,
    originalName: dokument.name,
    resourceType: "raw",
    deliveryType: "authenticated",
    publicId: przeslany?.publicId ?? null,
    url: przeslany?.url ?? null,
    rodzaj: dokument.rodzaj,
    numer: dokument.numer,
    strony: dokument.strony,
  };
}
