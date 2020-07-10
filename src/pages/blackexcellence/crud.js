import React, { Component } from 'react';
import { connect } from 'react-redux';
import { zHandlers, zDate } from 'zavid-modules';

import { setAlert } from 'components/alert.js';
import request from 'constants/request.js';
import { cloudinary } from 'constants/settings.js';
import { isValidCandidate } from 'constants/validations.js';

import CandidateForm from 'partials/pages/candidates/form.js';

class CandidateAdd extends Component {
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor() {
    super();
    this.state = {
      id: null,
      name: '',
      occupation: '',
      birthday: null,
      description: '',
      image: '',
      ethnicity1: '',
      ethnicity2: '',
      ethnicity3: '',
      ethnicity4: '',
      socials: {},
      authorId: null,
      dateWritten: new Date()
    };
  }

  /** Get latest candidate ID */
  componentDidMount() {
    const { operation, candidate } = this.props;
    const isEditOperation = operation === 'edit';

    request({
      url: '/api/v1/candidates/latest',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: ({ id = 0 }) => {
        if (!isEditOperation) {
          id = id + 1;
          this.setState({ id });
        }
      }
    });

    if (isEditOperation) {
      const { birthday, dateWritten, ethnicity, socials } = candidate;
      const ethnicityArr = JSON.parse(ethnicity);

      /** Populate ethnicity array */
      const ethnicities = {};
      for (let i = 0; i < 4; i++) {
        ethnicities[`ethnicity${i + 1}`] = ethnicityArr ? ethnicityArr[i] : '';
      }

      this.setState({
        ...candidate,
        socials: JSON.parse(socials),
        birthday: new Date(birthday),
        dateWritten: new Date(dateWritten),
        ...ethnicities
      });
    }
  }

  /**
   * Build candidate(s) object from state and props.
   * @returns {object} Payload to be submitted to server.
   */
  buildRequest = () => {
    const {
      id,
      name,
      occupation,
      image,
      birthday,
      description,
      socials,
      authorId,
      dateWritten
    } = this.state;
    const { operation } = this.props;

    // Add ethncities to array
    const ethnicities = [];
    for (let i = 1; i <= 4; i++) {
      if (this.state[`ethnicity${i}`])
        ethnicities.push(this.state[`ethnicity${i}`]);
    }

    const candidate = {
      id: id,
      name: name.trim(),
      occupation: occupation.trim(),
      image: image,
      birthday: zDate.formatISODate(birthday),
      ethnicity: JSON.stringify(ethnicities),
      description: description,
      socials: JSON.stringify(socials),
      authorId,
      dateWritten: zDate.formatISODate(dateWritten)
    };

    let data;

    if (operation === 'add') {
      data = JSON.stringify(candidate);
    } else {
      data = JSON.stringify({
        candidate: candidate,
        changed: image !== '' && image !== null && !cloudinary.check(image)
      });
    }

    return data;
  };

  /** Submit the candidate to the server */
  submitCandidate = () => {
    if (!isValidCandidate(this.state)) return;
    const data = this.buildRequest();

    request({
      url: '/api/v1/candidates',
      method: 'POST',
      body: data,
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully added candidate ${this.state.name}.`
        });
        location.href = '/blackexcellence';
      }
    });
  };

  /** Update candidate on server */
  updateCandidate = () => {
    if (!isValidCandidate(this.state)) return;
    const data = this.buildRequest();

    request({
      url: `/api/v1/candidates/${this.props.candidate.id}`,
      method: 'PUT',
      body: data,
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        const { id, name } = this.state;
        setAlert({
          type: 'success',
          message: `You've successfully edited the details of ${name}.`
        });
        location.href = `/blackexcellence/${id}`;
      }
    });
  };

  render() {
    const { title, operation } = this.props;
    const backPath =
      operation === 'add'
        ? '/blackexcellence'
        : `/blackexcellence/${this.state.id}`;
    return (
      <CandidateForm
        heading={title}
        candidate={this.state}
        handlers={zHandlers(this)}
        confirmText={operation === 'add' ? 'Submit' : 'Update'}
        confirmFunc={
          operation === 'add' ? this.submitCandidate : this.updateCandidate
        }
        cancelFunc={() => (location.href = backPath)}
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

export default connect(mapStateToProps)(CandidateAdd);
