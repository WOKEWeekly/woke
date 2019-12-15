import React, { Component} from 'react';
import { connect } from 'react-redux';

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
      image: ''
    };
  }

  componentDidMount() {
    this.setState({...this.props.review})
  }

  buildRequest = () => {
    const { referee, position, rating, description, image } = this.state;
    const { operation } = this.props;
    
    const review = {
      referee: referee.trim(),
      position: position.trim(),
      rating,
      description: description.trim(),
      image
    };

    let data;

    if (operation === 'add'){
      data = JSON.stringify({
        review,
        changed: image !== ''
      });
    } else {
      data = JSON.stringify({
        review1: this.props.review,
        review2: review,
        changed: image !== null && image !== '' && !image.startsWith("v")
      });
    }

    return data;
  }

  /** POST review to the server */
  submitReview = () => {
    if (!isValidReview(this.state)) return;
    const data = this.buildRequest();

    /** Add review to database */
    request({
      url:'/addReview',
      method: 'POST',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added the review by ${this.state.referee}.` });
        location.href = '/reviews';
      }
    });
  }

  /** Update review on server */
  updateReview = () => {
    if (!isValidReview(this.state)) return;
    const data = this.buildRequest();

    /** Update review in database */
    request({
      url: '/updateReview',
      method: 'PUT',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}`, },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully edited ${this.state.referee}'s review.` });
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
        cancelFunc={() => location.href = '/reviews'}

        operation={operation}

        metaTitle={title}
        metaUrl={`/${operation}`} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(ReviewCrud);