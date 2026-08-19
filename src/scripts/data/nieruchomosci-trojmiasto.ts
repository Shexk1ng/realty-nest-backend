// Katalog ofert demonstracyjnych dla Trójmiasta (Gdańsk / Gdynia / Sopot).
//
// Plik jest samowystarczalny: nie importuje niczego i definiuje własne typy.
// Każda oferta ma spójny zestaw 5-8 fotografii przedstawiających
// JEDNĄ nieruchomość tego samego typu (mieszkanie: salon / kuchnia / sypialnia /
// łazienka / korytarz / budynek; dom: elewacja / ogród / wnętrza; działka: teren;
// garaż: wnętrze i brama; biuro i lokal: przestrzeń robocza i wejście).
//
// Adresy zdjęć pochodzą z biblioteki src/scripts/data/zdjecia.ts — każdy kadr
// obejrzano w miniaturze i przypisano do JEDNEJ kategorii nieruchomości oraz do skali
// metrażu. Żadne zdjęcie nie trafia więc do ofert dwóch różnych typów, mieszkania do
// 40 m² dostają wyłącznie ujęcia oznaczone jako małe, a jedno zdjęcie występuje
// w najwyżej trzech ofertach w całej bazie.

/* ------------------------------------------------------------------ */
/*  Typy — zgodne z enumami modelu Property i słownikami property-options  */
/* ------------------------------------------------------------------ */

export type TransactionType = "SALE" | "RENT";

export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "STUDIO"
  | "PLOT"
  | "COMMERCIAL"
  | "OFFICE"
  | "GARAGE"
  | "ROOM";

export type MarketType = "PRIMARY" | "SECONDARY";

export type PropertyStatus = "ACTIVE" | "PENDING" | "SOLD" | "WITHDRAWN";

export type OwnershipType =
  | "FULL_OWNERSHIP"
  | "COOPERATIVE"
  | "COOPERATIVE_LAND"
  | "SHARE";

export type PropertyCondition =
  | "READY_TO_MOVE"
  | "GOOD"
  | "AFTER_RENOVATION"
  | "TO_RENOVATE"
  | "FOR_FINISHING"
  | "DEVELOPER_STATE";

export type HeatingType =
  | "DISTRICT"
  | "GAS"
  | "ELECTRIC"
  | "HEAT_PUMP"
  | "SOLID_FUEL"
  | "OTHER";

export type EnergyClass = "A+" | "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type FeatureTag =
  | "balcony"
  | "terrace"
  | "garden"
  | "parking"
  | "garage"
  | "elevator"
  | "basement"
  | "furnished"
  | "ac"
  | "fireplace"
  | "alarm"
  | "concierge"
  | "reception"
  | "fiber"
  | "two_level"
  | "separate_kitchen";

export type Miasto = "Gdańsk" | "Gdynia" | "Sopot";

export interface AdresOferty {
  street: string;
  district: string;
  city: Miasto;
  postalCode: string;
  country: "PL";
  lat: number;
  lng: number;
}

export interface SekcjeOpisu {
  intro: string;
  layout: string | null;
  location: string;
  additional: string;
}

