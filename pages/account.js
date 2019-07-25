import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { Shader } from '~/components/layout.js';
import { Modal } from '~/components/modal.js';

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
      <React.Fragment>
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

        <NewUsernameModal />
        {/* <NewPasswordModal /> */}
      </React.Fragment>
    )
  }
}

export class NewUsernameModal extends Component {
  constructor(){
    super();
    this.state = { username: '' }
  }

  render(){
    const { close, visible } = this.props;

    const body = (
      <Group>
        <UsernameInput
          name={idx}
          value={this.state.username}
          onChange={this.handleText}
          placeholder={'Enter a new username.'} />
      </Group>
    );

    const footer = (
      <CloseButton onClick={close}>Close</CloseButton>
    )
    return (
      <Modal
        show={visible}
        scrollable
        body={body}
        footer={footer} />
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Account);