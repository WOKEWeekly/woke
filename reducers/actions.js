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