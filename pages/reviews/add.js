import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';

import request from '~/constants/request.js';
import { isValidReview } from '~/constants/validations.js';

import ReviewForm from './form.js';

class ReviewAdd extends Component {
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
 
  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }
  handleImage = (event) => { this.setState({image: event.target.files[0]}); }
  handleRatingChange = (e) => {
    const rating = parseInt(e.currentTarget.value)
    this.setState({ rating });
  }

  /** POST review to the server */
  submitReview = () => {
    if (!isValidReview(this.state)) return;
    const review = this.state;

    const data = new FormData();
    data.append('review', JSON.stringify(review));
    if (review.image !== null){
      data.append('changed', true);
      data.append('file', review.image);
    }

    /** Add review to database */
    request({
      url:'/addReview',
      method: 'POST',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added the review by ${review.referee}.` });
        location.href = '/reviews';
      }
    });
  }

  render(){
    return (
      <ReviewForm
        heading={'Add New Review'}
        entity={this.state}
        handleText={this.handleText}
        handleImage={this.handleImage}
        handleRatingChange={this.handleRatingChange}

        confirmSocials={this.confirmSocials}
        clearSelection={this.clearSelection}

        confirmText={'Submit'}
        confirmFunc={this.submitReview}
        cancelFunc={() => Router.push('/reviews')}

        metaTitle={'Add New Review'}
        metaUrl={'/add'} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(ReviewAdd);