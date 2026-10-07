/**
 * TV K37 Broadcasting Data Architecture
 * Comprehensive scheduling, shows, news, and operator distribution
 */

export interface ProgramItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'informativni' | 'film_serija' | 'sport' | 'dokumentarni' | 'zabavni' | 'kultura' | 'jutarnji';
  startTime: string; // "HH:MM" 24h
  endTime: string;   // "HH:MM" 24h
  startMinutes: number; // minutes from 00:00 (e.g. 19:30 = 1170)
  endMinutes: number;
  durationMinutes: number;
  ageRating: 'SVI' | '12+' | '16+' | '18+';
  description: string;
  presenter?: string;
  isLive: boolean;
  isPremiere: boolean;
  isRerun?: boolean;
  image: string;
  seasonEpisode?: string;
  channelName: string;
}

export interface DaySchedule {
  dayId: string; // 'pon' | 'uto' | 'sre' | 'cet' | 'pet' | 'sub' | 'ned'
  dayName: string; // 'Ponedeljak', 'Utorak', etc.
  shortName: string; // 'PON', 'UTO', etc.
  dateString: string;
  isToday?: boolean;
  programs: ProgramItem[];
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Najnovije' | 'Društvo' | 'Ekonomija' | 'Sport' | 'Kultura' | 'Svet';
  timestamp: string;
  readTime: string;
  author: string;
  image: string;
  isBreaking?: boolean;
  tags: string[];
}

export interface FeaturedShow {
  id: string;
  title: string;
  tagline: string;
  category: string;
  airTime: string;
  host: string;
  hostRole: string;
  description: string;
  image: string;
  episodesCount: number;
  episodes: {
    id: string;
    title: string;
    airDate: string;
    duration: string;
    views: string;
    synopsis: string;
  }[];
}

export interface OperatorFrequency {
  operator: string;
  platform: 'Kabl' | 'IPTV' | 'Satelit' | 'Zemaljska' | 'OTT / Web';
  channelNumber: string;
  quality: 'Full HD 1080p' | '4K UHD Test' | 'HD 720p';
  coverage: string;
  notes?: string;
}

// Visual Assets from generation
export const IMAGES = {
  heroTvStudio: '/src/assets/images/hero_tv_studio_1791213566083.jpg',
  showFokusTalk: '/src/assets/images/show_fokus_talk_1791213578015.jpg',
  showDocumentary: '/src/assets/images/show_documentary_1791213590140.jpg',
  showSportsArena: '/src/assets/images/show_sports_arena_1791213601693.jpg',
};

