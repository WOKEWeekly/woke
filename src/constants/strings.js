/** All entity names */
exports.ENTITY = {
  ARTICLE: 'article',
  CANDIDATE: 'candidate',
  DOCUMENT: 'document',
  MEMBER: 'member',
  PAGE: 'page',
  REVIEW: 'review',
  SESSION: 'session',
  TOPIC: 'topic',
  USER: 'user'
};

/** The CRUD operations for all entities */
exports.OPERATIONS = {
  CREATE: 'add',
  UPDATE: 'edit'
};

/** The cloudinary directories for entities */
exports.DIRECTORY = {
  ARTICLES: 'articles',
  CANDIDATES: 'blackexcellence',
  MEMBERS: 'team',
  REVIEWS: 'reviews',
  SESSIONS: 'sessions',
};

/** For each of the pages */
exports.PAGE = {
  KINDS: {
    INFO: 'information',
    VARIANTS: 'variants'
  },
  OPERATIONS: {
    READ: 'READ',
    UPDATE: 'UPDATE'
  },
  THEMES: {
    DEFAULT: 'default',
    BLACKEX: 'blackex',
    MENTAL: 'mental'
  }
};

/** The status of the blog articles */
exports.ARTICLE_STATUS = {
  DRAFT: 'DRAFT',
  PRIVATE: 'PRIVATE',
  PUBLISHED: 'PUBLISHED',
};

const PAGES = [
  '/about',
  '/cookies',
  '/donate',
  '/faq',
  '/mentalhealth',
  '/privacy',
  '/recruitment'
];

/** List of the dynamic page and document routes */
exports.ROUTES = {
  DOCUMENTS: [
    '/blackexcellence-tribute-guide',
    '/constitution',
    '/sponsorship-proposal'
  ],
  PAGES: [
    ...PAGES,
    ...PAGES.map(route => `${route}/edit`)
  ],
};