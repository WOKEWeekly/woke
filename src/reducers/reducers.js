import { combineReducers } from 'redux';

/** Reducer for user authentication */
const initialUser = {
  id: 0,
  firstname: '',
  lastname: '',
  fullname: '',
  username: '',
  clearance: 0,
  remember: false,
  isAuthenticated: false,
  isVerified: false
};

const userReducer = (state = initialUser, action) => {
  switch (action.type) {
    case 'SAVE_USER':
      const user = action.payload;

      user.isAuthenticated = true;
      user.fullname = `${user.firstname} ${user.lastname}`;
      user.isVerified = user.clearance > 1;

      return user;
    case 'CLEAR_USER':
      return initialUser;
    case 'VERIFY_USER':
      return Object.assign({}, state, {
        clearance: 2,
        isVerified: true
      });
    case 'CHANGE_USERNAME':
      return Object.assign({}, state, {
        username: action.payload
      });
    default:
      return state;
  }
};

/** Reducer for session settings */
const defaultSession = {
  view: 'grid',
  sort: '2'
};

const sessionReducer = (state = defaultSession, action) => {
  switch (action.type) {
    case 'SAVE_SESSION_VIEW':
      return Object.assign({}, state, {
        view: action.payload
      });
    case 'SAVE_SESSION_SORT':
      return Object.assign({}, state, {
        sort: action.payload
      });
    default:
      return state;
  }
};

const defaultTopic = {
  filters: {
    categories: [],
    types: [],
    polarity: [],
    misc: []
  },
  sort: '3'
};

const topicReducer = (state = defaultTopic, action) => {
  switch (action.type) {
    case 'SAVE_TOPIC_SORT':
      return Object.assign({}, state, {
        sort: action.payload
      });
    case 'SAVE_TOPIC_FILTERS':
      return Object.assign({}, state, {
        filters: action.payload
      });
    default:
      return state;
  }
};

const defaultBlackEx = {
  view: '1'
};

const blackexReducer = (state = defaultBlackEx, action) => {
  switch (action.type) {
    case 'SAVE_CANDIDATE_SORT':
      return Object.assign({}, state, {
        sort: action.payload
      });
    default:
      return state;
  }
};

const countryReducer = (state = [], action) => {
  switch (action.type) {
    case 'SAVE_COUNTRIES':
      return action.payload;
    default:
      return state;
  }
};

const themeReducer = (state = 'default', action) => {
  switch (action.type) {
    case 'SET_THEME':
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  user: userReducer,
  session: sessionReducer,
  topic: topicReducer,
  blackex: blackexReducer,
  countries: countryReducer,
  theme: themeReducer
});