// Helper: convert HH:MM to total minutes
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Master Schedule Template for weekdays
const WEEKDAY_PROGRAMS: Omit<ProgramItem, 'id'>[] = [
  {
    title: 'Jutro sa K37',
    subtitle: 'Prva jutarnja kafa, servisne informacije i pregled štampe',
    category: 'jutarnji',
    startTime: '06:30',
    endTime: '09:00',
    startMinutes: 390,
    endMinutes: 540,
    durationMinutes: 150,
    ageRating: 'SVI',
    description: 'Najgledaniji jutarnji program u regionu donosi aktuelne teme, vremensku prognozu, izveštaje sa terena u realnom vremenu i ekskluzivne goste u studiju K37.',
    presenter: 'Milica Jovanović i Marko Nikolić',
    isLive: true,
    isPremiere: true,
    image: IMAGES.heroTvStudio,
    channelName: 'K37 HD'
  },
  {
    title: 'Vesti K37',
    subtitle: 'Brzi pregled najvažnijih događaja u zemlji i svetu',
    category: 'informativni',
    startTime: '09:00',
    endTime: '09:15',
    startMinutes: 540,
    endMinutes: 555,
    durationMinutes: 15,
    ageRating: 'SVI',
    description: 'Sažet i objektivan pregled najvažnijih vesti u 9 časova sa izveštajima naših dopisnika.',
    presenter: 'Sanja Petrović',
    isLive: true,
    isPremiere: true,
    image: IMAGES.heroTvStudio,
    channelName: 'K37 HD'
  },
  {
    title: 'Horizonti: Divlji Balkan',
    subtitle: 'Dokumentarni serijal o skrivenim prirodnim lepotama',
    category: 'dokumentarni',
    startTime: '09:15',
    endTime: '10:30',
    startMinutes: 555,
    endMinutes: 630,
    durationMinutes: 75,
    ageRating: 'SVI',
    description: 'Ekskluzivna 4K produkcija Televizije K37. Putovanje kroz netaknute kanjone, planinske vence i drevne šume u srcu Balkanskog poluostrva.',
    presenter: 'Dragan Vasić',
    isLive: false,
    isPremiere: false,
    isRerun: true,
    image: IMAGES.showDocumentary,
    seasonEpisode: 'Sezona 2 · Epizoda 4',
    channelName: 'K37 HD'
  },
  {
    title: 'Presek u 10',
    subtitle: 'Analiza društvenih i ekonomskih kretanja',
    category: 'informativni',
    startTime: '10:30',
    endTime: '11:00',
    startMinutes: 630,
    endMinutes: 660,
    durationMinutes: 30,
    ageRating: 'SVI',
    description: 'Ekonomski i društveni dijalog sa analitičarima, privrednicima i stručnjacima za tržišta.',
    presenter: 'Aleksandar Popović',
    isLive: true,
    isPremiere: true,
    image: IMAGES.heroTvStudio,
    channelName: 'K37 HD'
  },
  {
    title: 'Senke Dunava',
    subtitle: 'Dramska kriminalistička serija domaće produkcije',
    category: 'film_serija',
    startTime: '11:00',
    endTime: '12:00',
    startMinutes: 660,
    endMinutes: 720,
    durationMinutes: 60,
    ageRating: '16+',
    description: 'Inspektor Vuković istražuje misteriozni nestanak teretnog broda na Dunavu, otkrivajući mrežu korupcije koja seže do najviših struktura vlasti.',
    isLive: false,
    isPremiere: false,
    isRerun: true,
    image: IMAGES.showFokusTalk,
    seasonEpisode: 'Epizoda 7',
    channelName: 'K37 HD'
  },
  {
    title: 'Podnevni Dnevnik K37',
    subtitle: 'Glavne vesti dana i direktna uključenja reportera',
    category: 'informativni',
    startTime: '12:00',
    endTime: '12:40',
    startMinutes: 720,
    endMinutes: 760,
    durationMinutes: 40,
    ageRating: 'SVI',
    description: 'Podnevno centralno informativno izdanje sa najsvežijim izveštajima sa terena, berzanskim podacima i vremenskom prognozom.',
    presenter: 'Jelena Simić',
    isLive: true,
    isPremiere: true,
    image: IMAGES.heroTvStudio,
    channelName: 'K37 HD'
  },
  {
    title: 'Sportski Magazin K37',
    subtitle: 'Rezultati, golovi i analiza mečeva regionalnih liga',
    category: 'sport',
    startTime: '12:40',
    endTime: '13:30',
    startMinutes: 760,
    endMinutes: 810,
    durationMinutes: 50,
    ageRating: 'SVI',
    description: 'Pregled najzanimljivijih sportskih događaja, golovi, ekskluzivni intervjui sa trenerima i najave predstojećih derbija.',
    presenter: 'Nenad Stanković',
    isLive: false,
    isPremiere: true,
    image: IMAGES.showSportsArena,
    channelName: 'K37 HD'
  },
  {
    title: 'Tragom Prošlosti: Zaboravljeni Gradovi',
    subtitle: 'Istorijsko-istraživački dokumentarni format',
    category: 'kultura',
    startTime: '13:30',
    endTime: '14:45',
    startMinutes: 810,
    endMinutes: 885,
    durationMinutes: 75,
    ageRating: 'SVI',
    description: 'Putovanje kroz arheološka nalazišta rimskog i srednjovekovnog doba duž rečnih tokova.',
    presenter: 'Prof. dr Radomir Lukić',
    isLive: false,
    isPremiere: false,
    image: IMAGES.showDocumentary,
    channelName: 'K37 HD'
  },
  {
    title: 'Vesti u 15: Brzi Fokus',
    subtitle: 'Ekspresno popodnevno izdanje',
    category: 'informativni',
    startTime: '14:45',
    endTime: '15:15',
    startMinutes: 885,
    endMinutes: 915,
    durationMinutes: 30,
    ageRating: 'SVI',
    description: 'Najnovije informacije iz zemlje i sveta u popodnevnom terminu.',
    presenter: 'Sanja Petrović',
    isLive: true,
    isPremiere: true,
    image: IMAGES.heroTvStudio,
    channelName: 'K37 HD'
  },
  {
    title: 'Porodični Bioskop: Obećana Zemlja',
    subtitle: 'Topla porodična drama nagrađena na evropskim festivalima',
    category: 'film_serija',
    startTime: '15:15',
    endTime: '17:00',
    startMinutes: 915,
    endMinutes: 1020,
    durationMinutes: 105,
    ageRating: '12+',
    description: 'Priča o porodici koja se vraća na porodično imanje u planinskom selu kako bi obnovila stari vinograd i pronašla mir.',
    isLive: false,
    isPremiere: true,
    image: IMAGES.showDocumentary,
    channelName: 'K37 HD'
  },
  {
    title: 'Fokus 37 sa Tamara Kovačević',
    subtitle: 'Debata nedelje: sukob argumenata o ključnim društvenim temama',
    category: 'zabavni',
    startTime: '17:00',
    endTime: '18:15',
    startMinutes: 1020,
    endMinutes: 1095,
    durationMinutes: 75,
    ageRating: '12+',
    description: 'Gosti iz suprotstavljenih političkih, ekonomskih i društvenih sfera suočavaju stavove pred auditorijumom K37. Bez cenzure i bez izbegavanja neprijatnih pitanja.',
    presenter: 'Tamara Kovačević',
    isLive: true,
    isPremiere: true,
    image: IMAGES.showFokusTalk,
    channelName: 'K37 HD'
  },
  {
    title: 'Regionalni Mozaik',
    subtitle: 'Izveštaji i priče iz svih opština i gradova',
    category: 'informativni',
    startTime: '18:15',
    endTime: '19:00',
    startMinutes: 1095,
    endMinutes: 1140,
    durationMinutes: 45,
    ageRating: 'SVI',
    description: 'Lokalne teme koje čine život naših građana: infrastruktura, poljoprivreda, kulturne manifestacije i heroji iz komšiluka.',
    presenter: 'Igor Babić',
    isLive: true,
    isPremiere: true,
    image: IMAGES.heroTvStudio,
    channelName: 'K37 HD'
  },
  {
    title: 'Centralni Dnevnik K37',
    subtitle: 'Glavni informativni stub televizije K37 sa najvišim standardima novinarstva',
    category: 'informativni',
    startTime: '19:00',
    endTime: '19:50',
    startMinutes: 1140,
    endMinutes: 1190,
    durationMinutes: 50,
    ageRating: 'SVI',
    description: 'Sveobuhvatan, nezavisan i dubinski pregled najvažnijih događaja dana. Uživo izveštaji iz regiona i prestonice, analitički komentari i teme koje zanimaju građane.',
    presenter: 'Vladimir Đorđević i Nevena Krstić',
    isLive: true,
    isPremiere: true,
    image: IMAGES.heroTvStudio,
    channelName: 'K37 HD'
  },
  {
    title: 'Vremenska Prognoza & Stanje na putevima',
    subtitle: 'Detaljan meteo bilten za narednih 7 dana',
    category: 'informativni',
    startTime: '19:50',
    endTime: '20:00',
    startMinutes: 1190,
    endMinutes: 1200,
    durationMinutes: 10,
    ageRating: 'SVI',
    description: 'Satelitski radarski snimci, biometeorološka prognoza i saveti za vozače.',
    presenter: 'Marija Savić',
    isLive: true,
    isPremiere: true,
    image: IMAGES.heroTvStudio,
    channelName: 'K37 HD'
  },
  {
    title: 'Arena 37: Studio & UEFA Liga Šampiona',
    subtitle: 'Uživo prenos i stručna analiza fudbalskih spektakla',
    category: 'sport',
    startTime: '20:00',
    endTime: '22:45',
    startMinutes: 1200,
    endMinutes: 1365,
    durationMinutes: 165,
    ageRating: 'SVI',
    description: 'Najgledaniji sportski blok: direktan prenos večerašnjeg meča, taktička analiza u studiju sa bivšim selektorima i reakcije fudbalera.',
    presenter: 'Dejan Milić i gosti',
    isLive: true,
    isPremiere: true,
    image: IMAGES.showSportsArena,
    channelName: 'K37 HD'
  },
  {
    title: 'Noćni Puls',
    subtitle: 'Kasnovečernji tok-šou sa muzikom uživo i neočekivanim razgovorima',
    category: 'zabavni',
    startTime: '22:45',
    endTime: '23:45',
    startMinutes: 1365,
    endMinutes: 1425,
    durationMinutes: 60,
    ageRating: '16+',
    description: 'Kulturni fenomen kasnog programa: poznati glumci, muzičari i pisci u opuštenoj atmosferi uz kućni bend studija K37.',
    presenter: 'Stefan Ilić',
    isLive: true,
    isPremiere: true,
    image: IMAGES.showFokusTalk,
    channelName: 'K37 HD'
  },
  {
    title: 'Ponoćne Vesti K37',
    subtitle: 'Poslednje vesti i rezime dana pred spavanje',
    category: 'informativni',
    startTime: '23:45',
    endTime: '00:05',
    startMinutes: 1425,
    endMinutes: 1445,
    durationMinutes: 20,
    ageRating: 'SVI',
    description: 'Završno informativno izdanje sa noćnim izveštajima i servisnim informacijama.',
    presenter: 'Bojan Nedeljković',
    isLive: true,
    isPremiere: true,
    image: IMAGES.heroTvStudio,
    channelName: 'K37 HD'
  },
  {
    title: 'Noćni Bioskop: Noćni Let',
    subtitle: 'Psihološki triler visoke napetosti',
    category: 'film_serija',
    startTime: '00:05',
    endTime: '01:50',
    startMinutes: 1445,
    endMinutes: 1550,
    durationMinutes: 105,
    ageRating: '18+',
    description: 'Menadžerka hotela u noćnom letu shvata da njen saputnik priprema atentat koji zavisi od njenog pristanka.',
    isLive: false,
    isPremiere: false,
    image: IMAGES.showFokusTalk,
    channelName: 'K37 HD'
  },
  {
    title: 'Muzička Noć K37',
    subtitle: 'Izbor najboljih live koncerata i akustičnih sesija',
    category: 'kultura',
    startTime: '01:50',
    endTime: '06:30',
    startMinutes: 1550,
    endMinutes: 1830,
    durationMinutes: 280,
    ageRating: 'SVI',
    description: 'Noćni muzički maraton najlepših akustičnih nastupa iz arhive televizije K37.',
    isLive: false,
    isPremiere: false,
    image: IMAGES.showFokusTalk,
    channelName: 'K37 HD'
  }
];

