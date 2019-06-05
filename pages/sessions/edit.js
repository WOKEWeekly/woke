import React, { Component} from 'react';
import Router from 'next/router';
import { formatISODate } from '~/constants/date.js';

import SessionForm from './form.js';

export default class SessionEdit extends Component {
  static async getInitialProps({ query }) {
    return { session: query.session };
  }

  constructor(props) {
    super(props);
    this.state = {
      title: props.session.title,
      date: new Date(props.session.dateHeld),
      description: props.session.description,

      image: props.session.image,
      imageChanged: false
    };
  }
 
  handleTitle = (event) => { this.setState({title: event.target.value}); }
  handleDate = (date) => { this.setState({date}); }
  handleDescription = (event) => { this.setState({description: event.target.value}); }
  handleImage = (event) => { this.setState({image: event.target.files[0]}); }

  /** Update session details */
  updateSession = () => {
    const { title, date, description } = this.state;

    console.log(title, formatISODate(date), description);
  }

  render(){
    const { title, date, description } = this.state;

    return (
      <SessionForm
        heading={'Edit Session'}
        title={title}
        date={date}
        description={description}
        handleTitle={this.handleTitle}
        handleDate={this.handleDate}
        handleDescription={this.handleDescription}

        confirmText={'Update'}
        cancelFunc={Router.back}

        metaTitle={'Edit Session'}
        metaUrl={'/edit'}
         />
    );
  }
}