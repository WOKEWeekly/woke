import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { alert } from 'components/alert.js';
import { AddEntityButton } from 'components/button.js';
import { FemaleSymbol, Icon, MaleSymbol } from 'components/icon.js';
import { Shader } from 'components/layout.js';
import { ConfirmModal } from 'components/modal.js';
import Tabler from 'components/tabler';
import { BottomToolbar } from 'components/toolbar.js';
import CLEARANCES from 'constants/clearances.js';
import { countriesToString } from 'constants/countries.js';
import request from 'constants/request.js';
import { determineMemberSlug } from 'partials/pages/members/helpers';
import css from 'styles/pages/Members.module.scss';

/**
 * The admin page for members.
 * @param {object} props - The component properties.
 * @param {object} props.user - The current user.
 * @returns {React.Component} The component.
 */
const MemberAdmin = (props) => {
  const { user } = props;

  if (user.clearance < CLEARANCES.ACTIONS.MEMBERS.VIEW) {
    return (location.href = '/');
  }

  return (
    <>
      <Shader>
        <MemberCollection {...props} />
      </Shader>

      <BottomToolbar>
        <AddEntityButton
          title={'Add Member'}
          onClick={() => (location.href = '/admin/members/add')}
        />
      </BottomToolbar>
    </>
  );
};

/**
 * The collection of members.
 * @param {object} props - The component properties.
 * @param {object[]} props.countries - The list of countries.
 * @param {object} props.user - The current user.
 * @returns {React.Component} The component.
 */
const MemberCollection = ({ user, countries }) => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState({});
  const [isLoaded, setLoaded] = useState(false);
  const [deleteModalVisible, setDeleteModalVisibility] = useState(false);

  useEffect(() => getMembers(), [isLoaded]);

  /** Retrieve a list of all members */
  const getMembers = () => {
    request({
      url: '/api/v1/members',
      method: 'GET',
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: (members) => {
        setMembers(members);
        setLoaded(true);
      }
    });
  };

  /**
   * Delete a member from the server.
   */
  const deleteMember = () => {
    const { id, fullname } = selectedMember;
    request({
      url: `/api/v1/members/${id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        alert.success(`You've deleted the member: ${fullname}.`);
        setDeleteModalVisibility(false);
        getMembers();
      }
    });
  };

  return (
    <>
      <Tabler
        heading={'List of #WOKEWeekly Team Members'}
        itemsLoaded={isLoaded}
        emptyMessage={'No members found.'}
        columns={[
          ['#', { centerAlign: true }],
          [<Icon name={'camera'} key={0} />, { centerAlign: true }],
          ['Name'],
          [<Icon name={'venus-mars'} key={0} />, { centerAlign: true }],
          ['Level'],
          ['Role'],
          ['Ethnicity'],
          ['Birthday']
        ]}
        items={members.map((member, key) => {
          member.demonyms = countriesToString(
            JSON.parse(member.ethnicity),
            countries
          );
          member.fullname = `${member.firstname} ${member.lastname}`;
          return [
            [key + 1, { type: 'index' }],
            [
              member.image,
              {
                type: 'image',
                imageOptions: { css: css['member-admin-image'], lazy: 'ss' }
              }
            ],
            [member.fullname, { icon: 'user' }],
            [
              <GenderSymbol member={member} key={key} />,
              { icon: 'venus-mars' }
            ],
            [member.level, { icon: 'star' }],
            [member.role, { icon: 'signature', hideIfEmpty: true }],
            [member.demonyms, { icon: 'globe-africa', hideIfEmpty: true }],
            [
              zDate.formatDate(member.birthday),
              { icon: 'birthday-cake', hideIfEmpty: true }
            ],
            [<LinkButton member={member} key={key} />, { type: 'button' }],
            [<EditButton id={member.id} key={key} />, { type: 'button' }],
            [
              <DeleteButton
                member={member}
                setDeleteModalVisibility={setDeleteModalVisibility}
                setSelectedMember={setSelectedMember}
                key={key}
              />,
              { type: 'button' }
            ]
          ];
        })}
        distribution={'4% 6% 1fr 4% 0.6fr 1.3fr 1fr 0.8fr 4% 4% 4%'}
      />
      <ConfirmModal
        visible={deleteModalVisible}
        message={`Are you sure you want to delete member: ${selectedMember.fullname}?`}
        confirmFunc={deleteMember}
        confirmText={'Delete'}
        close={() => setDeleteModalVisibility(false)}
      />
    </>
  );
};

/**
 * The corresponding gender symbol for the member.
 * @param {object} props - The component properties.
 * @param {object} props.member - The member object.
 * @returns {React.Component} The component.
 */
const GenderSymbol = ({ member }) => {
  if (member.sex === 'M') {
    return <MaleSymbol />;
  } else if (member.sex === 'F') {
    return <FemaleSymbol />;
  } else {
    return null;
  }
};

/**
 * Navigate to the verified member's page.
 * @param {object} props - The component properties.
 * @param {object} props.member - The member object.
 * @returns {React.Component} The component.
 */
const LinkButton = ({ member }) => {
  if (!member.slug) return null;

  return (
    <button
      className={css.invisible_button}
      onClick={() => (location.href = determineMemberSlug(member))}>
      <Icon name={'external-link-alt'} />
    </button>
  );
};

/**
 * Navigate to edit a member.
 * @param {object} props - The component properties.
 * @param {number} props.id - The ID of the member.
 * @returns {React.Component} The component.
 */
const EditButton = ({ id }) => {
  const link = `/admin/members/edit/${id}`;
  return (
    <button
      className={css.invisible_button}
      onClick={() => (location.href = link)}>
      <Icon name={'edit'} />
    </button>
  );
};

/**
 * Attempt to delete a member.
 * @param {object} props - The component properties.
 * @param {number} props.member - The member to be deleted.
 * @param {Function} props.setDeleteModalVisibility - The hook for setting modal visibility.
 * @param {Function} props.setSelectedMember - The hook for setting the currently-selected member.
 * @returns {React.Component} The component.
 */
const DeleteButton = ({
  member,
  setDeleteModalVisibility,
  setSelectedMember
}) => {
  const { firstname, lastname } = member;
  return (
    <button
      className={css.invisible_button}
      onClick={() => {
        setDeleteModalVisibility(true);
        setSelectedMember(
          Object.assign({}, member, {
            fullname: `${firstname} ${lastname}`
          })
        );
      }}>
      <Icon name={'trash'} />
    </button>
  );
};

const mapStateToProps = ({ countries, user }) => ({
  countries,
  user
});

export default connect(mapStateToProps)(MemberAdmin);