// Generate 7-day schedule with proper days of the week
export function generateWeeklySchedule(): DaySchedule[] {
  const dayNames = [
    { id: 'pon', name: 'Ponedeljak', short: 'PON' },
    { id: 'uto', name: 'Utorak', short: 'UTO' },
    { id: 'sre', name: 'Sreda', short: 'SRE' },
    { id: 'cet', name: 'Četvrtak', short: 'ČET' },
    { id: 'pet', name: 'Petak', short: 'PET' },
    { id: 'sub', name: 'Subota', short: 'SUB' },
    { id: 'ned', name: 'Nedelja', short: 'NED' },
  ];

  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  return dayNames.map((day, idx) => {
    // Generate date string relative to current week
    const targetDate = new Date();
    targetDate.setDate(now.getDate() - currentDayIndex + idx);
    const dayOfMonth = targetDate.getDate().toString().padStart(2, '0');
    const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
    const dateFormatted = `${dayOfMonth}.${month}.`;

    // Make slight variations for weekends
    let progs = [...WEEKDAY_PROGRAMS];
    if (day.id === 'sub' || day.id === 'ned') {
      progs = WEEKDAY_PROGRAMS.map(p => {
        if (p.category === 'jutarnji') {
          return { ...p, title: 'Vikend Magazin K37', subtitle: 'Kulturni vodič, priče iz Srbije i gastronomske tajne' };
        }
        if (p.title === 'Arena 37: Studio & UEFA Liga Šampiona') {
          return { ...p, title: 'Superliga Specijal: Derbi Vikenda', subtitle: 'Direktan prenos meča sezone sa stadiona' };
        }
        return p;
      });
    }

    return {
      dayId: day.id,
      dayName: day.name,
      shortName: day.short,
      dateString: dateFormatted,
      isToday: idx === currentDayIndex,
      programs: progs.map((p, pIdx) => ({
        ...p,
        id: `${day.id}-prog-${pIdx}`
      }))
    };
  });
}

