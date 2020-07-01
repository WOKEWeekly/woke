import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { setAlert } from 'components/alert.js';
import { SubmitButton, CancelButton } from 'components/button.js';
import { Group, Label } from 'components/form';
import { UsernameInput, PasswordInput, Checkbox } from 'components/form/v2';
import { Modal } from 'components/modal.js';
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
  const usernameRef = useRef('');
  const passwordRef = useRef('');
  const shouldRememberRef = useRef(getCookie('remember') === 'true');

  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

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
    const credentials = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
      remember: shouldRememberRef.current.checked
    };
    if (!isValidLogin(credentials)) return;

    request({
      url: '/api/v1/users/login',
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (user) => {
        setCookie('remember', credentials.remember, 365 * 24);
        saveUser(user);
        close();
        setAlert({ type: 'info', message: `Welcome, ${user.firstname}!` });
        location.reload();
      }
    });
  };

  const Header = <h2 className={css['text']}>Log In</h2>;
  const Body = (
    <div className={css['login-form']}>
      <Group>
        <Label>Username / Email Address:</Label>
        <UsernameInput ref={usernameRef} placeholder={'Enter your username'} />
      </Group>
      <Group>
        <Label>Password:</Label>
        <PasswordInput ref={passwordRef} placeholder={'Enter your password'} />
      </Group>
      <Group>
        <Checkbox ref={shouldRememberRef} label={'Stay signed in'} />
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
