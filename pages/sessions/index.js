import React, { Component, PureComponent } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import Router from 'next/router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveSessionSort, saveSessionView } from '~/reducers/actions';

import { AddButton, DropdownButton, RadioButtonGroup } from '~/components/button.js';
import Cover from '~/components/cover.js';
import { Icon } from '~/components/icon.js';
import { Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';

import { formatDate } from '~/constants/date.js';
import CLEARANCES from '~/constants/clearances.js';

import Meta from '~/partials/meta.js';
import css from '~/styles/sessions.scss';


class Sessions extends Component {
  constructor(props){
    super(props);
    this.state = {
      sessions: [],
      isLoaded: false,
      view: props.session.view,
      sort: props.session.sort,
    }
  }

  /** Get sessions on mount */
  componentDidMount() {
    this.getSessions();
  }

  /** Get all sessions */
  getSessions = () => {
    fetch('/getSessions', {
      method: 'GET',
      headers: {
        'Authorization': 'authorized',
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(sessions => {
      this.setState({
        sessions: sessions,
        isLoaded: true
      });

      this.sortSessions(this.state.sort);
    })
    .catch(error => console.error(error));
  }

  sortSessions = (sort) => {
    const { sessions } = this.state;

    switch(sort){
      case '1':
        sessions.sort(function (a,b) {
          a = a.dateHeld;
          b = b.dateHeld;
          return a < b ? -1 : a > b ? 1 : 0;
        });
        break;
      case '2':
        sessions.sort(function (a,b) {
          a = a.dateHeld;
          b = b.dateHeld;
          return a < b ? 1 : a > b ? -1 : 0;
        });
        break;
    }  

    this.setState({
      sessions: sessions,
      sort: sort
    });
  }

  switchView = (value) => {
    this.setState({ view: value });
    this.props.saveSessionView(value);
  }
  switchSort = (value) => {
    this.props.saveSessionSort(value);
    this.sortSessions(value);
  }

	render(){

    const { isLoaded, sessions, view } = this.state;
    const { user } = this.props;

    const sortItems = ['Sort By Date (Ascending)', 'Sort by Date (Descending)'];
    const radioItems = [
      { label: <div><Icon name={'th-large'} />Grid</div>, value: 'grid' },
      { label: <div><Icon name={'list-ul'} />List</div>, value: 'list' }
    ];

    const SessionCollection = () => {
      if (!isLoaded){
        return <Loader/>;
      } else if (sessions.length === 0) {
        return <Empty message={'No sessions found.'} />;
      } else {
        const items = [];

        for (const [index, item] of sessions.entries()) {
          items.push(<Session key={index} item={item} view={view} />);
        }

        if (view === 'grid'){
          return <div className={css.grid}>{items}</div>;
        } else {
          return <Container className={css.list}>{items}</Container>;
        }
      }
    }

    return (
      <Shader>
        <Meta
					title={'Sessions | #WOKEWeekly'}
					description={'Where we do the magic...'}
					url={'/sessions'} />

        <Spacer gridrows={'auto 1fr auto'}>
          <Cover
            title={'Sessions'}
            subtitle={'Where we do the magic...'}
            image={'sessions-header.jpg'}
            height={200}
            backgroundPosition={'0 -70px'} />

          <SessionCollection/>

          <BottomToolbar>
            {user.clearance >= CLEARANCES.ACTIONS.CRUD_TOPICS ?
            <AddButton
              title={'Add Session'}
              mobileTitle={'Add'}
              onClick={() => Router.push('/sessions/add')} /> : null}

            <RadioButtonGroup
              name={'view'}
              items={radioItems}
              defaultValue={view}
              onChange={this.switchView} />
      
            <DropdownButton items={sortItems} onSelect={this.switchSort} />
          </BottomToolbar>
        </Spacer>
      </Shader>
    );
	}
}

class Session extends PureComponent {
  render(){
    const { item, view } = this.props;
    
    if (view === 'grid'){
      return (
        <Link href={`/session/${item.slug}`}>
          <div className={css.cell}>
            <img
              src={`/static/images/sessions/${item.image}`}
              alt={item.title}
              className={css.image} />
            <div className={css.details}>
              <Title className={css.title}>{item.title}</Title>
              <Subtitle className={css.date}>{formatDate(item.dateHeld, true)}</Subtitle>
            </div>
          </div>
        </Link>
      );
    } else {
      return (
        <Link href={`/session/${item.slug}`}>
          <Row className={css.item}>
            <Col xs={4} className={'p-0'}>
              <img
                src={`/static/images/sessions/${item.image}`}
                alt={item.title}
                className={css.image} />
            </Col>
            <Col xs={8}>
              <div className={css.details}>
                <Title className={css.title}>{item.title}</Title>
                <Subtitle className={css.date}>{formatDate(item.dateHeld, true)}</Subtitle>
                <Divider />
                <Paragraph className={css.description}>{item.description}</Paragraph>
              </div>
            </Col>
          </Row>
        </Link>
      );
    }
    
  }
}

const mapStateToProps = state => ({
  session: state.session,
  user: state.user
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    saveSessionSort,
    saveSessionView
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Sessions);