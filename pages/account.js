import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';
import { Shader, Spacer } from '~/components/layout.js';
import CLEARANCES from '~/constants/clearances.js';
import css from '~/styles/auth.scss';

class Account extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      ...props.user
    }

    if (!props.user.isAuthenticated){
      return Router.push('/');
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true })
  }

  render(){
    const { id, fullname, username, clearance = 1, isLoaded } = this.state
    const level = (CLEARANCES.LEVELS.USERS).find(level => level.value === clearance).label;
    if (!isLoaded) return null;


    return (
      <Shader>
        <div className={css.container}>
          <div className={css.name}>{fullname}</div>
          <div className={css.username}>@{username}</div>
          <div className={css.clearance}>{level}</div>

          <div className={css.links}>
            <button>Change Username</button>
            <button>Change Password</button>
            <button>Delete Your Account</button>
          </div>
        </div>
      </Shader>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Account);