export interface OfertaNieruchomosci {
  title: string;
  /** Cena sprzedaży w zł, a dla najmu — miesięczny czynsz najmu w zł. */
  price: number;
  location: string;
  transactionType: TransactionType;
  propertyType: PropertyType;
  market: MarketType;
  status: PropertyStatus;
  area: number | null;
  plotArea: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  /** Miesięczny czynsz administracyjny / opłata eksploatacyjna w zł. */
  monthlyRent: number | null;
  deposit: number | null;
  ownership: OwnershipType;
  condition: PropertyCondition | null;
  heating: HeatingType | null;
  energyClass: EnergyClass | null;
  availableFrom: string | null;
  features: FeatureTag[];
  address: AdresOferty;
  images: string[];
  imageUrl: string;
  descriptionSections: SekcjeOpisu;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Galerie — adresy z biblioteki src/scripts/data/zdjecia.ts             */
/*  Każde zdjęcie obejrzano w miniaturze i przypisano do jednej kategorii */
/*  nieruchomości oraz do skali metrażu, dlatego adresy wpisano wprost.   */
/* ------------------------------------------------------------------ */

type Szkic = Omit<OfertaNieruchomosci, "imageUrl" | "description">;

const SZKICE: Szkic[] = [];

/* ================================================================== */
/*  GDAŃSK — ŚRÓDMIEŚCIE                                               */
/* ================================================================== */

SZKICE.push(
  {
    title: "Trzy pokoje z widokiem na Motławę, Wyspa Spichrzów",
    price: 1_209_000,
    location: "Gdańsk, Śródmieście",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 62,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 4,
    totalFloors: 7,
    yearBuilt: 2021,
    monthlyRent: 780,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: null,
    features: ["balcony", "elevator", "parking", "basement", "ac", "fiber"],
    address: {
      street: "ul. Chmielna 73",
      district: "Śródmieście",
      city: "Gdańsk",
      postalCode: "80-748",
      country: "PL",
      lat: 54.3487,
      lng: 18.658,
    },
    images: [
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7166645/pexels-photo-7166645.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6934170/pexels-photo-6934170.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/34574604/pexels-photo-34574604.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6933762/pexels-photo-6933762.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1643906652169-a750f3f70848?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Mieszkanie na czwartym piętrze siedmiokondygnacyjnego budynku z 2021 roku, wzniesionego na Wyspie Spichrzów kilkadziesiąt metrów od nabrzeża Motławy. Sześćdziesiąt dwa metry rozłożone na trzy niezależne pokoje.",
      layout:
        "Salon z aneksem kuchennym wychodzi na balkon od strony kanału, obie sypialnie ulokowano od podwórza, więc nocą jest tu cicho mimo ścisłego centrum. Łazienka z oknem, przy wejściu wydzielona garderoba.",
      location:
        "Kładką przez Motławę na Długi Targ i pod Żurawia idzie się niecałe dziesięć minut. W drugą stronę, przez Podwale Przedmiejskie, jest Forum Gdańsk, dworzec Gdańsk Główny i przystanki tramwajowe.",
      additional:
        "Do lokalu przynależy miejsce postojowe w hali garażowej i komórka lokatorska na poziomie -1. Ogrzewanie miejskie, czynsz administracyjny 780 zł, księga wieczysta bez obciążeń.",
    },
  },
  {
    title: "Dwupokojowe przy Szafarni, 200 m od Mariny Gdańsk",
    price: 984_000,
    location: "Gdańsk, Śródmieście",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "PENDING",
    area: 48,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    totalFloors: 6,
    yearBuilt: 2018,
    monthlyRent: 610,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: null,
    features: ["balcony", "elevator", "garage", "basement", "ac", "fiber"],
    address: {
      street: "ul. Szafarnia 11",
      district: "Śródmieście",
      city: "Gdańsk",
      postalCode: "80-755",
      country: "PL",
      lat: 54.3505,
      lng: 18.66,
    },
    images: [
      "https://images.pexels.com/photos/19866414/pexels-photo-19866414.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6908565/pexels-photo-6908565.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8135505/pexels-photo-8135505.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1587527901949-ab0341697c1e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7019012/pexels-photo-7019012.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1643906652169-a750f3f70848?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Czterdzieści osiem metrów w kameralnym budynku przy Szafarni, dwie minuty spacerem od kei Mariny Gdańsk. Mieszkanie utrzymane w jasnej kolorystyce, gotowe do wprowadzenia bez żadnych prac.",
      layout:
        "Rozkład dwupokojowy: salon połączony z kuchnią otwartą na jadalnię oraz osobna sypialnia z szafą w zabudowie. Balkon od strony południowej, łazienka z pralką w zabudowie pod blatem.",
      location:
        "Wzdłuż Motławy dojdzie się stąd do Ołowianki i Filharmonii Bałtyckiej, a mostem zwodzonym na Stągiewnej — prosto na Długi Targ. Przystanek tramwajowy Brama Nizinna oddalony jest o 400 m.",
      additional:
        "W cenie miejsce w garażu podziemnym oraz komórka. Oferta jest obecnie zarezerwowana, przyjmujemy zgłoszenia rezerwowe. Czynsz administracyjny 610 zł łącznie z funduszem remontowym.",
    },
  },
  {
    title: "Wynajem: 2 pokoje przy Długich Ogrodach, umeblowane",
    price: 3_400,
    location: "Gdańsk, Śródmieście",
    transactionType: "RENT",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 41,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    totalFloors: 5,
    yearBuilt: 2007,
    monthlyRent: 520,
    deposit: 6_800,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: "2026-09-15",
    features: ["furnished", "balcony", "elevator", "basement", "fiber"],
    address: {
      street: "ul. Długie Ogrody 25",
      district: "Śródmieście",
      city: "Gdańsk",
      postalCode: "80-765",
      country: "PL",
      lat: 54.3512,
      lng: 18.664,
    },
    images: [
      "https://images.pexels.com/photos/7836571/pexels-photo-7836571.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6186828/pexels-photo-6186828.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7147299/pexels-photo-7147299.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1616537937163-387d3f079de8?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19857261/pexels-photo-19857261.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Umeblowane mieszkanie dwupokojowe o powierzchni 41 m² przy Długich Ogrodach, w budynku z 2007 roku z windą. Wynajmowane w całości wyposażone — łącznie ze sprzętem AGD i pościelą.",
      layout:
        "Salon z rozkładaną kanapą i aneksem kuchennym, obok osobna sypialnia z podwójnym łóżkiem i biurkiem. Balkon od strony podwórza, w przedpokoju szafa na całą ścianę.",
      location:
        "Do Bramy Żuławskiej i przystanku tramwajowego jest 150 m, a na Długi Targ idzie się kwadrans wzdłuż Motławy. W sąsiedztwie targ przy Wałowej, Zielony Rynek i wejście na Opływ Motławy.",
      additional:
        "Kaucja 6 800 zł, czynsz administracyjny 520 zł płatny do wspólnoty, media według liczników. Preferowany najem długoterminowy od połowy września, bez zwierząt.",
    },
  },
  {
    title: "Kawalerka 28 m² na Ogarnej, po gruntownym remoncie",
    price: 498_000,
    location: "Gdańsk, Śródmieście",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 28,
    plotArea: null,
    rooms: 1,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 1958,
    monthlyRent: 380,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "GAS",
    energyClass: "E",
    availableFrom: null,
    features: ["furnished", "fiber", "basement"],
    address: {
      street: "ul. Ogarna 108",
      district: "Śródmieście",
      city: "Gdańsk",
      postalCode: "80-826",
      country: "PL",
      lat: 54.3496,
      lng: 18.6521,
    },
    images: [
      "https://images.pexels.com/photos/6890400/pexels-photo-6890400.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6890399/pexels-photo-6890399.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/33054906/pexels-photo-33054906.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6436758/pexels-photo-6436758.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1542309175-9b88d743f89f?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Kawalerka o powierzchni 28 m² w kamienicy z odbudowy Głównego Miasta, przy Ogarnej. Remont zakończono w ubiegłym roku: nowe instalacje, okna i podłogi.",
      layout:
        "Jedno duże pomieszczenie z aneksem kuchennym po lewej stronie od wejścia i wydzieloną strefą spania przy oknie. Łazienka z prysznicem walk-in, w przedpokoju miejsce na szafę wnękową.",
      location:
        "Ogarna biegnie równolegle do Długiej, więc na Długi Targ i pod Ratusz Głównego Miasta idzie się trzy minuty. Przystanek tramwajowy Brama Wyżynna i Targ Węglowy są w tej samej odległości.",
      additional:
        "Piec gazowy dwufunkcyjny, ogrzewanie i ciepła woda niezależne od wspólnoty. Do mieszkania należy piwnica. Lokal sprawdza się zarówno pod najem krótkoterminowy, jak i dla jednej osoby.",
    },
  },
  {
    title: "Lokal gastronomiczny 96 m² przy Podwalu Staromiejskim",
    price: 12_500,
    location: "Gdańsk, Śródmieście",
    transactionType: "RENT",
    propertyType: "COMMERCIAL",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 96,
    plotArea: null,
    rooms: 3,
    bedrooms: null,
    bathrooms: 2,
    floor: 0,
    totalFloors: 5,
    yearBuilt: 1970,
    monthlyRent: 1_900,
    deposit: 25_000,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: "2026-10-01",
    features: ["ac", "alarm", "fiber"],
    address: {
      street: "ul. Podwale Staromiejskie 105",
      district: "Śródmieście",
      city: "Gdańsk",
      postalCode: "80-844",
      country: "PL",
      lat: 54.3486,
      lng: 18.6516,
    },
    images: [
      "https://images.unsplash.com/photo-1667388969250-1c7220bf3f37?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1729394405518-eaf2a0203aa7?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/18823960/pexels-photo-18823960.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7385395/pexels-photo-7385395.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/20659383/pexels-photo-20659383.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Lokal gastronomiczny o powierzchni 96 m² w parterze budynku przy Podwalu Staromiejskim, z witryną od strony ulicy. Poprzedni najemca prowadził tu bistro, wyposażenie zaplecza pozostaje na miejscu.",
      layout:
        "Sala konsumpcyjna na około 40 miejsc, za nią bar z podłączonym szynkwasem, kuchnia z wentylacją mechaniczną i osobne zaplecze socjalne. Dwie toalety, w tym jedna dostępna dla gości.",
      location:
        "Podwale Staromiejskie prowadzi wprost do Hali Targowej i Kościoła św. Katarzyny, w promieniu 300 m są Wielki Młyn oraz przystanki tramwajowe. Ruch pieszy utrzymuje się tu przez cały sezon.",
      additional:
        "Umowa na minimum trzy lata, kaucja w wysokości dwóch czynszów. Opłata eksploatacyjna 1 900 zł miesięcznie, media rozliczane osobno. Zgoda właściciela na wyprowadzenie ogródka letniego.",
    },
  },
  {
    title: "Powierzchnia biurowa 180 m² na Młodym Mieście",
    price: 14_400,
    location: "Gdańsk, Śródmieście",
    transactionType: "RENT",
    propertyType: "OFFICE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 180,
    plotArea: null,
    rooms: 6,
    bedrooms: null,
    bathrooms: 2,
    floor: 3,
    totalFloors: 6,
    yearBuilt: 2019,
    monthlyRent: 2_700,
    deposit: 28_800,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: "2026-09-01",
    features: ["ac", "elevator", "parking", "reception", "alarm", "fiber"],
    address: {
      street: "ul. Wałowa 21",
      district: "Śródmieście",
      city: "Gdańsk",
      postalCode: "80-858",
      country: "PL",
      lat: 54.356,
      lng: 18.648,
    },
    images: [
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1706074793638-da28b90ea8ae?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1706074797611-a02f9ed06439?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1643267514395-b36b3f7e8281?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1677272292136-0a6b269fd671?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Sto osiemdziesiąt metrów powierzchni biurowej na trzecim piętrze budynku z 2019 roku przy Wałowej, w kwartale Młodego Miasta. Moduł wykończony, gotowy do zajęcia od zaraz.",
      layout:
        "Open space na 18 stanowisk, cztery gabinety wydzielone szklanymi ściankami, sala konferencyjna na 10 osób oraz aneks socjalny z pełną zabudową. Dwie łazienki i pomieszczenie serwerowe.",
      location:
        "Dwieście metrów do Europejskiego Centrum Solidarności i przystanku tramwajowego Brama Oliwska, kwadrans pieszo do dworca Gdańsk Główny. Wokół gastronomia Stoczni i nabrzeże Motławy.",
      additional:
        "Czynsz najmu 80 zł za metr, opłata eksploatacyjna 2 700 zł miesięcznie. Do modułu przypisane są cztery miejsca w garażu podziemnym. Recepcja budynku czynna w godzinach 7-19.",
    },
  },
  {
    title: "Kamienica na Dolnym Mieście, 74 m² do remontu",
    price: 873_000,
    location: "Gdańsk, Śródmieście",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 74,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 1,
    totalFloors: 4,
    yearBuilt: 1938,
    monthlyRent: 420,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "TO_RENOVATE",
    heating: "SOLID_FUEL",
    energyClass: "F",
    availableFrom: null,
    features: ["basement", "separate_kitchen"],
    address: {
      street: "ul. Toruńska 18",
      district: "Śródmieście",
      city: "Gdańsk",
      postalCode: "80-747",
      country: "PL",
      lat: 54.3452,
      lng: 18.6597,
    },
    images: [
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1603825491103-bd638b1873b0?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6312359/pexels-photo-6312359.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1775210727503-227edc39ad20?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Mieszkanie o powierzchni 74 m² na pierwszym piętrze przedwojennej kamienicy na Dolnym Mieście. Lokal wymaga kompleksowego remontu, ale zachował oryginalne drzwi płycinowe i sztukaterię w dwóch pokojach.",
      layout:
        "Układ amfiladowy z korytarzem: trzy pokoje o wysokości 3,2 m, osobna kuchnia z oknem i łazienka wydzielona w latach osiemdziesiątych. Do zmiany instalacja elektryczna i wodno-kanalizacyjna.",
      location:
        "Toruńska leży kilkaset metrów od Opływu Motławy i bastionów, a ulicą Łąkową dojdzie się do przystanku tramwajowego w pięć minut. Na Długi Targ jest stąd niecałe dwadzieścia minut pieszo.",
      additional:
        "Ogrzewanie piecowe, kamienica po remoncie dachu w 2022 roku. Do mieszkania należy piwnica i udział w podwórzu. Cena uwzględnia stan techniczny — właściciel nie prowadzi negocjacji poniżej 850 000 zł.",
    },
  },
);

/* ================================================================== */
/*  GDAŃSK — OLIWA                                                     */
/* ================================================================== */

SZKICE.push(
  {
    title: "Trzy pokoje w przedwojennej willi przy Parku Oliwskim",
    price: 928_000,
    location: "Gdańsk, Oliwa",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 58,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 1,
    totalFloors: 3,
    yearBuilt: 1936,
    monthlyRent: 540,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "fireplace", "separate_kitchen", "garden"],
    address: {
      street: "ul. Opacka 9",
      district: "Oliwa",
      city: "Gdańsk",
      postalCode: "80-338",
      country: "PL",
      lat: 54.4098,
      lng: 18.5646,
    },
    images: [
      "https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7195739/pexels-photo-7195739.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19980080/pexels-photo-19980080.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6903210/pexels-photo-6903210.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7546639/pexels-photo-7546639.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/16205089/pexels-photo-16205089.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Pięćdziesiąt osiem metrów na pierwszym piętrze willi z 1936 roku przy Opackiej, dosłownie przy murze Parku Oliwskiego. Trzy pokoje z zachowanymi drewnianymi podłogami i piecem kaflowym w salonie.",
      layout:
        "Salon z wyjściem na balkon od strony parku, dwie sypialnie od podwórza, osobna kuchnia z oknem i spiżarką. Łazienka po odświeżeniu w 2021 roku, w przedpokoju zabudowa na wymiar.",
      location:
        "Brama Parku Oliwskiego i katedra z organami są 200 m stąd, ZOO Gdańsk — dwadzieścia minut spacerem przez Dolinę Radości. Do przystanku SKM Gdańsk Oliwa i pętli tramwajowej idzie się osiem minut.",
      additional:
        "Wspólnota trzech lokali, ogrzewanie gazowe własne, roczny koszt utrzymania niski. Do mieszkania należy piwnica oraz prawo do korzystania z ogrodu za budynkiem. Kominek sprawny, z aktualnym przeglądem.",
    },
  },
  {
    title: "Dom 156 m² z ogrodem przy Dolinie Radości, Oliwa",
    price: 2_262_000,
    location: "Gdańsk, Oliwa",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 156,
    plotArea: 520,
    rooms: 5,
    bedrooms: 4,
    bathrooms: 2,
    floor: null,
    totalFloors: 2,
    yearBuilt: 1972,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["garden", "garage", "fireplace", "terrace", "basement", "fiber"],
    address: {
      street: "ul. Kwietna 6",
      district: "Oliwa",
      city: "Gdańsk",
      postalCode: "80-339",
      country: "PL",
      lat: 54.4142,
      lng: 18.5545,
    },
    images: [
      "https://images.pexels.com/photos/33050276/pexels-photo-33050276.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1624018171446-c4f0b942cf87?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/10153051/pexels-photo-10153051.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/20771843/pexels-photo-20771843.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6492399/pexels-photo-6492399.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/15412016/pexels-photo-15412016.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Wolnostojący dom z 1972 roku o powierzchni 156 m² na działce 520 m² przy Kwietnej, w spokojnej części Oliwy pod lasem. Budynek był systematycznie modernizowany, ostatnio wymieniono okna i pokrycie dachu.",
      layout:
        "Na parterze salon z kominkiem, kuchnia z jadalnią i gabinet, na piętrze trzy sypialnie oraz druga łazienka. Do tego podpiwniczenie z pralnią i garaż w bryle budynku.",
      location:
        "Wejście do Doliny Radości i szlaki Trójmiejskiego Parku Krajobrazowego zaczynają się 400 m dalej, do Parku Oliwskiego i katedry jest kilometr. Przystanek autobusowy przy Polankach zapewnia dojazd do SKM Oliwa.",
      additional:
        "Ogród urządzony, z tarasem od południa i starymi drzewami owocowymi. Ogrzewanie gazowe z 2019 roku, dom podłączony do światłowodu. Stan prawny uregulowany, jeden właściciel od 1998 roku.",
    },
  },
  {
    title: "Willa 214 m² przy ul. Polanki, działka 780 m²",
    price: 3_317_000,
    location: "Gdańsk, Oliwa",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 214,
    plotArea: 780,
    rooms: 6,
    bedrooms: 4,
    bathrooms: 3,
    floor: null,
    totalFloors: 2,
    yearBuilt: 1998,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "HEAT_PUMP",
    energyClass: "C",
    availableFrom: null,
    features: ["garden", "garage", "terrace", "fireplace", "alarm", "fiber"],
    address: {
      street: "ul. Polanki 118",
      district: "Oliwa",
      city: "Gdańsk",
      postalCode: "80-308",
      country: "PL",
      lat: 54.4128,
      lng: 18.5583,
    },
    images: [
      "https://images.pexels.com/photos/7031604/pexels-photo-7031604.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1669564751571-7039ebe6aa45?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19846360/pexels-photo-19846360.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/34733202/pexels-photo-34733202.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6587852/pexels-photo-6587852.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/34574591/pexels-photo-34574591.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Dwustukilkunastometrowa willa z 1998 roku przy alei Polanki, jednej z najbardziej rozpoznawalnych ulic Oliwy. Działka 780 m² ze starodrzewem, dom po modernizacji instalacji grzewczej.",
      layout:
        "Parter to otwarty salon z kominkiem połączony z jadalnią i kuchnią oraz gabinet i łazienka gościnna. Na piętrze cztery sypialnie, w tym główna z garderobą i własną łazienką, oraz taras.",
      location:
        "Polanki prowadzą wprost do Parku Oliwskiego i katedry, a w drugą stronę — do Doliny Radości. Kampus Uniwersytetu Gdańskiego przy Bażyńskiego i przystanek SKM Gdańsk Oliwa są w promieniu kilometra.",
      additional:
        "Ogrzewanie pompą ciepła zamontowaną w 2022 roku, dom objęty monitoringiem i alarmem. Garaż dwustanowiskowy, podjazd na cztery samochody. Możliwe przejęcie części wyposażenia w cenie.",
    },
  },
  {
    title: "Działka budowlana 1050 m² w Oliwie, przy lesie",
    price: 1_838_000,
    location: "Gdańsk, Oliwa",
    transactionType: "SALE",
    propertyType: "PLOT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: null,
    plotArea: 1050,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    floor: null,
    totalFloors: null,
    yearBuilt: null,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: null,
    heating: null,
    energyClass: null,
    availableFrom: null,
    features: [],
    address: {
      street: "ul. Czyżewskiego",
      district: "Oliwa",
      city: "Gdańsk",
      postalCode: "80-336",
      country: "PL",
      lat: 54.4046,
      lng: 18.562,
    },
    images: [
      "https://images.pexels.com/photos/37462581/pexels-photo-37462581.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/37305883/pexels-photo-37305883.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/3997049/pexels-photo-3997049.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/37244497/pexels-photo-37244497.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/31596607/pexels-photo-31596607.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Działka budowlana o powierzchni 1050 m² przy Czyżewskiego w Oliwie, w drugiej linii zabudowy jednorodzinnej. Teren płaski, zadrzewiony po zachodniej granicy, bez konieczności niwelacji.",
      layout: null,
      location:
        "Granica Trójmiejskiego Parku Krajobrazowego przebiega 300 m od działki, a do Parku Oliwskiego i katedry jest niecały kilometr. Przystanek SKM Gdańsk Oliwa oddalony jest o dwa przystanki autobusowe.",
      additional:
        "Miejscowy plan zagospodarowania dopuszcza zabudowę jednorodzinną wolnostojącą do dwóch kondygnacji. Media — woda, prąd i gaz — w drodze przy granicy działki. Kształt zbliżony do prostokąta o wymiarach ok. 25 × 42 m.",
    },
  },
  {
    title: "Wynajem: 46 m² przy SKM Gdańsk Oliwa",
    price: 3_200,
    location: "Gdańsk, Oliwa",
    transactionType: "RENT",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 46,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 5,
    totalFloors: 11,
    yearBuilt: 2015,
    monthlyRent: 560,
    deposit: 6_400,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: "2026-09-01",
    features: ["balcony", "elevator", "furnished", "parking", "fiber"],
    address: {
      street: "al. Grunwaldzka 501",
      district: "Oliwa",
      city: "Gdańsk",
      postalCode: "80-309",
      country: "PL",
      lat: 54.4073,
      lng: 18.5702,
    },
    images: [
      "https://images.pexels.com/photos/19866421/pexels-photo-19866421.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19966809/pexels-photo-19966809.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8082562/pexels-photo-8082562.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7546318/pexels-photo-7546318.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1584093083495-74184f19a8cb?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Dwupokojowe mieszkanie 46 m² na piątym piętrze budynku z 2015 roku przy alei Grunwaldzkiej w Oliwie. Lokal umeblowany, z widokiem na zieleń od strony zachodniej.",
      layout:
        "Salon z aneksem kuchennym i wyjściem na balkon, osobna sypialnia z łóżkiem 160 cm i szafą przesuwną. Łazienka z kabiną prysznicową i pralką, przedpokój z zabudową na buty i odzież.",
      location:
        "Przystanek SKM Gdańsk Oliwa jest 350 m stąd, przy nim pętla tramwajowa i autobusowa. Park Oliwski, kampus Uniwersytetu Gdańskiego i galeria przy Grunwaldzkiej mieszczą się w piętnastu minutach spacerem.",
      additional:
        "Kaucja 6 400 zł, czynsz administracyjny 560 zł, media według liczników. W cenie miejsce postojowe w garażu podziemnym. Dostępne od 1 września, preferowana umowa na rok z opcją przedłużenia.",
    },
  },
);

