import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { setAlert } from 'components/alert.js';
import handlers from 'constants/handlers.js';
import request from 'constants/request.js';
import { OPERATIONS } from 'constants/strings.js';
import { isValidMember } from 'constants/validations.js';
import MemberForm from 'partials/pages/members/form.js';

const adminPage = '/admin/members';

const MemberCrud = ({ member: currentMember, operation, title, user }) => {
  const [stateMember, setMember] = useState({
    firstname: '',
    lastname: '',
    level: '',
    role: '',
    sex: 'M',
    image: '',
    birthday: null,
    description: '',
    ethnicity: new Array(4).fill(''),
    socials: {},
    verified: false,
    slackId: '',
    trelloId: '',
    isAuthor: false
  });
  const [ethnicities, setEthnicities] = useState(new Array(4).fill(''));
  const [imageHasChanged, setImageChanged] = useState(false);

  const isCreateOperation = operation === OPERATIONS.CREATE;

  useEffect(() => {
    if (!isCreateOperation) {
      const { birthday, ethnicity, socials } = currentMember;

      setMember(
        Object.assign({}, currentMember, {
          socials: JSON.parse(socials),
          birthday: birthday !== null ? new Date(birthday) : null
        })
      );
      setEthnicities(JSON.parse(ethnicity));
    }
  }, []);

  const buildRequest = () => {
    const {
      firstname,
      lastname,
      role,
      level,
      sex,
      image,
      birthday,
      description,
      socials,
      verified,
      slackId,
      trelloId,
      isAuthor
    } = stateMember;

    const member = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      level,
      role: role.trim(),
      sex,
      image,
      birthday: zDate.formatISODate(birthday) || null,
      description: description,
      ethnicity: JSON.stringify(ethnicities),
      socials: JSON.stringify(socials),
      verified,
      slackId: slackId ? slackId.trim() : null,
      trelloId: trelloId ? trelloId.trim() : null,
      isAuthor
    };

    let payload;

    if (isCreateOperation) {
      payload = JSON.stringify(member);
    } else {
      payload = JSON.stringify({
        member: member,
        changed: imageHasChanged
      });
    }

    return payload;
  };

  /** POST member to the server */
  const submitMember = () => {
    if (!isValidMember({ ...stateMember, ethnicities })) return;
    const payload = buildRequest();

    request({
      url: `/api/v1/members`,
      method: 'POST',
      body: payload,
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        const { firstname, lastname } = stateMember;
        setAlert({
          type: 'success',
          message: `You've successfully added member: ${firstname} ${lastname}.`
        });
        location.href = adminPage;
      }
    });
  };

  /** PUT member on server */
  const updateMember = () => {
    if (!isValidMember({ ...stateMember, ethnicities })) return;
    const data = buildRequest();

    request({
      url: `/api/v1/members/${currentMember.id}`,
      method: 'PUT',
      body: data,
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: ({ slug }) => {
        const { firstname, lastname, level } = stateMember;
        const isGuest = level === 'Guest';
        const backPath = !slug
          ? '/admin/members'
          : isGuest
          ? `/author/${slug}`
          : `/team/${slug}`;

        setAlert({
          type: 'success',
          message: `You've successfully edited the details of ${firstname} ${lastname}.`
        });
        location.href = backPath;
      }
    });
  };

  return (
    <MemberForm
      heading={title}
      member={stateMember}
      ethnicities={ethnicities}
      handlers={handlers(setMember, stateMember)}
      setEthnicities={setEthnicities}
      setImageChanged={setImageChanged}
      confirmText={isCreateOperation ? 'Submit' : 'Update'}
      confirmFunc={isCreateOperation ? submitMember : updateMember}
      cancelFunc={() => (location.href = adminPage)}
      operation={operation}
      metaTitle={title}
      metaUrl={`/${operation}`}
    />
  );
};

MemberCrud.getInitialProps = async ({ query }) => {
  return { ...query };
};

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(MemberCrud);
