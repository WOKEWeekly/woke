import React, { Component, PureComponent } from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Cover from '~/components/cover.js';
import css from '~/styles/sessions.scss';

import { formatDate } from '~/constants/date.js';

export default class Sessions extends Component {
  constructor(){
    super();
    this.state = {
      sessions: [],
      isLoaded: false
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
    const { sessions } = this.state;
    const items = [];

    for (const [index, item] of sessions.entries()) {
      items.push(<Session key={index} item={item} />);
    }

    return items;
  }

	render(){

    const { isLoaded } = this.state;

    /** Render sessions in grid */
    const SessionGrid = () => {
      return <div className={css.grid}>
      {this.renderSessions()}
      </div>;
    };

    return (
      <div>
        <Cover
          title={'Sessions'}
          subtitle={'Where we do the magic...'}
          image={'sessions-header.jpg'}
          height={200} />

        {isLoaded ? <SessionGrid/> : null}

        <Toolbar />
      </div>
    );
	}
}

class Session extends PureComponent {
  render(){
    const { item } = this.props;
    
    return (
      <a href={`/session/${item.slug}`} style={{textDecoration: 'none'}}>
        <div className={css.cell}>
          <img
            src={`/static/images/sessions/${item.image}`}
            alt={item.title}
            className={css.image} />
          <div className={css.details}>
            <div className={css.title}>{item.title}</div>
            <div className={css.date}>{formatDate(item.dateHeld, true)}</div>
          </div>
        </div>
      </a>
    );
  }
}

/** Toolbar for view settings and sorting */
class Toolbar extends Component {
  render(){
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