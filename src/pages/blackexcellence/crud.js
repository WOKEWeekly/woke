import React, { Component} from 'react';
import { connect } from 'react-redux';

import { setAlert } from '~/components/alert.js';

import { formatISODate } from '~/constants/date.js';
import handlers from '~/constants/handlers.js';
import request from '~/constants/request.js';

import { creationDate } from '~/constants/settings.js';
import { isValidCandidate } from '~/constants/validations.js';

import CandidateForm from './form.js';

class CandidateAdd extends Component {
  static async getInitialProps({ query }) {
    return { ...query };
  }

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
      date_written: creationDate
    };
  }

  /** Get latest candidate ID */
  componentDidMount(){
    request({
      url: '/newCandidateID',
      onSuccess: (id) => this.setState({id})
    });

    const { operation, candidate } = this.props;

    if (operation === 'edit'){

      const { birthday, date_written, ethnicity, socials } = candidate;
      const ethnicityArr = JSON.parse(ethnicity);

      /** Populate ethnicity array */
      const ethnicities = {};
      for (let i = 0; i < 4; i++){
        ethnicities[`ethnicity${i+1}`] = ethnicityArr ? ethnicityArr[i] : '';
      }

      this.setState({
        ...candidate,
        socials: JSON.parse(socials),
        birthday: new Date(birthday),
        date_written: new Date(date_written),
        ...ethnicities
      });
    }
  }

  buildRequest = () => {
    const { id, name, occupation, image, birthday, description, socials,
      authorId, date_written } = this.state;
    const { operation } = this.props;

    /** Add ethncities to array */
    const ethnicities = [];
    for (let i = 1; i <= 4; i++){
      if (this.state[`ethnicity${i}`]) ethnicities.push(this.state[`ethnicity${i}`]);
    }
    
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

    let data;

    if (operation === 'add'){
      data = JSON.stringify(candidate);
    } else {
      data = JSON.stringify({
        candidate1: this.props.candidate,
        candidate2: candidate,
        changed: !image.startsWith("v")
      });
    }

    return data;
  }

  /** POST candidate to the server */
  submitCandidate = () => {
    if (!isValidCandidate(this.state)) return;
    const data = this.buildRequest();

    /** Add candidate to database */
    request({
      url:'/addCandidate',
      method: 'POST',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added candidate ${this.state.name}.` });
        location.href = '/blackexcellence';
      }
    });
  }

  /** Update session details */
  updateCandidate = () => {
    if (!isValidCandidate(this.state)) return;
    const data = this.buildRequest();

    /** Update candidate in database */
    request({
      url: '/updateCandidate',
      method: 'PUT',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        const { id, name } = this.state;
        setAlert({ type: 'success', message: `You've successfully edited the details of ${name}.` });
        location.href = `/blackexcellence/candidate/${id}`;
      }
    });
  }

  render(){
    const { title, operation } = this.props;
    return (
      <CandidateForm
        heading={title}
        candidate={this.state}
        handlers={handlers(this)}

        confirmText={operation === 'add' ? 'Submit' : 'Update'}
        confirmFunc={operation === 'add' ? this.submitCandidate : this.updateCandidate}
        cancelFunc={() => location.href = '/blackexcellence'}

        operation={operation}

        metaTitle={title}
        metaUrl={`/${operation}`} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(CandidateAdd);