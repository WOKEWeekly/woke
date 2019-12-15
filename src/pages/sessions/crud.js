import React, { Component} from 'react';
import { connect } from 'react-redux';

import { setAlert } from '~/components/alert.js';

import { formatISODate } from '~/constants/date.js';
import handlers from '~/constants/handlers.js';
import { isValidSession } from '~/constants/validations.js';
import request from '~/constants/request.js';

import SessionForm from './form.js';

class SessionCrud extends Component {
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor() {
    super();
    this.state = {
      title: '',
      date: new Date(),
      description: '',
      image: ''
    };
  }

  componentDidMount() {
    this.setState({...this.props.session})
  }

  /** POST session to the server */
  submitSession = () => {
    if (!isValidSession(this.state)) return;
    
    const { title, date, description, image } = this.state;
    
    const data = {
      session: {
        title: title.trim(),
        dateHeld: formatISODate(date),
        description: description.trim(),
        image: image
      },
      changed: image !== ''
    };

    /** Add session to database */
    request({
      url: '/addSession',
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added: ${session.title}.` });
        location.href = '/sessions';
      }
    });
  }

  /** Update session details */
  updateSession = () => {
    if (!isValidSession(this.state)) return;
    
    const { title, date, description, image } = this.state;

    const data = JSON.stringify({
      session1: this.props.session,
      session2: {
        title: title.trim(),
        dateHeld: formatISODate(date),
        description: description.trim(),
        image: image
      },
      changed: image !== null && image !== '' && !image.startsWith("v")
    });

    /** Update session in database */
    request({
      url: '/updateSession',
      method: 'PUT',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}`, },
      onSuccess: ({slug}) => {
        setAlert({ type: 'success', message: `You've successfully edited the details of ${title}.` });
        location.href = `/session/${slug}`;
      }
    });
  }

  render(){
    const { title, operation } = this.props;
    return (
      <SessionForm
        heading={title}
        session={this.state}
        handlers={handlers(this)}

        confirmText={operation === 'add' ? 'Submit' : 'Update'}
        confirmFunc={operation === 'add' ? this.submitSession : this.updateSession}
        cancelFunc={() => location.href = '/sessions'}

        operation={operation}

        metaTitle={title}
        metaUrl={`/${operation}`} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(SessionCrud);