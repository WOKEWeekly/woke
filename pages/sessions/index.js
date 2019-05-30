import React, { Component, PureComponent } from 'react';
import { Button, Container, Col, Dropdown, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Link from 'next/link';

import Cover from '~/components/cover.js';
import Icon from '~/components/icon.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import Toolbar from '~/components/toolbar.js';
import { formatDate } from '~/constants/date.js';

import Meta from '~/partials/meta.js';
import css from '~/styles/sessions.scss';


export default class Sessions extends Component {
  constructor(){
    super();
    this.state = {
      sessions: [],
      isLoaded: false,
      view: 1,
      sort: '2',
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

  switchView = (value) => { this.setState({ view: value }); }

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

    return (
      <div>
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
          <Link href={'/sessions/add'}>
            <Button variant="dark">
              <Icon name={'plus'} />Add Session
            </Button>
          </Link>

          <ToggleButtonGroup
            className={css.view}
            type={'radio'}
            name={'view'}
            defaultValue={1}
            onChange={this.switchView}>
            <ToggleButton variant="dark" value={1}><Icon name={'th-large'} />Grid</ToggleButton>
            <ToggleButton variant="dark" value={2}><Icon name={'list-ul'} />List</ToggleButton>
          </ToggleButtonGroup>
    
          <Dropdown className={css.sort} onSelect={this.sortSessions}>
            <Dropdown.Toggle variant="dark"><Icon name={'sort-amount-down'} />Sort</Dropdown.Toggle>
            <Dropdown.Menu onSelect={this.switchSort}>
              <Dropdown.Item eventKey={1}>Sort Ascending</Dropdown.Item>
              <Dropdown.Item eventKey={2}>Sort Descending</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Toolbar>
      </div>
    );
	}
}

class Session extends PureComponent {
  render(){
    const { item, view } = this.props;
    
    if (view === 1){
      return (
        <Link href={`/sessions/${item.slug}`}>
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
        <Link href={`/sessions/${item.slug}`}>
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
                <Paragraph className={css.description}>{item.text}</Paragraph>
              </div>
            </Col>
          </Row>
        </Link>
      );
    }
    
  }
}