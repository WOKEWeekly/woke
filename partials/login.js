import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveUser } from '~/reducers/actions';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { Group, Label, Input, Checkbox } from '~/components/form';
import css from '~/styles/_components.scss';

class LoginModal extends Component {
  constructor(){
    super();
    this.state = {
      username: '',
      password: '',
      remember: false
    }
  }

  /** Handle login fields */
  handleUsername = (event) => { this.setState({username: event.target.value}); }
  handlePassword = (event) => { this.setState({password: event.target.value}); }
  handleRemember = (event) => { this.setState({remember: event.target.checked}); }

  /** Log in as registered user */
  logIn = () => {
    fetch('/login', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(user => {
      this.props.saveUser(user);
      location.reload();
    }).catch(error => console.error(error));
  }

  render(){

    const { username, password, remember } = this.state;

    return (
      <Modal
        show={this.props.visible}
        centered>
          
        <Modal.Header className={css.modal_header}>
          <h2 className={css.text}>Log In</h2>
        </Modal.Header>

        <Modal.Body className={css.modal_body}>
          <div style={{padding: '0 1em'}}>
            <Group>
              <Label>Username / Email Address:</Label>
              <Input
                value={username}
                onChange={this.handleUsername}
                placeholder={"Enter username"} />
            </Group>
            <Group>
              <Label>Password:</Label>
              <Input
                value={password}
                onChange={this.handlePassword}
                placeholder={"Enter password"} />
            </Group>
            <Group>
              <Checkbox
                checked={remember}
                label={'Remember me'}
                onChange={this.handleRemember} />
            </Group>
          </div>
        </Modal.Body>

        <Modal.Footer className={css.modal_footer}>
          <SubmitButton onClick={this.logIn}>Log In</SubmitButton>
          <CancelButton onClick={this.props.close}>Cancel</CancelButton>
        </Modal.Footer>
    </Modal>
    )
  }
}

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    saveUser
  }, dispatch)
);

export default connect(null, mapDispatchToProps)(LoginModal);