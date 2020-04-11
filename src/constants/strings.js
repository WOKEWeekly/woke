module.exports = {

  /** All entity names */
  ENTITY: {
    ARTICLE: 'article',
    AUTHOR: 'author',
    CANDIDATE: 'candidate',
    MEMBER: 'member',
    PAGE: 'page',
    REVIEW: 'review',
    SESSION: 'session',
    TOPIC: 'topic',
    USER: 'user'
  },

  /** The CRUD operations for all entities */
  OPERATIONS: {
    CREATE: 'add',
    UPDATE: 'edit'
  },

  /** The cloudinary directories for entities */
  DIRECTORY: {
    CANDIDATES: 'blackexcellence',
    ARTICLES: 'articles',
    AUTHORS: 'authors',
    REVIEWS: 'reviews',
    SESSIONS: 'sessions',
    MEMBERS: 'team'
  },

  /** For each of the pages */
  PAGE: {
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
  },

  /** The status of the blog articles */
  ARTICLE_STATUS: {
    DRAFT: 'DRAFT',
    PRIVATE: 'PRIVATE',
    PUBLISHED: 'PUBLISHED',
  }
}