/* ================================================================== */
/*  GDAŃSK — WRZESZCZ                                                  */
/* ================================================================== */

SZKICE.push(
  {
    title: "Kamienica przy Wajdeloty — 67 m² po remoncie",
    price: 1_018_000,
    location: "Gdańsk, Wrzeszcz",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 67,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 1928,
    monthlyRent: 610,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["basement", "fiber", "separate_kitchen", "balcony"],
    address: {
      street: "ul. Wajdeloty 22",
      district: "Wrzeszcz",
      city: "Gdańsk",
      postalCode: "80-437",
      country: "PL",
      lat: 54.3789,
      lng: 18.5951,
    },
    images: [
      "https://images.unsplash.com/photo-1615800002234-05c4d488696c?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6908565/pexels-photo-6908565.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8135505/pexels-photo-8135505.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7534282/pexels-photo-7534282.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6312359/pexels-photo-6312359.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1782923825215-40b24a0778e9?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Sześćdziesiąt siedem metrów na drugim piętrze kamienicy z 1928 roku przy Wajdeloty, po remoncie zakończonym w 2024 roku. Zachowano wysokość 3,1 m, sztukaterię i oryginalną stolarkę drzwiową.",
      layout:
        "Trzy pokoje rozkładowe: salon od frontu z balkonem, dwie sypialnie od podwórza. Kuchnia osobna, z oknem i miejscem na stół, łazienka z wanną wolnostojącą i pralką w zabudowie.",
      location:
        "Wajdeloty to deptak z kawiarniami, wychodzący prosto na Park Kuźniczki i Dolinę Zdrowia. Do dworca SKM Gdańsk Wrzeszcz i Galerii Bałtyckiej idzie się osiem minut, do Politechniki Gdańskiej — dwanaście.",
      additional:
        "Wymieniona instalacja elektryczna i hydraulika, nowy piec gazowy dwufunkcyjny. Kamienica po termomodernizacji, klatka schodowa odnowiona w 2023 roku. Do mieszkania należy piwnica o powierzchni 8 m².",
    },
  },
  {
    title: "Dwa pokoje przy Jaśkowej Dolinie, 54 m²",
    price: 734_000,
    location: "Gdańsk, Wrzeszcz",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "SOLD",
    area: 54,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    totalFloors: 5,
    yearBuilt: 1972,
    monthlyRent: 640,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "fiber"],
    address: {
      street: "ul. Jaśkowa Dolina 44",
      district: "Wrzeszcz",
      city: "Gdańsk",
      postalCode: "80-252",
      country: "PL",
      lat: 54.3742,
      lng: 18.5885,
    },
    images: [
      "https://images.pexels.com/photos/19866404/pexels-photo-19866404.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6527057/pexels-photo-6527057.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/30767888/pexels-photo-30767888.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1643949700215-e61cdca053f7?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7546558/pexels-photo-7546558.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1580216643062-cf460548a66a?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Mieszkanie 54 m² na trzecim piętrze bloku z 1972 roku przy Jaśkowej Dolinie. Transakcja została sfinalizowana w tym sezonie — oferta pozostaje w systemie jako materiał porównawczy dla dzielnicy.",
      layout:
        "Duży salon z wyjściem na balkon od strony zachodniej, sypialnia z oknem na zieleń oraz kuchnia w układzie zamkniętym. Łazienka po odświeżeniu, osobna toaleta obok przedpokoju.",
      location:
        "Jaśkowa Dolina wspina się od Grunwaldzkiej w stronę lasu — przystanek autobusowy jest pod blokiem, a do dworca SKM Gdańsk Wrzeszcz jedzie się trzy przystanki. Galeria Bałtycka w odległości kilometra.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu z założoną księgą wieczystą. Ogrzewanie miejskie, czynsz 640 zł z zaliczką na ciepło. Do lokalu przynależy piwnica; blok po ociepleniu w 2016 roku.",
    },
  },
  {
    title: "Wynajem: 38 m² przy Partyzantów, blisko Politechniki",
    price: 2_700,
    location: "Gdańsk, Wrzeszcz",
    transactionType: "RENT",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 38,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 4,
    totalFloors: 5,
    yearBuilt: 1965,
    monthlyRent: 480,
    deposit: 5_400,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "E",
    availableFrom: "2026-09-01",
    features: ["furnished", "balcony", "fiber", "basement"],
    address: {
      street: "ul. Partyzantów 76",
      district: "Wrzeszcz",
      city: "Gdańsk",
      postalCode: "80-254",
      country: "PL",
      lat: 54.3814,
      lng: 18.5926,
    },
    images: [
      "https://images.unsplash.com/photo-1632829882891-5047ccc421bc?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7614540/pexels-photo-7614540.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6899357/pexels-photo-6899357.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7195899/pexels-photo-7195899.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1567505477286-9c7269119db7?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Umeblowane mieszkanie dwupokojowe 38 m² na czwartym piętrze przy Partyzantów. Lokal wynajmowany od lat studentom i pracownikom uczelni, wyposażenie kompletne i sprawne.",
      layout:
        "Pokój dzienny z rozkładaną sofą i biurkiem, mniejsza sypialnia z łóżkiem 140 cm, kuchnia w osobnym pomieszczeniu. Balkon od strony podwórza, łazienka z wanną i pralką.",
      location:
        "Gmachy Politechniki Gdańskiej są sześć minut spacerem, przystanek tramwajowy Wyspiańskiego — trzy. Do Galerii Bałtyckiej i dworca SKM Gdańsk Wrzeszcz idzie się kwadrans przez Park Kuźniczki.",
      additional:
        "Kaucja 5 400 zł, czynsz spółdzielczy 480 zł, prąd i internet na najemcę. Umowa od września na cały rok akademicki lub dłużej. Dopuszczalny najem dla dwóch osób.",
    },
  },
  {
    title: "Nowa inwestycja przy Grunwaldzkiej — 89 m², 4 pokoje",
    price: 1_531_000,
    location: "Gdańsk, Wrzeszcz",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "PRIMARY",
    status: "ACTIVE",
    area: 89,
    plotArea: null,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    floor: 6,
    totalFloors: 8,
    yearBuilt: 2026,
    monthlyRent: 890,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "DEVELOPER_STATE",
    heating: "DISTRICT",
    energyClass: "A",
    availableFrom: "2026-12-01",
    features: ["balcony", "elevator", "garage", "basement", "ac", "fiber"],
    address: {
      street: "al. Grunwaldzka 141",
      district: "Wrzeszcz",
      city: "Gdańsk",
      postalCode: "80-264",
      country: "PL",
      lat: 54.3856,
      lng: 18.6013,
    },
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/8135493/pexels-photo-8135493.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1551361415-69c87624334f?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1629079447777-1e605162dc8d?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Czteropokojowy lokal o powierzchni 89 m² na szóstym piętrze budynku oddawanego w grudniu 2026 roku przy alei Grunwaldzkiej. Sprzedaż z rynku pierwotnego, stan deweloperski.",
      layout:
        "Salon z otwartą kuchnią i wyjściem na balkon o powierzchni 9 m², trzy sypialnie oraz dwie łazienki — jedna z wanną, druga z prysznicem przy pokoju głównym. Pomieszczenie gospodarcze przy wejściu.",
      location:
        "Aleja Grunwaldzka to główna oś Wrzeszcza: Galeria Bałtycka, dworzec SKM Gdańsk Wrzeszcz i przystanki tramwajowe znajdują się w promieniu 600 m. Kompleks Garnizon z gastronomią jest po drugiej stronie ulicy.",
      additional:
        "Budynek w klasie energetycznej A, z rekuperacją i przygotowaniem pod klimatyzację. W cenie miejsce w hali garażowej; komórka lokatorska za dopłatą 28 000 zł. Umowa deweloperska z rachunkiem powierniczym.",
    },
  },
  {
    title: "Willa z 1936 roku w Jaśkowej Dolinie, 178 m²",
    price: 2_634_000,
    location: "Gdańsk, Wrzeszcz",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 178,
    plotArea: 620,
    rooms: 5,
    bedrooms: 4,
    bathrooms: 2,
    floor: null,
    totalFloors: 2,
    yearBuilt: 1936,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "E",
    availableFrom: null,
    features: ["garden", "fireplace", "basement", "terrace", "garage"],
    address: {
      street: "ul. Jaśkowa Dolina 106",
      district: "Wrzeszcz",
      city: "Gdańsk",
      postalCode: "80-252",
      country: "PL",
      lat: 54.3703,
      lng: 18.5822,
    },
    images: [
      "https://images.pexels.com/photos/12458357/pexels-photo-12458357.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1695550056778-de79c8cd909e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19878515/pexels-photo-19878515.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7746627/pexels-photo-7746627.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7045848/pexels-photo-7045848.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6773787/pexels-photo-6773787.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Przedwojenna willa o powierzchni 178 m² w górnej części Jaśkowej Doliny, na działce 620 m² wtopionej w zbocze. Budynek zachował układ i detale z 1936 roku, po remoncie dachu i elewacji.",
      layout:
        "Parter mieści salon z kominkiem, jadalnię i kuchnię z wyjściem na taras, piętro — cztery sypialnie i łazienkę. Poddasze użytkowe do adaptacji, pełne podpiwniczenie z kotłownią i pralnią.",
      location:
        "Powyżej domu zaczyna się Trójmiejski Park Krajobrazowy z trasami biegowymi, poniżej — Wrzeszcz z Galerią Bałtycką i dworcem SKM. Przystanek autobusowy przy posesji, do centrum Wrzeszcza dziesięć minut jazdy.",
      additional:
        "Ogrzewanie gazowe, kocioł wymieniony w 2020 roku. Ogród ze starodrzewem i tarasem od południa, garaż wolnostojący na jeden samochód. Nieruchomość nie jest wpisana do rejestru zabytków.",
    },
  },
  {
    title: "Miejsce garażowe w hali przy Kościuszki, Wrzeszcz",
    price: 92_000,
    location: "Gdańsk, Wrzeszcz",
    transactionType: "SALE",
    propertyType: "GARAGE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 16,
    plotArea: null,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    floor: -1,
    totalFloors: null,
    yearBuilt: 2012,
    monthlyRent: 140,
    deposit: null,
    ownership: "SHARE",
    condition: null,
    heating: null,
    energyClass: null,
    availableFrom: null,
    features: ["parking", "alarm"],
    address: {
      street: "ul. Kościuszki 18",
      district: "Wrzeszcz",
      city: "Gdańsk",
      postalCode: "80-451",
      country: "PL",
      lat: 54.3823,
      lng: 18.5978,
    },
    images: [
      "https://images.pexels.com/photos/20589694/pexels-photo-20589694.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/28986802/pexels-photo-28986802.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/11850871/pexels-photo-11850871.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1619335680796-54f13b88c6ba?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7996765/pexels-photo-7996765.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Miejsce postojowe o powierzchni 16 m² w podziemnej hali garażowej budynku z 2012 roku przy Kościuszki. Stanowisko szerokie, przy słupie tylko z jednej strony, bez problemu mieści auto klasy SUV.",
      layout: null,
      location:
        "Hala znajduje się w środku Wrzeszcza, 300 m od Galerii Bałtyckiej i przystanku tramwajowego. Rozwiązuje problem parkowania w strefie płatnej, która obejmuje cały ten kwartał.",
      additional:
        "Sprzedaż udziału w lokalu niemieszkalnym z prawem do wyłącznego korzystania z konkretnego stanowiska. Brama na pilota, hala monitorowana. Opłata eksploatacyjna 140 zł miesięcznie.",
    },
  },
  {
    title: "Pokój 14 m² w trzypokojowym mieszkaniu, Wrzeszcz",
    price: 1_250,
    location: "Gdańsk, Wrzeszcz",
    transactionType: "RENT",
    propertyType: "ROOM",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 14,
    plotArea: null,
    rooms: 1,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    totalFloors: 5,
    yearBuilt: 1962,
    monthlyRent: 200,
    deposit: 1_250,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "E",
    availableFrom: "2026-10-01",
    features: ["furnished", "fiber", "balcony"],
    address: {
      street: "ul. Miszewskiego 12",
      district: "Wrzeszcz",
      city: "Gdańsk",
      postalCode: "80-239",
      country: "PL",
      lat: 54.38,
      lng: 18.6045,
    },
    images: [
      "https://images.pexels.com/photos/26556327/pexels-photo-26556327.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19966757/pexels-photo-19966757.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/5556177/pexels-photo-5556177.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7005279/pexels-photo-7005279.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1630699144461-733d6eaf19b1?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Pokój jednoosobowy o powierzchni 14 m² w trzypokojowym mieszkaniu przy Miszewskiego. Pozostałe dwa pokoje zajmują studentki Politechniki, mieszkanie prowadzone spokojnie i bez imprez.",
      layout:
        "Pokój umeblowany: łóżko 90 cm, biurko, regał i szafa. Kuchnia, łazienka i balkon do wspólnego użytku, każdy lokator ma własną półkę w lodówce i szafce.",
      location:
        "Miszewskiego odchodzi od alei Zwycięstwa naprzeciwko kampusu Politechniki Gdańskiej — na wydziały idzie się pięć minut. Przystanek tramwajowy Politechnika oraz sklepy przy Grunwaldzkiej są w pobliżu.",
      additional:
        "Czynsz 1 250 zł obejmuje media do ustalonego limitu, dodatkowo 200 zł opłaty administracyjnej. Kaucja równa jednemu czynszowi. Wolne od października, umowa na dziesięć miesięcy lub na rok.",
    },
  },
);

