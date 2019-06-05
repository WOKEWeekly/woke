import React, { Component} from 'react';
import Router from 'next/router';
import { formatISODate } from '~/constants/date.js';
import { generateSlug, getExtension } from '~/constants/file.js';
import { isValidSession } from '~/constants/validations.js';

import SessionForm from './form.js';

export default class SessionAdd extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
      date: new Date(),
      description: '',
      image: null
    };
  }
 
  handleTitle = (event) => { this.setState({title: event.target.value}); }
  handleDate = (date) => { this.setState({date}); }
  handleDescription = (event) => { this.setState({description: event.target.value}); }
  handleImage = (event) => { this.setState({image: event.target.files[0]}); }

  /** POST session to the server */
  submitSession = () => {
    if (!isValidSession(this.state)) return;
    
    const { title, date, description, image } = this.state;

    let slug = generateSlug(title);
    let filename = `${formatISODate(date)}-${slug}.${getExtension(image)}`;
    
    const session = {
      title: title,
      dateHeld: formatISODate(date),
      description: description,
      slug: slug,
      image: filename
    };

    fetch('/addSession', {
      method: 'POST',
      body: JSON.stringify(session),
      headers: {
        'Authorization': 'authorized',
        'Content-Type': 'application/json',
      }
    }).then(res => {
      if (res.ok){
        const formData = new FormData()
        formData.append('file', image, filename);

        /** Upload file to /sessions directory */
        fetch('/uploadSession', {
          method: 'POST',
          body: formData
        })
        .then(() => Router.push('/sessions'))
        .catch(error => console.error(error));
      }
    }).catch(error => console.error(error));
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
        handleImage={this.handleImage}

        confirmText={'Submit'}
        confirmFunc={this.submitSession}
        cancelFunc={() => Router.push('/sessions')}

        metaTitle={'Add New Session'}
        metaUrl={'/add'} />
    );
  }
}