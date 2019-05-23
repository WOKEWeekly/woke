import React, { Component } from "react";

import Cover from '~/components/cover.js';
import css from "../styles/home.scss";

export default class Home extends Component {
	render(){
		return (
			<div>
				<Cover
					title={'Awakening Through Conversation.'}
					subtitle={'Debates and discussions centered around and beyond the UK black community.'}
					image={'/static/images/bg/home-header.jpg'}
					height={575} />
			</div>
		);
	}
}