import React, { Component} from 'react';
import Router from 'next/router';
import { connect } from 'react-redux';

import { alert, setAlert, displayErrorMessage } from '~/components/alert.js';

import CLEARANCES from '~/constants/clearances';
import { formatISODate } from '~/constants/date.js';
import { generateSlug, generateSessionFilename } from '~/constants/file.js';
import { isValidSession } from '~/constants/validations.js';

import SessionForm from './form.js';

class SessionAdd extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
      date: new Date(),
      description: '',
      image: null
    };
  }
 
  /** Handle session detail changes */
  handleTitle = (event) => { this.setState({title: event.target.value}); }
  handleDate = (date) => { this.setState({date}); }
  handleDescription = (event) => { this.setState({description: event.target.value}); }
  handleImage = (event) => { this.setState({image: event.target.files[0]}); }

  /** POST session to the server */
  submitSession = () => {
    if (!isValidSession(this.state)) return;
    
    const { title, date, description, image } = this.state;

    /** Generate slugs and filenames from title and data */
    let slug = generateSlug(title);
    let filename = generateSessionFilename(date, slug, image);
    
    const session = {
      title: title.trim(),
      dateHeld: formatISODate(date),
      description: description.trim(),
      slug: slug,
      image: filename
    };

    const data = new FormData();
    data.append('session', JSON.stringify(session));
    data.append('changed', true);
    data.append('file', image, filename);

    /** Add session to database */
    fetch('/addSession', {
      method: 'POST',
      body: data,
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Clearance': CLEARANCES.ACTIONS.CRUD_SESSIONS,
        'Path': 'sessions'
      }
    })
    .then(res => Promise.all([res, res.json()]))
    .then(([status, response]) => { 
      if (status.ok){
        setAlert({ type: 'success', message: `You've successfully added: ${session.title}.` });
        location.href = '/sessions';
      } else {
        alert.error(response.message)
      }
    }).catch(error => {
      displayErrorMessage(error);
    });
  }

  render(){
    return (
      <SessionForm
        heading={'Add New Session'}
        session={this.state}
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

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(SessionAdd);