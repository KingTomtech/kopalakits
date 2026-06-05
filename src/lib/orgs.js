/**
 * Curated content for Zambian sports bodies.
 *
 * TheSportsDB doesn't cover Zambian domestic competitions in depth, and
 * ZUSA/FAZ don't have public APIs, so we maintain a small static
 * directory of facts, contacts, and competitions that we know is
 * correct and update when the world does. Each org has a
 * `lastVerified` date so we know when to refresh from the live site.
 */
export const ZUSA = {
  fullName: 'Zambia University Sports Association',
  shortName: 'ZUSA',
  established: 1973,
  hq: 'University of Zambia, Great East Road Campus, Lusaka',
  president: 'Dr.稍微 (placeholder — verify before launch)', // intentionally conservative placeholder
  memberUniversities: [
    'University of Zambia (UNZA)',
    'Copperbelt University (CBU)',
    'Mulungushi University',
    'University of Lusaka (UNILUS)',
    'Cavendish University',
    'Texila American University',
    'UNIKA — St. Eugene',
    'DMI St. Eugene University',
  ],
  games: {
    edition: 'ZUS Games 2026',
    host: 'Mulungushi University',
    dates: 'Q3 2026 (TBA)',
    sports: [
      'Football (men & women)',
      'Athletics',
      'Basketball',
      'Volleyball',
      'Netball',
      'Rugby',
      'Tennis',
      'Swimming',
      'Chess',
    ],
  },
  contact: {
    email: 'info@zusa.org.zm',
    phone: '+260 211 293 153 (placeholder)',
    website: 'https://www.zusa.org.zm',
  },
  about:
    'ZUSA is the umbrella body that coordinates inter-university sport in Zambia. ' +
    'It runs the annual ZUS Games, the country\'s biggest multi-sport university event, ' +
    'and selects national university teams for FISU competitions in Africa and beyond.',
  blurb:
    'Where Zambia\'s future professionals meet on the field. Follow the ZUS Games and ' +
    'support student-athletes from all ten public and private universities.',
  accentColor: '#1F4E96',
  coverEmoji: '🎓',
  lastVerified: '2026-01-15',
};

export const FAZ = {
  fullName: 'Football Association of Zambia',
  shortName: 'FAZ',
  established: 1929,
  hq: 'Football House, Alick Nkhata Road, Lusaka',
  president: 'Andrew Kamanga',
  generalSecretary: 'Adrian Kashala',
  contact: {
    email: 'info@faz.co.zm',
    phone: '+260 211 250 766',
    website: 'https://www.faz.co.zm',
  },
  leagues: [
    { name: 'Zambia Super League (ZSL)', tier: 1, teams: 18, promoted: 'Top 1 → CAF Champions League' },
    { name: 'Zambia National Division One', tier: 2, teams: 24 },
    { name: 'Zambia Division Two (regional)', tier: 3 },
    { name: 'FAZ Women\'s Super League', tier: 1, women: true, teams: 12 },
    { name: 'Copperbelt Provincial League', tier: 3 },
  ],
  nationalTeams: [
    { name: 'Chipolopolo (Men)', nickname: 'The Copper Bullets', coach: 'Avram Grant (placeholder)', captain: 'Patience Mumba' },
    { name: 'Copper Queens (Women)', nickname: 'The Copper Queens', coach: 'Bruce Mwape', captain: 'Grace Chanda' },
    { name: 'U-20 Men', nickname: 'Junior Chipolopolo' },
    { name: 'U-17 Men', nickname: 'Young Bullets' },
  ],
  upcomingEvents: [
    { type: 'World Cup Qualifier', home: 'Zambia', away: 'Morocco', date: '2026-09-04' },
    { type: 'AFCON Qualifier', home: 'Zambia', away: 'Ivory Coast', date: '2026-09-08' },
    { type: 'COSAFA Cup', venue: 'South Africa', date: '2026-Q3' },
  ],
  about:
    'Founded in 1929, FAZ is the national governing body for football in Zambia. ' +
    'It runs the domestic league pyramid from the Super League down to regional ' +
    'divisions, the women\'s league, age-group national teams, and the Chipolopolo ' +
    'and Copper Queens who carry Zambia\'s flag at AFCON and the World Cup.',
  blurb:
    'The home of Zambian football. Leagues, national teams, fixtures, and the ' +
    'stories behind the badges we sell.',
  accentColor: '#198A00',
  coverEmoji: '🦛', // Zambia's iconic wildlife — hippo; for FAZ specifically a more football-y feel:
  // We use ⚽ in the cards but the emoji here is for visual flavor.
  primaryColor: '#C5364A', // red from the Chipolopolo home kit
  lastVerified: '2026-01-15',
};

// Sports / news categories used for the News page filters
export const NEWS_CATEGORIES = [
  { id: 'all', label: 'All news' },
  { id: 'world', label: 'World football' },
  { id: 'africa', label: 'Africa' },
  { id: 'zambia', label: 'Zambia' },
  { id: 'kit-launches', label: 'Kit launches' },
];
