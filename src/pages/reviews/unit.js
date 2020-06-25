import React, { memo, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import LazyLoader from 'react-visibility-sensor';
import { zText } from 'zavid-modules';

import { setAlert } from 'components/alert.js';
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
import { cloudinary } from 'constants/settings.js';
import css from 'styles/pages/Home.module.scss';

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
    review.description && review.description.trim().length > 0
      ? review.description
      : 'No description.';

  const limit = isSmallDevice() ? 40 : 60;
  const beyondLimit = review.description.split(' ').length > limit;

  const isEven = idx % 2 == 0;

  /** Image of reviewer */
  const ReviewerImage = () => {
    if (!review.image) return null;
    return (
      <Col md={{ span: 3, order: isEven ? 1 : 2 }}>
        <img
          src={`${cloudinary.url}/${review.image}`}
          alt={review.fullname}
          className={css.image}
        />
      </Col>
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

  /** Details of the review */
  const ReviewDetails = () => {
    const colStyle = !isSmallDevice()
      ? { display: 'flex', flexDirection: 'column' }
      : null;
    const detailsStyle = !isSmallDevice()
      ? { textAlign: isEven ? 'left' : 'right' }
      : null;
    const ratorStyle = !isSmallDevice()
      ? { justifyContent: isEven ? 'flex-start' : 'flex-end' }
      : null;

    return (
      <Col
        md={{ span: review.image ? 9 : 12, order: isEven ? 2 : 1 }}
        style={colStyle}>
        <div className={css.details} style={detailsStyle}>
          <Default>
            <Divider style={{ marginTop: 0 }} />
          </Default>
          <Title className={css.title}>{review.referee}</Title>
          <Subtitle className={css.subtitle}>{review.position}</Subtitle>
          <Rator rating={review.rating} changeable={false} style={ratorStyle} />
          <QuoteWrapper>
            <Paragraph className={css.paragraph}>
              {showFullText
                ? review.description
                : zText.truncateText(review.description, limit)}
            </Paragraph>
            <ReadMore />
          </QuoteWrapper>
        </div>
      </Col>
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
          direction={isEven ? 'left' : 'right'}>
          <div className={css.item}>
            <Row>
              <ReviewerImage />
              <ReviewDetails />
            </Row>
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
