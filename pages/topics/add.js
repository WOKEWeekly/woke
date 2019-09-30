import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';
import handlers from '~/constants/handlers.js';
import request from '~/constants/request.js';
import { isValidTopic } from '~/constants/validations.js';

import TopicForm from './form.js';

class TopicAdd extends Component {
  constructor() {
    super();
    this.state = {
      headline: '',
      category: '',
      question: '',
      type: '',
      description: '',
      polarity: false,
      option1: '',
      option2: ''
    };
  }

  /** POST session to the server */
  submitTopic = () => {

    if (!isValidTopic(this.state)) return;
    const { headline, category, question, type, description, polarity, option1, option2 } = this.state;
    
    const topic = {
      headline: headline.trim(),
      category: category,
      question: question.trim(),
      type: type,
      description: description.trim(),
      polarity: polarity,
      option1: polarity ? option1.trim() : null,
      option2: polarity ? option2.trim() : null,
      userId: this.props.user.id
    };

    /** Add topic to database */
    request({
      url: '/addTopic',
      method: 'POST',
      body: JSON.stringify(topic),
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Content-Type': 'application/json'
      },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added "${headline}: ${question}".` });
        location.href = '/topics';
      }
    });
  }

  render(){
    return (
      <TopicForm
        heading={'Add New Topic'}
        topic={this.state}
        handlers={handlers(this)}

        confirmText={'Submit'}
        confirmFunc={this.submitTopic}
        cancelFunc={() => Router.push('/topics')}

        metaTitle={'Add New Topic'}
        metaUrl={'/add'} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(TopicAdd);