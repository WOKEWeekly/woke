module.exports = {
  ACTIONS: {
    SUGGEST_TOPIC: 2,       // Suggest topics
    VIEW_TOPICS: 3,         // View Topic Bank

    CRUD_BLACKEX: 6,        // Add, edit and delete #BlackExcellence candidates
    CRUD_SESSIONS: 6,       // Add, edit and delete sessions
    CRUD_TOPICS: 6,          // Add, edit and delete topics from the Topic Bank

    SEE_SUGGESTING_USER: 7, // See author of suggestions
    DELETE_SUGGESTION: 7,   // Delete suggestions for all users

    VIEW_USERS: 8,          // View all registered user details
    CRUD_TEAM: 8,           // Add, edit and delete team member profiles
    CHANGE_CLEARANCE: 8,    // Change the clearances of other users
    SEND_NOTIFICATIONS: 8,  // Send notifications to all users
  }
};

// export const ROLES = [
//   { label: '(1) Subscriber', value: 1, role: 'Subscriber'},
//   { label: '(2) Verified User', value: 2, role: 'Verified User'},
//   { label: '(3) Coordinator', value: 3, role: 'Coordinator'},
//   { label: '(4) Manager', value: 4, role: 'Manager'},
//   { label: '(5) Anchor', value: 5, role: 'Anchor'},
//   { label: '(6) Journalist', value: 6, role: 'Journalist'},
//   { label: '(7) Executive', value: 7, role: 'Executive'},
//   { label: '(8) Lead Executive', value: 8, role: 'Lead Executive'},
//   { label: '(9) Director', value: 9, role: 'Director'},
// ];

// export const getRole = (clearance) => {
//   return ROLES.find((role) => {
//     return role.value === clearance
//   }).role
// }