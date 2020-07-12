exports.ACTIONS = {
  ARTICLES: {
    MODIFY: 6
  },

  CANDIDATES: {
    MODIFY: 6
  },

  DOCUMENTS: {
    VIEW: 3,
    MODIFY: 8
  },

  MEMBERS: {
    VIEW: 7,
    MODIFY: 6
  },

  PAGES: {
    MODIFY: 8
  },

  REVIEWS: {
    VIEW: 8,
    MODIFY: 8
  },

  SESSIONS: {
    MODIFY: 6
  },

  SUBSCRIBERS: {
    VIEW: 8,
    MODIFY: 8
  },

  TOPICS: {
    VIEW: 3,
    MODIFY: 6,
    GENERATE_TOKEN: 9
  },

  USERS: {
    VIEW: 8,
    MODIFY: 8,
    CHANGE_USERNAME: 2,
    CHANGE_PASSWORD: 2,
    DELETE_OWN_ACCOUNT: 1
  }
};

exports.LEVELS = {
  MEMBERS: [
    { label: 'Executive' },
    { label: 'Manager' },
    { label: 'Coordinator' },
    { label: 'Guest' },
    { label: 'Quiescent' }
  ],
  USERS: [
    { label: '(1) Subscriber', value: 1, role: 'Subscriber' },
    { label: '(2) Verified User', value: 2, role: 'Verified User' },
    { label: '(3) Coordinator', value: 3, role: 'Coordinator' },
    { label: '(4) Manager', value: 4, role: 'Manager' },
    { label: '(5) Anchor', value: 5, role: 'Anchor' },
    { label: '(6) Journalist', value: 6, role: 'Journalist' },
    { label: '(7) Executive', value: 7, role: 'Executive' },
    { label: '(8) Lead Executive', value: 8, role: 'Lead Executive' },
    { label: '(9) Director', value: 9, role: 'Director' }
  ]
};
