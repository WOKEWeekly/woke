import React, { Component} from 'react';
import Router from 'next/router';
import { connect } from 'react-redux';
import { isValidTopic } from '~/constants/validations.js';

import TopicForm from './form.js';

class TopicEdit extends Component {
  static async getInitialProps({ query }) {
    return { topic: query.topic };
  }

  constructor(props) {
    super(props);
    this.state = {
      headline: props.topic.headline,
      category: props.topic.category,
      question: props.topic.question,
      type: props.topic.type,
      description: props.topic.description,
      polarity: props.topic.polarity,
      option1: props.topic.option1,
      option2: props.topic.option2
    };
  }
 
  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value});
  }

  /** Handle radio changes */
  handleRadio = (value, event) => {
    const { name } = event.target;
    this.setState({[name]: value});
  }

  /** Handle checkbox changes */
  handleCheckbox = (value, event) => {
    const { name, checked } = event.target;
    this.setState({[name]: checked})
  }

  /** Update topic details */
  updateTopic = () => {
    if (!isValidTopic(this.state)) return;
    const { headline, category, question, type, description, polarity, option1, option2 } = this.state;
    
    const topics = {
      topic1: this.props.topic,
      topic2: {
        headline: headline.trim(),
        category: category,
        question: question.trim(),
        type: type,
        description: description.trim(),
        polarity: polarity,
        option1: polarity ? option1.trim() : null,
        option2: polarity ? option2.trim() : null
      }
    };

    /** Update topic in database */
    fetch('/updateTopic', {
      method: 'PUT',
      body: JSON.stringify(topics),
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.ok) Router.push(`/topics`);
    }).catch(error => console.error(error));
  }

  render(){
    return (
      <TopicForm
        heading={'Edit Topic'}
        topic={this.state}
        handleText={this.handleText}
        handleRadio={this.handleRadio}
        handleCheckbox={this.handleCheckbox}

        confirmText={'Update'}
        confirmFunc={this.updateTopic}
        cancelFunc={Router.back}

        metaTitle={'Edit Topic'}
        metaUrl={'/edit'}
         />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(TopicEdit);