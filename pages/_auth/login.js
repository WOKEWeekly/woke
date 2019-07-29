import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveUser } from '~/reducers/actions';

import { alert, setAlert, displayErrorMessage } from '~/components/alert.js';
import { SubmitButton, CancelButton } from '~/components/button.js';
import { Group, Label, UsernameInput, PasswordInput, Checkbox } from '~/components/form.js';
import { Modal } from '~/components/modal.js';

import { setCookie, getCookie } from '~/constants/cookies';
import { isValidLogin } from '~/constants/validations.js';
import css from '~/styles/auth.scss';

class LoginModal extends Component {
  constructor(props){
    super(props);
    this.state = {
      username: '',
      password: '',
      remember: getCookie('remember')
    }
  }

  /** When 'Enter' pressed, trigger login */
  _handleKeyPress = (e) => {
    if (!this.props.visible) return;
    if (e.key === 'Enter') this.logIn();
  }

  /** Register key events */
  componentDidMount(){ document.addEventListener("keypress", this._handleKeyPress, false); }
  componentWillUnmount(){ document.removeEventListener("keypress", this._handleKeyPress, false); }

  /** Handle login fields */
  handleUsername = (event) => { this.setState({username: event.target.value}); }
  handlePassword = (event) => { this.setState({password: event.target.value}); }
  handleRemember = (event) => { this.setState({remember: event.target.checked}); }

  /** Log in as registered user */
  logIn = () => {
    if (!isValidLogin(this.state)) return;

    fetch('/login', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => Promise.all([res, res.json()]))
    .then(([status, response]) => { 
      if (status.ok){
        const user = response;
        setCookie('remember', this.state.remember);
        this.props.saveUser(user);
        this.props.close();
        setAlert({ type: 'info', message: `Welcome, ${user.firstname}!` });
        location.reload();
      } else {
        alert.error(response.message)
      }
    })
    .catch(error => {
      displayErrorMessage(error);
    });
  }

  render(){

    const { username, password, remember } = this.state;

    const header = (
      <h2 className={css.text}>Log In</h2>
    );
    const body = (
      <div style={{padding: '0 1em'}}>
        <Group className={css.group}>
          <Label>Username / Email Address:</Label>
          <UsernameInput
            value={username}
            onChange={this.handleUsername}
            placeholder={"Enter your username"} />
        </Group>
        <Group className={css.group}>
          <Label>Password:</Label>
          <PasswordInput
            value={password}
            onChange={this.handlePassword}
            placeholder={"Enter your password"} />
        </Group>
        <Group style={{marginTop: '1em'}}>
          <Checkbox
            checked={remember}
            label={'Remember me'}
            onChange={this.handleRemember} />
        </Group>
      </div>
    );
    const footer = (
      <React.Fragment>
        <SubmitButton onClick={this.logIn}>Log In</SubmitButton>
        <CancelButton onClick={this.props.close}>Cancel</CancelButton>
      </React.Fragment>
    )

    return (
      <Modal
        visible={this.props.visible}
        header={header}
        body={body}
        footer={footer}
        onKeyPress={this._handleKeyPress} />
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    saveUser
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal);