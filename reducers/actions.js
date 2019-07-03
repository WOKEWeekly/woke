/** Save user on authentications */
export const saveUser = user => ({
  type: 'SAVE_USER',
  payload: user,
});

/** Remove user from state */
export const clearUser = () => ({
  type: 'CLEAR_USER'
});

export const saveSessionView = view => ({
  type: 'SAVE_SESSION_VIEW',
  payload: view,
});

export const saveSessionSort = sort => ({
  type: 'SAVE_SESSION_SORT',
  payload: sort,
});

export const saveTopicSort = sort => ({
  type: 'SAVE_TOPIC_SORT',
  payload: sort,
});

export const saveTopicFilters = filters => ({
  type: 'SAVE_TOPIC_FILTERS',
  payload: filters,
});

export const saveCandidateSort = sort => ({
  type: 'SAVE_CANDIDATE_SORT',
  payload: sort,
});

export const triggerAlert = () => ({
  type: 'TRIGGER_ALERT'
});

export const clearAlert = () => ({
  type: 'CLEAR_ALERT'
});