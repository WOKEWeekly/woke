import { combineReducers } from 'redux';

const initialUser = {
  firstname: '',
  lastname: '',
  fullname: '',
  username: '',
  clearance: 0,
  hasClearance: function(){},
};

/** Reducer for user authentication */
const userReducer = (state = initialUser, action) => {
  switch (action.type) {
    case 'SAVE_USER':
      console.log(action.payload);
      const user = action.payload;
      user['fullname'] = `${user.firstname} ${user.lastname}`;
      user['hasClearance'] = function(value){
        return action.payload.clearance >= value ? true : false;
      }
      return user;
    default:
      return state;
  }
};

export default combineReducers({
  user: userReducer
});