/* ================================================================== */
/*  GDAŃSK — ZASPA                                                     */
/* ================================================================== */

SZKICE.push(
  {
    title: "Trzy pokoje przy Pilotów, 47 m² z widokiem na murale",
    price: 583_000,
    location: "Gdańsk, Zaspa",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 47,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 7,
    totalFloors: 11,
    yearBuilt: 1980,
    monthlyRent: 690,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "elevator", "basement", "fiber"],
    address: {
      street: "ul. Pilotów 21",
      district: "Zaspa",
      city: "Gdańsk",
      postalCode: "80-460",
      country: "PL",
      lat: 54.3937,
      lng: 18.6039,
    },
    images: [
      "https://images.pexels.com/photos/5490904/pexels-photo-5490904.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7005291/pexels-photo-7005291.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7546276/pexels-photo-7546276.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1643949719317-4342d8d4031e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6394543/pexels-photo-6394543.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1619542402915-dcaf30e4e2a1?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Klasyczne M4 o powierzchni 47 m² na siódmym piętrze wieżowca przy Pilotów. Mieszkanie utrzymane w dobrym stanie, z widokiem na ściany szczytowe pokryte muralami Kolekcji Malarstwa Monumentalnego.",
      layout:
        "Salon z balkonem, dwie mniejsze sypialnie i kuchnia w układzie zamkniętym z oknem. Łazienka i toaleta osobno, w przedpokoju wnęka na szafę wykorzystana pod zabudowę.",
      location:
        "Zaspa to osiedle rozplanowane wokół zieleni dawnego lotniska — do parku i alei Jana Pawła II jest 200 m. Przystanek SKM Gdańsk Zaspa oddalony o osiem minut, plaża w Brzeźnie o trzy kilometry.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu, księga wieczysta założona. Budynek po termomodernizacji i wymianie wind w 2019 roku. Czynsz 690 zł z zaliczkami, piwnica w cenie.",
    },
  },
  {
    title: "Startowa 5 — 61 m² po remoncie, niskie piętro",
    price: 787_000,
    location: "Gdańsk, Zaspa",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "PENDING",
    area: 61,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 2,
    totalFloors: 5,
    yearBuilt: 1985,
    monthlyRent: 720,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "AFTER_RENOVATION",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "basement", "fiber", "separate_kitchen"],
    address: {
      street: "ul. Startowa 5",
      district: "Zaspa",
      city: "Gdańsk",
      postalCode: "80-461",
      country: "PL",
      lat: 54.3958,
      lng: 18.6088,
    },
    images: [
      "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6186828/pexels-photo-6186828.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7147299/pexels-photo-7147299.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7005476/pexels-photo-7005476.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8135493/pexels-photo-8135493.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Sześćdziesiąt jeden metrów na drugim piętrze pięciokondygnacyjnego budynku przy Startowej, po remoncie zakończonym w 2023 roku. Wymieniono instalacje, podłogi, stolarkę wewnętrzną i całą łazienkę.",
      layout:
        "Przestronny salon z wyjściem na balkon, dwie sypialnie oraz kuchnia zamknięta z miejscem na stół dla czterech osób. Łazienka z prysznicem i pralką, osobna toaleta.",
      location:
        "Startowa leży w spokojnej części Zaspy, przy terenach zielonych dawnego lotniska. Do przystanku SKM Gdańsk Zaspa i sklepów przy alei Jana Pawła II jest kwadrans pieszo, do plaży w Brzeźnie — dziesięć minut autem.",
      additional:
        "Oferta zarezerwowana, umowa przedwstępna planowana na przyszły miesiąc. Czynsz 720 zł, ogrzewanie miejskie. Piwnica oraz miejsce w wiacie rowerowej w cenie mieszkania.",
    },
  },
  {
    title: "Wynajem: 36 m² przy Dywizjonu 303, Zaspa",
    price: 2_500,
    location: "Gdańsk, Zaspa",
    transactionType: "RENT",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 36,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 4,
    totalFloors: 5,
    yearBuilt: 1978,
    monthlyRent: 520,
    deposit: 5_000,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "E",
    availableFrom: "2026-09-01",
    features: ["furnished", "balcony", "basement", "fiber"],
    address: {
      street: "ul. Dywizjonu 303 nr 8",
      district: "Zaspa",
      city: "Gdańsk",
      postalCode: "80-462",
      country: "PL",
      lat: 54.3915,
      lng: 18.6002,
    },
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/21765129/pexels-photo-21765129.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/34754006/pexels-photo-34754006.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19866443/pexels-photo-19866443.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1610286986642-057ece0c3656?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Dwupokojowe mieszkanie 36 m² na czwartym piętrze przy Dywizjonu 303. Umeblowane i wyposażone w komplet sprzętu AGD, gotowe do zamieszkania od ręki.",
      layout:
        "Pokój dzienny z kanapą i telewizorem, sypialnia z łóżkiem podwójnym oraz kuchnia w osobnym pomieszczeniu z oknem. Balkon od strony wschodniej, łazienka z wanną.",
      location:
        "Osiedle sąsiaduje z zieloną osią dawnego lotniska i alejami spacerowymi Zaspy. Przystanki tramwajowe przy alei Rzeczypospolitej pozwalają dojechać do Wrzeszcza w kilkanaście minut, plaża Brzeźno jest w zasięgu roweru.",
      additional:
        "Kaucja 5 000 zł, czynsz spółdzielczy 520 zł, prąd i internet rozliczane osobno. Wynajem długoterminowy od września, akceptowane zwierzę po ustaleniu z właścicielem.",
    },
  },
  {
    title: "Hynka 12 — 54 m² do remontu, oferta wycofana",
    price: 616_000,
    location: "Gdańsk, Zaspa",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "WITHDRAWN",
    area: 54,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 1,
    totalFloors: 5,
    yearBuilt: 1983,
    monthlyRent: 680,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "TO_RENOVATE",
    heating: "DISTRICT",
    energyClass: "E",
    availableFrom: null,
    features: ["balcony", "basement"],
    address: {
      street: "ul. Hynka 12",
      district: "Zaspa",
      city: "Gdańsk",
      postalCode: "80-465",
      country: "PL",
      lat: 54.3898,
      lng: 18.6068,
    },
    images: [
      "https://images.pexels.com/photos/19966782/pexels-photo-19966782.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/10758468/pexels-photo-10758468.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6903214/pexels-photo-6903214.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1661107259637-4e1c55462428?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6947274/pexels-photo-6947274.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/18350573/pexels-photo-18350573.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Trzypokojowe mieszkanie 54 m² na pierwszym piętrze przy Hynka, w stanie do generalnego remontu. Właściciel wycofał ofertę ze sprzedaży we wrześniu — rekord pozostaje w bazie do celów porównawczych.",
      layout:
        "Układ typowy dla wielkiej płyty: salon z balkonem, dwa mniejsze pokoje, kuchnia z oknem oraz łazienka z osobną toaletą. Wymiany wymaga instalacja elektryczna i cała biała ceramika.",
      location:
        "Hynka leży w południowej części Zaspy, blisko granicy z Wrzeszczem. Przystanki tramwajowe przy alei Rzeczypospolitej i przychodnia są w promieniu 400 m, do SKM Gdańsk Zaspa idzie się dwanaście minut.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu z księgą wieczystą. Cena z ostatniego okresu ekspozycji wynosiła 616 000 zł. W razie ponownego wystawienia oferty aktualizujemy wycenę.",
    },
  },
  {
    title: "Garaż murowany w zespole przy Skarżyńskiego",
    price: 78_000,
    location: "Gdańsk, Zaspa",
    transactionType: "SALE",
    propertyType: "GARAGE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 18,
    plotArea: null,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    floor: null,
    totalFloors: null,
    yearBuilt: 1988,
    monthlyRent: 60,
    deposit: null,
    ownership: "COOPERATIVE_LAND",
    condition: null,
    heating: null,
    energyClass: null,
    availableFrom: null,
    features: ["garage"],
    address: {
      street: "ul. Skarżyńskiego 9",
      district: "Zaspa",
      city: "Gdańsk",
      postalCode: "80-463",
      country: "PL",
      lat: 54.3946,
      lng: 18.5985,
    },
    images: [
      "https://images.unsplash.com/photo-1507035159636-7a86eb324885?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/14002092/pexels-photo-14002092.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1691276427940-50319bdccaa1?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6895381/pexels-photo-6895381.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/31944676/pexels-photo-31944676.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Wolnostojący garaż murowany o powierzchni 18 m² w zespole garaży przy Skarżyńskiego. Boks suchy, otynkowany, z betonową posadzką i doprowadzonym prądem.",
      layout: null,
      location:
        "Zespół garaży obsługuje okoliczne bloki Zaspy, wjazd od strony Skarżyńskiego. Do najbliższych budynków mieszkalnych jest 150 m, teren oświetlony i zamykany na noc.",
      additional:
        "Prawo do garażu w formie spółdzielczej wraz z udziałem w gruncie. Kanał przeglądowy, regały warsztatowe pozostają w cenie. Opłata za grunt i energię wynosi około 60 zł miesięcznie.",
    },
  },
);

