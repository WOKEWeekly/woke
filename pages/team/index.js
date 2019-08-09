import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';

import { Shader, Default, Mobile } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { Fader } from '~/components/transitioner.js';
import { Title } from '~/components/text.js';

import { countriesToString } from '~/constants/countries.js';
import { formatDate } from '~/constants/date.js';
import CLEARANCES from '~/constants/clearances.js';

import css from '~/styles/team.scss';


class Team extends Component {
  constructor(props){
    super(props);
    this.state = {
      members: [],
      isLoaded: false
    };

    if (props.user.clearance < CLEARANCES.ACTIONS.VIEW_TEAM){
      return location.href = '/';
    }
  }

  /** Get topics on mount */
  componentDidMount() {
    this.getTeam();
  }

  /** Retrieve all team members */
  getTeam = () => {
    fetch('/getTeam', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Clearance': CLEARANCES.ACTIONS.VIEW_TEAM,
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(members => {
      this.setState({
        members: members,
        isLoaded: true
      });
    })
    .catch(error => console.error(error));
  }

	render(){

    const { isLoaded, members } = this.state;
    const { user } = this.props;

    if (!isLoaded){
      return <Loader/>;
    } else if (members.length === 0) {
      return <Empty message={'No members found.'} />;
    }

    const items = [];

    for (const [index, item] of members.entries()) {
      items.push(<Member key={index} idx={index} item={item} />);
    }

    const MemberTable = () => {
      const headerRow = (
        <div className={css.header}>
          <span>No.</span>
          <span>Name</span>
          <span>Level</span>
          <span>Role</span>
          <span>Ethnicity</span>
          <span>Birthday</span>
        </div>
      )

      return (
        <div className={css.grid}>
          {headerRow}
          {items}
        </div>
      );
    };

    const MemberList = () => {
      return <div className={css.list}>{items}</div>;
    };

    const MemberCollection = () => {
      return (
        <React.Fragment>
          <Default><MemberTable/></Default>
          <Mobile><MemberList/></Mobile>
        </React.Fragment>
      )
    }

    return (
      <Shader className={css.container}>
        <Title className={css.heading}>List of #WOKEWeekly Team Members</Title>
        <MemberCollection/>
      </Shader>
    );
	}
}

class _Member extends PureComponent {
  constructor(){
    super();
    this.state = {
      isLoaded: false
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

  render(){
    const { item, idx, countries } = this.props;
    item.demonyms = countriesToString(JSON.parse(item.ethnicity), countries);

    return (
      <Fader
        key={idx}
        determinant={this.state.isLoaded}
        duration={500 + (idx * 100)}
        className={css.row}
        postTransitions={'background-color .1s ease'}>
        <Default>
          <span>{idx+1}</span>
          <span>{item.firstname} {item.lastname}</span>
          <span>{item.level}</span>
          <span>{item.role}</span>
          <span>{item.demonyms}</span>
          <span>{formatDate(item.birthday)}</span>
        </Default>
        <Mobile>
          <Title className={css.name}>{item.firstname} {item.lastname}</Title>
          <div>{item.level}</div>
          <div>{item.role}</div>
          <div>{item.demonyms}</div>
          <div>{formatDate(item.birthday)}</div>
          <div className={css.index}>{idx+1}</div>
        </Mobile>
        
      </Fader>
    ); 
  }
}

const mapStateToProps = state => ({
  user: state.user,
  countries: state.countries
});

const Member = connect(mapStateToProps)(_Member);
export default connect(mapStateToProps)(Team);