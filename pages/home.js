import React, { Component } from 'react';
import {Container, Col, Row} from 'react-bootstrap';

import Cover from '~/components/cover.js';
import css from "../styles/home.scss";

export default class Home extends Component {
	render(){
		return (
			<div>
				<Cover
					title={'Awakening Through Conversation.'}
					subtitle={'Debates and discussions centered around and beyond the UK black community.'}
					image={'home-header.jpg'}
					height={575} />

				<Container fluid={true}>
					<Row className={css.threepart}>
						<Part
							headline={'Enlightenment'}
							description={'Facilitating open-floor conversation to shape the minds and alter the perspectives of participants.'}
							image={'three-part-1.jpg'} />
						<Part
							headline={'Expression'}
							description={'Providing a safe-space for freedom of expression and opinions to be heard.'}
							image={'three-part-2.jpg'} />
						<Part
							headline={'Community'}
							description={'Encouraging unity amongst the community irrespective of social status or background.'}
							image={'three-part-3.jpg'} />
					</Row>
				</Container>
			</div>
		);
	}
}

class Part extends Component {
	render(){
		return (
			<Col md={4} className={css.colpart}>
				<div className={css.part} style={{backgroundImage: `url(/static/images/bg/${this.props.image})`}}>
					<div className={css.caption}>
						<div className={css.headline}>{this.props.headline}</div>
						<div className={css.description}>{this.props.description}</div>
					</div>
				</div>
			</Col>
		);
	}
}