/* ================================================================== */
/*  GDAŃSK — PRZYMORZE                                                 */
/* ================================================================== */

SZKICE.push(
  {
    title: "Jagiellońska 8 — 43 m² przy Parku Reagana",
    price: 568_000,
    location: "Gdańsk, Przymorze",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 43,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    totalFloors: 5,
    yearBuilt: 1974,
    monthlyRent: 640,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "fiber"],
    address: {
      street: "ul. Jagiellońska 8",
      district: "Przymorze",
      city: "Gdańsk",
      postalCode: "80-366",
      country: "PL",
      lat: 54.4053,
      lng: 18.5903,
    },
    images: [
      "https://images.pexels.com/photos/6758245/pexels-photo-6758245.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/36662633/pexels-photo-36662633.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6588571/pexels-photo-6588571.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1695002817411-203c7f19dfa3?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19846377/pexels-photo-19846377.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1432297984334-707d34c4163a?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Dwupokojowe mieszkanie 43 m² na trzecim piętrze bloku z 1974 roku przy Jagiellońskiej. Lokal zadbany, z wymienionymi oknami i odświeżonymi ścianami, gotowy do zamieszkania bez nakładów.",
      layout:
        "Salon z wyjściem na balkon od strony południowej, sypialnia z widokiem na zieleń osiedlową i kuchnia w układzie zamkniętym. Łazienka z wanną, w przedpokoju pawlacz i szafa wnękowa.",
      location:
        "Park im. Ronalda Reagana zaczyna się 400 m stąd i prowadzi wprost na plażę w Jelitkowie. Galeria Przymorze, przychodnia i przystanki tramwajowe przy Chłopskiej znajdują się w promieniu pięciu minut.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu z księgą wieczystą, czynsz 640 zł z zaliczką na ciepło. Budynek po ociepleniu, klatka po remoncie w 2021 roku. Piwnica w cenie.",
    },
  },
  {
    title: "Falowiec przy Obrońców Wybrzeża — 51 m², 3 pokoje",
    price: 648_000,
    location: "Gdańsk, Przymorze",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "SOLD",
    area: 51,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 6,
    totalFloors: 11,
    yearBuilt: 1973,
    monthlyRent: 710,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "elevator", "basement", "fiber"],
    address: {
      street: "ul. Obrońców Wybrzeża 4",
      district: "Przymorze",
      city: "Gdańsk",
      postalCode: "80-398",
      country: "PL",
      lat: 54.4076,
      lng: 18.5847,
    },
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/10071390/pexels-photo-10071390.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1522444278776-b4adce133d57?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1742134131017-44d377a611b1?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6933762/pexels-photo-6933762.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1542309175-9b88d743f89f?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Mieszkanie 51 m² na szóstym piętrze falowca przy Obrońców Wybrzeża — jednego z najbardziej rozpoznawalnych budynków Przymorza. Transakcja zakończona, rekord zachowany jako punkt odniesienia dla wycen w tej zabudowie.",
      layout:
        "Trzy pokoje w układzie rozkładowym, kuchnia z oknem i miejscem na stół oraz balkon biegnący wzdłuż salonu. Łazienka z osobną toaletą, dodatkowa wnęka gospodarcza przy wejściu.",
      location:
        "Od falowca do plaży w Jelitkowie idzie się dwadzieścia minut przez Park Reagana, do przystanku SKM Gdańsk Przymorze-Uniwersytet — dziesięć. Sklepy, przychodnia i szkoła znajdują się w obrębie osiedla.",
      additional:
        "Cena transakcyjna 648 000 zł, czyli około 12 700 zł za metr. Spółdzielcze własnościowe prawo do lokalu z księgą wieczystą, czynsz 710 zł. Budynek po termomodernizacji i wymianie dźwigów.",
    },
  },
  {
    title: "Piastowska 70 — 66 m² dziesięć minut od plaży",
    price: 1_181_000,
    location: "Gdańsk, Przymorze",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 66,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 2,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 2007,
    monthlyRent: 820,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "elevator", "garage", "basement", "ac", "fiber"],
    address: {
      street: "ul. Piastowska 70",
      district: "Przymorze",
      city: "Gdańsk",
      postalCode: "80-332",
      country: "PL",
      lat: 54.4133,
      lng: 18.5926,
    },
    images: [
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19966809/pexels-photo-19966809.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8082562/pexels-photo-8082562.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/5883736/pexels-photo-5883736.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7614619/pexels-photo-7614619.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1584093083495-74184f19a8cb?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/358592/pexels-photo-358592.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Sześćdziesiąt sześć metrów na drugim piętrze kameralnego budynku z 2007 roku przy Piastowskiej, w części Przymorza przechodzącej w Jelitkowo. Mieszkanie w bardzo dobrym stanie, z klimatyzacją w salonie.",
      layout:
        "Salon z aneksem kuchennym i balkonem, dwie sypialnie oraz dwie łazienki — jedna z wanną, druga z prysznicem. Przedpokój z zabudową i osobne pomieszczenie gospodarcze.",
      location:
        "Do wejścia na plażę w Jelitkowie jest dziesięć minut spacerem wzdłuż Potoku Oliwskiego, do pętli tramwajowej Jelitkowo — pięć. Park Reagana i promenada nadmorska zaczynają się tuż za rogiem.",
      additional:
        "Miejsce postojowe w hali garażowej i komórka lokatorska wliczone w cenę. Wspólnota niewielka, czynsz 820 zł. Lokal sprawdza się także pod wynajem sezonowy — właściciel udostępni historię obłożenia.",
    },
  },
  {
    title: "Wynajem: 58 m² przy Kołobrzeskiej, wysokie piętro",
    price: 3_900,
    location: "Gdańsk, Przymorze",
    transactionType: "RENT",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 58,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 8,
    totalFloors: 12,
    yearBuilt: 2004,
    monthlyRent: 780,
    deposit: 7_800,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: "2026-10-01",
    features: ["balcony", "elevator", "parking", "furnished", "basement", "fiber"],
    address: {
      street: "ul. Kołobrzeska 42",
      district: "Przymorze",
      city: "Gdańsk",
      postalCode: "80-394",
      country: "PL",
      lat: 54.4025,
      lng: 18.5983,
    },
    images: [
      "https://images.pexels.com/photos/276746/pexels-photo-276746.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6527057/pexels-photo-6527057.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/30767888/pexels-photo-30767888.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6980656/pexels-photo-6980656.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19889160/pexels-photo-19889160.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/11631278/pexels-photo-11631278.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Trzypokojowe mieszkanie 58 m² na ósmym piętrze budynku z 2004 roku przy Kołobrzeskiej. Umeblowane, z widokiem na panoramę Przymorza i pas nadmorski po zachodniej stronie.",
      layout:
        "Salon z aneksem kuchennym i wyjściem na balkon, dwie sypialnie z szafami w zabudowie. Łazienka z kabiną i pralką, przedpokój z dodatkową szafą gospodarczą.",
      location:
        "Kołobrzeska prowadzi do Galerii Przymorze i przystanku SKM Gdańsk Przymorze-Uniwersytet, oba w odległości ośmiu minut. Do plaży w Jelitkowie jest niecałe trzy kilometry, do Parku Reagana — kilometr.",
      additional:
        "Kaucja 7 800 zł, czynsz administracyjny 780 zł, media na najemcę. W cenie miejsce postojowe na terenie zamkniętym. Umowa od października, minimum na dwanaście miesięcy.",
    },
  },
  {
    title: "Lokal usługowy 74 m² w parterze przy Chłopskiej",
    price: 6_700,
    location: "Gdańsk, Przymorze",
    transactionType: "RENT",
    propertyType: "COMMERCIAL",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 74,
    plotArea: null,
    rooms: 2,
    bedrooms: null,
    bathrooms: 1,
    floor: 0,
    totalFloors: 5,
    yearBuilt: 1976,
    monthlyRent: 950,
    deposit: 13_400,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: "2026-09-01",
    features: ["ac", "alarm", "fiber", "parking"],
    address: {
      street: "ul. Chłopska 30",
      district: "Przymorze",
      city: "Gdańsk",
      postalCode: "80-363",
      country: "PL",
      lat: 54.4062,
      lng: 18.5878,
    },
    images: [
      "https://images.unsplash.com/photo-1723663123120-6d47b4fac665?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1736236560164-bc741c70bca5?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1564227502985-91742d806cff?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/30929605/pexels-photo-30929605.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/34726348/pexels-photo-34726348.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Lokal usługowy o powierzchni 74 m² w parterze budynku przy Chłopskiej, z osobnym wejściem od ulicy i witryną na całą szerokość frontu. Ostatnio działała tu drogeria, zabudowa regałowa pozostaje do dyspozycji.",
      layout:
        "Sala sprzedaży 52 m² z witryną, zaplecze magazynowe 14 m² oraz pomieszczenie socjalne z toaletą. Instalacja elektryczna po modernizacji, klimatyzacja w sali sprzedaży.",
      location:
        "Chłopska jest główną osią handlową Przymorza — po sąsiedzku Galeria Przymorze, przychodnia i przystanki tramwajowe. Zaplecze stanowi kilkanaście tysięcy mieszkańców okolicznych bloków.",
      additional:
        "Czynsz najmu 6 700 zł, opłaty eksploatacyjne 950 zł, media według liczników. Kaucja w wysokości dwóch czynszów. Przed lokalem miejsca postojowe dla klientów, dostawa od strony podwórza.",
    },
  },
);

/* ================================================================== */
/*  GDYNIA — ŚRÓDMIEŚCIE                                               */
/* ================================================================== */