// Breaking news ticker data
export const BREAKING_NEWS = [
  'UŽIVO SA K37: Centralni Dnevnik u 19:30 donosi ekskluzivne detalje novog energetskog sporazuma',
  'TELEVIZIJA K37 DOBITNIK REGIONALNOG PRIZNANJA: "Horizonti" proglašeni za najbolji dokumentarni serijal godine',
  'SPORT: Direktni prenosi četvrtfinala Lige Šampiona ekskluzivno na TV K37 svakog utorka i srede',
  'NOVA SEZONA: Talk-show "Fokus 37" sa Tamarom Kovačević obara rekorde gledanosti u prajm-tajmu',
  'DIGITALNO EMITOVANJE: TV K37 sada dostupna u 4K rezoluciji putem svih vodećih operatera'
];

// Broadcaster News Portal Articles
export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'vest-1',
    title: 'Ekskluzivno u Centralnom Dnevniku: Usvojen novi paket infrastrukturnih investicija za 2026.',
    summary: 'Naša ekipa donosi prve reakcije stručnjaka, detaljne mape koridora i rokove za završetak radova koji će povezati sve ključne regije.',
    content: `Vlada je danas zvanično usvojila dugoročni master plan modernizacije saobraćajne i energetske mreže. U specijalnom izdanju Centralnog Dnevnika Televizije K37 u 19:30, gosti u studiju biće resorni ministri i nezavisni građevinski inženjeri.

Prema prvim procenama, realizacija ovog projekta doneće više od 14.000 novih radnih mesta u prve dve godine. Naša dopisnička mreža je već obišla planirane tačke na terenu i razgovarala sa građanima u mestima gde se očekuje početak radova već krajem meseca.

Pratite uživo uključenja reportera K37 sa lica mesta i analizu u večerašnjim vestima.`,
    category: 'Društvo',
    timestamp: 'Pre 25 min',
    readTime: '3 min čitanja',
    author: 'Redakcija K37 Info',
    image: IMAGES.heroTvStudio,
    isBreaking: true,
    tags: ['Infrastruktura', 'Ekonomija', 'Vesti K37', 'Ekskluzivno']
  },
  {
    id: 'vest-2',
    title: 'Arena 37 Specijal: Sve spremno za večerašnji spektakl u borbi za polufinale',
    summary: 'Stručni konsultanti K37 analiziraju taktike, povrede ključnih igrača i atmosferu na tribinama pred početak direktnog prenosa u 20:00.',
    content: `Fudbalska groznica trese čitav region. Televizija K37 obezbedila je najviši standard TV prenosa uz 24 kamere u HD tehnologiji, super-slow motion snimke i virtuelnu analizu spornih situacija u studiju Arena 37.

Komentator Dejan Milić ističe da je ovo meč koji može definisati čitavu sezonu oba kluba. U studijskom delu emisije pridružiće mu se proslavljeni asovi i taktički analitičari.

Budite uz TV K37 od 20:00 kada počinje uvodni studijski program, dok sudijski zvižduk označava početak utakmice tačno u 21:00.`,
    category: 'Sport',
    timestamp: 'Pre 1 sat',
    readTime: '4 min čitanja',
    author: 'Dejan Milić, Sportska redakcija',
    image: IMAGES.showSportsArena,
    tags: ['Liga Šampiona', 'Fudbal', 'Sport Uživo', 'Arena 37']
  },
  {
    id: 'vest-3',
    title: 'Fokus 37: Večeras o reformi energetskog sektora i cenama za domaćinstva',
    summary: 'U studiju Tamare Kovačević sučeljavaju se ekonomski analitičari, predstavnici regulatora i udruženja potrošača.',
    content: `Da li nas očekuje stabilna grejna sezona i kakve će biti cene električne energije u narednim kvartalima? Tema o kojoj svi pričaju večeras dobija otvorenu raspravu u emisiji "Fokus 37".

Tamara Kovačević postavlja direktna pitanja gostima: koliko su realne trenutne tarife, šta se dešava sa uvozom energenata i kako zaštititi najugroženije kategorije stanovništva.

Gledaoci će putem zvaničnog K37 portala moći da glasaju na pitanje emisije i pošalju svoja pitanja u realnom vremenu.`,
    category: 'Ekonomija',
    timestamp: 'Pre 2 sata',
    readTime: '3 min čitanja',
    author: 'Tamara Kovačević',
    image: IMAGES.showFokusTalk,
    tags: ['Fokus 37', 'Debata', 'Energetika', 'Društvo']
  },
  {
    id: 'vest-4',
    title: 'Dokumentarni serijal "Horizonti" oborio rekord gledanosti u regionu',
    summary: 'Epizoda posvećena kanjonu Uvca i beloglavim supovima privukla je više od 800.000 gledalaca u premijernom emitovanju.',
    content: `Autorski tim produkcije Televizije K37 proveo je šest meseci na terenu, snimajući najzahtevnije kadrove divljeg sveta uz pomoć specijalizovanih bioskopskih dronova i noćnih termalnih kamera.

Kritika je ocenila "Horizonte" kao trijumf domaće televizijske produkcije koji se može ravnopravno meriti sa vodećim svetskim prirodnjačkim formatima.

Reprizu ove epizode možete pogledati danas u 09:15 ili u bilo kom trenutku na našoj video-arhivi na K37 portalu.`,
    category: 'Kultura',
    timestamp: 'Pre 4 sata',
    readTime: '2 min čitanja',
    author: 'Kulturna redakcija K37',
    image: IMAGES.showDocumentary,
    tags: ['Horizonti', 'Priroda', 'Dokumentarac', 'Produkcija']
  }
];

