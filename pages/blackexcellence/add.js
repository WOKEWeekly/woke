import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';

import { formatISODate } from '~/constants/date.js';
import handlers from '~/constants/handlers.js';
import request from '~/constants/request.js';
import { isValidCandidate } from '~/constants/validations.js';

import CandidateForm from './form.js';

class CandidateAdd extends Component {
  constructor() {
    super();
    this.state = {
      id: 0,
      name: '',
      occupation: '',
      birthday: new Date(2000, 0, 1),
      description: '',
      image: '',
      ethnicity1: '',
      ethnicity2: '',
      ethnicity3: '',
      ethnicity4: '',
      socials: {},
      authorId: 0,
      date_written: new Date(2000, 0, 1)
    };
  }

  /** Get latest candidate ID */
  componentDidMount(){
    request({ url: '/newCandidateID', onSuccess: (id) => this.setState({id}) })
  }

  // confirmSocials = (socials) => {this.setState({socials})}
  // clearSelection = (name) => { this.setState({[name]: ''})}

  /** POST candidate to the server */
  submitCandidate = () => {
    if (!isValidCandidate(this.state)) return;
    const { id, name, occupation, image, birthday, description, socials,
    ethnicity1, ethnicity2, ethnicity3, ethnicity4, authorId, date_written } = this.state;
    /** Add ethncities to array */
    const ethnicities = [];
    if (ethnicity1) ethnicities.push(ethnicity1);
    if (ethnicity2) ethnicities.push(ethnicity2);
    if (ethnicity3) ethnicities.push(ethnicity3);
    if (ethnicity4) ethnicities.push(ethnicity4);
    
    const candidate = {
      id: id,
      name: name.trim(),
      occupation: occupation.trim(),
      image: image,
      birthday: formatISODate(birthday),
      ethnicity: JSON.stringify(ethnicities),
      description: description,
      socials: JSON.stringify(socials),
      authorId,
      date_written: formatISODate(date_written)
    };

    const data = new FormData();
    data.append('candidate', JSON.stringify(candidate));
    data.append('changed', 'true');
    data.append('file', image);

    /** Add candidate to database */
    request({
      url:'/addCandidate',
      method: 'POST',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added candidate ${candidate.name}.` });
        location.href = '/blackexcellence';
      }
    });
  }

  render(){

    return (
      <CandidateForm
        heading={'Add New Candidate'}
        candidate={this.state}
        handlers={handlers(this)}

        confirmText={'Submit'}
        confirmFunc={this.submitCandidate}
        cancelFunc={() => Router.push('/blackexcellence')}

        metaTitle={'Add New Candidate'}
        metaUrl={'/add'} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(CandidateAdd);