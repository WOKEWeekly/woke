module.exports = {
  
  /** The CRUD operations for all entities */
  OPERATIONS: {
    CREATE: 'add',
    UPDATE: 'edit'
  },

  /** The cloudinary directories for entities */
  DIRECTORY: {
    BLACKEXCELLENCE: 'blackexcellence',
    ARTICLES: 'articles',
    REVIEWS: 'reviews',
    SESSIONS: 'sessions',
    TEAM: 'team'
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