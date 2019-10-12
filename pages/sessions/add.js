import React, { Component} from 'react';
import Router from 'next/router';
import { connect } from 'react-redux';

import { setAlert } from '~/components/alert.js';

import { formatISODate } from '~/constants/date.js';
import handlers from '~/constants/handlers.js';
import { isValidSession } from '~/constants/validations.js';
import request from '~/constants/request.js';

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

  /** POST session to the server */
  submitSession = () => {
    if (!isValidSession(this.state)) return;
    
    const { title, date, description, image } = this.state;
    
    const session = {
      title: title.trim(),
      dateHeld: formatISODate(date),
      description: description.trim(),
      image: image
    };

    const data = new FormData();
    data.append('session', JSON.stringify(session));
    data.append('changed', true);
    data.append('file', image);

    /** Add session to database */
    request({
      url: '/addSession',
      method: 'POST',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added: ${session.title}.` });
        location.href = '/sessions';
      }
    });
  }

  render(){
    return (
      <SessionForm
        heading={'Add New Session'}
        session={this.state}
        handlers={handlers(this)}

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