import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { zText } from 'zavid-modules';

import { alert } from 'components/alert.js';
import { AddEntityButton } from 'components/button.js';
import { Icon } from 'components/icon.js';
import { CloudinaryImage } from 'components/image.js';
import { Shader } from 'components/layout.js';
import { ConfirmModal, useModal } from 'components/modal.js';
import Rator from 'components/rator.js';
import Tabler from 'components/tabler';
import { Title } from 'components/text';
import { BottomToolbar } from 'components/toolbar.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import css from 'styles/pages/Reviews.module.scss';

const ReviewsAdmin = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState({});
  const [isLoaded, setLoaded] = useState(false);
  
  const [deleteModalVisible, setDeleteModalVisibility] = useModal(false);

  useEffect(() => {
    getReviews();
  }, [isLoaded]);

  if (user.clearance < CLEARANCES.ACTIONS.VIEW_ADMIN_REVIEWS) {
    return (location.href = '/');
  }

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
   * @returns {React.Component} The component.
   */
  const DeleteButton = ({ review }) => {
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

  const ReviewCollection = () => {
    return (
      <>
        <Title className={css['review-table-heading']}>List of Reviews</Title>
        <Tabler
          itemsLoaded={isLoaded}
          emptyMessage={'No reviews found.'}
          columns={['#', '', 'Referee', 'Position', 'Rating', 'Description']}
          items={reviews.map((review, key) => {
            return [
              [key + 1, { type: 'index' }],
              [
                <CloudinaryImage
                  src={review.image}
                  className={css['review-image-mobile']}
                  lazy={'ms'}
                  key={key}
                />,
                { type: 'image' }
              ],
              [review.referee, { icon: 'user' }],
              [review.position, { icon: 'signature' }],
              [
                <Rator
                  rating={review.rating}
                  changeable={false}
                  className={css['admin-rator']}
                  key={key}
                />,
                { icon: 'star-half-alt' }
              ],
              [
                zText.truncateText(review.description, 30),
                { hideOnMobile: true }
              ],
              [<EditButton id={review.id} />, { type: 'button' }],
              [<DeleteButton review={review} />, { type: 'button' }]
            ];
          })}
          distribution={'4% 10% 15% 20% 15% 1fr 4% 4%'}
        />
      </>
    );
  };

  return (
    <>
      <Shader className={css.reviewTabler}>
        <ReviewCollection />
      </Shader>

      <BottomToolbar>
        <AddEntityButton
          title={'Add Review'}
          onClick={() => (location.href = '/admin/reviews/add')}
        />
      </BottomToolbar>

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

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(ReviewsAdmin);
