import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';

import { formatISODate } from '~/constants/date.js';
import { generateSlug, generateCandidateFilename } from '~/constants/file.js';
import request from '~/constants/request.js';
import { isValidCandidate } from '~/constants/validations.js';

import CandidateForm from './form.js';

class CandidateEdit extends Component {
  static async getInitialProps({ query }) {
    return { candidate: query.candidate };
  }

  constructor(props) {
    super(props);

    const { id, name, occupation, image, birthday, description, ethnicity, socials } = props.candidate;
    const ethnicities = JSON.parse(ethnicity);

    this.state = {
      id: id,
      name: name,
      occupation: occupation,
      birthday: new Date(birthday),
      description: description,
      image: image,
      imageChanged: false,
      ethnicity1: ethnicities ? ethnicities[0] : '',
      ethnicity2: ethnicities ? ethnicities[1] : '',
      ethnicity3: ethnicities ? ethnicities[2] : '',
      ethnicity4: ethnicities ? ethnicities[3] : '',
      socials: JSON.parse(socials)
    };
  }

  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }
  handleDate = (birthday) => { this.setState({birthday}); }
  handleImage = (event) => { this.setState({image: event.target.files[0], imageChanged: true}); }
  confirmSocials = (socials) => {this.setState({socials})}

  clearSelection = (name) => { this.setState({[name]: ''})}

  /** Update session details */
  updateCandidate = () => {
    if (!isValidCandidate(this.state)) return;
    
    const { id, name, occupation, image, birthday, description, socials,
      ethnicity1, ethnicity2, ethnicity3, ethnicity4, imageChanged } = this.state;

    /** Generate slugs and filenames from name and data */
    let slug = generateSlug(name);
    let filename = imageChanged ? generateCandidateFilename(id, slug, image) : image

    /** Add ethncities to array */
    const ethnicities = [];
    if (ethnicity1) ethnicities.push(ethnicity1);
    if (ethnicity2) ethnicities.push(ethnicity2);
    if (ethnicity3) ethnicities.push(ethnicity3);
    if (ethnicity4) ethnicities.push(ethnicity4);
    
    const candidates = {
      candidate1: this.props.candidate,
      candidate2: {
        id: id,
        name: name.trim(),
        occupation: occupation.trim(),
        image: filename,
        birthday: formatISODate(birthday),
        ethnicity: JSON.stringify(ethnicities),
        description: description,
        socials: JSON.stringify(socials)
      }
    };

    const data = new FormData();
    data.append('candidates', JSON.stringify(candidates));
    data.append('changed', imageChanged);
    if (imageChanged) data.append('file', image, filename);

    /** Update candidate in database */
    request({
      url: '/updateCandidate',
      method: 'PUT',
      body: data,
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Path': 'blackexcellence'
      },
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
        handleDate={this.handleDate}
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