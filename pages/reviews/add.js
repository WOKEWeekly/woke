import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';

import { generateSlug, generateReviewFilename } from '~/private/file.js';
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
      image: ''
    };
  }
 
  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }
  handleImage = (event) => { this.setState({image: event.target.files[0]}); }

  /** POST review to the server */
  submitReview = () => {
    if (!isValidReview(this.state)) return;
    const { referee, position, rating, description, image } = this.state;

    /** Generate slugs and filenames from name and data */
    let slug = generateSlug(referee);
    let filename = generateReviewFilename(slug, image);
    
    const review = {
      referee, position, rating, description,
      image: filename
    };

    const data = new FormData();
    data.append('review', JSON.stringify(review));
    if (image !== ''){
      data.append('changed', true);
      data.append('file', image, filename);
    }

    /** Add review to database */
    request({
      url:'/addReview',
      method: 'POST',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added review by ${review.referee}.` });
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