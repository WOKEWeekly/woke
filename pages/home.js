import React, { Component } from "react";

import css from "~/styles/home.scss";
import Link from 'next/link';

export default class Home extends Component {
	render(){
		return (
			<div>
				<div className={css.example}>Awakening Through Conversation</div>
				<Link>Let us become more aware</Link>
			</div>
		);
	}
}