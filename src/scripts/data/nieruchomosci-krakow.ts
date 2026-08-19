// Katalog realistycznych ofert nieruchomości dla Krakowa (50 pozycji) — dane demonstracyjne
// do pracy magisterskiej. Plik jest samowystarczalny: nie importuje niczego, typy odwzorowują
// enumy z modelu ../../models/properties.ts oraz słowniki z realty-nest/src/lib/property-options.ts.
//
// Konwencje zgodne z seed-demo.ts:
//   price        — cena sprzedaży (SALE) albo miesięczny czynsz najmu (RENT)
//   monthlyRent  — czynsz administracyjny płacony do wspólnoty/spółdzielni (nie najem)
//   deposit      — kaucja, ustawiana wyłącznie dla RENT (2× price)
//   area = null / plotArea = X — dla działek (PLOT), tak jak w genProperty()
//   availableFrom — data ISO-8601 (YYYY-MM-DD); konsument robi new Date(...)
//
// companyId i agentId celowo pominięto — przypisanie oferty do agencji i agenta należy
// do skryptu seedującego, żeby nie ruszać kont admin@/manager@/agent1..6@/assistant1..2@.
//
// Zdjęcia: każda oferta ma 5-8 kadrów jednej nieruchomości, wziętych z biblioteki
// src/scripts/data/zdjecia.ts. Każdy kadr obejrzano w miniaturze i przypisano do JEDNEJ
// kategorii nieruchomości oraz do skali metrażu, więc żadne zdjęcie nie trafia do ofert
// dwóch różnych typów, mieszkania do 40 m² dostają wyłącznie ujęcia oznaczone jako małe,
// a jedno zdjęcie występuje w najwyżej trzech ofertach w całej bazie.

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

export interface PropertyAddress {
  street: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
}

export interface DescriptionSections {
  intro: string;
  layout: string;
  location: string;
  additional: string;
}

interface KrakowPropertyBase {
  title: string;
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
  monthlyRent: number | null;
  deposit: number | null;
  ownership: OwnershipType | null;
  condition: PropertyCondition | null;
  heating: HeatingType | null;
  energyClass: EnergyClass | null;
  availableFrom: string | null;
  features: readonly FeatureTag[];
  address: PropertyAddress;
  descriptionSections: DescriptionSections;
  /** 5–8 zdjęć tworzących spójny zestaw JEDNEJ nieruchomości tego samego typu. */
  images: readonly [string, ...string[]];
}

export interface KrakowProperty extends KrakowPropertyBase {
  /** Sklejane z descriptionSections — pole indeksowane pełnotekstowo w modelu. */
  description: string;
  imageUrl: string;
}

// Galerie ofert zbudowano z biblioteki src/scripts/data/zdjecia.ts — każde zdjęcie
// obejrzano w miniaturze i przypisano do jednej kategorii nieruchomości oraz do skali
// metrażu, więc adresy wpisano tu wprost, bez sklejania z identyfikatorów.

