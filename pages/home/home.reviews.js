import React, { Component } from 'react';
import { Title } from '~/components/text.js';
import { Fader } from '~/components/transitioner.js';
import request from '~/constants/request.js';

import Review from '~/pages/reviews/unit.js';
import css from '~/styles/home.scss';

export default class ReviewsPreview extends Component {
  constructor(){
    super();
    this.state = { reviews: [] }
  }

  componentDidMount(){
    this.getReviews();
  }
  
  getReviews = () => {
    request({
      url: '/getReviews?limit=3',
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: (reviews) => {
        this.setState({reviews});
      }
    });
  }

  render(){
    const { reviews, inView, detectViewChange } = this.state;
    if (reviews.length === 0) return null;

    const items = [];

    for (const [index, item] of reviews.entries()) {
      items.push(
        <Review
          key={index}
          idx={index}
          item={item}
          inView={inView}
          detectViewChange={detectViewChange}
          showFullText={false}
          showAdminControls={false} />
      );
    }

    return (
      <div className={css.reviewsPreview}>
        <ReviewsHeading />
        <div className={css.reviewsList}>{items}</div>
      </div>
    );
  }
}

class ReviewsHeading extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  componentDidMount() {
    this.setState({isLoaded: true})
  }

  render(){
    const { isLoaded } = this.state;

    return (
      <Fader determinant={isLoaded} duration={1500} delay={1000} className={css.reviewsPreview}>
        <Title className={css.heading}>What are people saying about us?</Title>
      </Fader>
    );
  }
}