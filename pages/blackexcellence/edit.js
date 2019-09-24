import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';

import { formatISODate } from '~/constants/date.js';
import { generateSlug, generateCandidateFilename } from '~/private/file.js';
import request from '~/constants/request.js';
import { isValidCandidate } from '~/constants/validations.js';

import CandidateForm from './form.js';

class CandidateEdit extends Component {
  static async getInitialProps({ query }) {
    return { candidate: query.candidate };
  }

  constructor(props) {
    super(props);

    const { id, name, occupation, image, birthday, description, ethnicity, socials, authorId, date_written } = props.candidate;
    const ethnicities = JSON.parse(ethnicity);

    this.state = {
      id,
      name,
      occupation: occupation,
      birthday: new Date(birthday),
      description: description,
      image,
      imageChanged: false,
      ethnicity1: ethnicities ? ethnicities[0] : '',
      ethnicity2: ethnicities ? ethnicities[1] : '',
      ethnicity3: ethnicities ? ethnicities[2] : '',
      ethnicity4: ethnicities ? ethnicities[3] : '',
      socials: JSON.parse(socials),
      authorId,
      date_written
    };
  }

  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }
  handleBirthday = (birthday) => { this.setState({birthday}); }
  handleDateWritten = (date_written) => { this.setState({date_written}); }
  handleImage = (event) => { this.setState({image: event.target.files[0], imageChanged: true}); }
  confirmSocials = (socials) => {this.setState({socials})}

  clearSelection = (name) => { this.setState({[name]: ''})}

  /** Update session details */
  updateCandidate = () => {
    if (!isValidCandidate(this.state)) return;
    
    const { id, name, occupation, image, birthday, description, socials,
      ethnicity1, ethnicity2, ethnicity3, ethnicity4, imageChanged, authorId, date_written } = this.state;

    /** Add ethncities to array */
    const ethnicities = [];
    if (ethnicity1) ethnicities.push(ethnicity1);
    if (ethnicity2) ethnicities.push(ethnicity2);
    if (ethnicity3) ethnicities.push(ethnicity3);
    if (ethnicity4) ethnicities.push(ethnicity4);
    
    const candidates = {
      candidate1: this.props.candidate,
      candidate2: {
        id,
        name: name.trim(),
        occupation: occupation.trim(),
        image,
        birthday: formatISODate(birthday),
        ethnicity: JSON.stringify(ethnicities),
        description: description,
        socials: JSON.stringify(socials),
        authorId,
        date_written: formatISODate(date_written)
      }
    };

    const data = new FormData();
    data.append('candidates', JSON.stringify(candidates));
    data.append('changed', imageChanged);
    if (imageChanged) data.append('file', image);

    /** Update candidate in database */
    request({
      url: '/updateCandidate',
      method: 'PUT',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully edited the details of ${name}.` });
        location.href = `/blackexcellence/candidate/${id}`;
      }
    });
  }

  render(){
    return (
      <CandidateForm
        heading={'Edit Candidate'}
        candidate={this.state}
        handleText={this.handleText}
        handleBirthday={this.handleBirthday}
        handleDateWritten={this.handleDateWritten}
        handleImage={this.handleImage}

        confirmSocials={this.confirmSocials}
        clearSelection={this.clearSelection}

        confirmText={'Update'}
        confirmFunc={this.updateCandidate}
        cancelFunc={Router.back}

        metaTitle={'Edit Candidate'}
        metaUrl={'/edit'} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(CandidateEdit);