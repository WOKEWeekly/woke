module.exports = {
  ACTIONS: {
    DELETE_ACCOUNT: 1, // Delete account

    SUGGEST_TOPIC: 2, // Suggest topics,
    CHANGE_ACCOUNT: 2, // Change username and password

    VIEW_TOPICS: 3, // View Topic Bank

    CRUD_BLACKEX: 6, // Add, edit and delete #BlackExcellence candidates
    CRUD_SESSIONS: 6, // Add, edit and delete sessions
    CRUD_TOPICS: 6, // Add, edit and delete topics from the Topic Bank
    CRUD_TEAM: 6, // Add, edit and delete team member profiles
    CRUD_ARTICLES: 6, // Add, edit and delete articles

    VIEW_TEAM: 7, // View all team member details
    SEE_SUGGESTING_USER: 7, // See author of suggestions
    DELETE_SUGGESTION: 7, // Delete suggestions for all users

    CRUD_AUTHORS: 8, // Add, edit and delete authors
    VIEW_USERS: 8, // View all registered user details
    CRUD_USERS: 8, // Change the clearances of other users
    CRUD_REVIEWS: 8, // Add, edit and delete team member profiles
    SEND_NOTIFICATIONS: 8, // Send notifications to all users
    EDIT_PAGE: 8, // Edit information pages

    CRUD_DOCUMENTS: 8,
    GENERATE_NEW_TOKEN: 9, // Generate new access tokens
  },
  LEVELS: {
    MEMBERS: [
      { label: 'Executive' },
      { label: 'Manager' },
      { label: 'Coordinator' },
      { label: 'Quiescent' },
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
      { label: '(9) Director', value: 9, role: 'Director' },
    ],
  },
};
