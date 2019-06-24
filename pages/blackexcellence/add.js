import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { formatISODate } from '~/constants/date.js';
import { isValidCandidate } from '~/constants/validations.js';
import CLEARANCES from '~/constants/clearances.js';
import { generateSlug, generateCandidateFilename } from '~/constants/file.js';

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
    };
  }

  /** Get latest candidate ID */
  componentDidMount(){
    fetch('/newCandidateID')
    .then(res => res.json())
    .then(id => this.setState({id}))
    .catch(error => console.error(error));
  }
 
  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }
  handleDate = (birthday) => { this.setState({birthday}); }
  handleImage = (event) => { this.setState({image: event.target.files[0]}); }

  /** POST candidate to the server */
  submitCandidate = () => {
    if (!isValidCandidate(this.state)) return;
    const { id, name, occupation, image, birthday, description,
    ethnicity1, ethnicity2, ethnicity3, ethnicity4 } = this.state;

    /** Generate slugs and filenames from title and data */
    let slug = generateSlug(name);
    let filename = generateCandidateFilename(id, slug, image);

    const ethnicities = [ethnicity1, ethnicity2, ethnicity3, ethnicity4];
    
    const candidate = {
      id: id,
      name: name.trim(),
      occupation: occupation.trim(),
      image: filename,
      birthday: formatISODate(birthday),
      ethnicities: ethnicities,
      description: description
    };

    const data = new FormData();
    data.append('candidate', JSON.stringify(candidate));
    data.append('file', image, filename);

    /** Add candidate to database */
    fetch('/addCandidate', {
      method: 'POST',
      body: data,
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Clearance': CLEARANCES.ACTIONS.CRUD_BLACKEX,
        'Path': 'blackexcellence'
      }
    }).then(res => {
      if (res.ok) Router.push('/blackexcellence');
    }).catch(error => console.error(error));
  }

  render(){
    return (
      <CandidateForm
        heading={'Add New Candidate'}
        candidate={this.state}
        handleText={this.handleText}
        handleDate={this.handleDate}
        handleImage={this.handleImage}

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