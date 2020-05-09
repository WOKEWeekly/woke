import React, { Component } from 'react';
import { connect } from 'react-redux';
import { zDate, zHandlers } from 'zavid-modules';

import { setAlert } from '~/components/alert.js';

import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';
import { isValidMember } from '~/constants/validations.js';

import MemberForm from './form.js';

class MemberCrud extends Component {
	static async getInitialProps({ query }) {
		return { ...query };
	}

	constructor(props) {
		super(props);

		const ethnicities = {};
		for (let i = 1; i <= 4; i++) ethnicities[`ethnicity${i}`] = '';

		this.state = {
			firstname: '',
			lastname: '',
			level: '',
			role: '',
			sex: 'M',
			image: '',
			birthday: null,
			description: '',
			...ethnicities,
			socials: {},
			verified: false,
			slackId: '',
			isAuthor: false,
		};
	}

	componentDidMount() {
		const { operation } = this.props;
		let backPath = '';

		if (operation === 'add') {
			this.setState({
				...this.props.member,
				backPath: '/team',
			});
		} else {
			const {
				level,
				birthday,
				ethnicity,
				socials,
				slug,
				verified,
			} = this.props.member;

			const ethnicityArr = JSON.parse(ethnicity);
			const isExecutive = level === 'Executive';

			/** If in /add, or user if not verified, return to /team */
			if (verified) {
				backPath = isExecutive ? `/executives/${slug}` : `/team/member/${slug}`;
			} else {
				backPath = '/team';
			}

			/** Populate ethnicity array */
			const ethnicities = {};
			for (let i = 0; i < 4; i++) {
				ethnicities[`ethnicity${i + 1}`] = ethnicityArr ? ethnicityArr[i] : '';
			}

			this.setState({
				...this.props.member,
				socials: JSON.parse(socials),
				birthday: new Date(birthday),
				...ethnicities,
				backPath,
			});
		}
	}

	buildRequest = () => {
		const {
			firstname,
			lastname,
			role,
			level,
			sex,
			image,
			birthday,
			description,
			socials,
			verified,
			slackId,
			isAuthor,
		} = this.state;
		const { operation } = this.props;

		if (!verified) this.setState({ backPath: '/team' });

		/** Add ethncities to array */
		const ethnicities = [];
		for (let i = 1; i <= 4; i++) {
			if (this.state[`ethnicity${i}`])
				ethnicities.push(this.state[`ethnicity${i}`]);
		}

		const member = {
			firstname: firstname.trim(),
			lastname: lastname.trim(),
			level,
			role: role.trim(),
			sex,
			image,
			birthday: zDate.formatISODate(birthday),
			description: description,
			ethnicity: JSON.stringify(ethnicities),
			socials: JSON.stringify(socials),
			verified,
			slackId: slackId !== null ? slackId.trim() : null,
			isAuthor,
		};

		let data;

		if (operation === 'add') {
			data = JSON.stringify(member);
		} else {
			data = JSON.stringify({
				member: member,
				changed: image !== '' && image !== null && !cloudinary.check(image),
			});
		}

		return data;
	};

	/** POST member to the server */
	submitMember = () => {
		if (!isValidMember(this.state)) return;
		const data = this.buildRequest();

		request({
			url: `/api/v1/members`,
			method: 'POST',
			body: data,
			headers: { Authorization: `Bearer ${this.props.user.token}` },
			onSuccess: () => {
				const { firstname, lastname, backPath } = this.state;
				setAlert({
					type: 'success',
					message: `You've successfully added member: ${firstname} ${lastname}.`,
				});
				location.href = backPath;
			},
		});
	};

	/** PUT member on server */
	updateMember = () => {
		if (!isValidMember(this.state)) return;
		const data = this.buildRequest();

		request({
			url: `/api/v1/members/${this.props.member.id}`,
			method: 'PUT',
			body: data,
			headers: { Authorization: `Bearer ${this.props.user.token}` },
			onSuccess: ({ slug }) => {
				const { firstname, lastname, level } = this.state;
				const isExecutive = level === 'Executive';
				const backPath =
					slug === null
						? '/team'
						: isExecutive
						? `/executives/${slug}`
						: `/team/member/${slug}`;

				setAlert({
					type: 'success',
					message: `You've successfully edited the details of ${firstname} ${lastname}.`,
				});
				location.href = backPath;
			},
		});
	};

	render() {
		const { title, operation } = this.props;
		const { backPath } = this.state;

		return (
			<MemberForm
				heading={title}
				member={this.state}
				handlers={zHandlers(this)}
				confirmText={operation === 'add' ? 'Submit' : 'Update'}
				confirmFunc={
					operation === 'add' ? this.submitMember : this.updateMember
				}
				cancelFunc={() => (location.href = backPath)}
				operation={operation}
				metaTitle={title}
				metaUrl={`/${operation}`}
			/>
		);
	}
}

const mapStateToProps = state => ({
	user: state.user,
});

export default connect(mapStateToProps)(MemberCrud);
