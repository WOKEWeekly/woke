import classnames from 'classnames';
import React, { useState, useEffect } from 'react';

import css from 'styles/components/Form.module.scss';

import { Icon } from './icon.js';

const Rator = ({
  rating: currentRating,
  changeable,
  containerClassName,
  starClassName,
  onChange,
  style
}) => {
  const [stateRating, setRating] = useState(0);
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    setRating(currentRating);
    setLoaded(true);
  }, [isLoaded, stateRating]);

  const changeRating = (e) => {
    if (!changeable) return;
    setRating(e.target.value);
    onChange(e);
  };

  return (
    <div
      className={classnames(css['rator-star-bar'], containerClassName)}
      style={style}>
      <StarBar
        changeRating={changeRating}
        starClassName={starClassName}
        rating={stateRating}
      />
    </div>
  );
};

const StarBar = ({ changeRating, rating, starClassName }) => {
  const stars = [];
  for (let i = 0; i < rating; i++) {
    stars.push(
      <Star
        className={starClassName}
        changeRating={changeRating}
        value={i + 1}
        key={i}
      />
    );
  }
  for (let i = 0; i < 5 - rating; i++) {
    stars.push(
      <Star
        className={starClassName}
        empty={true}
        changeRating={changeRating}
        value={i + 1 + rating}
        key={i + rating}
      />
    );
  }
  return stars;
};

const Star = ({ changeRating, className, empty = false, value = 0 }) => {
  const iconProps = empty ? { prefix: 'far' } : {};
  return (
    <button
      value={value}
      className={css['rator-star-button']}
      onClick={changeRating}>
      <Icon
        {...iconProps}
        name={'star'}
        className={classnames(css['rator-star-icon'], className)}
      />
    </button>
  );
};

export default Rator;
