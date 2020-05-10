import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setAlert } from '~/components/alert.js';

import { zDate, zHandlers } from 'zavid-modules';
import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';
import { isValidSession } from '~/constants/validations.js';

import SessionForm from './form.js';

class SessionCrud extends Component {
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor() {
    super();
    this.state = {
      id: 0,
      title: '',
      dateHeld: null,
      timeHeld: null,
      description: '',
      image: ''
    };
  }

  componentDidMount() {
    this.setState({ ...this.props.session });
  }

  /** POST session to the server */
  submitSession = () => {
    if (!isValidSession(this.state)) return;

    const { title, dateHeld, timeHeld, description, image } = this.state;

    const session = {
      title: title.trim(),
      dateHeld: zDate.formatISODate(dateHeld),
      timeHeld: zDate.formatISOTime(timeHeld, false),
      description: description.trim(),
      image: image
    };

    request({
      url: '/api/v1/sessions',
      method: 'POST',
      body: JSON.stringify(session),
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully added: ${session.title}.`
        });
        location.href = '/sessions';
      }
    });
  };

  /** Update session details */
  updateSession = () => {
    if (!isValidSession(this.state)) return;

    const { id, title, dateHeld, timeHeld, description, image } = this.state;

    const data = JSON.stringify({
      session: {
        title: title.trim(),
        dateHeld: zDate.formatISODate(dateHeld),
        timeHeld: zDate.formatISOTime(timeHeld, false),
        description: description.trim(),
        image: image
      },
      changed: image !== '' && image !== null && !cloudinary.check(image)
    });

    request({
      url: `/api/v1/sessions/${id}`,
      method: 'PUT',
      body: data,
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: ({ slug }) => {
        setAlert({
          type: 'success',
          message: `You've successfully edited the details of ${title}.`
        });
        location.href = `/session/${slug}`;
      }
    });
  };

  render() {
    const { title, operation } = this.props;
    return (
      <SessionForm
        heading={title}
        session={this.state}
        handlers={zHandlers(this)}
        confirmText={operation === 'add' ? 'Submit' : 'Update'}
        confirmFunc={
          operation === 'add' ? this.submitSession : this.updateSession
        }
        cancelFunc={() => (location.href = '/sessions')}
        operation={operation}
        metaTitle={title}
        metaUrl={`/${operation}`}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(SessionCrud);
