import React, { Component} from 'react';
import { connect } from 'react-redux';

import { setAlert } from '~/components/alert.js';

import { formatISODate } from '~/constants/date.js';
import handlers from '~/constants/handlers.js';
import request from '~/constants/request.js';
import { isValidMember } from '~/constants/validations.js';

import { generateSlug, generateMemberFilename } from '~/private/file.js';

import MemberForm from './form.js';

class MemberEdit extends Component {
  static async getInitialProps({ query }) {
    return { member: query.member };
  }

  constructor(props) {
    super(props);

    const { id, firstname, lastname, role, level, image, birthday, description, ethnicity, socials, verified } = this.props.member;
    const ethnicities = JSON.parse(ethnicity);

    const isExecutive = level === 'Executive';
    const verified = verfied === 1;

    this.state = {
      id, firstname, lastname, level, role, description, image, verified,
      imageChanged: false,
      birthday: new Date(birthday),
      ethnicity1: ethnicities ? ethnicities[0] : '',
      ethnicity2: ethnicities ? ethnicities[1] : '',
      ethnicity3: ethnicities ? ethnicities[2] : '',
      ethnicity4: ethnicities ? ethnicities[3] : '',
      socials: JSON.parse(socials),
      backPath: !verified ? `/team` : isExecutive ? `/executives/${slug}` : `/team/member/${slug}`
    };
  }

  /** Update session details */
  updateMember = () => {
    if (!isValidMember(this.state)) return;
    
    const { firstname, lastname, role, level, image, birthday, description, socials,
      ethnicity1, ethnicity2, ethnicity3, ethnicity4, imageChanged, verified, backPath } = this.state;


    // TODO: Generate these on server, this should be tackled while testing Team
    /** Generate slugs and filenames from name and data */
    let slug = generateSlug(`${firstname} ${lastname}`);
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
        slug: verified ? slug : null,
        image: filename,
        birthday: formatISODate(birthday),
        description: description,
        ethnicity: JSON.stringify(ethnicities),
        socials: JSON.stringify(socials),
        verified: verified
      }
    };

    const data = new FormData();
    data.append('members', JSON.stringify(members));
    data.append('changed', imageChanged);
    imageChanged && data.append('file', image, filename);

    /** Update member in database */
    request({
      url: '/updateMember',
      method: 'PUT',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}`, },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully edited the details of ${firstname} ${lastname}.` });
        location.href = backPath;
      }
    });
  }

  render(){
    return (
      <MemberForm
        heading={'Edit Team Member'}
        member={this.state}
        handlers={handlers(this)}

        confirmText={'Update'}
        confirmFunc={this.updateMember}
        cancelFunc={() => location.href = backPath}

        metaTitle={'Edit Team Member'}
        metaUrl={'/edit'} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(MemberEdit);