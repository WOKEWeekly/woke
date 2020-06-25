import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { alert } from 'components/alert.js';
import { AddEntityButton } from 'components/button.js';
import { FemaleSymbol, Icon, MaleSymbol } from 'components/icon.js';
import { Default, Mobile, Shader } from 'components/layout.js';
import { ConfirmModal } from 'components/modal.js';
import Tabler from 'components/tabler';
import { Title } from 'components/text.js';
import { BottomToolbar } from 'components/toolbar.js';
import { Fader } from 'components/transitioner.js';
import CLEARANCES from 'constants/clearances.js';
import { countriesToString } from 'constants/countries.js';
import request from 'constants/request.js';
import css from 'styles/pages/Members.module.scss';

class MemberAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: [],
      isLoaded: false
    };

    if (props.user.clearance < CLEARANCES.ACTIONS.VIEW_TEAM) {
      return (location.href = '/');
    }
  }

  /** Get topics on mount */
  componentDidMount() {
    this.getTeam();
  }

  /** Retrieve all team members */
  getTeam = () => {
    request({
      url: '/api/v1/members',
      method: 'GET',
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: (members) => {
        this.setState({
          members: members,
          isLoaded: true
        });
      }
    });
  };

  render() {
    const { members } = this.state;

    const MemberCollection = () => {

      const items = [];

      for (const [index, item] of members.entries()) {
        items.push(
          <Member key={index} idx={index} item={item} getTeam={this.getTeam} />
        );
      }

      return (
        <React.Fragment>
          <Title className={css.heading}>
            List of #WOKEWeekly Team Members
          </Title>
          <Tabler
            columns={[
              '#',
              'Name',
              // eslint-disable-next-line react/jsx-key
              <Icon name={'venus-mars'} />,
              'Level',
              'Role',
              'Ethnicity',
              'Birthday'
            ]}
            emptyMessage={'No members found.'}
            items={items}
            tableCss={css.grid}
            listCss={css.list}
          />
        </React.Fragment>
      );
    };

    return (
      <React.Fragment>
        <Shader className={css.memberTabler}>
          <MemberCollection />
        </Shader>

        <BottomToolbar>
          <AddEntityButton
            title={'Add Member'}
            onClick={() => (location.href = '/admin/members/add')}
          />
        </BottomToolbar>
      </React.Fragment>
    );
  }
}

class IMember extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...props.item,
      isLoaded: false,
      deleteVisible: false
    };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  /** Go to edit member */
  editMember = (member) => (location.href = `/admin/members/edit/${member.id}`);

  /** Delete member */
  deleteMember = () => {
    const { firstname, lastname } = this.state;
    request({
      url: `/api/v1/members/${this.state.id}`,
      method: 'DELETE',
      body: JSON.stringify(this.state),
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        alert.success(`You've deleted member ${firstname} ${lastname}.`);
        this.closeDelete();
        this.props.getTeam();
      }
    });
  };

  openDelete = () => this.setState({ deleteVisible: true });
  closeDelete = () => this.setState({ deleteVisible: false });

  render() {
    const { deleteVisible } = this.state;
    const { item, idx, countries } = this.props;
    item.demonyms = countriesToString(JSON.parse(item.ethnicity), countries);
    item.fullname = `${item.firstname} ${item.lastname}`;

    const LinkButton = () => {
      if (!item.slug) return null;

      return (
        <button
          className={css.invisible_button}
          onClick={() => (location.href = `/team/${item.slug}`)}>
          <Icon name={'external-link-alt'} />
        </button>
      );
    };

    const GenderSymbol = () => {
      if (item.sex === 'M') {
        return <MaleSymbol />;
      } else if (item.sex === 'F') {
        return <FemaleSymbol />;
      } else {
        return null;
      }
    };

    return (
      <Fader
        key={idx}
        determinant={this.state.isLoaded}
        duration={500 + idx * 100}
        className={css.row}
        postTransitions={'background-color .1s ease'}>
        <Default>
          <span>{idx + 1}</span>
          <span>{item.fullname}</span>
          <span>
            <GenderSymbol />
          </span>
          <span>{item.level}</span>
          <span>{item.role}</span>
          <span>{item.demonyms}</span>
          <span>{zDate.formatDate(item.birthday)}</span>
          <span>
            <LinkButton />
          </span>
          <span>
            <button
              className={css.invisible_button}
              onClick={() => this.editMember(item)}>
              <Icon name={'edit'} />
            </button>
          </span>
          <span>
            <button className={css.invisible_button} onClick={this.openDelete}>
              <Icon name={'trash'} />
            </button>
          </span>
        </Default>
        <Mobile>
          <div>
            <span>
              <Icon name={'user'} />
            </span>
            <span className={css.name}>
              {item.fullname} <GenderSymbol />
            </span>
          </div>
          <div>
            <span>
              <Icon name={'star'} />
            </span>
            <span>{item.level}</span>
          </div>
          <div>
            <span>
              <Icon name={'signature'} />
            </span>
            <span>{item.role}</span>
          </div>
          <div>
            <span>
              <Icon name={'globe-africa'} />
            </span>
            <span>{item.demonyms}</span>
          </div>
          <div>
            <span>
              <Icon name={'birthday-cake'} />
            </span>
            <span>{zDate.formatDate(item.birthday)}</span>
          </div>
          <div className={css.index}>{idx + 1}</div>
          <div className={css.crud}>
            <LinkButton />
            <button
              className={css.invisible_button}
              onClick={() => this.editMember(item)}>
              <Icon name={'edit'} />
            </button>
            <button className={css.invisible_button} onClick={this.openDelete}>
              <Icon name={'trash'} />
            </button>
          </div>
        </Mobile>

        <ConfirmModal
          visible={deleteVisible}
          message={`Are you sure you want to delete member: ${item.fullname}?`}
          confirmFunc={this.deleteMember}
          confirmText={'Delete'}
          close={this.closeDelete}
        />
      </Fader>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  countries: state.countries
});

const Member = connect(mapStateToProps)(IMember);
export default connect(mapStateToProps)(MemberAdmin);