SZKICE.push(
  {
    title: "Świętojańska 68 — 72 m² w modernistycznej kamienicy",
    price: 1_210_000,
    location: "Gdynia, Śródmieście",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 72,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 3,
    totalFloors: 5,
    yearBuilt: 1936,
    monthlyRent: 690,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "separate_kitchen", "fiber"],
    address: {
      street: "ul. Świętojańska 68",
      district: "Śródmieście",
      city: "Gdynia",
      postalCode: "81-389",
      country: "PL",
      lat: 54.5142,
      lng: 18.5386,
    },
    images: [
      "https://images.pexels.com/photos/6980724/pexels-photo-6980724.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1638799869566-b17fa794c4de?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7614619/pexels-photo-7614619.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1777203360392-060b7e12df9a?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Siedemdziesiąt dwa metry na trzecim piętrze modernistycznej kamienicy z 1936 roku przy Świętojańskiej. Remont z 2022 roku zachował okrągłe okno klatki, lastryko i oryginalne klamki.",
      layout:
        "Salon od frontu z balkonem, dwie sypialnie od podwórza oraz osobna kuchnia z oknem i spiżarką. Łazienka po całkowitej wymianie, przedpokój na planie litery L z zabudową do sufitu.",
      location:
        "Świętojańska to główny deptak Gdyni — do Skweru Kościuszki i Mola Południowego z Darem Pomorza idzie się dziesięć minut. Bulwar Nadmorski, plaża Śródmieście i dworzec Gdynia Główna są w zasięgu spaceru.",
      additional:
        "Ogrzewanie gazowe własne, piec z 2022 roku. Wspólnota mieszkaniowa, czynsz 690 zł, budynek po remoncie dachu. Do mieszkania należy piwnica; strych do adaptacji po uzgodnieniu ze wspólnotą.",
    },
  },
  {
    title: "Starowiejska 21 — 45 m² w sercu Gdyni",
    price: 621_000,
    location: "Gdynia, Śródmieście",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 45,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 1957,
    monthlyRent: 520,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "E",
    availableFrom: null,
    features: ["basement", "separate_kitchen", "fiber"],
    address: {
      street: "ul. Starowiejska 21",
      district: "Śródmieście",
      city: "Gdynia",
      postalCode: "81-363",
      country: "PL",
      lat: 54.5182,
      lng: 18.5327,
    },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19966796/pexels-photo-19966796.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/29887333/pexels-photo-29887333.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7546639/pexels-photo-7546639.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1567505477286-9c7269119db7?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Czterdzieści pięć metrów na drugim piętrze budynku z 1957 roku przy Starowiejskiej, w kwartale między dworcem a Świętojańską. Mieszkanie w dobrym stanie, bez konieczności remontu.",
      layout:
        "Dwa niezależne pokoje, kuchnia osobna z oknem oraz łazienka z wanną. Przedpokój na tyle szeroki, że mieści szafę na całą ścianę; okna wychodzą na cichą oficynę.",
      location:
        "Starowiejska to jedna z najstarszych ulic Gdyni, dziś pełna lokali i sklepów. Dworzec Gdynia Główna jest 400 m stąd, Skwer Kościuszki i molo — kwadrans pieszo przez Świętojańską.",
      additional:
        "Ogrzewanie miejskie, czynsz 520 zł. Budynek po wymianie pionów wodnych w 2020 roku. Do lokalu należy piwnica. Mieszkanie sprawdzi się jako pierwsze lokum lub inwestycja pod wynajem.",
    },
  },
  {
    title: "Wynajem: 39 m² przy 10 Lutego, dwie minuty od dworca",
    price: 3_100,
    location: "Gdynia, Śródmieście",
    transactionType: "RENT",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 39,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 4,
    totalFloors: 6,
    yearBuilt: 1938,
    monthlyRent: 470,
    deposit: 6_200,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "D",
    availableFrom: "2026-09-01",
    features: ["furnished", "elevator", "fiber", "basement"],
    address: {
      street: "ul. 10 Lutego 16",
      district: "Śródmieście",
      city: "Gdynia",
      postalCode: "81-364",
      country: "PL",
      lat: 54.5198,
      lng: 18.5352,
    },
    images: [
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19857231/pexels-photo-19857231.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1601578318413-af2284f10486?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/8141967/pexels-photo-8141967.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19980215/pexels-photo-19980215.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1779233495727-588a40d4b60c?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Umeblowane mieszkanie 39 m² na czwartym piętrze przedwojennej kamienicy przy 10 Lutego. Budynek z windą, mieszkanie odświeżone w ubiegłym roku.",
      layout:
        "Pokój dzienny z sofą i stołem, sypialnia z łóżkiem 160 cm oraz kuchnia otwarta na część dzienną. Łazienka z prysznicem, pralka w zabudowie pod blatem.",
      location:
        "Ulica 10 Lutego łączy dworzec Gdynia Główna ze Skwerem Kościuszki — do jednego i drugiego jest po kilka minut. InfoBox, Teatr Muzyczny i Bulwar Nadmorski leżą po drodze.",
      additional:
        "Kaucja 6 200 zł, czynsz administracyjny 470 zł, media według liczników. Wynajem od września, umowa na minimum rok. Bez zwierząt ze względu na ustalenia wspólnoty.",
    },
  },
  {
    title: "Władysława IV 51 — 84 m², cztery pokoje z windą",
    price: 1_310_000,
    location: "Gdynia, Śródmieście",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "PENDING",
    area: 84,
    plotArea: null,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    floor: 5,
    totalFloors: 7,
    yearBuilt: 2016,
    monthlyRent: 940,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: null,
    features: ["balcony", "elevator", "garage", "basement", "ac", "fiber", "concierge"],
    address: {
      street: "ul. Władysława IV 51",
      district: "Śródmieście",
      city: "Gdynia",
      postalCode: "81-384",
      country: "PL",
      lat: 54.5163,
      lng: 18.5312,
    },
    images: [
      "https://images.pexels.com/photos/34688219/pexels-photo-34688219.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1644421439741-712c7fde7e95?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19889160/pexels-photo-19889160.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1595330449916-e7c3e1962bd3?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1650894622076-e09ab837c502?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Osiemdziesiąt cztery metry na piątym piętrze budynku z 2016 roku przy Władysława IV. Mieszkanie z pełnym wykończeniem i klimatyzacją, w standardzie utrzymanym w naturalnych materiałach.",
      layout:
        "Salon z otwartą kuchnią wychodzi na balkon od zachodu, trzy sypialnie ulokowano wzdłuż korytarza. Dwie łazienki, pomieszczenie gospodarcze oraz garderoba przy sypialni głównej.",
      location:
        "Do Skweru Kościuszki i Bulwaru Nadmorskiego jest kwadrans pieszo, do dworca Gdynia Główna — dziesięć minut. Świętojańska z gastronomią i sklepami zaczyna się dwie przecznice dalej.",
      additional:
        "Oferta zarezerwowana z terminem umowy przedwstępnej w przyszłym miesiącu. W cenie dwa miejsca w hali garażowej i komórka. Budynek z całodobową recepcją, czynsz 940 zł.",
    },
  },
  {
    title: "Biuro 240 m² przy Armii Krajowej, centrum Gdyni",
    price: 19_200,
    location: "Gdynia, Śródmieście",
    transactionType: "RENT",
    propertyType: "OFFICE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 240,
    plotArea: null,
    rooms: 8,
    bedrooms: null,
    bathrooms: 3,
    floor: 4,
    totalFloors: 8,
    yearBuilt: 2008,
    monthlyRent: 3_600,
    deposit: 38_400,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: "2026-11-01",
    features: ["ac", "elevator", "parking", "reception", "alarm", "fiber"],
    address: {
      street: "ul. Armii Krajowej 24",
      district: "Śródmieście",
      city: "Gdynia",
      postalCode: "81-372",
      country: "PL",
      lat: 54.5175,
      lng: 18.534,
    },
    images: [
      "https://images.unsplash.com/photo-1610374792793-f016b77ca51a?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/9300765/pexels-photo-9300765.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8971808/pexels-photo-8971808.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1631248055158-edec7a3c072b?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1652498196118-4577d5f6abd5?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1677272294107-959848f44e61?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Dwieście czterdzieści metrów powierzchni biurowej na czwartym piętrze budynku z 2008 roku przy Armii Krajowej. Moduł z niezależnym wejściem z holu windowego i widokiem na Skwer Kościuszki.",
      layout:
        "Sześć gabinetów, open space na 12 stanowisk, sala konferencyjna na 16 osób oraz kuchnia z jadalnią. Trzy węzły sanitarne, oddzielne pomieszczenie techniczne z szafą serwerową.",
      location:
        "Armii Krajowej przecina ścisłe centrum — do dworca Gdynia Główna jest osiem minut pieszo, do mola i Bulwaru Nadmorskiego kwadrans. Świętojańska z gastronomią biegnie równolegle.",
      additional:
        "Stawka 80 zł za metr, opłata eksploatacyjna 3 600 zł miesięcznie. Sześć miejsc parkingowych w podziemiu w cenie. Powierzchnia dostępna od listopada, minimalny okres najmu trzy lata.",
    },
  },
  {
    title: "Lokal gastronomiczny 128 m² przy Skwerze Kościuszki",
    price: 14_000,
    location: "Gdynia, Śródmieście",
    transactionType: "RENT",
    propertyType: "COMMERCIAL",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 128,
    plotArea: null,
    rooms: 4,
    bedrooms: null,
    bathrooms: 2,
    floor: 0,
    totalFloors: 4,
    yearBuilt: 1962,
    monthlyRent: 2_200,
    deposit: 28_000,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: "2026-10-15",
    features: ["ac", "terrace", "alarm", "fiber"],
    address: {
      street: "Skwer Kościuszki 15",
      district: "Śródmieście",
      city: "Gdynia",
      postalCode: "81-370",
      country: "PL",
      lat: 54.5188,
      lng: 18.546,
    },
    images: [
      "https://images.unsplash.com/photo-1538333581680-29dd4752ddf2?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1538334421852-687c439c92f4?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1583354608715-177553a4035e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1613274554329-70f997f5789f?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1523368749929-6b2bf370dbf8?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/31763620/pexels-photo-31763620.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Lokal gastronomiczny 128 m² w parterze budynku przy Skwerze Kościuszki, kilkadziesiąt metrów od wejścia na Molo Południowe. Przeszklenie na całą szerokość frontu z widokiem na basen jachtowy.",
      layout:
        "Sala główna na 60 miejsc, kuchnia z pełną wentylacją i wydzielonym zmywakiem, chłodnia oraz zaplecze socjalne. Dwie toalety dla gości, w tym jedna dostosowana dla osób z niepełnosprawnościami.",
      location:
        "Skwer Kościuszki to najbardziej uczęszczany punkt Gdyni: Dar Pomorza, ORP Błyskawica i Akwarium Gdyńskie przyciągają tu ruch przez cały rok. Świętojańska i dworzec są w zasięgu spaceru.",
      additional:
        "Czynsz 14 000 zł, opłata eksploatacyjna 2 200 zł, media osobno. Zgoda na sezonowy ogródek na 40 miejsc przed lokalem. Kaucja odpowiada dwóm czynszom, umowa na minimum pięć lat.",
    },
  },
);

/* ================================================================== */
/*  GDYNIA — ORŁOWO                                                    */
/* ================================================================== */

SZKICE.push(
  {
    title: "Orłowska 27 — 68 m² pięć minut od klifu",
    price: 1_530_000,
    location: "Gdynia, Orłowo",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 68,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 2,
    floor: 2,
    totalFloors: 3,
    yearBuilt: 2013,
    monthlyRent: 860,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "GAS",
    energyClass: "B",
    availableFrom: null,
    features: ["balcony", "elevator", "garage", "basement", "ac", "fiber"],
    address: {
      street: "ul. Orłowska 27",
      district: "Orłowo",
      city: "Gdynia",
      postalCode: "81-522",
      country: "PL",
      lat: 54.4818,
      lng: 18.5648,
    },
    images: [
      "https://images.pexels.com/photos/7546648/pexels-photo-7546648.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7005291/pexels-photo-7005291.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7546276/pexels-photo-7546276.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7746070/pexels-photo-7746070.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7045321/pexels-photo-7045321.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/18153132/pexels-photo-18153132.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8089169/pexels-photo-8089169.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Sześćdziesiąt osiem metrów na drugim piętrze kameralnego budynku z 2013 roku przy Orłowskiej. Osiem lokali w całej inwestycji, mieszkanie w stanie praktycznie nowym.",
      layout:
        "Salon z aneksem kuchennym i przeszkleniem wychodzącym na balkon, dwie sypialnie oraz dwie łazienki. Przy wejściu garderoba, w salonie klimatyzacja i podłogowe ogrzewanie w części dziennej.",
      location:
        "Do mola w Orłowie i plaży pod klifem idzie się pięć minut ulicą Orłowską, przy której działają restauracje i kawiarnie. Przystanek SKM Gdynia Orłowo znajduje się 600 m dalej, obok wejście do Doliny Kolibki.",
      additional:
        "Ogrzewanie gazowe z własnym kotłem, klasa energetyczna B. W cenie miejsce w garażu podziemnym i komórka lokatorska. Wspólnota niewielka, czynsz 860 zł, budynek objęty monitoringiem.",
    },
  },
  {
    title: "Dom 232 m² przy Przebendowskich, działka 900 m²",
    price: 4_872_000,
    location: "Gdynia, Orłowo",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "SOLD",
    area: 232,
    plotArea: 900,
    rooms: 6,
    bedrooms: 4,
    bathrooms: 3,
    floor: null,
    totalFloors: 2,
    yearBuilt: 2005,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "HEAT_PUMP",
    energyClass: "B",
    availableFrom: null,
    features: ["garden", "garage", "terrace", "fireplace", "alarm", "fiber"],
    address: {
      street: "ul. Przebendowskich 12",
      district: "Orłowo",
      city: "Gdynia",
      postalCode: "81-526",
      country: "PL",
      lat: 54.4841,
      lng: 18.5588,
    },
    images: [
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1705980505348-222bc8724138?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/280232/pexels-photo-280232.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/20137477/pexels-photo-20137477.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/33529508/pexels-photo-33529508.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/13099442/pexels-photo-13099442.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Dom wolnostojący z 2005 roku o powierzchni 232 m² na działce 900 m² przy Przebendowskich, w willowej części Orłowa. Nieruchomość została sprzedana w tym sezonie; rekord zachowujemy dla porównań rynkowych.",
      layout:
        "Parter: salon z kominkiem otwarty na jadalnię, kuchnia z wyspą, gabinet i łazienka gościnna. Piętro: cztery sypialnie, dwie łazienki i taras nad garażem, z którego widać zieleń Kolibek.",
      location:
        "Przebendowskich prowadzi w stronę Doliny Kolibki i lasu, a w drugą — do Orłowskiej i mola. Klif orłowski oraz plaża są w odległości kilometra, przystanek SKM Gdynia Orłowo o kilka minut jazdy.",
      additional:
        "Cena transakcyjna 4 872 000 zł, około 21 000 zł za metr. Ogrzewanie pompą ciepła z 2021 roku, dom w klasie energetycznej B. Garaż dwustanowiskowy, ogród z automatycznym nawadnianiem.",
    },
  },
  {
    title: "Króla Jana III 88 — 51 m² na parterze z ogródkiem",
    price: 1_010_000,
    location: "Gdynia, Orłowo",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 51,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 1,
    totalFloors: 4,
    yearBuilt: 1998,
    monthlyRent: 620,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "basement", "parking", "fiber"],
    address: {
      street: "ul. Króla Jana III 88",
      district: "Orłowo",
      city: "Gdynia",
      postalCode: "81-521",
      country: "PL",
      lat: 54.4869,
      lng: 18.5573,
    },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/12870169/pexels-photo-12870169.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6312359/pexels-photo-6312359.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1610286986642-057ece0c3656?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Dwupokojowe mieszkanie 51 m² na pierwszym piętrze budynku z 1998 roku przy Króla Jana III. Lokal w dobrym stanie technicznym, z dużym balkonem od strony południowo-zachodniej.",
      layout:
        "Salon połączony z kuchnią przez otwartą ladę, sypialnia z szafą przesuwną oraz łazienka z wanną i pralką. W przedpokoju wnęka z zabudową na wysokość pomieszczenia.",
      location:
        "Króla Jana III biegnie grzbietem Orłowa, między Małym Kackiem a klifem. Do przystanku SKM Gdynia Orłowo jest osiem minut pieszo, do plaży i mola — dwadzieścia, głównie z górki.",
      additional:
        "Ogrzewanie miejskie, czynsz 620 zł. Piwnica oraz miejsce postojowe na terenie osiedla w cenie. Wspólnota dobrze zarządzana, w 2023 roku wymieniono domofony i odnowiono elewację.",
    },
  },
  {
    title: "Dom 165 m² przy Balladyny, Orłowo",
    price: 3_218_000,
    location: "Gdynia, Orłowo",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 165,
    plotArea: 540,
    rooms: 5,
    bedrooms: 4,
    bathrooms: 2,
    floor: null,
    totalFloors: 2,
    yearBuilt: 1978,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "GAS",
    energyClass: "C",
    availableFrom: null,
    features: ["garden", "garage", "terrace", "basement", "fireplace", "fiber"],
    address: {
      street: "ul. Balladyny 8",
      district: "Orłowo",
      city: "Gdynia",
      postalCode: "81-524",
      country: "PL",
      lat: 54.4796,
      lng: 18.5525,
    },
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1715934514075-06f0dbda1c09?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6908359/pexels-photo-6908359.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/16435060/pexels-photo-16435060.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/35189677/pexels-photo-35189677.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6283969/pexels-photo-6283969.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Dom z 1978 roku o powierzchni 165 m² na działce 540 m² przy Balladyny, po remoncie zakończonym w 2023 roku. Wymieniono dach, okna, instalacje oraz całe wykończenie wnętrz.",
      layout:
        "Na parterze salon z kominkiem i wyjściem na taras, kuchnia z jadalnią oraz pokój do pracy. Na piętrze cztery sypialnie i łazienka, w podpiwniczeniu kotłownia, pralnia i pomieszczenie gospodarcze.",
      location:
        "Balladyny leży w spokojnej, zadrzewionej części Orłowa, kilkaset metrów od Doliny Kolibki. Do przystanku SKM Gdynia Orłowo jest dziesięć minut pieszo, do plaży pod klifem — kwadrans.",
      additional:
        "Ogrzewanie gazowe z kotłem kondensacyjnym, w salonie ogrzewanie podłogowe. Garaż w bryle budynku plus podjazd na dwa auta. Ogród urządzony, z tarasem od południa i miejscem na oczko wodne.",
    },
  },
);

