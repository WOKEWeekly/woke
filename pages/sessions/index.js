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
import { Shader } from '~/components/layout.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import Toolbar from '~/components/toolbar.js';
import { formatDate } from '~/constants/date.js';

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

  /** Render all sessions */
  renderSessions = () => {
    const { sessions, view } = this.state;
    const items = [];

    for (const [index, item] of sessions.entries()) {
      items.push(<Session key={index} item={item} view={view} />);
    }

    return items;
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

    const { isLoaded, view } = this.state;

    /** Render sessions in grid */
    const SessionGrid = () => {
      return <div className={css.grid}>{this.renderSessions()}</div>;
    };

    /** Render sessions in list */
    const SessionList = () => {
      return <Container className={css.list}>
        {this.renderSessions()}
      </Container>;
    };

    const sortItems = ['Sort By Date (Ascending)', 'Sort by Date (Descending)'];
    const radioItems = [
      <div><Icon name={'th-large'} />Grid</div>,
      <div><Icon name={'list-ul'} />List</div>
    ];

    return (
      <Shader>
        <Meta
					title={'Sessions | #WOKEWeekly'}
					description={'Where we do the magic...'}
					url={'/sessions'} />

        <Cover
          title={'Sessions'}
          subtitle={'Where we do the magic...'}
          image={'sessions-header.jpg'}
          height={200} />

        {!isLoaded ? null : view === 1 ? <SessionGrid/> : <SessionList/>}

        <Toolbar>
          <AddButton
            title={'Add Session'}
            onClick={() => Router.push('/sessions/add')} />

          <RadioButtonGroup
            name={'view'}
            items={radioItems}
            defaultValue={view}
            onChange={this.switchView} />
    
          <DropdownButton items={sortItems} onSelect={this.switchSort} />
        </Toolbar>
      </Shader>
    );
	}
}

class Session extends PureComponent {
  render(){
    const { item, view } = this.props;
    
    if (view === 1){
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
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    saveSessionSort,
    saveSessionView
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Sessions);