// Featured In-House Shows
export const FEATURED_SHOWS: FeaturedShow[] = [
  {
    id: 'fokus-37',
    title: 'Fokus 37',
    tagline: 'Gde argumenti govore više od glasina',
    category: 'Političko-društveni Talk Show',
    airTime: 'Ponedeljak – Petak u 17:00',
    host: 'Tamara Kovačević',
    hostRole: 'Urednica i autorka',
    description: 'Vodeći debate format u zemlji. Tamara Kovačević bez kompromisa otvara najosetljivija pitanja politike, pravosuđa i ekonomije uz ravnopravno učešće svih strana.',
    image: IMAGES.showFokusTalk,
    episodesCount: 142,
    episodes: [
      {
        id: 'fok-142',
        title: 'Cene energenata i zimska sezona: Realnost protiv obećanja',
        airDate: 'Danas u 17:00',
        duration: '72 min',
        views: '48.2K pregleda',
        synopsis: 'Sučeljavanje direktora energetskog operatora i predstavnika potrošača.'
      },
      {
        id: 'fok-141',
        title: 'Zdravstveni sistem: Zašto se čeka na preglede?',
        airDate: '03. oktobar',
        duration: '68 min',
        views: '92.4K pregleda',
        synopsis: 'Razgovor sa načelnicima klinika i sindikatom lekara.'
      },
      {
        id: 'fok-140',
        title: 'Digitalna bezbednost dece na internetu',
        airDate: '01. oktobar',
        duration: '65 min',
        views: '61.7K pregleda',
        synopsis: 'Istraživanje K37 redakcije o zloupotrebama na društvenim mrežama.'
      }
    ]
  },
  {
    id: 'centralni-dnevnik',
    title: 'Centralni Dnevnik K37',
    tagline: 'Standard istinitog, brzog i objektivnog informisanja',
    category: 'Centralni Informativni Program',
    airTime: 'Svakog dana u 19:00',
    host: 'Vladimir Đorđević & Nevena Krstić',
    hostRole: 'Glavni prezenteri vesti',
    description: 'Centralni Dnevnik K37 predstavlja okosnicu programa naše televizije. Sa mrežom dopisnika iz svih gradova Srbije i regiona, pružamo najpouzdaniju sliku dana.',
    image: IMAGES.heroTvStudio,
    episodesCount: 890,
    episodes: [
      {
        id: 'dn-latest',
        title: 'Centralni Dnevnik: Glavno izdanje u 19:00',
        airDate: 'Danas u 19:00',
        duration: '50 min',
        views: '115.8K pregleda',
        synopsis: 'Paket infrastrukturnih mera, diplomatska kretanja i vesti iz sporta.'
      },
      {
        id: 'dn-yesterday',
        title: 'Centralni Dnevnik: Glavno izdanje',
        airDate: 'Juče u 19:00',
        duration: '48 min',
        views: '124.3K pregleda',
        synopsis: 'Izveštaj o privrednom rastu i intervju sa guvernerom.'
      }
    ]
  },
  {
    id: 'horizonti',
    title: 'Horizonti',
    tagline: 'Otkrijte magiju prirode u 4K rezoluciji',
    category: 'Dokumentarni Serijal',
    airTime: 'Subotom i Nedeljom u 09:15 i 21:00',
    host: 'Dragan Vasić',
    hostRole: 'Režiser i narator',
    description: 'Priznati dokumentarni serijal koji gledaoce vodi na zaboravljene lokalitete, planinske vrhove i misteriozne podzemne pećine Balkana.',
    image: IMAGES.showDocumentary,
    episodesCount: 36,
    episodes: [
      {
        id: 'hor-36',
        title: 'Divlji Kanjon Uvca: Let gospodara neba',
        airDate: 'Subota',
        duration: '52 min',
        views: '210.5K pregleda',
        synopsis: 'Pogled izbliza na stanište beloglavog supa i meandre reke Uvac.'
      },
      {
        id: 'hor-35',
        title: 'Tara: Poslednje utočište mrkog medveda',
        airDate: 'Prošla nedelja',
        duration: '55 min',
        views: '180.1K pregleda',
        synopsis: 'Noćno praćenje medveđih staza u gustim četinarskim šumama Tare.'
      }
    ]
  },
  {
    id: 'arena-37',
    title: 'Arena 37',
    tagline: 'Gde sport živi punim plućima',
    category: 'Sportski Magazin & Uživo Prenosi',
    airTime: 'Utorkom, Sredom i Vikendom od 20:00',
    host: 'Dejan Milić',
    hostRole: 'Urednik sportske redakcije',
    description: 'Emisija posvećena vrhunskom sportu, taktičkim analizama, ekskluzivnim intervjuima sa asovima i najvažnijim utakmicama u direktnom prenosu.',
    image: IMAGES.showSportsArena,
    episodesCount: 220,
    episodes: [
      {
        id: 'ar-220',
        title: 'UEFA Liga Šampiona Studio: Četvrtfinala',
        airDate: 'Danas u 20:00',
        duration: '165 min',
        views: '84.6K pregleda',
        synopsis: 'Prenos utakmice, stručni studio, izjave trenera i golovi.'
      },
      {
        id: 'ar-219',
        title: 'Pregled Superlige: Derbi kola i sporne situacije',
        airDate: 'Nedelja',
        duration: '60 min',
        views: '73.2K pregleda',
        synopsis: 'Sudijska analiza, golovi kola i razgovori iz svlačionica.'
      }
    ]
  }
];

