import React, { Component} from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveUser } from '~/reducers/actions';

import { alert, setAlert, displayErrorMessage } from '~/components/alert.js';
import { SubmitButton } from '~/components/button.js';
import { Heading, Group, Label, TextInput, PasswordInput, Checkbox } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import request from '~/constants/request.js';
import { isValidSignup } from '~/constants/validations';
import { TEST_USERS } from '~/test/configuration/data';

import css from '~/styles/Auth.module.scss';

class Signup extends Component {
  constructor(props){
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      username: '',
      password1: '',
      password2: '',
      privacy: false,
      subscribe: false,
      honeypot: false
    }

    if (props.user.isAuthenticated){
      return location.href = '/';
    }
  }

  fill = () => {
    this.setState(TEST_USERS.CREATED);
  }

  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }
  handleCheck = (event) => {
    const { name, checked } = event.target;
    this.setState({[name]: checked});}

  signUp = () => {
    // If honeypot checked, fake successful registration
    if (this.state.honeypot){
      setAlert({ type: 'info', message: `Welcome! Thank you for registering to the #WOKEWeekly website.` });
      return location.href = '/';
    }

    if (!isValidSignup(this.state)) return;

    request({
      url: '/api/v1/users',
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: {  'Authorization': process.env.AUTH_KEY },
      onSuccess: (user) => {
        this.props.saveUser(user);
        setAlert({ type: 'info', message: `Welcome, ${user.firstname}! Thank you for registering to the #WOKEWeekly website.` });
        location.href = '/';
      }
    });
  }

  render(){
    const { firstname, lastname, email, username, password1, password2, privacy, subscribe, honeypot } = this.state;

    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>Sign Up</Heading>

            <Group>
              <Col md={6}>
                <Label>First Name:</Label>
                <TextInput
                  name={'firstname'}
                  value={firstname}
                  onChange={this.handleText}
                  placeholder={"Enter your first name."} />
              </Col>
              <Col md={6}>
                <Label>Last Name:</Label>
                <TextInput
                  name={'lastname'}
                  value={lastname}
                  onChange={this.handleText}
                  placeholder={"Enter your last name."} />
              </Col>
            </Group>
            <Group>
              <Col md={12}>
                <Label>Email Address:</Label>
                <TextInput
                  name={'email'}
                  value={email}
                  onChange={this.handleText}
                  placeholder={"Enter your email address."} />
              </Col>
            </Group>
            <Group>
              <Col md={12}>
                <Label>Username:</Label>
                <TextInput
                  name={'username'}
                  value={username}
                  onChange={this.handleText}
                  placeholder={"Enter your username of choice."} />
              </Col>
            </Group>
            <Group>
              <Col md={12}>
                <Label>Password:</Label>
                <PasswordInput
                  name={'password1'}
                  value={password1}
                  onChange={this.handleText}
                  placeholder={"Enter your choice password."} />
              </Col>
            </Group>
            <Group>
              <Col md={12}>
                <Label>Confirm Your Password:</Label>
                <PasswordInput
                  name={'password2'}
                  value={password2}
                  onChange={this.handleText}
                  placeholder={"Confirm your choice password."} />
              </Col>
            </Group>
            <Group style={{marginBottom: 0}}>
              <Col md={12}>
                <Checkbox
                  name={'subscribe'}
                  checked={subscribe}
                  label={'I would like to subscribe to regular news and updates about #WOKEWeekly.'}
                  onChange={this.handleCheck} />
              </Col>
              <Col md={12}>
                <Checkbox
                  name={'privacy'}
                  checked={privacy}
                  label={
                  <span>I have read and I agree to this site's <a target={'_blank'} className={css['link-default']} href={'/privacy'}>Privacy Policy</a>, including the <a target={'_blank'} className={css['link-default']} href={'/cookies'}>Cookie Policy</a>.</span>}
                  onChange={this.handleCheck} />
                <Checkbox
                  name={'honeypot'}
                  checked={honeypot}
                  label={'I have read and agreed to the Terms & Conditions.'}
                  onChange={this.handleCheck}
                  className={css.honeypot} />
              </Col>
            </Group>
          </div>

          <div>
            <Group>
              <Col>
                <SubmitButton onClick={this.signUp} className={'mr-2'}>Sign Up</SubmitButton>
                {process.env.NODE_ENV !== 'production' ?
                  <button onClick={this.fill}>Fill</button>
                : null}
              </Col>
            </Group>
          </div>
        </Spacer>
      </Shader>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(Signup);