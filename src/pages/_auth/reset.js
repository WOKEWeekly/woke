import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { setAlert } from '@components/alert.js';
import { SubmitButton } from '@components/button.js';
import { Heading, Group, Label, PasswordInput } from '@components/form';
import { Shader } from '@components/layout.js';

import request from '@constants/request.js';
import { isValidPassword } from '@constants/validations.js';

import css from '@styles/Auth.module.scss';

class ResetPassword extends Component {
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor(props) {
    super(props);
    this.state = {
      password: '',
      password2: ''
    };

    if (props.user.isAuthenticated) {
      return (location.href = '/');
    }
  }

  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  changePasswordFromReset = () => {
    const { password, password2 } = this.state;
    if (!isValidPassword(password, password2)) return false;

    request({
      url: '/api/v1/users/password/reset',
      method: 'PATCH',
      body: JSON.stringify(this.state),
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully set your new password. Log in with your new credentials and enjoy the website!`
        });
        location.href = '/';
      }
    });
  };

  render() {
    const { password, password2 } = this.state;

    return (
      <Shader>
        <div className={css.form}>
          <Heading>Set New Password</Heading>

          <Group>
            <Col>
              <Label>New Password:</Label>
              <PasswordInput
                name={'password'}
                value={password}
                onChange={this.handleText}
                placeholder={'Enter a new password'}
              />
            </Col>
          </Group>
          <Group>
            <Col>
              <Label>Confirm New Password:</Label>
              <PasswordInput
                name={'password2'}
                value={password2}
                onChange={this.handleText}
                placeholder={'Confirm your new password'}
              />
            </Col>
          </Group>
          <Group>
            <Col>
              <SubmitButton onClick={this.changePasswordFromReset}>
                Submit
              </SubmitButton>
            </Col>
          </Group>
        </div>
      </Shader>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(ResetPassword);
