import React, { Component, PureComponent } from 'react';
import {Container, Col, Row} from 'react-bootstrap';

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
      return <div className={css.grid}>{this.renderSessions()}</div>;
    };

    return (
      <div>
        <Cover
          title={'Sessions'}
          subtitle={'Where we do the magic...'}
          image={'sessions-header.jpg'}
          height={200} />

        <Container fluid={true} className={css.toolbar}></Container>

        {isLoaded ? <SessionGrid/> : null}
      </div>
    );
	}
}

class Session extends PureComponent {
  render(){
    const { item } = this.props;
    
    return (
      <a href={`/session/${item.slug}`}>
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