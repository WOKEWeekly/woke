import React, { Component} from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';

import CLEARANCES from '~/constants/clearances.js';
import { formatISODate } from '~/constants/date.js';
import { generateSlug, generateMemberFilename } from '~/constants/file.js';
import request from '~/constants/request.js';
import { isValidMember } from '~/constants/validations.js';

import MemberForm from './form.js';

class MemberAdd extends Component {
  constructor() {
    super();
    this.state = {
      firstname: '',
      lastname: '',
      level: '',
      role: '',
      image: '',
      birthday: new Date(2000, 0, 1),
      description: '',
      ethnicity: {},
      socials: {},
      verified: false
    };
  }
 
  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }
  handleDate = (birthday) => { this.setState({birthday}); }
  handleImage = (event) => { this.setState({image: event.target.files[0]}); }

  confirmSocials = (socials) => {this.setState({socials})}
  clearSelection = (name) => { this.setState({[name]: ''})}

  /** POST member to the server */
  submitMember = () => {
    if (!isValidMember(this.state)) return;
    const { firstname, lastname, role, level, image, birthday, description, socials,
      ethnicity1, ethnicity2, ethnicity3, ethnicity4, verified } = this.state;

    /** Generate slugs and filenames from name and data */
    let slug = generateSlug(`${firstname} ${lastname}`);
    let filename = generateMemberFilename(slug, image);

    /** Add ethncities to array */
    const ethnicities = [];
    if (ethnicity1) ethnicities.push(ethnicity1);
    if (ethnicity2) ethnicities.push(ethnicity2);
    if (ethnicity3) ethnicities.push(ethnicity3);
    if (ethnicity4) ethnicities.push(ethnicity4);
    
    const member = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      level: level,
      role: role.trim(),
      slug: slug,
      image: filename,
      birthday: formatISODate(birthday),
      description: description,
      ethnicity: JSON.stringify(ethnicities),
      socials: JSON.stringify(socials),
      verified: verified
    };

    const data = new FormData();
    data.append('member', JSON.stringify(member));
    if (image !== ''){
      data.append('changed', true);
      data.append('file', image, filename);
    }

    /** Add member to database */
    request({
      url:'/addMember',
      method: 'POST',
      body: data,
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Clearance': CLEARANCES.ACTIONS.CRUD_TEAM,
        'Path': 'team'
      },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added member: ${member.firstname} ${member.lastname}.` });
        location.href = '/team';
      }
    });
  }

  render(){
    return (
      <MemberForm
        heading={'Add New Member'}
        member={this.state}
        handleText={this.handleText}
        handleDate={this.handleDate}
        handleImage={this.handleImage}

        confirmSocials={this.confirmSocials}
        clearSelection={this.clearSelection}

        confirmText={'Submit'}
        confirmFunc={this.submitMember}
        cancelFunc={() => Router.push('/team')}

        metaTitle={'Add New Member'}
        metaUrl={'/add'} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(MemberAdd);