import React, { Component} from 'react';
import { formatISODate } from '~/constants/date.js';

import SessionForm from './form.js';

export default class SessionAdd extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
      date: new Date(),
      description: ''
    };
  }
 
  handleTitle = (event) => { this.setState({title: event.target.value}); }
  handleDate = (date) => { this.setState({date}); }
  handleDescription = (event) => { this.setState({description: event.target.value}); }

  /** POST session to the server */
  submitSession = () => {
    const { title, date, description } = this.state;

    console.log(title, formatISODate(date), description);
  }

  render(){
    const { title, date, description } = this.state;

    return (
      <SessionForm
        heading={'Add New Session'}
        title={title}
        date={date}
        description={description}
        handleTitle={this.handleTitle}
        handleDate={this.handleDate}
        handleDescription={this.handleDescription}
        confirmText={'Submit'}
         />
    );
  }
}