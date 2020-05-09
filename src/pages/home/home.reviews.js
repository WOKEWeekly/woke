import React, { Component } from 'react';
import { Title } from '~/components/text.js';
import { Fader } from '~/components/transitioner.js';
import request from '~/constants/request.js';

import Review from '~/pages/reviews/unit.js';
import css from '~/styles/pages/Home.module.scss';
import { ReadMore } from '../../components/text';

export default class ReviewsPreview extends Component {
	constructor() {
		super();
		this.state = {
			reviews: [],
			limit: 3,
		};
	}

	componentDidMount() {
		this.getReviews();
	}

	getReviews = () => {
		request({
			url: `/api/v1/reviews/featured`,
			method: 'GET',
			headers: { Authorization: process.env.AUTH_KEY },
			onSuccess: reviews => {
				this.setState({ reviews });
			},
		});
	};

	render() {
		const { reviews, limit } = this.state;
		if (reviews.length === 0) return null;

		const items = [];

		for (const [index, item] of reviews.entries()) {
			items.push(
				<Review
					key={index}
					idx={index}
					item={item}
					showFullText={false}
					showAdminControls={false}
				/>
			);
		}

		const SeeMoreReviews = () => {
			if (reviews.length < limit) return null;

			return (
				<div className={css.moreReviews}>
					<ReadMore text={'See more reviews'} link={'/reviews'} />
				</div>
			);
		};

		return (
			<div className={css.reviewsPreview}>
				<ReviewsHeading />
				<div className={css.reviewsList}>{items}</div>
				<SeeMoreReviews />
			</div>
		);
	}
}

class ReviewsHeading extends Component {
	constructor() {
		super();
		this.state = { isLoaded: false };
	}

	componentDidMount() {
		this.setState({ isLoaded: true });
	}

	render() {
		const { isLoaded } = this.state;

		return (
			<Fader
				determinant={isLoaded}
				duration={1500}
				delay={1000}
				className={css.reviewsPreview}>
				<Title className={css.heading}>What are people saying about us?</Title>
			</Fader>
		);
	}
}
