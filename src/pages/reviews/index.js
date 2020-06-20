import React, { Component } from 'react';
import { connect } from 'react-redux';

import { AddEntityButton } from 'components/button.js';
import { Cover, Shader, Spacer } from 'components/layout.js';
import { Loader, Empty } from 'components/loader.js';
import { BottomToolbar } from 'components/toolbar.js';

import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';

import Review from 'pages/reviews/unit.js';

import css from 'styles/pages/Home.module.scss';

class ReviewsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reviews: [],
      isLoaded: false
    };
  }

  componentDidMount() {
    this.getReviews();
  }

  getReviews = () => {
    request({
      url: '/api/v1/reviews',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (reviews) => {
        this.setState({ reviews, isLoaded: true });
      }
    });
  };

  render() {
    const { reviews, isLoaded } = this.state;
    const { user } = this.props;

    const heading = 'Reviews';
    const description = 'What are people saying about us?';

    const ReviewsList = () => {
      if (!isLoaded) {
        return <Loader />;
      } else if (reviews.length === 0) {
        return <Empty message={'There are no reviews.'} />;
      } else {
        const items = [];
        for (const [index, item] of reviews.entries()) {
          items.push(
            <Review
              key={index}
              idx={index}
              item={item}
              showFullText={true}
              showAdminControls={true}
            />
          );
        }
        return (
          <div className={css.reviewsPreview}>
            <div className={css.reviewsList}>{items}</div>
          </div>
        );
      }
    };

    return (
      <Shader>
        <Spacer gridrows={'auto 1fr auto'}>
          <Cover
            title={heading}
            subtitle={description}
            image={'header-reviews.jpg'}
            height={250}
            backgroundPosition={'center'}
          />

          <ReviewsList />

          <BottomToolbar>
            {user.clearance >= CLEARANCES.ACTIONS.CRUD_REVIEWS ? (
              <AddEntityButton
                title={'Add Review'}
                onClick={() => (location.href = '/reviews/add')}
              />
            ) : null}
          </BottomToolbar>
        </Spacer>
      </Shader>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(ReviewsList);
