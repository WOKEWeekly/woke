import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';

import handlers from '~/constants/handlers.js';
import request from '~/constants/request.js';
import { isValidReview } from '~/constants/validations.js';

import ReviewForm from './form.js';

class ReviewCrud extends Component {
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor() {
    super();
    this.state = {
      referee: '',
      position: '',
      rating: 0,
      description: '',
      image: null
    };
  }

  componentDidMount() {
    this.setState({...this.props.review})
  }

  /** POST review to the server */
  submitReview = () => {
    if (!isValidReview(this.state)) return;
    const {referee, position, rating, description, image } = this.state;

    const review = {
      referee: referee.trim(),
      position: position.trim(),
      rating,
      description: description.trim(),
      image
    };

    const data = new FormData();
    data.append('review', JSON.stringify(review));
    if (image !== null){
      data.append('changed', true);
      data.append('file', image);
    }

    /** Add review to database */
    request({
      url:'/addReview',
      method: 'POST',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added the review by ${referee}.` });
        location.href = '/reviews';
      }
    });
  }

  /** Update review on server */
  updateReview = () => {
    if (!isValidReview(this.state)) return;

    const {referee, position, rating, description, image } = this.state;
    const imageChanged = typeof image === 'object';

    const reviews = {
      review1: this.props.review,
      review2: {
        referee: referee.trim(),
        position: position.trim(),
        rating,
        description: description.trim(),
        image
      }
    };

    const data = new FormData();
    data.append('reviews', JSON.stringify(reviews));
    data.append('changed', imageChanged);
    if (imageChanged) data.append('file', image);

    /** Update review in database */
    request({
      url: '/updateReview',
      method: 'PUT',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}`, },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully edited ${referee}'s review.` });
        location.href = `/reviews`;
      }
    });
  }

  render(){

    const { title, operation } = this.props;

    return (
      <ReviewForm
        heading={title}
        entity={this.state}
        handlers={handlers(this)}

        confirmText={operation === 'add' ? 'Submit' : 'Update'}
        confirmFunc={operation === 'add' ? this.submitReview : this.updateReview}
        cancelFunc={() => Router.push('/reviews')}

        metaTitle={title}
        metaUrl={`/${operation}`} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(ReviewCrud);