// Frequencies and Operator Distribution
export const OPERATOR_FREQUENCIES: OperatorFrequency[] = [
  {
    operator: 'MTS Iris TV',
    platform: 'IPTV',
    channelNumber: 'Kanal 114 (HD) / Kanal 737 (4K)',
    quality: 'Full HD 1080p',
    coverage: 'Nacionalno pokrivanje u osnovnom paketu',
    notes: 'Dostupno i na Iris GO mobilnoj aplikaciji'
  },
  {
    operator: 'SBB / EON',
    platform: 'Kabl',
    channelNumber: 'Kanal 37 (HD) / Kanal 137',
    quality: 'Full HD 1080p',
    coverage: 'Nacionalno na svim EON Smart Box uređajima',
    notes: 'Podržano vraćanje unazad 7 dana'
  },
  {
    operator: 'Supernova',
    platform: 'Kabl',
    channelNumber: 'Kanal 37 (HD)',
    quality: 'Full HD 1080p',
    coverage: 'Osnovni paket kablovske distribucije',
    notes: 'Kvalitetan 50fps signal za sportske prenose'
  },
  {
    operator: 'Yettel Hipernet TV',
    platform: 'IPTV',
    channelNumber: 'Kanal 42 (HD)',
    quality: 'Full HD 1080p',
    coverage: 'Dostupno u celoj Srbiji na optičkoj mreži',
    notes: 'Automatski HDR profil slike'
  },
  {
    operator: 'Orion Telekom',
    platform: 'IPTV',
    channelNumber: 'Kanal 29 (HD)',
    quality: 'Full HD 1080p',
    coverage: 'Dostupno na Orion TV aplikaciji i STB boksevima',
    notes: 'EPG vodič sa slikom i podsetnicima'
  },
  {
    operator: 'DVB-T2 Digitalna Zemaljska',
    platform: 'Zemaljska',
    channelNumber: 'Kanal 37 · MUX 2 (UHF frekvencija)',
    quality: 'Full HD 1080p',
    coverage: 'Preko 96% teritorije putem predajnika',
    notes: 'Besplatan prijem uz običnu sobnu ili krovnu antenu'
  },
  {
    operator: 'Total TV Satelit',
    platform: 'Satelit',
    channelNumber: 'Eutelsat 16A · Pozicija 54',
    quality: 'Full HD 1080p',
    coverage: 'Čitava Evropa, Balkan i dijaspora',
    notes: 'Frekvencija 11.231 V, SR 30000, FEC 3/4'
  }
];

