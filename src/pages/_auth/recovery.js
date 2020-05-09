import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';

import { SubmitButton } from '~/components/button.js';
import { Heading, Group, Label, TextInput } from '~/components/form.js';
import { Shader } from '~/components/layout.js';

import request from '~/constants/request.js';
import { isValidEmail } from '~/constants/validations.js';

import css from '~/styles/Auth.module.scss';

class Recovery extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			submitted: false,
		};

		if (props.user.isAuthenticated) {
			return (location.href = '/');
		}
	}

	/** Handle text changes */
	handleText = event => {
		const { name, value } = event.target;
		this.setState({ [name]: value });
	};

	submit = () => {
		const { email } = this.state;
		if (!isValidEmail(email)) return false;

		request({
			url: 'api/v1/users/recovery',
			method: 'NOTIFY',
			body: JSON.stringify(this.state),
			headers: { Authorization: process.env.AUTH_KEY },
			onSuccess: () => this.setState({ submitted: true }),
		});
	};

	render() {
		const { email, submitted } = this.state;

		const renderContent = () => {
			if (!submitted) {
				return (
					<React.Fragment>
						<Group style={{ padding: '1.5em 0' }}>
							<Col>
								<Label>Email Address:</Label>
								<TextInput
									name={'email'}
									value={email}
									onChange={this.handleText}
									placeholder={'Enter your email address'}
								/>
							</Col>
						</Group>
						<Group>
							<Col>
								<SubmitButton onClick={this.submit}>Submit</SubmitButton>
							</Col>
						</Group>
					</React.Fragment>
				);
			} else {
				return (
					<div className={css.instructions}>
						<div>Submitted!</div>
						<div>
							Please follow the instructions in the email we have sent to{' '}
							<a href={'#'} className={css['link-default']}>
								{email}
							</a>{' '}
							to recovery your account.
						</div>
					</div>
				);
			}
		};

		return (
			<Shader>
				<div className={css.form}>
					<Heading>Forgot Your Password?</Heading>

					{renderContent()}
				</div>
			</Shader>
		);
	}
}

const mapStateToProps = state => ({
	user: state.user,
});

export default connect(mapStateToProps)(Recovery);
