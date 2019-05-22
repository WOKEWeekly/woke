import React, { Component } from "react";

import css from "../styles/home.scss";

export default class Home extends Component {
	render(){
		return (
			<div className={css.body}>
				<div className={css.example}>Awakening Through Conversation</div>
			</div>
		);
	}
}