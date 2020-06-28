import React, { useState, useEffect } from 'react';

import { isSmallDevice } from 'components/layout';
import { Title, ReadMore } from 'components/text.js';
import { Fader } from 'components/transitioner.js';
import request from 'constants/request.js';
import Review from 'pages/reviews/unit.js';
import css from 'styles/pages/Reviews.module.scss';

export default () => {
  const [reviews, setReviews] = useState([]);
  const [isLoaded, setLoaded] = useState(false);

  const limit = isSmallDevice() ? 1 : 3;

  useEffect(() => {
    request({
      url: `/api/v1/reviews/featured`,
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (reviews) => {
        reviews = reviews.slice(0, limit);
        setReviews(reviews);
        setLoaded(true);
      }
    });
  }, [isLoaded]);

  if (!reviews.length) return null;

  const ReviewsHeading = () => {
    const [isLoaded, setLoaded] = useState(false);
    useEffect(() => setLoaded(true), [isLoaded]);
  
    return (
      <Fader
        determinant={isLoaded}
        duration={1500}
        delay={1000}>
        <Title className={css['reviews-heading']}>
          What are people saying about us?
        </Title>
      </Fader>
    );
  };

  const ReviewsList = () => {
    const items = reviews.map((item, index) => {
      return (
        <Review
          key={index}
          idx={index}
          item={item}
          showFullText={true}
        />
      );
    });

    return <div className={css['reviews-list']}>{items}</div>;
  };

  const SeeMoreReviews = () => {
    if (reviews.length < limit) return null;

    return (
      <div className={css['reviews-more']}>
        <ReadMore text={'See more reviews'} link={'/reviews'} />
      </div>
    );
  };

  return (
    <>
      <ReviewsHeading />
      <ReviewsList />
      <SeeMoreReviews />
    </>
  );
};