/* ================================================================== */
/*  GDYNIA — REDŁOWO                                                   */
/* ================================================================== */

SZKICE.push(
  {
    title: "Nowa inwestycja przy Powstania Styczniowego — 62 m²",
    price: 1_147_000,
    location: "Gdynia, Redłowo",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "PRIMARY",
    status: "ACTIVE",
    area: 62,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 2,
    floor: 4,
    totalFloors: 7,
    yearBuilt: 2026,
    monthlyRent: 810,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "DEVELOPER_STATE",
    heating: "DISTRICT",
    energyClass: "A",
    availableFrom: "2027-03-01",
    features: ["balcony", "elevator", "garage", "basement", "ac", "fiber"],
    address: {
      street: "ul. Powstania Styczniowego 34",
      district: "Redłowo",
      city: "Gdynia",
      postalCode: "81-519",
      country: "PL",
      lat: 54.4917,
      lng: 18.5545,
    },
    images: [
      "https://images.pexels.com/photos/5793547/pexels-photo-5793547.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/10758468/pexels-photo-10758468.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6903214/pexels-photo-6903214.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19916721/pexels-photo-19916721.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1630699293854-f75359d10c5d?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1551361415-69c87624334f?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6969997/pexels-photo-6969997.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Trzypokojowy lokal 62 m² na czwartym piętrze inwestycji przy Powstania Styczniowego, z odbiorem zaplanowanym na marzec 2027 roku. Sprzedaż z rynku pierwotnego, wydanie w stanie deweloperskim.",
      layout:
        "Salon z otwartą kuchnią i wyjściem na balkon 8 m² od strony zachodniej, dwie sypialnie oraz dwie łazienki. Przy wejściu wydzielone pomieszczenie gospodarcze z przyłączem do pralki.",
      location:
        "Rezerwat Kępa Redłowska i Bulwar Nadmorski zaczynają się kilkaset metrów od inwestycji, plaża w Redłowie jest w dwudziestu minutach spacerem. Przystanek SKM Gdynia Redłowo i Szpital Morski w pobliżu.",
      additional:
        "Budynek w klasie energetycznej A, z wentylacją mechaniczną i przygotowaniem pod klimatyzację. Miejsce w garażu podziemnym za 65 000 zł, komórka za 22 000 zł. Umowa deweloperska z rachunkiem powierniczym.",
    },
  },
  {
    title: "Legionów 112 — 55 m² z widokiem na Kępę Redłowską",
    price: 847_000,
    location: "Gdynia, Redłowo",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "PENDING",
    area: 55,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    totalFloors: 5,
    yearBuilt: 1994,
    monthlyRent: 640,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "parking", "fiber"],
    address: {
      street: "ul. Legionów 112",
      district: "Redłowo",
      city: "Gdynia",
      postalCode: "81-472",
      country: "PL",
      lat: 54.4954,
      lng: 18.5479,
    },
    images: [
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1610307522657-8c0304960189?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7031719/pexels-photo-7031719.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8135493/pexels-photo-8135493.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1619994121345-b61cd610c5a6?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Pięćdziesiąt pięć metrów na trzecim piętrze budynku z 1994 roku przy Legionów. Z balkonu widać zalesione zbocze Kępy Redłowskiej, mieszkanie utrzymane w dobrym stanie.",
      layout:
        "Duży salon z wyjściem na balkon, sypialnia z oknem na wschód oraz kuchnia otwarta na jadalnię. Łazienka z wanną i osobna toaleta, w przedpokoju zabudowa na wymiar.",
      location:
        "Wejście na szlaki rezerwatu Kępa Redłowska znajduje się 500 m od budynku, plaża w Redłowie w piętnastu minutach. Do przystanku SKM Gdynia Redłowo i Szpitala Morskiego jest kilka minut pieszo.",
      additional:
        "Oferta zarezerwowana przez klienta z finansowaniem gotówkowym. Czynsz 640 zł, ogrzewanie miejskie. W cenie piwnica oraz miejsce postojowe na terenie ogrodzonym.",
    },
  },
  {
    title: "Dom 196 m² przy Cylkowskiego, Redłowo",
    price: 3_567_000,
    location: "Gdynia, Redłowo",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 196,
    plotArea: 700,
    rooms: 6,
    bedrooms: 4,
    bathrooms: 3,
    floor: null,
    totalFloors: 2,
    yearBuilt: 2001,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "C",
    availableFrom: null,
    features: ["garden", "garage", "terrace", "basement", "alarm", "fiber"],
    address: {
      street: "ul. Cylkowskiego 6",
      district: "Redłowo",
      city: "Gdynia",
      postalCode: "81-465",
      country: "PL",
      lat: 54.4896,
      lng: 18.5586,
    },
    images: [
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1719324923613-ff0884b031ed?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7174393/pexels-photo-7174393.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8146155/pexels-photo-8146155.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/31525748/pexels-photo-31525748.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/15758636/pexels-photo-15758636.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Dom wolnostojący z 2001 roku o powierzchni 196 m² na działce 700 m² przy Cylkowskiego. Budynek murowany, systematycznie utrzymywany, z nową kotłownią i odnowioną elewacją.",
      layout:
        "Parter mieści salon otwarty na jadalnię, kuchnię z osobną spiżarką, gabinet i łazienkę gościnną. Na piętrze cztery sypialnie i dwie łazienki, w podpiwniczeniu garaż, kotłownia i pomieszczenie gospodarcze.",
      location:
        "Cylkowskiego to spokojna uliczka w głębi Redłowa, otoczona zabudową jednorodzinną. Do rezerwatu Kępa Redłowska jest 700 m, do przystanku SKM Gdynia Redłowo i alei Zwycięstwa — dziesięć minut.",
      additional:
        "Ogrzewanie gazowe z kotłem kondensacyjnym z 2022 roku, dom objęty alarmem. Ogród z tarasem i altaną, podjazd wybrukowany na trzy samochody. Nieruchomość bez obciążeń, gotowa do wydania po akcie.",
    },
  },
  {
    title: "Działka 880 m² przy Redłowskiej, blisko rezerwatu",
    price: 1_716_000,
    location: "Gdynia, Redłowo",
    transactionType: "SALE",
    propertyType: "PLOT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: null,
    plotArea: 880,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    floor: null,
    totalFloors: null,
    yearBuilt: null,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: null,
    heating: null,
    energyClass: null,
    availableFrom: null,
    features: [],
    address: {
      street: "ul. Redłowska",
      district: "Redłowo",
      city: "Gdynia",
      postalCode: "81-450",
      country: "PL",
      lat: 54.4873,
      lng: 18.5628,
    },
    images: [
      "https://images.pexels.com/photos/16234539/pexels-photo-16234539.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/37520984/pexels-photo-37520984.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/31853767/pexels-photo-31853767.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/32314074/pexels-photo-32314074.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/32314077/pexels-photo-32314077.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Działka budowlana o powierzchni 880 m² przy Redłowskiej, w zabudowie jednorodzinnej na skraju Kępy Redłowskiej. Teren lekko opadający w kierunku wschodnim, bez zadrzewienia wymagającego wycinki.",
      layout: null,
      location:
        "Granica rezerwatu Kępa Redłowska przebiega 300 m od działki, a Bulwar Nadmorski i plaża w Redłowie są w odległości kilometra. Przystanek SKM Gdynia Redłowo oddalony o dziesięć minut pieszo.",
      additional:
        "Plan miejscowy dopuszcza dom jednorodzinny wolnostojący do dwóch kondygnacji, z dachem stromym. Przyłącza wody, prądu i gazu w ulicy. Wymiary działki około 22 × 40 m, dostęp z drogi publicznej.",
    },
  },
);

/* ================================================================== */
/*  SOPOT — DOLNY SOPOT                                                */
/* ================================================================== */

