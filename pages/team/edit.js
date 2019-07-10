import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { alert, setAlert, displayErrorMessage } from '~/components/alert.js';

import CLEARANCES from '~/constants/clearances';
import { formatISODate } from '~/constants/date.js';
import { generateSlug, generateMemberFilename } from '~/constants/file.js';
import { isValidMember } from '~/constants/validations.js';

import MemberForm from './form.js';

class MemberEdit extends Component {
  static async getInitialProps({ query }) {
    return { member: query.member };
  }

  constructor(props) {
    super(props);
    this.state = {
      id: '',
      firstname: '',
      lastname: '',
      level: '',
      role: '',
      birthday: new Date(2000, 0, 1),
      description: '',
      image: '',
      imageChanged: false,
      ethnicity1: '',
      ethnicity2: '',
      ethnicity3: '',
      ethnicity4: '',
      socials: {}
    };
  }

  componentDidMount(){
    const { id, firstname, lastname, role, level, image, birthday, description, ethnicity, socials } = this.props.member;

    this.setState({
      id: id,
      firstname: firstname,
      lastname: lastname,
      fullname: `${firstname} ${lastname}`,
      level: level,
      role: role,
      birthday: new Date(birthday),
      description: description,
      image: image,
      socials: JSON.parse(socials)
    }, () => {
      const ethnicities = JSON.parse(ethnicity);
      if (ethnicities){
        this.setState({
          ethnicity1: ethnicities[0] || '',
          ethnicity2: ethnicities[1] || '',
          ethnicity3: ethnicities[2] || '',
          ethnicity4: ethnicities[3] || '',
        })
      }
    })
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
  updateMember = () => {
    if (!isValidMember(this.state)) return;
    
    const { firstname, lastname, fullname, role, level, image, birthday, description, socials,
      ethnicity1, ethnicity2, ethnicity3, ethnicity4, imageChanged } = this.state;

    /** Generate slugs and filenames from name and data */
    let slug = generateSlug(fullname);
    let filename = imageChanged ? generateMemberFilename(slug, image) : image

    /** Add ethncities to array */
    const ethnicities = [];
    if (ethnicity1) ethnicities.push(ethnicity1);
    if (ethnicity2) ethnicities.push(ethnicity2);
    if (ethnicity3) ethnicities.push(ethnicity3);
    if (ethnicity4) ethnicities.push(ethnicity4);
    
    const members = {
      member1: this.props.member,
      member2: {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        level: level,
        role: role.trim(),
        slug: slug,
        image: filename,
        birthday: formatISODate(birthday),
        description: description,
        ethnicity: JSON.stringify(ethnicities),
        socials: JSON.stringify(socials)
      }
    };

    const data = new FormData();
    data.append('members', JSON.stringify(members));
    data.append('changed', imageChanged);
    imageChanged && data.append('file', image, filename);

    /** Update member in database */
    fetch('/updateMember', {
      method: 'PUT',
      body: data,
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Clearance': CLEARANCES.ACTIONS.CRUD_TEAM,
        'Path': 'team'
      }
    }).then(res => Promise.all([res, res.json()]))
    .then(([status, response]) => { 
      if (status.ok){
        setAlert({ type: 'success', message: `You've successfully edited the details of ${firstname} ${lastname}.` });
        location.href = `/executives/${slug}`;
      } else {
        alert.error(response.message)
      }
    }).catch(error => {
      displayErrorMessage(error);
    });
  }

  render(){
    return (
      <MemberForm
        heading={'Edit Team Member'}
        candidate={this.state}
        handleText={this.handleText}
        handleDate={this.handleDate}
        handleImage={this.handleImage}

        confirmSocials={this.confirmSocials}
        clearSelection={this.clearSelection}

        confirmText={'Update'}
        confirmFunc={this.updateMember}
        cancelFunc={Router.back}

        metaTitle={'Edit Team Member'}
        metaUrl={'/edit'} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(MemberEdit);