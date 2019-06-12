import { combineReducers } from 'redux';

/** Reducer for user authentication */
const initialUser = {
  firstname: '',
  lastname: '',
  fullname: '',
  username: '',
  clearance: 0,
  isAuthenticated: false,
  hasClearance: function(){},
};

const userReducer = (state = initialUser, action) => {
  switch (action.type) {
    case 'SAVE_USER':
      const user = action.payload;

      user.isAuthenticated = true;
      user.fullname = `${user.firstname} ${user.lastname}`;
      user.hasClearance = function(value){
        return action.payload.clearance >= value ? true : false;
      }
      
      return user;
    case 'CLEAR_USER': return state;
    default: return state;
  }
};

/** Reducer for session settings */
const defaultSession = {
  view: 1,
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
  sort: '2'
}

const topicReducer = (state = defaultTopic, action) => {
  switch (action.type) {
    case 'SAVE_TOPIC_SORT':
      return Object.assign({}, state, {
        sort: action.payload
      });
    default: return state;
  }
};

export default combineReducers({
  user: userReducer,
  session: sessionReducer,
  topic: topicReducer
});