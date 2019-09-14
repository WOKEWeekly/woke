import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';

import CLEARANCES from '~/constants/clearances';
import { formatISODate } from '~/constants/date.js';
import { generateSlug, generateSessionFilename } from '~/constants/file.js';
import request from '~/constants/request.js';
import { isValidSession } from '~/constants/validations.js';

import SessionForm from './form.js';

class SessionEdit extends Component {
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
 
  /** Handle session detail changes */
  handleTitle = (event) => { this.setState({title: event.target.value}); }
  handleDate = (date) => { this.setState({date}); }
  handleDescription = (event) => { this.setState({description: event.target.value}); }
  handleImage = (event) => { this.setState({image: event.target.files[0], imageChanged: true}); }

  /** Update session details */
  updateSession = () => {
    if (!isValidSession(this.state)) return;
    
    const { title, date, description, image, imageChanged } = this.state;

    /** Generate slugs and filenames from title and data */
    let slug = generateSlug(title);
    let filename = imageChanged ? generateSessionFilename(date, slug, image) : image;
    
    const sessions = {
      session1: this.props.session,
      session2: {
        title: title.trim(),
        dateHeld: formatISODate(date),
        description: description.trim(),
        slug: slug,
        image: filename
      }
    };

    const data = new FormData();
    data.append('sessions', JSON.stringify(sessions));
    data.append('changed', imageChanged);
    imageChanged && data.append('file', image, filename);

    /** Update session in database */
    request({
      url: '/updateSession',
      method: 'PUT',
      body: data,
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Path': 'sessions'
      },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully edited the details of ${title}.` });
        location.href = `/session/${slug}`;
      }
    });
  }

  render(){
    return (
      <SessionForm
        heading={'Edit Session'}
        session={this.state}
        handleTitle={this.handleTitle}
        handleDate={this.handleDate}
        handleDescription={this.handleDescription}
        handleImage={this.handleImage}

        confirmText={'Update'}
        confirmFunc={this.updateSession}
        cancelFunc={Router.back}

        metaTitle={'Edit Session'}
        metaUrl={'/edit'}
         />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(SessionEdit);