import React, { Component } from 'react';
import Link from 'next/link';

import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import { Slider } from '~/components/transitioner.js';

import { formatDate } from '~/constants/date.js';
import request from '~/constants/request.js';

import css from '~/styles/home.scss';

export default class UpcomingSession extends Component {
  constructor(){
    super();
    this.state = { session: {} }
  }

  componentDidMount(){
    this.getUpcomingSession();
  }

  getUpcomingSession = () => {
    request({
      url: '/getUpcomingSession',
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: (response) => {
        let { session, upcoming } = response;
        session.upcoming = upcoming;
        session.loaded = true;
        this.setState({session})
      }
    });
  }

  render(){
    const { session } = this.state;
    const heading = session.upcoming ? 'Most Upcoming Session' : 'Latest Session';
    const link = `/session/${session.slug}` || '/';
    return (
      <Slider
        determinant={session.loaded}
        duration={750}
        delay={1000}
        direction={'left'}
        postTransitions={'background-color .3s'}
        className={css.upcomingSession}>
        <Title className={css.heading}>{heading}</Title>
        <div>
          {session.image ?
          <Link href={link}>
            <img
              src={`/static/images/sessions/${session.image}`}
              alt={session.title}
              className={css.image} />
          </Link> : null}
          <div className={css.details}>
            <Title className={css.title}>{session.title}</Title>
            <Subtitle className={css.subtitle}>{formatDate(session.dateHeld, true)}</Subtitle>
            <Divider/>
            <Paragraph
              link={link}
              more={'Find out more'}
              className={css.paragraph}>{truncateText(session.description)}</Paragraph>
          </div>
        </div>
      </Slider>
    )
  }
}