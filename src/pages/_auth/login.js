import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { setAlert } from 'components/alert.js';
import { SubmitButton, CancelButton } from 'components/button.js';
import {
  Group,
  Label,
  UsernameInput,
  PasswordInput,
  Checkbox
} from 'components/form';
import { Modal, useModal } from 'components/modal.js';
import { setCookie, getCookie } from 'constants/cookies';
import request from 'constants/request.js';
import { isValidLogin } from 'constants/validations.js';
import { saveUser } from 'reducers/actions';
import css from 'styles/Auth.module.scss';

/**
 * The modal for logging in.
 * @param {object} props - The component props.
 * @param {Function} props.close - The hook for closing the modal.
 * @param {Function} props.saveUser - The reducer for storing the authenticated user.
 * @param {string} props.theme - The current page theme.
 * @param {boolean} props.visible - Whether the modal is visible or not.
 * @returns {React.Component} The component.
 */
const Login = ({ close, saveUser, theme, visible }) => {
  const [isLoaded, setLoaded] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [shouldRemember, setShouldRemember] = useModal(
    getCookie('remember') === 'true'
  );

  console.log('re-rendering');

  useEffect(() => {
    setLoaded(true);
  }, []);

  /**
   * Log in once the 'Enter' key is pressed.
   * @param {Event} event - An event.
   */
  const handleKeyPress = (event) => {
    if (!visible) return;
    if (event.key === 'Enter') logIn();
  };

  /** Log in as a registered user */
  const logIn = () => {
    const credentials = { username, password, remember: shouldRemember };
    if (!isValidLogin(credentials)) return;

    request({
      url: '/api/v1/users/login',
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (user) => {
        setCookie('remember', shouldRemember, 365 * 24);
        saveUser(user);
        close();
        setAlert({ type: 'info', message: `Welcome, ${user.firstname}!` });
        location.reload();
      }
    });
  };

  const Header = <h2 className={css['text']}>Log In</h2>;
  const Body = (
    <div className={css['loginForm']}>
      <Group>
        <Label>Username / Email Address:</Label>
        <UsernameInput
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={'Enter your username'}
        />
      </Group>
      <Group>
        <Label>Password:</Label>
        <PasswordInput
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={'Enter your password'}
        />
      </Group>
      <Group>
        <Checkbox
          checked={shouldRemember}
          label={'Stay signed in'}
          onChange={(event) => setShouldRemember(event.target.checked)}
        />
      </Group>
      <Group>
        <a href={'/account/recovery'} className={css[`link-${theme}`]}>
          Forgotten your password?
        </a>
      </Group>
    </div>
  );
  const Footer = (
    <>
      <SubmitButton onClick={logIn}>Log In</SubmitButton>
      <CancelButton onClick={close}>Cancel</CancelButton>
    </>
  );

  return (
    <Modal
      visible={visible}
      header={Header}
      body={Body}
      footer={Footer}
      onKeyPress={handleKeyPress}
      onHide={close}
    />
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
  theme: state.theme
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      saveUser
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Login);
