import React, { Component} from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveUser } from '~/reducers/actions';
import Router from 'next/router';

import { SubmitButton } from '~/components/button.js';
import { Heading, Group, Label, TextInput } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import Meta from '~/partials/meta.js';
import css from '~/styles/auth.scss';

class Signup extends Component {
  constructor(props){
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      username: '',
      password1: '',
      password2: ''
    }

    if (props.user.isAuthenticated){
      Router.push('/');
    }

    document.body.className = css.background;
  }

  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  render(){
    const { firstname, lastname, email, username, password1, password2 } = this.state;
    

    return (
      <Shader>
        <Meta
					title={`Sign Up | #WOKEWeekly`}
          url={`/signup`} />

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
                <TextInput
                  name={'password1'}
                  value={password1}
                  onChange={this.handleText}
                  placeholder={"Enter your choice password."} />
              </Col>
            </Group>
            <Group>
              <Col md={12}>
                <Label>Confirm Your Password:</Label>
                <TextInput
                  name={'password2'}
                  value={password2}
                  onChange={this.handleText}
                  placeholder={"Confirm your choice password."} />
              </Col>
            </Group>
          </div>

          <div>
            <Group>
              <Col>
                <SubmitButton onClick={() => console.log('hi')} className={'mr-2'}>Sign Up</SubmitButton>
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