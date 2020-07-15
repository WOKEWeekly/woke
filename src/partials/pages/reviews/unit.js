import React, { memo, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import LazyLoader from 'react-visibility-sensor';
import { zText } from 'zavid-modules';

import { setAlert } from 'components/alert.js';
import { CloudinaryImage } from 'components/image.js';
import { isSmallDevice, Default } from 'components/layout.js';
import { ConfirmModal } from 'components/modal.js';
import Rator from 'components/rator.js';
import {
  Title,
  Subtitle,
  Paragraph,
  QuoteWrapper,
  Divider,
  ExpandText
} from 'components/text.js';
import { Slider } from 'components/transitioner.js';
import request from 'constants/request.js';
import css from 'styles/pages/Reviews.module.scss';

const Review = memo(({ fullText, item: review, user, idx }) => {
  const [isLoaded, setLoaded] = useState(false);
  const [modalVisible, setModalVisibility] = useState(false);
  const [showFullText, setShowFullText] = useState(fullText);
  const [isInViewport, setInView] = useState(false);
  const [shouldWatch, setWatchStatus] = useState(true);

  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  const toggleVisibility = (isInViewport) => {
    setInView(isInViewport);
    setWatchStatus(isInViewport === false);
  };

  /** Delete review from database */
  const deleteReview = () => {
    request({
      url: `/api/v1/reviews/${review.id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully deleted ${review.referee}'s review.`
        });
        location.href = '/reviews';
      }
    });
  };

  review.description =
    review.description && review.description.trim().length
      ? review.description
      : 'No description.';

  const limit = isSmallDevice() ? 40 : 60;
  const beyondLimit = review.description.split(' ').length > limit;

  const isEven = idx % 2 == 0;
  const shouldLeftAlign = isEven || !review.image;

  const detailsStyle = !isSmallDevice()
    ? { textAlign: shouldLeftAlign ? 'left' : 'right' }
    : null;
  const ratorStyle = !isSmallDevice()
    ? { justifyContent: shouldLeftAlign ? 'flex-start' : 'flex-end' }
    : null;
  const imageStyle = shouldLeftAlign
    ? {
        float: 'left',
        marginRight: '1.5em'
      }
    : {
        float: 'right',
        marginLeft: '1.5em'
      };

  /** Image of reviewer */
  const ReviewerImage = () => {
    if (!review.image) return null;

    return (
      <div className={css['review-image-container']} style={imageStyle}>
        <CloudinaryImage
          src={review.image}
          alt={review.fullname}
          className={css['review-image']}
        />
      </div>
    );
  };

  /** Details of the review */
  const ReviewDetails = () => {
    return (
      <>
        <Default>
          <Divider style={{ marginTop: 0 }} />
        </Default>
        <Title className={css['review-referee']}>{review.referee}</Title>
        <Subtitle className={css['review-roles']}>{review.position}</Subtitle>
        <Rator rating={review.rating} changeable={false} style={ratorStyle} />
        <QuoteWrapper>
          <Paragraph className={css['review-paragraph']}>
            {showFullText
              ? review.description
              : zText.truncateText(review.description, { limit: limit })}
          </Paragraph>
          <ReadMore className={css['review-readmore']} />
        </QuoteWrapper>
      </>
    );
  };

  const ReadMore = () => {
    if (showFullText || !beyondLimit) return null;

    return (
      <ExpandText
        text={'Click to read more...'}
        onClick={() => setShowFullText(true)}
      />
    );
  };

  return (
    <>
      <LazyLoader
        onChange={toggleVisibility}
        partialVisibility={true}
        active={shouldWatch}>
        <Slider
          key={idx}
          determinant={isInViewport}
          duration={750}
          direction={shouldLeftAlign ? 'left' : 'right'}>
          <div className={css['review-list-item']} style={detailsStyle}>
            <ReviewerImage />
            <ReviewDetails />
          </div>
        </Slider>
      </LazyLoader>

      <ConfirmModal
        visible={modalVisible}
        message={'Are you sure you want to delete this review?'}
        confirmFunc={deleteReview}
        confirmText={'Delete'}
        close={() => setModalVisibility(false)}
      />
    </>
  );
});

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(Review);