// Helper to determine currently airing show based on current time
export function getCurrentlyAiringShow(programs: ProgramItem[], currentMinutes?: number): {
  currentShow: ProgramItem;
  nextShows: ProgramItem[];
  progressPercent: number;
  minutesRemaining: number;
  elapsedMinutes: number;
} {
  const now = new Date();
  const minutesNow = currentMinutes ?? (now.getHours() * 60 + now.getMinutes());

  // Find show where startMinutes <= minutesNow < endMinutes
  // Handle wraparound past midnight (minutes > 1440)
  let foundIndex = programs.findIndex(p => {
    if (p.endMinutes > p.startMinutes) {
      return minutesNow >= p.startMinutes && minutesNow < p.endMinutes;
    } else {
      // Over midnight show
      return minutesNow >= p.startMinutes || minutesNow < p.endMinutes;
    }
  });

  if (foundIndex === -1) {
    // Fallback: find closest next or default to prime-time
    foundIndex = programs.findIndex(p => p.startMinutes > minutesNow);
    if (foundIndex === -1) foundIndex = 0;
  }

  const currentShow = programs[foundIndex];
  const nextShows = [
    programs[(foundIndex + 1) % programs.length],
    programs[(foundIndex + 2) % programs.length],
    programs[(foundIndex + 3) % programs.length],
  ];

  let elapsed = minutesNow - currentShow.startMinutes;
  if (elapsed < 0) elapsed += 1440; // overnight compensation
  const duration = currentShow.durationMinutes || 60;
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / duration) * 100)));
  const minutesRemaining = Math.max(1, duration - elapsed);

  return {
    currentShow,
    nextShows,
    progressPercent,
    minutesRemaining,
    elapsedMinutes: elapsed
  };
}