const NIERUCHOMOSCI: readonly KrakowPropertyBase[] = [
  // ======================= MIESZKANIA (APARTMENT) — 30 =======================

  {
    title: "Mieszkanie 3-pokojowe przy Floriańskiej · Stare Miasto",
    price: 1_950_000,
    location: "Kraków, Stare Miasto",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 78,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 1892,
    monthlyRent: 780,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["fiber", "basement", "separate_kitchen"],
    address: {
      street: "ul. Floriańska 21",
      district: "Stare Miasto",
      city: "Kraków",
      postalCode: "31-019",
      country: "PL",
      lat: 50.0637,
      lng: 19.9394,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 78 m² na drugim piętrze kamienicy z 1892 roku przy Floriańskiej, w połowie drogi między Bramą Floriańską a Rynkiem Głównym. Po gruntownym remoncie z 2021 roku, z zachowaną sztukaterią i dwuskrzydłowymi drzwiami.",
      layout:
        "Salon od frontu z dwoma oknami na Floriańską, dwie sypialnie od strony cichego podwórza i oddzielna kuchnia z miejscem na stół. Wysokość pomieszczeń 3,4 m, na podłogach odtworzony dębowy parkiet.",
      location:
        "Rynek Główny i Sukiennice w trzy minuty pieszo, Planty tuż za rogiem, Barbakan i Dworzec Główny w promieniu 500 m. Trzeba się liczyć z gwarem deptaka — od strony ulicy w weekendy bywa głośno do późna.",
      additional:
        "Własność hipoteczna z księgą wieczystą bez obciążeń, czynsz administracyjny 780 zł. W kamienicy nie ma windy, do mieszkania przynależy piwnica 6 m².",
    },
    images: [
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6980671/pexels-photo-6980671.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7018379/pexels-photo-7018379.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6587820/pexels-photo-6587820.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/33173994/pexels-photo-33173994.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Dwa pokoje przy Sławkowskiej · Stare Miasto",
    price: 1_296_000,
    location: "Kraków, Stare Miasto",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 54,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    totalFloors: 4,
    yearBuilt: 1905,
    monthlyRent: 610,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "D",
    availableFrom: "2026-10-01",
    features: ["fiber", "basement"],
    address: {
      street: "ul. Sławkowska 12",
      district: "Stare Miasto",
      city: "Kraków",
      postalCode: "31-014",
      country: "PL",
      lat: 50.0641,
      lng: 19.9365,
    },
    descriptionSections: {
      intro:
        "Dwupokojowe mieszkanie 54 m² na trzecim piętrze przedwojennej kamienicy przy Sławkowskiej, w cichszej części Starego Miasta. Stan dobry, ostatnie odświeżenie w 2019 roku.",
      layout:
        "Pokój dzienny z wykuszem od ulicy, sypialnia i kuchnia w amfiladzie od podwórza, łazienka z oknem. Sufity 3,2 m pozwalają na antresolę nad częścią sypialnianą.",
      location:
        "Do Rynku Głównego 250 m, do Collegium Novum i kampusu UJ kwadrans spacerem. W tej części Sławkowskiej dominują kancelarie i kawiarnie, więc wieczorami jest wyraźnie spokojniej niż na Floriańskiej.",
      additional:
        "Wspólnota mieszkaniowa po remoncie dachu i klatki schodowej, czynsz 610 zł. Brak windy, mieszkanie na trzecim piętrze — warto uwzględnić przy oglądaniu.",
    },
    images: [
      "https://images.pexels.com/photos/19866421/pexels-photo-19866421.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19846388/pexels-photo-19846388.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1699942681763-d1da9f692489?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6899357/pexels-photo-6899357.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/2820153/pexels-photo-2820153.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1784535997070-5613c5c28784?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Kawalerka 28 m² przy Gołębiej · Stare Miasto",
    price: 2_700,
    location: "Kraków, Stare Miasto",
    transactionType: "RENT",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 28,
    plotArea: null,
    rooms: 1,
    bedrooms: null,
    bathrooms: 1,
    floor: 1,
    totalFloors: 3,
    yearBuilt: 1900,
    monthlyRent: 450,
    deposit: 5_400,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "ELECTRIC",
    energyClass: "E",
    availableFrom: "2026-09-15",
    features: ["furnished", "fiber"],
    address: {
      street: "ul. Gołębia 8",
      district: "Stare Miasto",
      city: "Kraków",
      postalCode: "31-007",
      country: "PL",
      lat: 50.0603,
      lng: 19.9345,
    },
    descriptionSections: {
      intro:
        "Umeblowana kawalerka 28 m² na pierwszym piętrze kamienicy przy Gołębiej, dosłownie przy budynkach Uniwersytetu Jagiellońskiego. Wynajem długoterminowy, mieszkanie gotowe do wprowadzenia z walizką.",
      layout:
        "Jedno pomieszczenie z częścią sypialną i aneksem kuchennym pod oknem, oddzielna łazienka z prysznicem oraz przedpokój z szafą w zabudowie.",
      location:
        "Collegium Novum i Biblioteka Jagiellońska w zasięgu dwóch minut, Rynek Główny 300 m, Planty po drugiej stronie ulicy. Lokalizacja pod studenta lub osobę pracującą w centrum — samochód jest tu raczej kłopotem niż ułatwieniem.",
      additional:
        "Czynsz administracyjny 450 zł, prąd i internet po stronie najemcy, kaucja równa dwóm czynszom najmu. Ogrzewanie elektryczne, mieszkanie ciepłe dzięki położeniu nad ogrzewanym lokalem.",
    },
    images: [
      "https://images.pexels.com/photos/6890400/pexels-photo-6890400.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/30386992/pexels-photo-30386992.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6970023/pexels-photo-6970023.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19857266/pexels-photo-19857266.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1621890849040-20837568b0e9?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Mieszkanie po remoncie przy Józefa · Kazimierz",
    price: 1_104_000,
    location: "Kraków, Kazimierz",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 48,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 1,
    totalFloors: 4,
    yearBuilt: 1910,
    monthlyRent: 540,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["fiber", "basement", "separate_kitchen"],
    address: {
      street: "ul. Józefa 17",
      district: "Kazimierz",
      city: "Kraków",
      postalCode: "31-056",
      country: "PL",
      lat: 50.0504,
      lng: 19.9457,
    },
    descriptionSections: {
      intro:
        "Dwupokojowe mieszkanie 48 m² przy Józefa, w samym sercu Kazimierza, po remoncie zakończonym w 2023 roku. Zachowano ceglane sklepienie w części kuchennej i oryginalne okiennice.",
      layout:
        "Salon z oknem na ulicę, wydzielona sypialnia od podwórza oraz osobna kuchnia z wyjściem na przedpokój. Łazienka z prysznicem walk-in, wszystkie instalacje wymienione na nowe.",
      location:
        "Plac Nowy z okrąglakiem 200 m, synagoga Remuh i ulica Szeroka pięć minut pieszo, bulwary wiślane niecały kilometr. Okolica pełna knajp i galerii — atut przy wynajmie krótkoterminowym, ale wieczorami bywa gwarno.",
      additional:
        "Własność hipoteczna, czynsz 540 zł, piwnica w cenie. Kamienica bez windy, mieszkanie na niskim pierwszym piętrze.",
    },
    images: [
      "https://images.pexels.com/photos/19866404/pexels-photo-19866404.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19966754/pexels-photo-19966754.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7019020/pexels-photo-7019020.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/34754006/pexels-photo-34754006.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6487955/pexels-photo-6487955.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1785607442844-c08a6654dddd?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Trzy pokoje przy Miodowej · Kazimierz",
    price: 1_474_000,
    location: "Kraków, Kazimierz",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 67,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 3,
    totalFloors: 4,
    yearBuilt: 1912,
    monthlyRent: 690,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "fiber", "basement"],
    address: {
      street: "ul. Miodowa 9",
      district: "Kazimierz",
      city: "Kraków",
      postalCode: "31-055",
      country: "PL",
      lat: 50.0527,
      lng: 19.9462,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 67 m² na trzecim piętrze kamienicy przy Miodowej, utrzymane w dobrym stanie, z balkonem od strony podwórza. Rozkład pozwala łatwo wydzielić gabinet.",
      layout:
        "Salon z wyjściem na balkon, dwie sypialnie, kuchnia z oknem i łazienka z wanną. Podłogi z klepki dębowej, stolarka okienna wymieniona na drewnianą w 2018 roku.",
      location:
        "Skrzyżowanie z Starowiślną i przystanki tramwajowe w stronę centrum 150 m, plac Wolnica z Muzeum Etnograficznym 400 m. Do bulwarów i Kładki Bernatka kwadrans spacerem wzdłuż Dietla.",
      additional:
        "Własność hipoteczna, czynsz 690 zł łącznie z funduszem remontowym. Do mieszkania należy piwnica, w budynku nie ma windy.",
    },
    images: [
      "https://images.pexels.com/photos/8583841/pexels-photo-8583841.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19966809/pexels-photo-19966809.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8082562/pexels-photo-8082562.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6969997/pexels-photo-6969997.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6312074/pexels-photo-6312074.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1779233495727-588a40d4b60c?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Duże mieszkanie przy Dietla · Kazimierz",
    price: 1_764_000,
    location: "Kraków, Kazimierz",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 84,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 2,
    floor: 4,
    totalFloors: 5,
    yearBuilt: 1925,
    monthlyRent: 860,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "elevator", "fiber", "basement", "separate_kitchen"],
    address: {
      street: "ul. Dietla 55",
      district: "Kazimierz",
      city: "Kraków",
      postalCode: "31-066",
      country: "PL",
      lat: 50.0538,
      lng: 19.9448,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 84 m² na czwartym piętrze kamienicy z 1925 roku przy Dietla, z windą dobudowaną podczas modernizacji budynku. Dwie łazienki i wysoki standard wykończenia części wspólnych.",
      layout:
        "Przestronny salon od strony alei, dwie sypialnie od cichego podwórza, oddzielna kuchnia oraz dwie łazienki — jedna z wanną, druga z prysznicem przy sypialni. Balkon dostępny z salonu.",
      location:
        "Aleja Dietla to główna oś Kazimierza: tramwaje w cztery strony miasta spod domu, plac Nowy 500 m, Hala Targowa 700 m. Zieleń pasa środkowego tłumi hałas, ale ruch samochodowy jest tu odczuwalny.",
      additional:
        "Własność hipoteczna, czynsz 860 zł z windą i funduszem remontowym. Klimatyzacji brak, ale instalacja została przygotowana pod montaż.",
    },
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6265836/pexels-photo-6265836.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6434592/pexels-photo-6434592.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1564540583246-934409427776?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1779903726781-7d2ccb810558?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/16205089/pexels-photo-16205089.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1651951646668-46562cfb4518?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Dwa pokoje przy Kalwaryjskiej · Podgórze",
    price: 858_000,
    location: "Kraków, Podgórze",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 52,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    totalFloors: 5,
    yearBuilt: 1938,
    monthlyRent: 520,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "fiber", "basement"],
    address: {
      street: "ul. Kalwaryjska 34",
      district: "Podgórze",
      city: "Kraków",
      postalCode: "30-504",
      country: "PL",
      lat: 50.0433,
      lng: 19.9472,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 52 m² w przedwojennej kamienicy przy Kalwaryjskiej, na drugim piętrze, w stanie dobrym. Ogrzewanie miejskie i wymienione piony wodne po remoncie z 2020 roku.",
      layout:
        "Salon z balkonem od podwórza, sypialnia od ulicy, kuchnia w zabudowie i łazienka z pralką. Układ niezależny — pokoje nie są przechodnie.",
      location:
        "Rynek Podgórski i kościół świętego Józefa 400 m, Kładka Bernatka prowadząca prosto na Kazimierz około kilometra. Kalwaryjska to główna ulica handlowa Podgórza, przystanki tramwajowe pod budynkiem.",
      additional:
        "Własność hipoteczna, czynsz 520 zł z zaliczką na ciepło. Piwnica lokatorska w cenie, w budynku brak windy.",
    },
    images: [
      "https://images.pexels.com/photos/5490904/pexels-photo-5490904.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1609241506098-80fc37c6325f?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/3705536/pexels-photo-3705536.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8141967/pexels-photo-8141967.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19857266/pexels-photo-19857266.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/33173994/pexels-photo-33173994.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Mieszkanie z tarasem na Zabłociu · Podgórze",
    price: 874_000,
    location: "Kraków, Podgórze",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "PENDING",
    area: 46,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 5,
    totalFloors: 7,
    yearBuilt: 2019,
    monthlyRent: 590,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: null,
    features: ["terrace", "elevator", "parking", "fiber", "ac"],
    address: {
      street: "ul. Lipowa 3",
      district: "Podgórze",
      city: "Kraków",
      postalCode: "30-702",
      country: "PL",
      lat: 50.0479,
      lng: 19.9603,
    },
    descriptionSections: {
      intro:
        "Dwupokojowe mieszkanie 46 m² z tarasem, na piątym piętrze budynku z 2019 roku na Zabłociu. Do wprowadzenia od zaraz, w cenie miejsce postojowe w hali garażowej.",
      layout:
        "Salon z aneksem kuchennym i wyjściem na taras 12 m², oddzielna sypialnia oraz łazienka z prysznicem. Zamontowana klimatyzacja i rolety zewnętrzne sterowane elektrycznie.",
      location:
        "Fabryka Schindlera i MOCAK dwie przecznice dalej, bulwary wiślane 600 m, stacja kolejowa Kraków Zabłocie 400 m. Dawna dzielnica przemysłowa, dziś jedna z najszybciej zmieniających się części miasta.",
      additional:
        "Własność hipoteczna, czynsz 590 zł łącznie z miejscem postojowym. Oferta zarezerwowana — zainteresowanych prosimy o kontakt w sprawie listy oczekujących.",
    },
    images: [
      "https://images.pexels.com/photos/19966782/pexels-photo-19966782.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7045356/pexels-photo-7045356.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1595514535116-d0401260e7cf?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19846390/pexels-photo-19846390.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Trzy pokoje przy Nadwiślańskiej · Podgórze",
    price: 1_278_000,
    location: "Kraków, Podgórze",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 71,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 2,
    floor: 6,
    totalFloors: 8,
    yearBuilt: 2014,
    monthlyRent: 820,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: null,
    features: ["balcony", "elevator", "garage", "basement", "fiber", "ac"],
    address: {
      street: "ul. Nadwiślańska 11",
      district: "Podgórze",
      city: "Kraków",
      postalCode: "30-527",
      country: "PL",
      lat: 50.0471,
      lng: 19.9518,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 71 m² na szóstym piętrze, z widokiem na Wisłę i Wawel z okien salonu. Budynek z 2014 roku z ochroną i podziemną halą garażową.",
      layout:
        "Salon z aneksem i wyjściem na balkon, dwie sypialnie, dwie łazienki oraz pomieszczenie gospodarcze przy wejściu. Klimatyzacja w salonie i sypialni głównej.",
      location:
        "Bulwary wiślane 150 m, Kładka Bernatka i Kazimierz kwadrans pieszo, Rynek Podgórski 700 m. Do centrum wygodnie tramwajem z przystanku przy moście Powstańców Śląskich.",
      additional:
        "Własność hipoteczna, czynsz 820 zł z miejscem w hali garażowej i komórką lokatorską. Ochrona osiedla całodobowa.",
    },
    images: [
      "https://images.pexels.com/photos/6980724/pexels-photo-6980724.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/18285887/pexels-photo-18285887.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7060826/pexels-photo-7060826.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1521783593447-5702b9bfd267?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6934176/pexels-photo-6934176.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1592276040264-e10344a6a10e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1576698483491-8c43f0862543?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Kawalerka do remontu przy Limanowskiego · Podgórze",
    price: 462_000,
    location: "Kraków, Podgórze",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 33,
    plotArea: null,
    rooms: 1,
    bedrooms: null,
    bathrooms: 1,
    floor: 1,
    totalFloors: 4,
    yearBuilt: 1930,
    monthlyRent: 380,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "TO_RENOVATE",
    heating: "GAS",
    energyClass: "F",
    availableFrom: null,
    features: ["basement"],
    address: {
      street: "ul. Limanowskiego 28",
      district: "Podgórze",
      city: "Kraków",
      postalCode: "30-534",
      country: "PL",
      lat: 50.0441,
      lng: 19.9506,
    },
    descriptionSections: {
      intro:
        "Kawalerka 33 m² do kompleksowego remontu, na pierwszym piętrze kamienicy przy Limanowskiego. Cena uwzględnia nakłady — instalacje elektryczna i wodna wymagają wymiany.",
      layout:
        "Jeden pokój z wnęką kuchenną, łazienka z wanną oraz przedpokój; ściana działowa jest niekonstrukcyjna, więc układ da się dowolnie przemodelować. Wysokość 3,1 m pozwala rozważyć antresolę.",
      location:
        "Rynek Podgórski 300 m, park Bednarskiego i Kopiec Krakusa w zasięgu spaceru. Limanowskiego jest dobrze skomunikowana tramwajami, ale to ruchliwa ulica — okna wychodzą na jezdnię.",
      additional:
        "Własność hipoteczna, księga wieczysta czysta, czynsz 380 zł. Do lokalu przynależy piwnica; budynek bez windy.",
    },
    images: [
      "https://images.unsplash.com/photo-1702014862053-946a122b920d?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6890399/pexels-photo-6890399.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19899047/pexels-photo-19899047.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19846390/pexels-photo-19846390.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1641987295449-831e51f9740f?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Trzy pokoje przy Królewskiej · Krowodrza",
    price: 1_258_000,
    location: "Kraków, Krowodrza",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 74,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 3,
    totalFloors: 5,
    yearBuilt: 1936,
    monthlyRent: 720,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "fiber", "basement", "separate_kitchen"],
    address: {
      street: "ul. Królewska 43",
      district: "Krowodrza",
      city: "Kraków",
      postalCode: "30-045",
      country: "PL",
      lat: 50.0684,
      lng: 19.9198,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 74 m² w kamienicy z 1936 roku przy Królewskiej, w stanie dobrym, z zachowanymi drzwiami i klamkami z epoki. Ogrzewanie miejskie, ciepła woda z sieci.",
      layout:
        "Salon i dwie sypialnie w układzie niezależnym, oddzielna kuchnia z oknem oraz łazienka z wanną. Z salonu wyjście na balkon od strony podwórza.",
      location:
        "Błonia 600 m, Park Krakowski dwie przecznice dalej, Nowy Kleparz kwadrans pieszo. Królewska to jedna z najlepiej skomunikowanych ulic Krowodrzy — tramwaje w stronę centrum i Bronowic zatrzymują się przy budynku.",
      additional:
        "Własność hipoteczna, czynsz 720 zł z zaliczką na ogrzewanie. Piwnica w cenie, w kamienicy nie ma windy.",
    },
    images: [
      "https://images.pexels.com/photos/34688219/pexels-photo-34688219.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/4252513/pexels-photo-4252513.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19866472/pexels-photo-19866472.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1782923825215-40b24a0778e9?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Dwa pokoje przy Lea · Krowodrza",
    price: 803_000,
    location: "Kraków, Krowodrza",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 49,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 4,
    totalFloors: 10,
    yearBuilt: 1978,
    monthlyRent: 640,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "elevator", "basement", "fiber"],
    address: {
      street: "ul. Juliusza Lea 118",
      district: "Krowodrza",
      city: "Kraków",
      postalCode: "30-048",
      country: "PL",
      lat: 50.0705,
      lng: 19.9128,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 49 m² na czwartym piętrze bloku z 1978 roku przy Lea, po odświeżeniu w 2022 roku. Budynek po termomodernizacji, z wymienioną windą.",
      layout:
        "Salon z balkonem, oddzielna sypialnia, kuchnia w zabudowie oraz łazienka z kabiną prysznicową. Do mieszkania należy komórka w piwnicy.",
      location:
        "Do Bronowic i Galerii Bronowice trzy przystanki tramwajem, Błonia i AGH kwadrans pieszo. W okolicy przedszkole, szkoła podstawowa i targ przy Nowym Kleparzu.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu z założoną księgą wieczystą, czynsz 640 zł z ciepłem. Możliwe przekształcenie w pełną własność.",
    },
    images: [
      "https://images.pexels.com/photos/6758245/pexels-photo-6758245.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/18033166/pexels-photo-18033166.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1531835551805-16d864c8d311?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19846354/pexels-photo-19846354.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19980251/pexels-photo-19980251.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1432297984334-707d34c4163a?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Wynajem 2 pokoi przy Mazowieckiej · Krowodrza",
    price: 3_400,
    location: "Kraków, Krowodrza",
    transactionType: "RENT",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 56,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 1,
    totalFloors: 4,
    yearBuilt: 1962,
    monthlyRent: 620,
    deposit: 6_800,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: "2026-09-01",
    features: ["balcony", "furnished", "fiber", "basement"],
    address: {
      street: "ul. Mazowiecka 72",
      district: "Krowodrza",
      city: "Kraków",
      postalCode: "30-019",
      country: "PL",
      lat: 50.0729,
      lng: 19.9238,
    },
    descriptionSections: {
      intro:
        "Umeblowane mieszkanie 56 m² po remoncie z 2024 roku, na pierwszym piętrze kamienicy przy Mazowieckiej. Wynajem długoterminowy, minimum na rok.",
      layout:
        "Salon z rozkładaną sofą i balkonem, sypialnia z podwójnym łóżkiem i szafą, kuchnia z pełnym wyposażeniem AGD oraz łazienka z pralką. Pokoje nieprzechodnie.",
      location:
        "Park Krowoderski i targ przy Nowym Kleparzu w zasięgu spaceru, tramwaj na Rynek Główny jedzie osiem minut. Cicha przecznica, choć do ruchliwej Prądnickiej jest blisko.",
      additional:
        "Czynsz administracyjny 620 zł płatny do wspólnoty, media według liczników, kaucja 6 800 zł. Bez zwierząt — decyzja właściciela.",
    },
    images: [
      "https://images.pexels.com/photos/16056400/pexels-photo-16056400.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6527057/pexels-photo-6527057.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/30767888/pexels-photo-30767888.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7746100/pexels-photo-7746100.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/13003822/pexels-photo-13003822.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/9426231/pexels-photo-9426231.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Cztery pokoje przy Racławickiej · Krowodrza",
    price: 1_632_000,
    location: "Kraków, Krowodrza",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 96,
    plotArea: null,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 1955,
    monthlyRent: 940,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "fiber", "separate_kitchen"],
    address: {
      street: "ul. Racławicka 9",
      district: "Krowodrza",
      city: "Kraków",
      postalCode: "30-017",
      country: "PL",
      lat: 50.0759,
      lng: 19.9209,
    },
    descriptionSections: {
      intro:
        "Czteropokojowe mieszkanie 96 m² w budynku z połowy lat pięćdziesiątych przy Racławickiej, z grubymi murami i wysokimi oknami. Metraż rzadko spotykany w tej części Krowodrzy.",
      layout:
        "Salon z balkonem, trzy sypialnie, oddzielna kuchnia oraz dwie łazienki — pełna z wanną i dodatkowa z prysznicem. Przedpokój na tyle szeroki, że mieści zabudowę na całej ścianie.",
      location:
        "Park Krowoderski 300 m, szkoła i przedszkole w tej samej przecznicy, Nowy Kleparz dziesięć minut pieszo. Spokojna, w większości mieszkaniowa okolica z dużą ilością zieleni między budynkami.",
      additional:
        "Własność hipoteczna, czynsz 940 zł. Do mieszkania należy piwnica 9 m², w budynku nie ma windy.",
    },
    images: [
      "https://images.pexels.com/photos/6580377/pexels-photo-6580377.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/4252513/pexels-photo-4252513.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1521783593447-5702b9bfd267?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1704383014646-2123f9dc8137?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1619994121345-b61cd610c5a6?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1576698483491-8c43f0862543?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Mieszkanie na os. Centrum B · Nowa Huta",
    price: 572_000,
    location: "Kraków, Nowa Huta",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "SOLD",
    area: 44,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 3,
    totalFloors: 4,
    yearBuilt: 1953,
    monthlyRent: 480,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["basement", "fiber", "separate_kitchen"],
    address: {
      street: "os. Centrum B 5",
      district: "Nowa Huta",
      city: "Kraków",
      postalCode: "31-929",
      country: "PL",
      lat: 50.0729,
      lng: 20.0356,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 44 m² w socrealistycznym bloku z 1953 roku na osiedlu Centrum B, kilkadziesiąt metrów od placu Centralnego. Transakcja zakończona — oferta pozostaje w systemie jako materiał porównawczy.",
      layout:
        "Dwa niezależne pokoje, oddzielna kuchnia z oknem i łazienka z wanną. Ściany murowane, wysokość 2,9 m, na podłogach oryginalna klepka.",
      location:
        "Plac Centralny imienia Ronalda Reagana 200 m, Teatr Ludowy i aleja Róż w zasięgu spaceru, Łąki Nowohuckie kwadrans pieszo. Cała okolica objęta ochroną konserwatorską jako założenie urbanistyczne.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu, czynsz 480 zł. Piwnica w cenie, w budynku brak windy.",
    },
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/20348123/pexels-photo-20348123.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1552558636-f6a8f071c2b3?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7534166/pexels-photo-7534166.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1630699293333-88b76da1405d?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1542309175-9b88d743f89f?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Trzy pokoje na os. Zgody · Nowa Huta",
    price: 754_000,
    location: "Kraków, Nowa Huta",
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
    totalFloors: 5,
    yearBuilt: 1957,
    monthlyRent: 560,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "basement", "fiber"],
    address: {
      street: "os. Zgody 7",
      district: "Nowa Huta",
      city: "Kraków",
      postalCode: "31-949",
      country: "PL",
      lat: 50.0706,
      lng: 20.0334,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 58 m² na pierwszym piętrze, po remoncie zakończonym w 2023 roku, gotowe do wprowadzenia. Blok po termomodernizacji, z nowymi oknami i wymienionymi pionami.",
      layout:
        "Salon z balkonem, dwie sypialnie oraz kuchnia otwarta na część dzienną po wyburzeniu ścianki działowej. Łazienka z prysznicem i miejscem na pralkę.",
      location:
        "Osiedle Zgody to zielona część starej Nowej Huty — między blokami rosną kilkudziesięcioletnie drzewa, a do placu Centralnego jest 600 m. Zalew Nowohucki i tereny spacerowe około dwóch kilometrów.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu z księgą wieczystą, czynsz 560 zł z ciepłem. Piwnica lokatorska w cenie.",
    },
    images: [
      "https://images.pexels.com/photos/36777534/pexels-photo-36777534.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7005291/pexels-photo-7005291.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7546276/pexels-photo-7546276.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1765766599670-a625d0fef258?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/27151842/pexels-photo-27151842.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Mieszkanie do remontu przy al. Jana Pawła II · Nowa Huta",
    price: 437_000,
    location: "Kraków, Nowa Huta",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "WITHDRAWN",
    area: 38,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 8,
    totalFloors: 11,
    yearBuilt: 1975,
    monthlyRent: 520,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "TO_RENOVATE",
    heating: "DISTRICT",
    energyClass: "E",
    availableFrom: null,
    features: ["balcony", "elevator", "basement"],
    address: {
      street: "al. Jana Pawła II 42",
      district: "Nowa Huta",
      city: "Kraków",
      postalCode: "31-870",
      country: "PL",
      lat: 50.0711,
      lng: 20.0181,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 38 m² na ósmym piętrze wieżowca z 1975 roku, do generalnego remontu. Oferta wycofana ze sprzedaży na życzenie właściciela.",
      layout:
        "Dwa pokoje, kuchnia z wyjściem na balkon oraz łazienka z wanną w starym układzie. Instalacje pochodzą z lat siedemdziesiątych i kwalifikują się do wymiany.",
      location:
        "Aleja Jana Pawła II łączy Nową Hutę z Rondem Mogilskim, przystanek tramwajowy pod budynkiem. Muzeum Lotnictwa i park Lotników Polskich w promieniu kilometra.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu, czynsz 520 zł. Winda sprawna, do mieszkania należy piwnica.",
    },
    images: [
      "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/20348123/pexels-photo-20348123.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1552558636-f6a8f071c2b3?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/20348127/pexels-photo-20348127.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19980251/pexels-photo-19980251.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1432297984334-707d34c4163a?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Wynajem 3 pokoi na os. Górali · Nowa Huta",
    price: 2_600,
    location: "Kraków, Nowa Huta",
    transactionType: "RENT",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 62,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 4,
    totalFloors: 5,
    yearBuilt: 1956,
    monthlyRent: 690,
    deposit: 5_200,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: "2026-10-01",
    features: ["furnished", "basement", "fiber", "separate_kitchen"],
    address: {
      street: "os. Górali 12",
      district: "Nowa Huta",
      city: "Kraków",
      postalCode: "31-959",
      country: "PL",
      lat: 50.0754,
      lng: 20.0321,
    },
    descriptionSections: {
      intro:
        "Umeblowane mieszkanie 62 m² na czwartym piętrze, na jednym z pierwszych osiedli Nowej Huty. Wynajem długoterminowy, chętnie rodzinie.",
      layout:
        "Trzy niezależne pokoje, oddzielna kuchnia z oknem oraz łazienka z wanną. Meble w dobrym stanie, sprzęt AGD wymieniony w 2024 roku.",
      location:
        "Osiedle Górali sąsiaduje z aleją Solidarności, przystanek tramwajowy dwie minuty od klatki. Szkoła podstawowa i przychodnia na terenie osiedla, plac Centralny kilometr dalej.",
      additional:
        "Czynsz administracyjny 690 zł do spółdzielni, media według liczników, kaucja 5 200 zł. Bez windy — mieszkanie na czwartym piętrze.",
    },
    images: [
      "https://images.pexels.com/photos/37760269/pexels-photo-37760269.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/10758468/pexels-photo-10758468.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6903214/pexels-photo-6903214.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1587527901949-ab0341697c1e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1777305293159-70adab4ea6ef?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/31431315/pexels-photo-31431315.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Dwa pokoje przy Barskiej · Dębniki",
    price: 816_000,
    location: "Kraków, Dębniki",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 51,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 1966,
    monthlyRent: 560,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "fiber"],
    address: {
      street: "ul. Barska 19",
      district: "Dębniki",
      city: "Kraków",
      postalCode: "30-302",
      country: "PL",
      lat: 50.0481,
      lng: 19.9331,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 51 m² przy Barskiej, w spokojnej części starych Dębnik, w stanie dobrym. Budynek z 1966 roku po wymianie instalacji i ociepleniu.",
      layout:
        "Salon z balkonem od strony podwórza, sypialnia, kuchnia w zabudowie oraz łazienka z wanną. Rozkład niezależny, bez pokoi przechodnich.",
      location:
        "Bulwary wiślane i widok na Wawel 500 m, Rynek Dębnicki z targowiskiem 300 m, Kładka Bernatka kwadrans wzdłuż rzeki. Do Rynku Głównego pieszo przez most Dębnicki niecałe dwadzieścia minut.",
      additional:
        "Własność hipoteczna, czynsz 560 zł z ogrzewaniem. Piwnica w cenie, w budynku nie ma windy.",
    },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7614540/pexels-photo-7614540.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19866441/pexels-photo-19866441.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1696986324639-caa0590be25f?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1567505477286-9c7269119db7?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Trzy pokoje z widokiem przy Konopnickiej · Dębniki",
    price: 1_173_000,
    location: "Kraków, Dębniki",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "PENDING",
    area: 69,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 7,
    totalFloors: 11,
    yearBuilt: 1998,
    monthlyRent: 780,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "elevator", "parking", "basement", "fiber"],
    address: {
      street: "ul. Marii Konopnickiej 20",
      district: "Dębniki",
      city: "Kraków",
      postalCode: "30-307",
      country: "PL",
      lat: 50.0436,
      lng: 19.9332,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 69 m² na siódmym piętrze, z panoramą na Wisłę i Skałkę z okien salonu. Budynek z 1998 roku z windą i wydzielonym parkingiem.",
      layout:
        "Salon z wyjściem na balkon, dwie sypialnie, kuchnia otwarta na jadalnię oraz łazienka z wanną i osobne WC. Do mieszkania należy komórka lokatorska.",
      location:
        "Ludwinów i bulwary wiślane pod domem, Kładka Bernatka i Kazimierz dziesięć minut pieszo. Przystanki tramwajowe przy Konopnickiej obsługują większość linii jadących na Ruczaj i do centrum.",
      additional:
        "Własność hipoteczna, czynsz 780 zł z miejscem parkingowym. Oferta zarezerwowana, umowa przedwstępna w przygotowaniu.",
    },
    images: [
      "https://images.pexels.com/photos/19966790/pexels-photo-19966790.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/36662633/pexels-photo-36662633.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6588571/pexels-photo-6588571.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1616537937163-387d3f079de8?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1785644979219-0f07b427fc18?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Mieszkanie na Ruczaju przy Bobrzyńskiego · Dębniki",
    price: 1_024_000,
    location: "Kraków, Dębniki",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 64,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 2,
    totalFloors: 6,
    yearBuilt: 2011,
    monthlyRent: 700,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: null,
    features: ["balcony", "elevator", "garage", "basement", "fiber"],
    address: {
      street: "ul. Andrzeja Bobrzyńskiego 35",
      district: "Dębniki",
      city: "Kraków",
      postalCode: "30-348",
      country: "PL",
      lat: 50.0231,
      lng: 19.8962,
    },
    descriptionSections: {
      intro:
        "Trzypokojowe mieszkanie 64 m² na Ruczaju, w budynku z 2011 roku, gotowe do wprowadzenia. W cenie miejsce w hali garażowej i komórka lokatorska.",
      layout:
        "Salon z aneksem kuchennym i balkonem, dwie sypialnie oraz łazienka z wanną. Okna wychodzą na wewnętrzny dziedziniec osiedla, więc od strony ulicy nic nie hałasuje.",
      location:
        "Kampus UJ i Life Science Park w zasięgu spaceru, Zakrzówek z zalewem około dwóch kilometrów. Linia tramwajowa wzdłuż Bobrzyńskiego dowozi do centrum w dwadzieścia minut.",
      additional:
        "Własność hipoteczna, czynsz 700 zł z garażem i ciepłem. Osiedle zamknięte, z placem zabaw i ochroną w godzinach wieczornych.",
    },
    images: [
      "https://images.pexels.com/photos/19866414/pexels-photo-19866414.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/10071390/pexels-photo-10071390.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1522444278776-b4adce133d57?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6934176/pexels-photo-6934176.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/31434235/pexels-photo-31434235.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Dwa pokoje po remoncie przy Mogilskiej · Grzegórzki",
    price: 850_000,
    location: "Kraków, Grzegórzki",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 50,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 4,
    totalFloors: 6,
    yearBuilt: 1972,
    monthlyRent: 600,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "elevator", "basement", "fiber", "ac"],
    address: {
      street: "ul. Mogilska 65",
      district: "Grzegórzki",
      city: "Kraków",
      postalCode: "31-542",
      country: "PL",
      lat: 50.0641,
      lng: 19.9631,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 50 m² po kompleksowym remoncie z 2024 roku, na czwartym piętrze budynku przy Mogilskiej. Wszystkie instalacje wymienione, zamontowana klimatyzacja.",
      layout:
        "Salon z aneksem kuchennym i wyjściem na balkon, oddzielna sypialnia oraz łazienka z prysznicem walk-in. Zabudowa meblowa w przedpokoju zostaje w cenie.",
      location:
        "Rondo Mogilskie i węzeł tramwajowy 400 m, Galeria Kazimierz kwadrans pieszo, park Dąbie nad Wisłą około kilometra. Stąd wygodnie dojechać zarówno do centrum, jak i w stronę Nowej Huty.",
      additional:
        "Własność hipoteczna, czynsz 600 zł z ciepłem i windą. Do mieszkania przynależy piwnica 4 m².",
    },
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/21765129/pexels-photo-21765129.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19980232/pexels-photo-19980232.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6436758/pexels-photo-6436758.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1610286986642-057ece0c3656?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Trzy pokoje przy Grzegórzeckiej · Grzegórzki",
    price: 1_241_000,
    location: "Kraków, Grzegórzki",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 73,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 2,
    totalFloors: 5,
    yearBuilt: 1964,
    monthlyRent: 710,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "fiber", "separate_kitchen"],
    address: {
      street: "ul. Grzegórzecka 79",
      district: "Grzegórzki",
      city: "Kraków",
      postalCode: "31-532",
      country: "PL",
      lat: 50.0591,
      lng: 19.9522,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 73 m² na drugim piętrze budynku z 1964 roku, utrzymane w dobrym stanie, z dużym balkonem od podwórza. Metraż i rozkład dobrze sprawdzą się dla rodziny.",
      layout:
        "Salon z balkonem, dwie sypialnie, oddzielna kuchnia z oknem oraz łazienka z wanną i osobne WC. Przedpokój mieści pełną zabudowę szaf.",
      location:
        "Hala Targowa 300 m, Ogród Botaniczny UJ kwadrans pieszo, Galeria Kazimierz i bulwary po drugiej stronie Grzegórzeckiej. Tramwaje spod domu dowożą na Rynek w niecałe dziesięć minut.",
      additional:
        "Własność hipoteczna, czynsz 710 zł z zaliczką na ciepło. Piwnica w cenie, budynek bez windy.",
    },
    images: [
      "https://images.pexels.com/photos/34887637/pexels-photo-34887637.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1600488999585-e4364713b90a?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7166927/pexels-photo-7166927.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/28295552/pexels-photo-28295552.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Cztery pokoje przy al. Pokoju · Grzegórzki",
    price: 1_584_000,
    location: "Kraków, Grzegórzki",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 88,
    plotArea: null,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    floor: 9,
    totalFloors: 12,
    yearBuilt: 2008,
    monthlyRent: 980,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: null,
    features: ["terrace", "elevator", "garage", "basement", "fiber", "ac", "alarm"],
    address: {
      street: "al. Pokoju 29",
      district: "Grzegórzki",
      city: "Kraków",
      postalCode: "31-559",
      country: "PL",
      lat: 50.0601,
      lng: 19.9698,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 88 m² na dziewiątym piętrze, z tarasem 18 m² i widokiem w stronę Kopca Wandy. Budynek z 2008 roku z recepcją i halą garażową.",
      layout:
        "Salon połączony z jadalnią i wyjściem na taras, trzy sypialnie, dwie łazienki oraz pomieszczenie gospodarcze. Klimatyzacja w części dziennej i sypialni głównej.",
      location:
        "Aleja Pokoju prowadzi prosto do Ronda Mogilskiego i dalej do centrum, Galeria Plaza po sąsiedzku. Park Dąbie i bulwary wiślane niecały kilometr od budynku.",
      additional:
        "Własność hipoteczna, czynsz 980 zł z miejscem garażowym i komórką. W budynku ochrona i monitoring, mieszkanie objęte instalacją alarmową.",
    },
    images: [
      "https://images.pexels.com/photos/14714646/pexels-photo-14714646.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1603825491103-bd638b1873b0?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7019012/pexels-photo-7019012.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1643906652169-a750f3f70848?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Dwa pokoje przy Bronowickiej · Bronowice",
    price: 697_500,
    location: "Kraków, Bronowice",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 45,
    plotArea: null,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    floor: 1,
    totalFloors: 4,
    yearBuilt: 1970,
    monthlyRent: 510,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "fiber"],
    address: {
      street: "ul. Bronowicka 52",
      district: "Bronowice",
      city: "Kraków",
      postalCode: "30-091",
      country: "PL",
      lat: 50.0791,
      lng: 19.9002,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 45 m² na pierwszym piętrze bloku przy Bronowickiej, w stanie dobrym, z balkonem od strony podwórza. Budynek po termomodernizacji z wymienionymi oknami.",
      layout:
        "Salon z wyjściem na balkon, oddzielna sypialnia, kuchnia w zabudowie oraz łazienka z wanną. Do lokalu należy piwnica.",
      location:
        "Galeria Bronowice pięć minut tramwajem, Młynówka Królewska ze ścieżką rowerową dwie przecznice dalej. Rydlówka, czyli dworek z „Wesela”, znajduje się w tej samej części Bronowic.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu z księgą wieczystą, czynsz 510 zł z ciepłem. Budynek bez windy.",
    },
    images: [
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19857231/pexels-photo-19857231.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1601578318413-af2284f10486?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6970023/pexels-photo-6970023.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7195899/pexels-photo-7195899.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1619994121345-b61cd610c5a6?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Trzy pokoje przy Armii Krajowej · Bronowice",
    price: 1_089_000,
    location: "Kraków, Bronowice",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "SOLD",
    area: 66,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 6,
    totalFloors: 10,
    yearBuilt: 2016,
    monthlyRent: 740,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: null,
    features: ["balcony", "elevator", "garage", "basement", "fiber"],
    address: {
      street: "ul. Armii Krajowej 89",
      district: "Bronowice",
      city: "Kraków",
      postalCode: "30-150",
      country: "PL",
      lat: 50.0762,
      lng: 19.8931,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 66 m² na szóstym piętrze budynku z 2016 roku, sprzedane w lipcu tego roku. Rekord zachowany dla porównań cenowych w tej części Bronowic.",
      layout:
        "Salon z aneksem kuchennym i balkonem, dwie sypialnie oraz łazienka z prysznicem. Miejsce postojowe w hali garażowej i komórka lokatorska w cenie.",
      location:
        "Węzeł Ofiar Katynia i wjazd na obwodnicę pięć minut samochodem, Galeria Bronowice kilometr dalej. Przystanki autobusowe przy Armii Krajowej zapewniają dojazd na AGH i do centrum.",
      additional:
        "Własność hipoteczna, czynsz 740 zł. Transakcja sfinalizowana aktem notarialnym, oferta nieaktywna.",
    },
    images: [
      "https://images.pexels.com/photos/7836571/pexels-photo-7836571.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19966796/pexels-photo-19966796.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1643949700215-e61cdca053f7?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19866472/pexels-photo-19866472.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1516501312919-d0cb0b7b60b8?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Trzy pokoje przy Królowej Jadwigi · Zwierzyniec",
    price: 1_197_000,
    location: "Kraków, Zwierzyniec",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 63,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 1,
    totalFloors: 3,
    yearBuilt: 1994,
    monthlyRent: 680,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "garden", "parking", "basement", "fiber"],
    address: {
      street: "ul. Królowej Jadwigi 71",
      district: "Zwierzyniec",
      city: "Kraków",
      postalCode: "30-218",
      country: "PL",
      lat: 50.0571,
      lng: 19.9021,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 63 m² w kameralnym budynku z 1994 roku przy Królowej Jadwigi, w otoczeniu willowej zabudowy. Tylko sześć lokali na klatkę i wspólny ogród.",
      layout:
        "Salon z balkonem, dwie sypialnie, kuchnia z oknem oraz łazienka z wanną. Do mieszkania przypisane miejsce postojowe na terenie posesji.",
      location:
        "Las Wolski i kopiec Kościuszki w zasięgu spaceru, Błonia niecałe dwa kilometry. Autobusy wzdłuż Królowej Jadwigi dowożą pod Salwator, skąd tramwajem dojedzie się do centrum w kwadrans.",
      additional:
        "Własność hipoteczna, czynsz 680 zł z utrzymaniem terenu zielonego. Ogrzewanie gazowe własne, piec kondensacyjny wymieniony w 2021 roku.",
    },
    images: [
      "https://images.pexels.com/photos/19866421/pexels-photo-19866421.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1643949719317-4342d8d4031e?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7166927/pexels-photo-7166927.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1580216643062-cf460548a66a?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Mieszkanie przy Salwatorskiej · Zwierzyniec",
    price: 1_102_000,
    location: "Kraków, Zwierzyniec",
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
    totalFloors: 3,
    yearBuilt: 1929,
    monthlyRent: 620,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "GAS",
    energyClass: "D",
    availableFrom: null,
    features: ["fiber", "basement", "separate_kitchen"],
    address: {
      street: "ul. Salwatorska 14",
      district: "Zwierzyniec",
      city: "Kraków",
      postalCode: "30-109",
      country: "PL",
      lat: 50.0546,
      lng: 19.9131,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 58 m² w przedwojennej willi przy Salwatorskiej, po remoncie zakończonym w 2022 roku. Zachowano oryginalne drzwi i piec kaflowy pełniący funkcję dekoracyjną.",
      layout:
        "Salon od strony ogrodu, sypialnia, oddzielna kuchnia oraz łazienka z prysznicem. Wysokość 3,1 m, na podłogach cyklinowany parkiet dębowy.",
      location:
        "Klasztor Norbertanek i pętla tramwajowa Salwator 300 m, bulwary wiślane i Błonia w zasięgu krótkiego spaceru. Jedna z najspokojniejszych i najbardziej zielonych części miasta.",
      additional:
        "Własność hipoteczna, czynsz 620 zł. Ogrzewanie gazowe własne, do mieszkania należy piwnica i udział we wspólnym ogrodzie.",
    },
    images: [
      "https://images.pexels.com/photos/19866404/pexels-photo-19866404.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1610307522657-8c0304960189?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1661107259637-4e1c55462428?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7019012/pexels-photo-7019012.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1784535997070-5613c5c28784?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Dwa pokoje przy Wybickiego · Prądnik Biały",
    price: 623_500,
    location: "Kraków, Prądnik Biały",
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
    yearBuilt: 1988,
    monthlyRent: 530,
    deposit: null,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["balcony", "basement", "fiber"],
    address: {
      street: "ul. Józefa Wybickiego 14",
      district: "Prądnik Biały",
      city: "Kraków",
      postalCode: "31-261",
      country: "PL",
      lat: 50.0881,
      lng: 19.9332,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 43 m² na trzecim piętrze bloku z 1988 roku, w stanie dobrym, gotowe do zamieszkania po odświeżeniu. Budynek ocieplony, z wymienioną stolarką okienną.",
      layout:
        "Salon z balkonem, sypialnia oraz kuchnia z oknem i łazienka z wanną. Piwnica przypisana do lokalu.",
      location:
        "Park Krowoderski 700 m, szpital imienia Narutowicza i przychodnie w pobliżu, targ przy Nowym Kleparzu dwa przystanki tramwajem. Osiedle z dużą ilością zieleni i placami zabaw między blokami.",
      additional:
        "Spółdzielcze własnościowe prawo do lokalu, czynsz 530 zł z ciepłem i wodą. Budynek bez windy.",
    },
    images: [
      "https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/29252561/pexels-photo-29252561.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19899047/pexels-photo-19899047.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1630699293854-f75359d10c5d?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1624204386084-dd8c05e32226?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Trzy pokoje przy Białoprądnickiej · Prądnik Biały",
    price: 825_000,
    location: "Kraków, Prądnik Biały",
    transactionType: "SALE",
    propertyType: "APARTMENT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 55,
    plotArea: null,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 2004,
    monthlyRent: 650,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: null,
    features: ["balcony", "elevator", "parking", "basement", "fiber"],
    address: {
      street: "ul. Białoprądnicka 26",
      district: "Prądnik Biały",
      city: "Kraków",
      postalCode: "31-221",
      country: "PL",
      lat: 50.0929,
      lng: 19.9371,
    },
    descriptionSections: {
      intro:
        "Mieszkanie 55 m² z 2004 roku, na drugim piętrze budynku z windą, gotowe do wprowadzenia. Trzy pokoje na tym metrażu to układ trudny do znalezienia w nowszym budownictwie.",
      layout:
        "Salon z balkonem, dwie mniejsze sypialnie, kuchnia w zabudowie oraz łazienka z wanną. Miejsce postojowe na terenie osiedla i komórka lokatorska w cenie.",
      location:
        "Dolina Białuchy ze ścieżkami spacerowymi 400 m, park Krowoderski kilometr dalej. Autobusy z Białoprądnickiej dowożą do Nowego Kleparza, skąd tramwaj jedzie na Rynek kwadrans.",
      additional:
        "Własność hipoteczna, czynsz 650 zł z ciepłem i miejscem parkingowym. Osiedle ogrodzone, z placem zabaw i monitoringiem.",
    },
    images: [
      "https://images.unsplash.com/photo-1615800002234-05c4d488696c?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/19846388/pexels-photo-19846388.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1699942681763-d1da9f692489?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/20348127/pexels-photo-20348127.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1630699294288-3bc2ae7bf361?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1570675894641-8860d49afece?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  // ============================ DOMY (HOUSE) — 8 ============================

  {
    title: "Dom 178 m² przy Emaus · Zwierzyniec",
    price: 2_670_000,
    location: "Kraków, Zwierzyniec",
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
    yearBuilt: 1998,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "C",
    availableFrom: null,
    features: ["garden", "terrace", "garage", "fireplace", "basement", "fiber", "alarm"],
    address: {
      street: "ul. Emaus 24",
      district: "Zwierzyniec",
      city: "Kraków",
      postalCode: "30-201",
      country: "PL",
      lat: 50.0601,
      lng: 19.9072,
    },
    descriptionSections: {
      intro:
        "Wolnostojący dom 178 m² na działce 620 m² przy Emaus, u podnóża wzgórza z kopcem Kościuszki. Wybudowany w 1998 roku, utrzymany w dobrym stanie, z kominkiem w salonie.",
      layout:
        "Na parterze salon z kominkiem i wyjściem na taras, kuchnia z jadalnią, gabinet oraz łazienka; na piętrze trzy sypialnie i druga łazienka. Garaż w bryle budynku i pełne podpiwniczenie.",
      location:
        "Las Wolski i szlaki na kopiec zaczynają się kilkaset metrów dalej, Błonia i Salwator w zasięgu roweru. Mimo bliskości centrum ulica jest cicha, z zabudową głównie jednorodzinną.",
      additional:
        "Własność hipoteczna, ogrzewanie gazowe z piecem kondensacyjnym z 2020 roku. Ogród urządzony, z nawodnieniem i starodrzewem od strony południowej.",
    },
    images: [
      "https://images.pexels.com/photos/358636/pexels-photo-358636.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1719324923613-ff0884b031ed?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/6908359/pexels-photo-6908359.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7746627/pexels-photo-7746627.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7587862/pexels-photo-7587862.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/28586197/pexels-photo-28586197.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6283969/pexels-photo-6283969.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Dom 156 m² przy Tetmajera · Bronowice",
    price: 1_950_000,
    location: "Kraków, Bronowice",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "PENDING",
    area: 156,
    plotArea: 540,
    rooms: 5,
    bedrooms: 4,
    bathrooms: 2,
    floor: null,
    totalFloors: 2,
    yearBuilt: 2006,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "GAS",
    energyClass: "C",
    availableFrom: null,
    features: ["garden", "terrace", "garage", "parking", "fiber", "alarm"],
    address: {
      street: "ul. Włodzimierza Tetmajera 41",
      district: "Bronowice",
      city: "Kraków",
      postalCode: "30-198",
      country: "PL",
      lat: 50.0869,
      lng: 19.8932,
    },
    descriptionSections: {
      intro:
        "Dom wolnostojący 156 m² na działce 540 m² w Bronowicach Małych, z 2006 roku, gotowy do zamieszkania. Elewacja i dach po przeglądzie w 2023 roku.",
      layout:
        "Parter z otwartym salonem, kuchnią i jadalnią oraz łazienką, na piętrze cztery sypialnie i pełna łazienka. Garaż jednostanowiskowy plus dwa miejsca postojowe na podjeździe.",
      location:
        "Bronowice Małe zachowały charakter dawnej wsi — do Rydlówki i kościoła świętej Jadwigi kilka minut pieszo. Wjazd na obwodnicę przez węzeł Modlnica około pięciu minut samochodem.",
      additional:
        "Własność hipoteczna, ogrzewanie gazowe, dom objęty instalacją alarmową. Oferta zarezerwowana — trwa procedura kredytowa kupującego.",
    },
    images: [
      "https://images.pexels.com/photos/8143683/pexels-photo-8143683.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1719324924230-63781a3f18b9?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7174393/pexels-photo-7174393.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/20137477/pexels-photo-20137477.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7587484/pexels-photo-7587484.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/15758636/pexels-photo-15758636.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Nowy dom przy Stelmachów · Prądnik Biały",
    price: 1_562_000,
    location: "Kraków, Prądnik Biały",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "PRIMARY",
    status: "ACTIVE",
    area: 142,
    plotArea: 480,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    floor: null,
    totalFloors: 2,
    yearBuilt: 2023,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "HEAT_PUMP",
    energyClass: "A",
    availableFrom: "2026-09-01",
    features: ["garden", "terrace", "garage", "parking", "fiber"],
    address: {
      street: "ul. Stelmachów 78",
      district: "Prądnik Biały",
      city: "Kraków",
      postalCode: "31-341",
      country: "PL",
      lat: 50.1031,
      lng: 19.9281,
    },
    descriptionSections: {
      intro:
        "Dom 142 m² na Górce Narodowej, oddany przez dewelopera w 2023 roku, z pompą ciepła i fotowoltaiką. Ostatni budynek z czteroelementowej inwestycji.",
      layout:
        "Otwarty parter z salonem, kuchnią i jadalnią, do tego łazienka i pomieszczenie gospodarcze; na piętrze trzy sypialnie i łazienka z wanną. Garaż w bryle oraz taras od południa.",
      location:
        "Górka Narodowa zmieniła się w ostatnich latach dzięki nowej pętli tramwajowej i estakadzie — do centrum dojedzie się stąd w dwadzieścia minut. W okolicy szkoła, żłobek i sklepy przy Stelmachów.",
      additional:
        "Rynek pierwotny, sprzedaż z gwarancją dewelopera, klasa energetyczna A. Ogrzewanie pompą ciepła, koszty utrzymania wyraźnie niższe niż w starszej zabudowie.",
    },
    images: [
      "https://images.pexels.com/photos/8092383/pexels-photo-8092383.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/37639780/pexels-photo-37639780.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/16849901/pexels-photo-16849901.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/16435060/pexels-photo-16435060.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8092397/pexels-photo-8092397.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Dom 210 m² przy Tynieckiej · Dębniki",
    price: 2_310_000,
    location: "Kraków, Dębniki",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 210,
    plotArea: 900,
    rooms: 6,
    bedrooms: 4,
    bathrooms: 3,
    floor: null,
    totalFloors: 2,
    yearBuilt: 2003,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "C",
    availableFrom: null,
    features: ["garden", "terrace", "garage", "fireplace", "basement", "parking", "fiber"],
    address: {
      street: "ul. Tyniecka 132",
      district: "Dębniki",
      city: "Kraków",
      postalCode: "30-323",
      country: "PL",
      lat: 50.0362,
      lng: 19.8901,
    },
    descriptionSections: {
      intro:
        "Dom 210 m² na działce 900 m² przy Tynieckiej, w kierunku Tyńca, wybudowany w 2003 roku. Duży ogród ze starodrzewem i widok na skarpę wiślaną.",
      layout:
        "Parter mieści salon z kominkiem, oddzielną kuchnię z jadalnią, gabinet i łazienkę, piętro cztery sypialnie i dwie łazienki. Garaż dwustanowiskowy, pełne podpiwniczenie z pralnią.",
      location:
        "Bulwary i ścieżka rowerowa wzdłuż Wisły prowadzą stąd prosto do Tyńca z opactwem Benedyktynów, a w drugą stronę do centrum. Zakrzówek i Ruczaj z kampusem UJ w zasięgu kilku minut samochodem.",
      additional:
        "Własność hipoteczna, ogrzewanie gazowe wspierane kominkiem z płaszczem wodnym. Dach i elewacja bez zastrzeżeń, ostatni przegląd instalacji w 2024 roku.",
    },
    images: [
      "https://images.pexels.com/photos/24524484/pexels-photo-24524484.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/32907363/pexels-photo-32907363.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8134802/pexels-photo-8134802.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8146155/pexels-photo-8146155.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6492399/pexels-photo-6492399.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/10267196/pexels-photo-10267196.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Przedwojenny dom przy Krasickiego · Podgórze",
    price: 1_408_000,
    location: "Kraków, Podgórze",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 128,
    plotArea: 350,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 1,
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
    features: ["garden", "basement", "fireplace", "fiber"],
    address: {
      street: "ul. Ignacego Krasickiego 27",
      district: "Podgórze",
      city: "Kraków",
      postalCode: "30-503",
      country: "PL",
      lat: 50.0401,
      lng: 19.9432,
    },
    descriptionSections: {
      intro:
        "Dom 128 m² z 1936 roku na działce 350 m², w przedwojennej części Podgórza. Budynek zadbany, z zachowaną stolarką i schodami z lastryka.",
      layout:
        "Na parterze salon z piecem kaflowym, kuchnia i pokój od ogrodu, na piętrze trzy sypialnie i łazienka. Wysokie piwnice o użytkowej wysokości, poddasze do adaptacji.",
      location:
        "Park Bednarskiego i Kopiec Krakusa w zasięgu spaceru, Rynek Podgórski 800 m. Krasickiego prowadzi w stronę Łagiewnik, przystanki tramwajowe dwie przecznice dalej.",
      additional:
        "Własność hipoteczna, księga wieczysta bez obciążeń. Ogrzewanie gazowe, instalacja elektryczna wymieniona w 2017 roku; stolarka okienna wymaga stopniowej renowacji.",
    },
    images: [
      "https://images.pexels.com/photos/10297633/pexels-photo-10297633.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/22696514/pexels-photo-22696514.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/19902897/pexels-photo-19902897.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8143710/pexels-photo-8143710.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6587852/pexels-photo-6587852.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/12700466/pexels-photo-12700466.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Dom z dużą działką przy Igołomskiej · Nowa Huta",
    price: 1_320_000,
    location: "Kraków, Nowa Huta",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "SOLD",
    area: 165,
    plotArea: 1_100,
    rooms: 5,
    bedrooms: 4,
    bathrooms: 2,
    floor: null,
    totalFloors: 2,
    yearBuilt: 2001,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "SOLID_FUEL",
    energyClass: "D",
    availableFrom: null,
    features: ["garden", "garage", "parking", "basement", "fireplace"],
    address: {
      street: "ul. Igołomska 156",
      district: "Nowa Huta",
      city: "Kraków",
      postalCode: "31-983",
      country: "PL",
      lat: 50.0631,
      lng: 20.0921,
    },
    descriptionSections: {
      intro:
        "Dom 165 m² na działce 1 100 m² we wschodniej części Nowej Huty, sprzedany wiosną tego roku. Rekord zachowany jako punkt odniesienia dla wycen w tej okolicy.",
      layout:
        "Parter z salonem, kuchnią, jadalnią i łazienką, na piętrze cztery sypialnie i druga łazienka. Wolnostojący garaż, budynek gospodarczy i sad w tylnej części działki.",
      location:
        "Igołomska prowadzi w stronę Wróżenic i granicy miasta — to najbardziej wiejski fragment Krakowa, z polami po obu stronach drogi. Do placu Centralnego około dwudziestu minut samochodem.",
      additional:
        "Własność hipoteczna, ogrzewanie kotłem na paliwo stałe — nabywca planował wymianę na pompę ciepła w ramach programu dotacyjnego. Transakcja zamknięta aktem notarialnym.",
    },
    images: [
      "https://images.pexels.com/photos/38877041/pexels-photo-38877041.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/38114648/pexels-photo-38114648.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8089196/pexels-photo-8089196.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/16116303/pexels-photo-16116303.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7045848/pexels-photo-7045848.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1649083048770-82e8ffd80431?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/13005094/pexels-photo-13005094.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Dom 194 m² przy Pod Strzechą · Bronowice",
    price: 2_522_000,
    location: "Kraków, Bronowice",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 194,
    plotArea: 700,
    rooms: 6,
    bedrooms: 4,
    bathrooms: 3,
    floor: null,
    totalFloors: 2,
    yearBuilt: 2011,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "GAS",
    energyClass: "B",
    availableFrom: null,
    features: ["garden", "terrace", "garage", "parking", "fireplace", "fiber", "alarm", "ac"],
    address: {
      street: "ul. Pod Strzechą 8",
      district: "Bronowice",
      city: "Kraków",
      postalCode: "30-147",
      country: "PL",
      lat: 50.0856,
      lng: 19.8971,
    },
    descriptionSections: {
      intro:
        "Dom wolnostojący 194 m² na działce 700 m², z 2011 roku, w bardzo dobrym stanie technicznym. Klimatyzacja na obu kondygnacjach i rekuperacja.",
      layout:
        "Otwarta strefa dzienna z kominkiem i wyjściem na taras, oddzielna kuchnia, gabinet i łazienka na parterze; na piętrze cztery sypialnie i dwie łazienki. Garaż dwustanowiskowy w bryle budynku.",
      location:
        "Spokojna, zabudowana jednorodzinnie część Bronowic, z dojazdem do obwodnicy w kilka minut. Szkoła i przedszkole przy Zarzecze, Galeria Bronowice około dwóch kilometrów.",
      additional:
        "Własność hipoteczna, ogrzewanie gazowe z rekuperacją, klasa energetyczna B. Ogród urządzony z automatycznym nawodnieniem, posesja ogrodzona i monitorowana.",
    },
    images: [
      "https://images.pexels.com/photos/28575436/pexels-photo-28575436.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1778683326192-898fc982e6a6?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7174409/pexels-photo-7174409.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/38071642/pexels-photo-38071642.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/33529508/pexels-photo-33529508.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/10767386/pexels-photo-10767386.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/15412016/pexels-photo-15412016.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Rezydencja 240 m² na Woli Justowskiej · Zwierzyniec",
    price: 3_840_000,
    location: "Kraków, Zwierzyniec",
    transactionType: "SALE",
    propertyType: "HOUSE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 240,
    plotArea: 1_050,
    rooms: 6,
    bedrooms: 4,
    bathrooms: 3,
    floor: null,
    totalFloors: 2,
    yearBuilt: 1995,
    monthlyRent: null,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "AFTER_RENOVATION",
    heating: "HEAT_PUMP",
    energyClass: "B",
    availableFrom: null,
    features: ["garden", "terrace", "garage", "parking", "fireplace", "basement", "alarm", "fiber", "ac"],
    address: {
      street: "ul. Junacka 12",
      district: "Zwierzyniec",
      city: "Kraków",
      postalCode: "30-244",
      country: "PL",
      lat: 50.0641,
      lng: 19.8882,
    },
    descriptionSections: {
      intro:
        "Dom 240 m² na działce 1 050 m² na Woli Justowskiej, po gruntownej modernizacji zakończonej w 2022 roku. Wymieniono instalacje, stolarkę i źródło ciepła na pompę ciepła.",
      layout:
        "Reprezentacyjny salon z kominkiem otwarty na dwie kondygnacje, kuchnia z wyspą i jadalnią, gabinet oraz łazienka na parterze; na piętrze cztery sypialnie, dwie łazienki i garderoba. Garaż dwustanowiskowy i podpiwniczenie z pomieszczeniem technicznym.",
      location:
        "Wola Justowska to najbardziej willowa część Krakowa — Las Wolski, ogród zoologiczny i kopiec Kościuszki są stąd w zasięgu spaceru. Do Rynku Głównego około piętnastu minut samochodem przez Salwator.",
      additional:
        "Własność hipoteczna, klasa energetyczna B po modernizacji. Ogród z nasadzeniami i automatycznym nawodnieniem, cała posesja objęta monitoringiem i alarmem.",
    },
    images: [
      "https://images.pexels.com/photos/32711440/pexels-photo-32711440.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8121950/pexels-photo-8121950.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/37460679/pexels-photo-37460679.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/36841749/pexels-photo-36841749.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/35189677/pexels-photo-35189677.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/28586197/pexels-photo-28586197.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/34574591/pexels-photo-34574591.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  // ==================== LOKALE UŻYTKOWE (COMMERCIAL) — 4 ====================

  {
    title: "Lokal gastronomiczny przy Krakowskiej · Kazimierz",
    price: 6_800,
    location: "Kraków, Kazimierz",
    transactionType: "RENT",
    propertyType: "COMMERCIAL",
    market: "SECONDARY",
    status: "PENDING",
    area: 68,
    plotArea: null,
    rooms: 3,
    bedrooms: null,
    bathrooms: 1,
    floor: 0,
    totalFloors: 4,
    yearBuilt: 1905,
    monthlyRent: 950,
    deposit: 13_600,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "GAS",
    energyClass: "D",
    availableFrom: "2026-11-01",
    features: ["fiber", "ac", "alarm"],
    address: {
      street: "ul. Krakowska 21",
      district: "Kazimierz",
      city: "Kraków",
      postalCode: "31-062",
      country: "PL",
      lat: 50.0491,
      lng: 19.9424,
    },
    descriptionSections: {
      intro:
        "Lokal użytkowy 68 m² w parterze kamienicy przy Krakowskiej, z witryną od ulicy i wydanym pozwoleniem na działalność gastronomiczną. Poprzedni najemca prowadził tu kawiarnię.",
      layout:
        "Sala główna na 30 miejsc, zaplecze kuchenne z wentylacją mechaniczną, magazyn oraz toaleta dla gości. Instalacja gazowa i elektryczna dostosowane do gastronomii.",
      location:
        "Krakowska to jedna z głównych osi Kazimierza, prowadząca od Dietla do placu Wolnica. Duży ruch pieszy przez cały rok, w sezonie wzmocniony turystami idącymi w stronę placu Nowego.",
      additional:
        "Czynsz najmu 6 800 zł netto, opłaty eksploatacyjne 950 zł, kaucja w wysokości dwóch czynszów. Lokal zarezerwowany — trwają negocjacje warunków umowy.",
    },
    images: [
      "https://images.pexels.com/photos/18823960/pexels-photo-18823960.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1538333581680-29dd4752ddf2?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7385395/pexels-photo-7385395.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/29854540/pexels-photo-29854540.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Lokal handlowy przy Grodzkiej · Stare Miasto",
    price: 9_360,
    location: "Kraków, Stare Miasto",
    transactionType: "RENT",
    propertyType: "COMMERCIAL",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 52,
    plotArea: null,
    rooms: 2,
    bedrooms: null,
    bathrooms: 1,
    floor: 0,
    totalFloors: 4,
    yearBuilt: 1890,
    monthlyRent: 1_100,
    deposit: 18_720,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: "2026-09-01",
    features: ["fiber", "ac", "alarm"],
    address: {
      street: "ul. Grodzka 44",
      district: "Stare Miasto",
      city: "Kraków",
      postalCode: "31-044",
      country: "PL",
      lat: 50.0581,
      lng: 19.9371,
    },
    descriptionSections: {
      intro:
        "Lokal handlowy 52 m² przy Grodzkiej, na najbardziej uczęszczanym odcinku Drogi Królewskiej. Witryna od ulicy, ceglane sklepienie w części sprzedażowej.",
      layout:
        "Sala sprzedaży 38 m² z witryną, zaplecze socjalne oraz toaleta. Lokal przygotowany pod handel detaliczny, ale nadaje się także na showroom lub galerię.",
      location:
        "Grodzka łączy Rynek Główny z Wawelem, przechodzą tędy praktycznie wszystkie trasy turystyczne. Natężenie ruchu pieszego należy do najwyższych w mieście, także poza sezonem.",
      additional:
        "Czynsz 9 360 zł netto miesięcznie, opłaty administracyjne 1 100 zł, kaucja równa dwóm czynszom. Budynek objęty ochroną konserwatorską — zmiany w witrynie wymagają uzgodnień.",
    },
    images: [
      "https://images.pexels.com/photos/32549949/pexels-photo-32549949.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8386651/pexels-photo-8386651.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/31318445/pexels-photo-31318445.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/20659383/pexels-photo-20659383.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/30929605/pexels-photo-30929605.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Lokal usługowy 145 m² przy Wielickiej · Podgórze",
    price: 1_595_000,
    location: "Kraków, Podgórze",
    transactionType: "SALE",
    propertyType: "COMMERCIAL",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 145,
    plotArea: null,
    rooms: 4,
    bedrooms: null,
    bathrooms: 2,
    floor: 0,
    totalFloors: 6,
    yearBuilt: 1995,
    monthlyRent: 1_450,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "C",
    availableFrom: null,
    features: ["parking", "fiber", "ac", "alarm"],
    address: {
      street: "ul. Wielicka 72",
      district: "Podgórze",
      city: "Kraków",
      postalCode: "30-552",
      country: "PL",
      lat: 50.0381,
      lng: 19.9702,
    },
    descriptionSections: {
      intro:
        "Lokal użytkowy 145 m² w parterze budynku przy Wielickiej, z osobnym wejściem i witryną. Obecnie wynajęty sieci handlowej z umową do końca 2027 roku.",
      layout:
        "Otwarta przestrzeń sprzedażowa 105 m², dwa pomieszczenia zaplecza, magazyn i dwie toalety. Wysokość 3,3 m pozwala na antresolę magazynową.",
      location:
        "Wielicka to jedna z głównych arterii wylotowych na Wieliczkę, z dużym ruchem samochodowym i przystankami tramwajowymi przed budynkiem. Szpital Rydygiera i osiedla Kurdwanowa generują stały ruch klientów.",
      additional:
        "Własność hipoteczna, opłaty eksploatacyjne 1 450 zł. Do lokalu przypisane cztery miejsca postojowe, inwestycja z bieżącym najemcą i udokumentowanym przychodem.",
    },
    images: [
      "https://images.pexels.com/photos/3423860/pexels-photo-3423860.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1633419002989-2668f98764be?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1638559650606-30bb3ce1cfff?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1695721157873-0c87f59a8ea1?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/34726348/pexels-photo-34726348.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/31763620/pexels-photo-31763620.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Lokal 96 m² na os. Centrum D · Nowa Huta",
    price: 768_000,
    location: "Kraków, Nowa Huta",
    transactionType: "SALE",
    propertyType: "COMMERCIAL",
    market: "SECONDARY",
    status: "WITHDRAWN",
    area: 96,
    plotArea: null,
    rooms: 3,
    bedrooms: null,
    bathrooms: 1,
    floor: 0,
    totalFloors: 4,
    yearBuilt: 1954,
    monthlyRent: 890,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: null,
    features: ["fiber", "alarm"],
    address: {
      street: "os. Centrum D 3",
      district: "Nowa Huta",
      city: "Kraków",
      postalCode: "31-935",
      country: "PL",
      lat: 50.0724,
      lng: 20.0361,
    },
    descriptionSections: {
      intro:
        "Lokal użytkowy 96 m² w parterze socrealistycznego budynku przy placu Centralnym. Oferta wycofana — właściciel zdecydował się na samodzielny wynajem.",
      layout:
        "Dwie sale o powierzchni 40 i 32 m² połączone przejściem, zaplecze socjalne i toaleta. Witryny arkadowe od strony placu, wejście bezpośrednio z podcieni.",
      location:
        "Plac Centralny imienia Ronalda Reagana to komunikacyjne i handlowe serce starej Nowej Huty, z węzłem tramwajowym obsługującym całą wschodnią część miasta. Podcienia zapewniają ruch pieszy niezależnie od pogody.",
      additional:
        "Własność hipoteczna, opłaty eksploatacyjne 890 zł. Budynek w rejestrze zabytków jako element założenia urbanistycznego — wszelkie zmiany elewacji wymagają zgody konserwatora.",
    },
    images: [
      "https://images.unsplash.com/photo-1739201080675-20f720aecde9?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1641159930908-e9eb9ccdc002?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1776000680544-ebf0989a71df?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1782177388316-7546da332c3a?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/7629181/pexels-photo-7629181.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1540200049848-d9813ea0e120?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  // =========================== BIURA (OFFICE) — 2 ===========================

  {
    title: "Biuro 220 m² przy al. Pokoju · Grzegórzki",
    price: 15_400,
    location: "Kraków, Grzegórzki",
    transactionType: "RENT",
    propertyType: "OFFICE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 220,
    plotArea: null,
    rooms: 6,
    bedrooms: null,
    bathrooms: 2,
    floor: 5,
    totalFloors: 9,
    yearBuilt: 2007,
    monthlyRent: 4_400,
    deposit: 30_800,
    ownership: "FULL_OWNERSHIP",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "B",
    availableFrom: "2026-10-01",
    features: ["elevator", "parking", "reception", "fiber", "ac", "alarm"],
    address: {
      street: "al. Pokoju 78",
      district: "Grzegórzki",
      city: "Kraków",
      postalCode: "31-564",
      country: "PL",
      lat: 50.0604,
      lng: 19.9752,
    },
    descriptionSections: {
      intro:
        "Powierzchnia biurowa 220 m² na piątym piętrze budynku klasy B przy alei Pokoju. Lokal gotowy do wprowadzenia, z zabudową meblową poprzedniego najemcy.",
      layout:
        "Open space na 18 stanowisk, dwie sale spotkań, gabinet zarządu, kuchnia socjalna i dwie toalety. Podłoga techniczna, sufit podwieszany i pełne okablowanie strukturalne.",
      location:
        "Aleja Pokoju to jeden z głównych korytarzy biurowych Krakowa, z dojazdem tramwajem do Ronda Mogilskiego w pięć minut. Galeria Plaza i zaplecze gastronomiczne w bezpośrednim sąsiedztwie.",
      additional:
        "Czynsz 70 zł za metr miesięcznie, opłaty eksploatacyjne 20 zł za metr, kaucja równa dwóm czynszom. W cenie sześć miejsc parkingowych w hali garażowej i recepcja budynku.",
    },
    images: [
      "https://images.unsplash.com/photo-1549637642-90187f64f420?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1706074793638-da28b90ea8ae?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1706074797611-a02f9ed06439?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/17460303/pexels-photo-17460303.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1715593949273-09009558300a?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1677272288961-567c82e173ad?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  {
    title: "Biuro 310 m² przy Armii Krajowej · Bronowice",
    price: 21_700,
    location: "Kraków, Bronowice",
    transactionType: "RENT",
    propertyType: "OFFICE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 310,
    plotArea: null,
    rooms: 8,
    bedrooms: null,
    bathrooms: 3,
    floor: 3,
    totalFloors: 6,
    yearBuilt: 2015,
    monthlyRent: 6_200,
    deposit: 43_400,
    ownership: "FULL_OWNERSHIP",
    condition: "READY_TO_MOVE",
    heating: "DISTRICT",
    energyClass: "A",
    availableFrom: "2026-09-15",
    features: ["elevator", "parking", "reception", "fiber", "ac", "alarm", "concierge"],
    address: {
      street: "ul. Armii Krajowej 18",
      district: "Bronowice",
      city: "Kraków",
      postalCode: "30-150",
      country: "PL",
      lat: 50.0758,
      lng: 19.8942,
    },
    descriptionSections: {
      intro:
        "Nowoczesna powierzchnia biurowa 310 m² w budynku klasy A z 2015 roku przy Armii Krajowej. Certyfikat BREEAM i klasa energetyczna A.",
      layout:
        "Open space na 30 stanowisk, trzy sale konferencyjne, dwa gabinety, kuchnia i trzy węzły sanitarne. Klimatyzacja strefowa, rekuperacja i okna otwieralne na całej długości elewacji.",
      location:
        "Armii Krajowej zapewnia bezpośredni dojazd do obwodnicy i lotniska w Balicach w dwadzieścia minut. Przystanki autobusowe pod budynkiem, Galeria Bronowice i AGH w promieniu dwóch kilometrów.",
      additional:
        "Czynsz 70 zł za metr miesięcznie, opłaty serwisowe 20 zł za metr, kaucja dwumiesięczna. Dziesięć miejsc w hali garażowej, recepcja i ochrona całodobowa w cenie.",
    },
    images: [
      "https://images.unsplash.com/photo-1577412647305-991150c7d163?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/9300765/pexels-photo-9300765.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8971808/pexels-photo-8971808.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1697538054827-5afb365a194f?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1643267514395-b36b3f7e8281?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1677272289690-a342ae78b26b?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },

  // ============================ DZIAŁKI (PLOT) — 3 ============================

  {
    title: "Działka budowlana 812 m² przy Stelmachów · Prądnik Biały",
    price: 731_000,
    location: "Kraków, Prądnik Biały",
    transactionType: "SALE",
    propertyType: "PLOT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: null,
    plotArea: 812,
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
      street: "ul. Stelmachów",
      district: "Prądnik Biały",
      city: "Kraków",
      postalCode: "31-341",
      country: "PL",
      lat: 50.1041,
      lng: 19.9262,
    },
    descriptionSections: {
      intro:
        "Działka budowlana 812 m² na Górce Narodowej, w kształcie zbliżonym do prostokąta o wymiarach około 22 na 37 metrów. Teren płaski, bez konieczności niwelacji.",
      layout:
        "Miejscowy plan zagospodarowania dopuszcza zabudowę jednorodzinną wolnostojącą do dwóch kondygnacji, z dachem dwuspadowym. Wskaźnik zabudowy 40 procent daje możliwość postawienia domu o powierzchni około 150 m².",
      location:
        "Górka Narodowa zyskała w ostatnich latach nową pętlę tramwajową i estakadę, dzięki czemu dojazd do centrum zajmuje około dwudziestu minut. Sąsiedztwo to głównie nowa zabudowa jednorodzinna i pola po stronie północnej.",
      additional:
        "Własność hipoteczna, księga wieczysta bez obciążeń, cena 900 zł za metr. Media w drodze: prąd, woda, gaz i kanalizacja, przyłącza do wykonania na koszt nabywcy.",
    },
    images: [
      "https://images.pexels.com/photos/37520984/pexels-photo-37520984.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/31853767/pexels-photo-31853767.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/36929652/pexels-photo-36929652.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/37244497/pexels-photo-37244497.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/31596607/pexels-photo-31596607.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Działka 1450 m² przy Tynieckiej · Dębniki",
    price: 1_015_000,
    location: "Kraków, Dębniki",
    transactionType: "SALE",
    propertyType: "PLOT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: null,
    plotArea: 1_450,
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
      street: "ul. Tyniecka",
      district: "Dębniki",
      city: "Kraków",
      postalCode: "30-323",
      country: "PL",
      lat: 50.0301,
      lng: 19.8791,
    },
    descriptionSections: {
      intro:
        "Działka 1 450 m² w Kostrzu, w zachodniej części Dębnik, z lekkim spadkiem w stronę południową. Szerokość frontu 28 metrów, dojazd drogą asfaltową.",
      layout:
        "Teren przeznaczony pod zabudowę jednorodzinną, obecnie użytkowany jako łąka, bez naniesień do usunięcia. Ukształtowanie pozwala na dom z garażem wjazdowym z poziomu drogi.",
      location:
        "Kostrze leży między Zakrzówkiem a Tyńcem, z ścieżką rowerową wzdłuż Wisły prowadzącą do opactwa Benedyktynów. Do kampusu UJ na Ruczaju około dziesięciu minut samochodem, do Rynku Głównego dwadzieścia pięć.",
      additional:
        "Własność hipoteczna, cena 700 zł za metr. Prąd i woda w granicy działki, gaz w drodze; brak kanalizacji miejskiej, przewidziana przydomowa oczyszczalnia.",
    },
    images: [
      "https://images.pexels.com/photos/25242994/pexels-photo-25242994.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1477339203895-911aec734b13?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1684867430916-ede9dc95eca5?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/32314074/pexels-photo-32314074.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/32314077/pexels-photo-32314077.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Działka 2300 m² przy Igołomskiej · Nowa Huta",
    price: 920_000,
    location: "Kraków, Nowa Huta",
    transactionType: "SALE",
    propertyType: "PLOT",
    market: "SECONDARY",
    status: "ACTIVE",
    area: null,
    plotArea: 2_300,
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
      street: "ul. Igołomska",
      district: "Nowa Huta",
      city: "Kraków",
      postalCode: "31-983",
      country: "PL",
      lat: 50.0611,
      lng: 20.1181,
    },
    descriptionSections: {
      intro:
        "Działka 2 300 m² w rejonie Wróżenic, przy wschodniej granicy Krakowa, o wydłużonym kształcie z frontem 30 metrów. Gleby klasy IV, teren równy i suchy.",
      layout:
        "Zgodnie z planem miejscowym możliwa zabudowa zagrodowa i jednorodzinna, z linią zabudowy sześć metrów od drogi. Powierzchnia pozwala na dom z budynkiem gospodarczym i sadem.",
      location:
        "Wróżenice to najbardziej rolniczy fragment miasta — wokół pola i zabudowa siedliskowa, a granica z gminą Igołomia-Wawrzeńczyce przebiega kilkaset metrów dalej. Do placu Centralnego około dwudziestu minut samochodem Igołomską.",
      additional:
        "Własność hipoteczna, cena 400 zł za metr, najniższa stawka za grunt budowlany w granicach miasta. Prąd przy działce, woda z wodociągu gminnego, gazu brak.",
    },
    images: [
      "https://images.unsplash.com/photo-1747854805840-9be7d5e360e6?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1755335491375-c02ce5e4d926?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.unsplash.com/photo-1755335493278-03caa1a38b59?w=1280&h=860&fit=crop&auto=format&q=80",
      "https://images.pexels.com/photos/32314081/pexels-photo-32314081.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/22276447/pexels-photo-22276447.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  // =========================== GARAŻE (GARAGE) — 2 ===========================

  {
    title: "Garaż murowany przy Chocimskiej · Krowodrza",
    price: 105_000,
    location: "Kraków, Krowodrza",
    transactionType: "SALE",
    propertyType: "GARAGE",
    market: "SECONDARY",
    status: "PENDING",
    area: 18,
    plotArea: null,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    floor: 0,
    totalFloors: 1,
    yearBuilt: 1985,
    monthlyRent: 90,
    deposit: null,
    ownership: "FULL_OWNERSHIP",
    condition: null,
    heating: null,
    energyClass: null,
    availableFrom: null,
    features: ["garage"],
    address: {
      street: "ul. Chocimska 15",
      district: "Krowodrza",
      city: "Kraków",
      postalCode: "30-057",
      country: "PL",
      lat: 50.0708,
      lng: 19.9192,
    },
    descriptionSections: {
      intro:
        "Garaż murowany 18 m² w zespole garaży przy Chocimskiej, z 1985 roku. Brama uchylna, wymieniona w 2019 roku, oraz doprowadzony prąd.",
      layout:
        "Jedno stanowisko o wymiarach 3 na 6 metrów, z regałami na tylnej ścianie i kanałem przeglądowym. Posadzka betonowa w dobrym stanie, bez pęknięć.",
      location:
        "Zespół garaży leży pomiędzy zabudową mieszkaniową Krowodrzy, z wjazdem od strony Chocimskiej. Do Błoń i AGH kilkanaście minut pieszo, okolica z ograniczoną liczbą miejsc postojowych.",
      additional:
        "Własność hipoteczna z udziałem w gruncie, opłata roczna za grunt rozliczana miesięcznie w wysokości 90 zł. Oferta zarezerwowana do końca miesiąca.",
    },
    images: [
      "https://images.pexels.com/photos/31944676/pexels-photo-31944676.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/14002092/pexels-photo-14002092.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/37703762/pexels-photo-37703762.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/28384143/pexels-photo-28384143.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/29527707/pexels-photo-29527707.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  {
    title: "Miejsce garażowe przy Józefińskiej · Podgórze",
    price: 380,
    location: "Kraków, Podgórze",
    transactionType: "RENT",
    propertyType: "GARAGE",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 15,
    plotArea: null,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    floor: -1,
    totalFloors: 1,
    yearBuilt: 2012,
    monthlyRent: 40,
    deposit: 760,
    ownership: "SHARE",
    condition: null,
    heating: null,
    energyClass: null,
    availableFrom: "2026-09-01",
    features: ["garage", "elevator", "alarm"],
    address: {
      street: "ul. Józefińska 9",
      district: "Podgórze",
      city: "Kraków",
      postalCode: "30-529",
      country: "PL",
      lat: 50.0462,
      lng: 19.9527,
    },
    descriptionSections: {
      intro:
        "Miejsce postojowe w podziemnej hali garażowej budynku z 2012 roku przy Józefińskiej. Stanowisko szerokie, przy filarze, z wygodnym manewrowaniem.",
      layout:
        "Powierzchnia przypisana 15 m², wjazd bramą na pilota, hala monitorowana i oświetlona czujnikami ruchu. Winda z garażu bezpośrednio na kondygnacje mieszkalne.",
      location:
        "Józefińska leży w ścisłym centrum Podgórza, kilkaset metrów od Rynku Podgórskiego i Kładki Bernatka. W tej okolicy obowiązuje strefa płatnego parkowania, więc miejsce w hali realnie rozwiązuje problem postoju.",
      additional:
        "Udział we współwłasności hali garażowej, wynajem długoterminowy. Czynsz 380 zł miesięcznie, opłata eksploatacyjna 40 zł, kaucja w wysokości dwóch czynszów.",
    },
    images: [
      "https://images.pexels.com/photos/11623685/pexels-photo-11623685.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/18344080/pexels-photo-18344080.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/21374999/pexels-photo-21374999.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/8609786/pexels-photo-8609786.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7996765/pexels-photo-7996765.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
    ],
  },

  // ============================= POKÓJ (ROOM) — 1 =============================

  {
    title: "Pokój w mieszkaniu przy Kijowskiej · Krowodrza",
    price: 1_250,
    location: "Kraków, Krowodrza",
    transactionType: "RENT",
    propertyType: "ROOM",
    market: "SECONDARY",
    status: "ACTIVE",
    area: 14,
    plotArea: null,
    rooms: 1,
    bedrooms: null,
    bathrooms: 1,
    floor: 2,
    totalFloors: 4,
    yearBuilt: 1974,
    monthlyRent: null,
    deposit: 1_250,
    ownership: "COOPERATIVE",
    condition: "GOOD",
    heating: "DISTRICT",
    energyClass: "D",
    availableFrom: "2026-09-20",
    features: ["furnished", "fiber", "basement"],
    address: {
      street: "ul. Kijowska 22",
      district: "Krowodrza",
      city: "Kraków",
      postalCode: "30-079",
      country: "PL",
      lat: 50.0701,
      lng: 19.9131,
    },
    descriptionSections: {
      intro:
        "Umeblowany pokój 14 m² w trzypokojowym mieszkaniu przy Kijowskiej, na drugim piętrze. Pozostałe dwa pokoje zajmują studentki AGH, wolne miejsce od dwudziestego września.",
      layout:
        "Pokój z łóżkiem, biurkiem, szafą i regałem, okno wychodzi na ciche podwórze. Kuchnia, łazienka z pralką i przedpokój do wspólnego użytku wszystkich lokatorów.",
      location:
        "AGH i Politechnika Krakowska w zasięgu kwadransa pieszo, Błonia i Park Krakowski w pobliżu. Przystanki tramwajowe przy Lea i Królewskiej zapewniają dojazd do centrum w dziesięć minut.",
      additional:
        "Czynsz 1 250 zł miesięcznie z opłatami administracyjnymi w cenie, media dzielone na trzy osoby, kaucja jednomiesięczna. Bez zwierząt, umowa na rok akademicki z możliwością przedłużenia.",
    },
    images: [
      "https://images.pexels.com/photos/19878532/pexels-photo-19878532.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/6908556/pexels-photo-6908556.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/5556177/pexels-photo-5556177.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.pexels.com/photos/7005279/pexels-photo-7005279.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1280&h=860",
      "https://images.unsplash.com/photo-1630699144461-733d6eaf19b1?w=1280&h=860&fit=crop&auto=format&q=80",
    ],
  },
];

/**
 * Katalog 50 ofert dla Krakowa. Pole `description` powstaje ze sklejenia czterech
 * sekcji opisu, `imageUrl` wskazuje pierwsze zdjęcie z galerii danej oferty.
 */
export const NIERUCHOMOSCI_KRAKOW: readonly KrakowProperty[] = NIERUCHOMOSCI.map(
  (p): KrakowProperty => ({
    ...p,
    imageUrl: p.images[0],
    description: [
      p.descriptionSections.intro,
      p.descriptionSections.layout,
      p.descriptionSections.location,
      p.descriptionSections.additional,
    ].join("\n\n"),
  }),
);

export default NIERUCHOMOSCI_KRAKOW;
