import { combineReducers } from 'redux';

/** Reducer for user authentication */
const initialUser = {
  firstname: '',
  lastname: '',
  fullname: '',
  username: '',
  clearance: 0,
  remember: false,
  isAuthenticated: false
};

const userReducer = (state = initialUser, action) => {
  switch (action.type) {
    case 'SAVE_USER':
      const user = action.payload;

      user.isAuthenticated = true;
      user.fullname = `${user.firstname} ${user.lastname}`;
      
      return user;
    case 'CLEAR_USER':
      return initialUser;
    default: return state;
  }
};

/** Reducer for session settings */
const defaultSession = {
  view: 'grid',
  sort: '2'
}

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
    default: return state;
  }
};

const defaultTopic = {
  filters: {
    categories: [],
    types: [],
    polarity: [],
  },
  sort: '3',
}

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
}

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

const alertReducer = (state = false, action) => {
  switch (action.type) {
    case 'TRIGGER_ALERT':
      return true;
    case 'CLEAR_ALERT':
        return false;
    default:
      return state;
  }
}

export default combineReducers({
  user: userReducer,
  session: sessionReducer,
  topic: topicReducer,
  blackex: blackexReducer,
  alert: alertReducer
});