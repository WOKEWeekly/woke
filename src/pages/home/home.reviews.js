import React, { useState, useEffect } from 'react';

import { Title, ReadMore } from 'components/text.js';
import { Fader } from 'components/transitioner.js';
import request from 'constants/request.js';
import Review from 'pages/reviews/unit.js';
import css from 'styles/pages/Home.module.scss';

const limit = 3;

export default () => {
  const [reviews, setReviews] = useState([]);
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    request({
      url: `/api/v1/reviews/featured`,
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (reviews) => {
        setReviews(reviews);
        setLoaded(true);
      }
    });
  }, [isLoaded]);

  if (!reviews.length) return null;

  const ReviewsList = () => {
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

    return <div className={css.reviewsList}>{items}</div>;
  };

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
      <ReviewsList />
      <SeeMoreReviews />
    </div>
  );
};

const ReviewsHeading = () => {
  const [isLoaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), [isLoaded]);

  return (
    <Fader
      determinant={isLoaded}
      duration={1500}
      delay={1000}
      className={css.reviewsPreview}>
      <Title className={css.heading}>What are people saying about us?</Title>
    </Fader>
  );
};
