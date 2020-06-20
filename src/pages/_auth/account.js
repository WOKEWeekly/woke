import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { changeUsername, clearUser, verifyUser } from 'reducers/actions';

import { alert, setAlert } from 'components/alert.js';
import { SubmitButton, CancelButton } from 'components/button.js';
import { Group, UsernameInput, PasswordInput } from 'components/form';
import { Icon } from 'components/icon.js';
import { Shader } from 'components/layout.js';
import { Modal, ConfirmModal } from 'components/modal.js';

import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import { isValidUsername, isValidPassword } from 'constants/validations';

import css from 'styles/Auth.module.scss';

class Account extends Component {
  static getInitialProps({ query }) {
    return { ...query };
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      ...props.user,

      usernameModal: false,
      passwordModal: false,
      deleteAccModal: false
    };

    if (!props.user.isAuthenticated) {
      return (location.href = '/');
    }
  }

  componentDidMount() {
    this.setState({ isLoaded: true });

    const { user, justVerified, verifiedUser } = this.props;

    if (justVerified && user.id === verifiedUser.id) {
      this.props.verifyUser();
      setAlert({
        type: 'info',
        message: `You\'ve successfully verified your account.`
      });
      setTimeout(() => (location.href = '/account'), 1000);
    }
  }

  deleteAccount = () => {
    const { id } = this.state;

    request({
      url: `/api/v1/users/${id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        this.props.clearUser();
        setAlert({
          type: 'success',
          message: `Your account has successfully been deleted.`
        });
        setTimeout(() => (location.href = '/'), 500);
      }
    });
  };

  resendVerificationEmail = () => {
    const { id } = this.state;

    request({
      url: `/api/v1/users/${id}/email/verify`,
      method: 'NOTIFY',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: () =>
        alert.success(
          'Resend successful. Check your email for the verification link.'
        )
    });
  };

  showUsernameModal = () => {
    this.setState({ usernameModal: true });
  };
  hideUsernameModal = () => {
    this.setState({ usernameModal: false });
  };
  showPasswordModal = () => {
    this.setState({ passwordModal: true });
  };
  hidePasswordModal = () => {
    this.setState({ passwordModal: false });
  };
  showDeleteAccountModal = () => {
    this.setState({ deleteAccModal: true });
  };
  hideDeleteAccountModal = () => {
    this.setState({ deleteAccModal: false });
  };

  render() {
    const {
      fullname,
      username,
      clearance = 1,
      isVerified,
      isLoaded,
      usernameModal,
      passwordModal,
      deleteAccModal
    } = this.state;
    const level = CLEARANCES.LEVELS.USERS.find(
      (level) => level.value === clearance
    ).label;
    if (!isLoaded) return null;

    return (
      <React.Fragment>
        <Shader>
          <div className={css.container}>
            <div className={css.name}>{fullname}</div>
            <div className={css.username}>@{username}</div>
            <div className={css.clearance}>{level}</div>

            <div className={css.links}>
              {isVerified ? (
                <React.Fragment>
                  <div className={css.features}>
                    <div>
                      We&#39;ll be adding more management features to your
                      account as time goes on.
                    </div>
                    <div>Stay tuned.</div>
                  </div>
                  <button onClick={this.showUsernameModal}>
                    Change Username
                  </button>
                  <button onClick={this.showPasswordModal}>
                    Change Password
                  </button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <Icon name={'exclamation-circle'} />
                    <p className={css.warning}>
                      You have not verified your account.
                    </p>
                  </div>
                  <button onClick={this.resendVerificationEmail}>
                    Resend Verification Email
                  </button>
                </React.Fragment>
              )}

              <button onClick={this.showDeleteAccountModal}>
                Delete Your Account
              </button>
            </div>
          </div>
        </Shader>

        <NewUsernameModal
          visible={usernameModal}
          close={this.hideUsernameModal}
        />
        <NewPasswordModal
          visible={passwordModal}
          close={this.hidePasswordModal}
        />
        <ConfirmModal
          visible={deleteAccModal}
          message={`Are you sure you want to delete your account? Once you're account has been deleted, it cannot be recovered.`}
          confirmFunc={this.deleteAccount}
          confirmText={'Yes, delete my account.'}
          close={this.hideDeleteAccountModal}
        />
      </React.Fragment>
    );
  }
}

class _NewUsernameModal extends Component {
  constructor(props) {
    super(props);
    this.state = { username: props.user.username };
  }

  changeUsername = () => {
    const { username } = this.state;
    if (!isValidUsername(username)) return;

    const { id, token } = this.props.user;

    request({
      url: `/api/v1/users/${id}/username`,
      method: 'PUT',
      body: JSON.stringify(username),
      headers: { Authorization: `Bearer ${token}` },
      onSuccess: () => {
        this.props.changeUsername(username);
        setAlert({
          type: 'success',
          message: `You've successfully changed your username.`
        });
        location.reload();
      }
    });
  };

  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  render() {
    const { close, visible } = this.props;

    const header = <h2 className={css.text}>Change Username</h2>;
    const body = (
      <Group>
        <Col>
          <UsernameInput
            name={'username'}
            value={this.state.username}
            onChange={this.handleText}
            placeholder={'Enter a new username'}
          />
        </Col>
      </Group>
    );

    const footer = (
      <React.Fragment>
        <SubmitButton onClick={this.changeUsername}>Confirm</SubmitButton>
        <CancelButton onClick={close}>Close</CancelButton>
      </React.Fragment>
    );
    return (
      <Modal
        show={visible}
        scrollable
        header={header}
        body={body}
        footer={footer}
      />
    );
  }
}

class _NewPasswordModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPassword: '',
      newPassword: '',
      newPassword2: ''
    };
  }

  changePassword = () => {
    const { oldPassword, newPassword, newPassword2 } = this.state;
    if (!isValidPassword(newPassword, newPassword2, oldPassword)) return;

    const { id, token } = this.props.user;

    request({
      url: `/api/v1/${id}/password`,
      method: 'PUT',
      body: JSON.stringify({
        oldPassword,
        newPassword
      }),
      headers: { Authorization: `Bearer ${token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully changed your password.`
        });
        location.reload();
      }
    });
  };

  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  render() {
    const { close, visible } = this.props;
    const { oldPassword, newPassword, newPassword2 } = this.state;

    const header = <h2 className={css.text}>Change Password</h2>;
    const body = (
      <React.Fragment>
        <Group>
          <Col>
            <PasswordInput
              name={'oldPassword'}
              value={oldPassword}
              onChange={this.handleText}
              placeholder={'Enter your current password'}
            />
          </Col>
        </Group>
        <Group>
          <Col>
            <PasswordInput
              name={'newPassword'}
              value={newPassword}
              onChange={this.handleText}
              placeholder={'Enter a new password'}
            />
          </Col>
        </Group>
        <Group>
          <Col>
            <PasswordInput
              name={'newPassword2'}
              value={newPassword2}
              onChange={this.handleText}
              placeholder={'Confirm your new password'}
            />
          </Col>
        </Group>
      </React.Fragment>
    );

    const footer = (
      <React.Fragment>
        <SubmitButton onClick={this.changePassword}>Confirm</SubmitButton>
        <CancelButton onClick={close}>Close</CancelButton>
      </React.Fragment>
    );
    return (
      <Modal
        show={visible}
        scrollable
        header={header}
        body={body}
        footer={footer}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      changeUsername,
      clearUser,
      verifyUser
    },
    dispatch
  );

const NewUsernameModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(_NewUsernameModal);
const NewPasswordModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(_NewPasswordModal);
export default connect(mapStateToProps, mapDispatchToProps)(Account);
