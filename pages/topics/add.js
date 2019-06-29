import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';
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
    fetch('/addTopic', {
      method: 'POST',
      body: JSON.stringify(topic),
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.ok) Router.push('/topics');
    }).catch(error => console.error(error));
  }

  render(){
    return (
      <TopicForm
        heading={'Add New Topic'}
        topic={this.state}
        handleText={this.handleText}
        handleRadio={this.handleRadio}
        handleCheckbox={this.handleCheckbox}

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