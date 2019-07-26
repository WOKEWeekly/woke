import React, { Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeUsername } from '~/reducers/actions';
import Router from 'next/router';
import { Col } from 'react-bootstrap';

import { alert, setAlert, displayErrorMessage } from '~/components/alert.js';
import { ConfirmButton, CloseButton } from '~/components/button.js';
import { Group, UsernameInput } from '~/components/form.js';
import { Shader } from '~/components/layout.js';
import { Modal } from '~/components/modal.js';

import CLEARANCES from '~/constants/clearances.js';
import { isValidUsername } from '~/constants/validations';
import css from '~/styles/auth.scss';

class Account extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      ...props.user,

      usernameModal: false,
      passwordModal: false
    }

    if (!props.user.isAuthenticated){
      return Router.push('/');
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true })
  }

  showUsernameModal = () => { this.setState({usernameModal: true})}
  hideUsernameModal = () => { this.setState({usernameModal: false})}
  showPasswordModal = () => { this.setState({passwordModal: true})}
  hidePasswordModal = () => { this.setState({passwordModal: false})}

  render(){
    const { id, fullname, username, clearance = 1, isLoaded,
    usernameModal, passwordModal } = this.state
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
              <button onClick={this.showUsernameModal}>Change Username</button>
              <button onClick={this.showPasswordModal}>Change Password</button>
              <button>Delete Your Account</button>
            </div>
          </div>
        </Shader>

        <NewUsernameModal
          visible={usernameModal}
          close={this.hideUsernameModal} />
        {/* <NewPasswordModal /> */}
      </React.Fragment>
    )
  }
}

class _NewUsernameModal extends Component {
  constructor(props){
    super(props);
    this.state = { username: props.user.username }
  }

  changeUsername = () => {
    const { username } = this.state;
    if (!isValidUsername(username)) return;

    const body = JSON.stringify({
      id: this.props.user.id,
      username
    });

    fetch('/changeUsername', {
      method: 'PUT',
      body: body,
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json'
      }
    })
    .then(res => Promise.all([res, res.json()]))
    .then(([status, response]) => { 
      if (status.ok){
        this.props.changeUsername(username);
        setAlert({ type: 'success', message: `You've successfully changed your username.` });
        location.reload();
      } else {
        alert.error(response.message)
      }
    }).catch(error => {
      displayErrorMessage(error);
    });
  }

  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }

  render(){
    const { close, visible } = this.props;

    const header = (
      <h2 className={css.text}>Change Username</h2>
    );
    const body = (
      <Group>
        <Col>
          <UsernameInput
            name={'username'}
            value={this.state.username}
            onChange={this.handleText}
            placeholder={'Enter a new username.'} />
        </Col>
      </Group>
    );

    const footer = (
      <React.Fragment>
        <ConfirmButton onClick={this.changeUsername}>Confirm</ConfirmButton>
        <CloseButton onClick={close}>Close</CloseButton>
      </React.Fragment>
    )
    return (
      <Modal
        show={visible}
        scrollable
        header={header}
        body={body}
        footer={footer} />
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    changeUsername
  }, dispatch)
);

const NewUsernameModal = connect(mapStateToProps, mapDispatchToProps)(_NewUsernameModal);

export default connect(mapStateToProps)(Account);