import React, { Component } from 'react';
import Link from 'next/link';
import LazyLoader from 'react-visibility-sensor';

import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import { Fader } from '~/components/transitioner.js';

import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import { zDate } from 'zavid-modules';

import css from '~/styles/pages/Home.module.scss';

export default class UpcomingSession extends Component {
  constructor(){
    super();
    this.state = {
      session: {},
      inView: false,
      detectViewChange: true
    }
  }

  componentDidMount(){
    this.getUpcomingSession();
  }

  toggleVisibility = (inView) => {
    this.setState({ inView, detectViewChange: inView === false });
  }

  getUpcomingSession = () => {
    request({
      url: '/api/v1/sessions/featured',
      method: 'GET',
      headers: { 'Authorization': process.env.AUTH_KEY },
      onSuccess: (response) => {
        let { session, upcoming } = response;
        session.upcoming = upcoming;
        session.loaded = true;
        this.setState({session})
      }
    });
  }

  render(){
    const { session, inView, detectViewChange } = this.state;
    const heading = session.upcoming ? 'Most Upcoming Session' : 'Latest Session';
    const link = `/session/${session.slug}` || '/';
    return (
      <div className={css.upcomingSession}>
        <LazyLoader onChange={this.toggleVisibility} partialVisibility={true} active={detectViewChange}>
          <Fader determinant={inView} duration={750}>
            <Title className={css.heading}>{heading}</Title>
            <div>
              {session.image ?
              <Link href={link}>
                <img
                  src={`${cloudinary.url}/${session.image}`}
                  alt={session.title}
                  className={css.image} />
              </Link> : null}
              <div className={css.details}>
                <Title className={css.title}>{session.title}</Title>
                <Subtitle className={css.subtitle}>{zDate.formatDate(session.dateHeld, true)}</Subtitle>
                <Divider/>
                <Paragraph
                  link={link}
                  moretext={'Find out more'}
                  className={css.paragraph}>{truncateText(session.description)}</Paragraph>
              </div>
            </div>
          </Fader>
        </LazyLoader>
      </div>
    )
  }
}