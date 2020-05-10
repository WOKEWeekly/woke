import React, { Component } from 'react';
import { connect } from 'react-redux';
import { zHandlers } from 'zavid-modules';

import { setAlert } from '~/components/alert.js';
import request from '~/constants/request.js';
import { isValidTopic } from '~/constants/validations.js';

import TopicForm from './form.js';

class TopicCrud extends Component {
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor() {
    super();
    this.state = {
      headline: '',
      category: '',
      question: '',
      type: '',
      description: '',
      polarity: false,
      validated: false,
      sensitivity: false,
      option1: '',
      option2: ''
    };
  }

  componentDidMount() {
    this.setState({ ...this.props.topic });
  }

  buildRequest = () => {
    const {
      headline,
      category,
      question,
      type,
      description,
      polarity,
      validated,
      sensitivity,
      option1,
      option2
    } = this.state;

    const topic = {
      headline: headline.trim(),
      category,
      question: question.trim(),
      type,
      description: description ? description.trim() : '',
      polarity,
      validated,
      sensitivity,
      option1: polarity ? option1.trim() : null,
      option2: polarity ? option2.trim() : null
    };

    return topic;
  };

  /** POST session to the server */
  submitTopic = () => {
    if (!isValidTopic(this.state)) return;

    const topic = this.buildRequest();
    topic.userId = this.props.user.id;

    request({
      url: '/api/v1/topics',
      method: 'POST',
      body: JSON.stringify(topic),
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully added "${topic.headline}: ${topic.question}".`
        });
        location.href = '/topics';
      }
    });
  };

  /** Update topic details */
  updateTopic = () => {
    if (!isValidTopic(this.state)) return;

    const topic = this.buildRequest();

    request({
      url: `/api/v1/topics/${this.props.topic.id}`,
      method: 'PUT',
      body: JSON.stringify(topic),
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully edited the details of "${topic.headline}: ${topic.question}".`
        });
        location.href = '/topics';
      }
    });
  };

  render() {
    const { title, operation } = this.props;

    return (
      <TopicForm
        heading={title}
        topic={this.state}
        handlers={zHandlers(this)}
        confirmText={operation === 'add' ? 'Submit' : 'Update'}
        confirmFunc={operation === 'add' ? this.submitTopic : this.updateTopic}
        cancelFunc={() => (location.href = '/topics')}
        metaTitle={title}
        metaUrl={`/${operation}`}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(TopicCrud);