SZKICE.push(
  {
    title: "Monte Cassino 47 — 58 m² w kamienicy z 1902 roku",
    price: 1_653_000,
    location: "Sopot, Dolny Sopot",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 58,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 1902,
    monthlyRent: 720,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "separate_kitchen", "fiber", "furnished"],
    address: {
      street: "ul. Bohaterów Monte Cassino 47",
      district: "Dolny Sopot",
      city: "Sopot",
      postalCode: "81-759",
      country: "PL",
      lat: 54.4433,
      lng: 18.5651,
    },
    images: [
      "https://images.pexels.com/photos/36816986/pexels-photo-36816986.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/36662633/pexels-photo-36662633.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6588571/pexels-photo-6588571.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7746100/pexels-photo-7746100.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1630699294288-3bc2ae7bf361?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Pięćdziesiąt osiem metrów na drugim piętrze secesyjnej kamienicy przy Monte Cassino, po remoncie z 2023 roku. Zachowano wysokość 3,4 m, sztukaterię i dwuskrzydłowe drzwi do salonu.",
      layout:
        "Salon od frontu z balkonem nad deptakiem, sypialnia od podwórza, kuchnia osobna z oknem. Łazienka po całkowitej przebudowie, z prysznicem walk-in i ogrzewaniem podłogowym.",
      location:
        "Monte Cassino prowadzi wprost na molo — do wejścia jest 400 m, do Skweru Kuracyjnego i Grand Hotelu niewiele więcej. Dworzec SKM Sopot i Krzywy Domek znajdują się po drodze, w odległości trzech minut.",
      additional:
        "Ogrzewanie gazowe własne, piec z 2023 roku. Kamienica po remoncie elewacji i klatki schodowej. Mieszkanie sprzedawane z wyposażeniem, z udokumentowaną historią najmu krótkoterminowego.",
    },
  },
  {
    title: "Powstańców Warszawy 82 — 74 m², trzy pokoje",
    price: 1_924_000,
    location: "Sopot, Dolny Sopot",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "PENDING",
    area: 74,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 2,
    floor: 3,
    totalFloors: 5,
    yearBuilt: 2009,
    monthlyRent: 980,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: null,
    features: ["balcony", "elevator", "garage", "basement", "ac", "fiber", "concierge"],
    address: {
      street: "ul. Powstańców Warszawy 82",
      district: "Dolny Sopot",
      city: "Sopot",
      postalCode: "81-718",
      country: "PL",
      lat: 54.4374,
      lng: 18.5688,
    },
    images: [
      "https://images.pexels.com/photos/34887637/pexels-photo-34887637.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6588581/pexels-photo-6588581.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1696987007764-7f8b85dd3033?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7045321/pexels-photo-7045321.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1612637968894-660373e23b03?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1733426107854-ee00a25d72a7?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Siedemdziesiąt cztery metry na trzecim piętrze apartamentowca z 2009 roku przy Powstańców Warszawy. Budynek z recepcją i garażem, mieszkanie wykończone w wysokim standardzie.",
      layout:
        "Salon z otwartą kuchnią wychodzi na balkon od zachodu, dwie sypialnie mają własne szafy w zabudowie. Dwie łazienki — jedna przy sypialni głównej — oraz pomieszczenie gospodarcze przy wejściu.",
      location:
        "Do plaży i Łazienek Południowych idzie się osiem minut, do mola i Monte Cassino kwadrans wzdłuż nadmorskiej promenady. Dworzec SKM Sopot jest w odległości kilometra.",
      additional:
        "Oferta zarezerwowana, umowa przedwstępna w przygotowaniu. W cenie miejsce w hali garażowej i komórka lokatorska. Czynsz 980 zł obejmuje recepcję i utrzymanie terenu.",
    },
  },
  {
    title: "Willa 240 m² przy Parkowej, Dolny Sopot",
    price: 5_760_000,
    location: "Sopot, Dolny Sopot",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 240,
    plotArea: 850,
    rooms: 7,
    bedrooms: 5,
    bathrooms: 3,
    floor: null,
    totalFloors: 2,
    yearBuilt: 1925,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["garden", "terrace", "fireplace", "basement", "alarm", "fiber", "parking"],
    address: {
      street: "ul. Parkowa 14",
      district: "Dolny Sopot",
      city: "Sopot",
      postalCode: "81-726",
      country: "PL",
      lat: 54.4471,
      lng: 18.5652,
    },
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1719324924230-63781a3f18b9?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/16849901/pexels-photo-16849901.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8143710/pexels-photo-8143710.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/13722861/pexels-photo-13722861.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Przedwojenna willa o powierzchni 240 m² na działce 850 m² przy Parkowej, kilkaset metrów od Grand Hotelu i plaży. Budynek z 1925 roku przeszedł remont konserwatorski zakończony w 2021 roku.",
      layout:
        "Parter: hol z klatką, salon z kominkiem, biblioteka, kuchnia z jadalnią i wyjściem na taras. Piętro: pięć sypialni i dwie łazienki, poddasze zaadaptowane na pracownię z oknami połaciowymi.",
      location:
        "Parkowa biegnie równolegle do nadmorskiej promenady — do wejścia na plażę jest 300 m, do mola i Monte Cassino dziesięć minut spacerem. Skwer Kuracyjny i Państwowa Galeria Sztuki tuż obok.",
      additional:
        "Zachowane oryginalne schody, stolarka i piece kaflowe, przy nowej instalacji grzewczej i elektrycznej. Ogród ze starodrzewem, dwa miejsca postojowe na posesji. Budynek w gminnej ewidencji zabytków.",
    },
  },
  {
    title: "Lokal handlowy 62 m² przy Monte Cassino",
    price: 11_000,
    location: "Sopot, Dolny Sopot",
    transactionType: "RENT",
    propertyType: "COMMERCIAL",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 62,
    plotArea: null,
    rooms: 2,
    bedrooms: null,
    bathrooms: 1,
    floor: 0,
    totalFloors: 4,
    yearBuilt: 1908,
    monthlyRent: 1_100,
    deposit: 22_000,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "D",
    availableFrom: "2026-09-01",
    features: ["ac", "alarm", "fiber"],
    address: {
      street: "ul. Bohaterów Monte Cassino 21",
      district: "Dolny Sopot",
      city: "Sopot",
      postalCode: "81-759",
      country: "PL",
      lat: 54.4425,
      lng: 18.5638,
    },
    images: [
      "https://images.unsplash.com/photo-1605217613423-0a61bd725c8a?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1729487151777-b4be9098ecbb?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7629181/pexels-photo-7629181.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1540200049848-d9813ea0e120?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Lokal handlowy o powierzchni 62 m² w parterze kamienicy przy Monte Cassino, z dwiema witrynami wychodzącymi na deptak. Wcześniej działał tu salon odzieżowy, wyposażenie ekspozycyjne do przejęcia.",
      layout:
        "Sala sprzedaży 46 m² z witrynami od frontu, przymierzalnie w głębi, zaplecze magazynowe z toaletą. Klimatyzacja, oświetlenie szynowe i instalacja alarmowa w komplecie.",
      location:
        "Monte Cassino to najczęściej odwiedzany deptak w Trójmieście — od lokalu do mola jest 300 m, do dworca SKM Sopot pięć minut. Krzywy Domek i główna oś gastronomiczna po sąsiedzku.",
      additional:
        "Czynsz 11 000 zł, opłata eksploatacyjna 1 100 zł, media według liczników. Kaucja odpowiada dwóm czynszom. Właściciel oczekuje umowy na minimum trzy lata; sezon letni podnosi obroty dwukrotnie.",
    },
  },
);

/* ================================================================== */
/*  SOPOT — GÓRNY SOPOT                                                */
/* ================================================================== */

SZKICE.push(
  {
    title: "Dom 188 m² przy Kolberga, Górny Sopot",
    price: 3_854_000,
    location: "Sopot, Górny Sopot",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 188,
    plotArea: 610,
    rooms: 6,
    bedrooms: 4,
    bathrooms: 3,
    floor: null,
    totalFloors: 2,
    yearBuilt: 1996,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "C",
    availableFrom: null,
    features: ["garden", "garage", "terrace", "fireplace", "basement", "fiber"],
    address: {
      street: "ul. Kolberga 9",
      district: "Górny Sopot",
      city: "Sopot",
      postalCode: "81-881",
      country: "PL",
      lat: 54.4406,
      lng: 18.5793,
    },
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/37639780/pexels-photo-37639780.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8134802/pexels-photo-8134802.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/16116303/pexels-photo-16116303.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7045908/pexels-photo-7045908.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Dom wolnostojący z 1996 roku o powierzchni 188 m² na działce 610 m² przy Kolberga, w zielonej części Górnego Sopotu. Budynek zadbany, z odnowioną elewacją i nową kotłownią.",
      layout:
        "Parter: salon z kominkiem otwarty na jadalnię, kuchnia z osobną spiżarką, gabinet i łazienka gościnna. Piętro: cztery sypialnie oraz dwie łazienki, w podpiwniczeniu pralnia i pomieszczenie gospodarcze.",
      location:
        "Do Opery Leśnej idzie się dziesięć minut pod górę, w drugą stronę — kwadrans do Monte Cassino i dworca SKM Sopot. Las Trójmiejski z trasami spacerowymi zaczyna się tuż za ulicą.",
      additional:
        "Ogrzewanie gazowe, kocioł kondensacyjny z 2021 roku, kominek z płaszczem wodnym. Garaż jednostanowiskowy w bryle domu, podjazd na dwa auta. Ogród z tarasem od południa i altaną.",
    },
  },
  {
    title: "Armii Krajowej 116 — 63 m² blisko Opery Leśnej",
    price: 1_159_000,
    location: "Sopot, Górny Sopot",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "SOLD",
    area: 63,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 2006,
    monthlyRent: 740,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "elevator", "parking", "basement", "fiber"],
    address: {
      street: "ul. Armii Krajowej 116",
      district: "Górny Sopot",
      city: "Sopot",
      postalCode: "81-824",
      country: "PL",
      lat: 54.4372,
      lng: 18.5808,
    },
    images: [
      "https://images.pexels.com/photos/2343469/pexels-photo-2343469.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7535012/pexels-photo-7535012.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1675419457963-071b02e5dab8?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1595330449916-e7c3e1962bd3?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
    descriptionSections: {
      intro:
        "Trzypokojowe mieszkanie 63 m² na drugim piętrze budynku z 2006 roku przy Armii Krajowej. Sprzedane w tym sezonie — rekord pozostaje w bazie jako materiał porównawczy dla Górnego Sopotu.",
      layout:
        "Salon z wyjściem na balkon od strony lasu, dwie sypialnie i kuchnia otwarta na jadalnię. Łazienka z wanną, w przedpokoju zabudowa na całą ścianę oraz dodatkowa wnęka gospodarcza.",
      location:
        "Opera Leśna i Hipodrom są w odległości kilometra, wejście do Lasu Trójmiejskiego — 300 m. Do dworca SKM Sopot Wyścigi jest osiem minut pieszo, do Monte Cassino i plaży dwadzieścia.",
      additional:
        "Cena transakcyjna 1 159 000 zł, czyli około 18 400 zł za metr. Ogrzewanie gazowe z kotłowni budynku, czynsz 740 zł. W cenie miejsce postojowe na terenie zamkniętym oraz piwnica.",
    },
  },
  {
    title: "Działka 1240 m² przy Malczewskiego, Górny Sopot",
    price: 2_604_000,
    location: "Sopot, Górny Sopot",
    transactionType: "SALE",
    propertyType: "PLOT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: null,
    plotArea: 1240,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    floor: null,
    totalFloors: null,
    yearBuilt: null,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: null,
    heating: null,
    energyClass: null,
    availableFrom: null,
    features: [],
    address: {
      street: "ul. Malczewskiego",
      district: "Górny Sopot",
      city: "Sopot",
      postalCode: "81-820",
      country: "PL",
      lat: 54.4429,
      lng: 18.5861,
    },
    images: [
      "https://images.pexels.com/photos/36929652/pexels-photo-36929652.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/25242994/pexels-photo-25242994.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/32314081/pexels-photo-32314081.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/22276447/pexels-photo-22276447.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/30440526/pexels-photo-30440526.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
    descriptionSections: {
      intro:
        "Działka budowlana o powierzchni 1240 m² przy Malczewskiego, w willowej części Górnego Sopotu. Teren wznoszący się łagodnie ku zachodowi, z widokiem na zieleń Lasu Trójmiejskiego.",
      layout: null,
      location:
        "Opera Leśna znajduje się kilkaset metrów od granicy działki, a szlaki Lasu Trójmiejskiego zaczynają się na końcu ulicy. Do dworca SKM Sopot Wyścigi jest dziesięć minut pieszo, do plaży — dwadzieścia pięć.",
      additional:
        "Plan miejscowy dopuszcza zabudowę willową jednorodzinną o wysokości do dwóch kondygnacji, przy 25-procentowej intensywności. Wszystkie media w drodze. Działka o wymiarach około 28 × 44 m, z dostępem z drogi publicznej.",
    },
  },
);

/* ------------------------------------------------------------------ */
/*  Eksport — pełne rekordy z rozwiniętymi adresami zdjęć i opisem      */
/* ------------------------------------------------------------------ */

export const NIERUCHOMOSCI_TROJMIASTO: OfertaNieruchomosci[] = SZKICE.map(
  (reszta) => {
    const s = reszta.descriptionSections;
    return {
      ...reszta,
      imageUrl: reszta.images[0] ?? "",
      description: [s.intro, s.layout, s.location, s.additional]
        .filter((czesc): czesc is string => Boolean(czesc))
        .join("\n\n"),
    };
  },
);

export default NIERUCHOMOSCI_TROJMIASTO;
