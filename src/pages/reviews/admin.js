import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { zText } from 'zavid-modules';

import { alert } from 'components/alert.js';
import { AddEntityButton } from 'components/button.js';
import { Icon } from 'components/icon.js';
import { Shader } from 'components/layout.js';
import { ConfirmModal } from 'components/modal.js';
import Tabler from 'components/tabler';
import { BottomToolbar } from 'components/toolbar.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import css from 'styles/pages/Reviews.module.scss';

const ReviewsAdmin = (props) => {
  const { user } = props;

  if (user.clearance < CLEARANCES.ACTIONS.REVIEWS.VIEW) {
    return (location.href = '/');
  }

  return (
    <>
      <Shader>
        <ReviewCollection {...props} />
      </Shader>

      <BottomToolbar>
        <AddEntityButton
          title={'Add Review'}
          onClick={() => (location.href = '/admin/reviews/add')}
        />
      </BottomToolbar>
    </>
  );
};

const ReviewCollection = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState({});
  const [isLoaded, setLoaded] = useState(false);
  const [deleteModalVisible, setDeleteModalVisibility] = useState(false);

  useEffect(() => getReviews(), [isLoaded]);

  /** Retrieve a list of all reviews */
  const getReviews = () => {
    request({
      url: '/api/v1/reviews',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (reviews) => {
        setReviews(reviews);
        setLoaded(true);
      }
    });
  };

  /**
   * Delete a review from the server.
   */
  const deleteReview = () => {
    const { id, referee } = selectedReview;
    request({
      url: `/api/v1/reviews/${id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        alert.success(`You've deleted the review by ${referee}.`);
        setDeleteModalVisibility(false);
        getReviews();
      }
    });
  };

  return (
    <>
      <Tabler
        heading={'List of Reviews'}
        itemsLoaded={isLoaded}
        emptyMessage={'No reviews found.'}
        columns={[
          ['#'],
          [<Icon name={'camera'} key={0} />, { centerAlign: true }],
          ['Referee'],
          ['Position'],
          ['Rating', { centerAlign: true }],
          ['Description']
        ]}
        items={reviews.map((review, key) => {
          return [
            [key + 1, { type: 'index' }],
            [
              review.image,
              {
                type: 'image',
                imageOptions: {
                  css: css['review-admin-image'],
                  lazy: 'ms'
                }
              }
            ],
            [review.referee, { icon: 'user' }],
            [review.position, { icon: 'signature' }],
            [review.rating, { icon: 'star-half-alt', type: 'rating' }],
            [
              zText.truncateText(review.description, { limit: 25 }),
              { hideOnMobile: true }
            ],
            [<EditButton id={review.id} key={key} />, { type: 'button' }],
            [
              <DeleteButton
                review={review}
                key={key}
                setDeleteModalVisibility={setDeleteModalVisibility}
                setSelectedReview={setSelectedReview}
              />,
              { type: 'button' }
            ]
          ];
        })}
        distribution={'4% 8% 15% 20% .5fr 1fr 4% 4%'}
      />
      <ConfirmModal
        visible={deleteModalVisible}
        message={`Are you sure you want to delete the review by ${selectedReview.referee}?`}
        confirmFunc={deleteReview}
        confirmText={'Delete'}
        close={() => setDeleteModalVisibility(false)}
      />
    </>
  );
};

/**
 * Navigate to edit a review.
 * @param {object} props - The component properties.
 * @param {number} props.id - The ID of the review.
 * @returns {React.Component} The component.
 */
const EditButton = ({ id }) => {
  const link = `/admin/reviews/edit/${id}`;
  return (
    <button
      className={css.invisible_button}
      onClick={() => (location.href = link)}>
      <Icon name={'edit'} />
    </button>
  );
};

/**
 * Attempt to delete a review.
 * @param {object} props - The component properties.
 * @param {number} props.review - The review to be deleted.
 * @param {Function} props.setDeleteModalVisibility - The hook for setting modal visibility.
 * @param {Function} props.setSelectedReview - The hook for setting the currently-selected review.
 * @returns {React.Component} The component.
 */
const DeleteButton = ({
  review,
  setDeleteModalVisibility,
  setSelectedReview
}) => {
  return (
    <button
      className={css.invisible_button}
      onClick={() => {
        setDeleteModalVisibility(true);
        setSelectedReview(review);
      }}>
      <Icon name={'trash'} />
    </button>
  );
};

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(ReviewsAdmin);
