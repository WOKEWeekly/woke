import React, { Component, PureComponent } from 'react';
import { Button, ButtonGroup, Dropdown, Container, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Link from 'next/link';

import Cover from '~/components/cover.js';
import { Title, Subtitle, Paragraph } from '~/components/text.js';

import css from '~/styles/sessions.scss';

import { formatDate } from '~/constants/date.js';

export default class Sessions extends Component {
  constructor(){
    super();
    this.state = {
      sessions: [],
      isLoaded: false,
      view: 'list'
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
      /** Sort sessions in descending order of date */
      sessions.sort(function (a,b) {
        a = a.dateHeld;
        b = b.dateHeld;
        return a < b ? 1 : a > b ? -1 : 0
      });
      
      this.setState({
        sessions: sessions,
        isLoaded: true
      });
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
        <Cover
          title={'Sessions'}
          subtitle={'Where we do the magic...'}
          image={'sessions-header.jpg'}
          height={200} />

        {!isLoaded ? null : view === 'grid' ? <SessionGrid/> : <SessionList/>}

        <Toolbar view={view} />
      </div>
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
                <Paragraph className={css.description}>{item.text}</Paragraph>
              </div>
            </Col>
          </Row>
        </Link>
      );
    }
    
  }
}

/** Toolbar for view settings and sorting */
class Toolbar extends Component {
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
    if (this.state.isLoaded){
      return (
        <div className={css.toolbar}>
          <ButtonGroup className={css.view}>
            <Button><Icon icon={'th-large'} />Grid</Button>
            <Button><Icon icon={'list-ul'} />List</Button>
          </ButtonGroup>
  
          <Dropdown as={ButtonGroup} className={css.sort}>
            <Dropdown.Toggle><Icon icon={'sort-amount-down'} />Sort</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="1">Sort by Oldest</Dropdown.Item>
              <Dropdown.Item eventKey="2">Sort by Newest</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )
    } else {
      return null;
    }
    
  }
}

/** Toolbar icons */
class Icon extends Component {
  render(){
    return (
      <FontAwesomeIcon
        icon={['fas', this.props.icon]}
        color={'white'}
        style={{
          marginRight: 5
        }} />
    )
    
  }
}