/** Save user on authentications */
export const saveUser = (user) => ({
  type: 'SAVE_USER',
  payload: user
});

/** Remove user from state */
export const clearUser = () => ({
  type: 'CLEAR_USER'
});

/** Verify user */
export const verifyUser = () => ({
  type: 'VERIFY_USER'
});

/** Change username */
export const changeUsername = (username) => ({
  type: 'CHANGE_USERNAME',
  payload: username
});

export const saveSessionView = (view) => ({
  type: 'SAVE_SESSION_VIEW',
  payload: view
});

export const saveSessionSort = (sort) => ({
  type: 'SAVE_SESSION_SORT',
  payload: sort
});

export const saveTopicSort = (sort) => ({
  type: 'SAVE_TOPIC_SORT',
  payload: sort
});

export const saveTopicFilters = (filters) => ({
  type: 'SAVE_TOPIC_FILTERS',
  payload: filters
});

export const saveCandidateSort = (sort) => ({
  type: 'SAVE_CANDIDATE_SORT',
  payload: sort
});

export const saveCountries = (countries) => ({
  type: 'SAVE_COUNTRIES',
  payload: countries
});

export const setTheme = (theme) => ({
  type: 'SET_THEME',
  payload: theme
});
