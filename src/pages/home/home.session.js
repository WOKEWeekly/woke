import React, { Component } from 'react';
import LazyLoader from 'react-visibility-sensor';
import { zDate, zText } from 'zavid-modules';

import {
  Title,
  Subtitle,
  Divider,
  Paragraph,
  VanillaLink
} from '@components/text.js';
import { Fader } from '@components/transitioner.js';

import request from '@constants/request.js';
import { cloudinary } from '@constants/settings.js';

import css from '@styles/pages/Home.module.scss';

export default class UpcomingSession extends Component {
  constructor() {
    super();
    this.state = {
      session: {},
      inView: false,
      detectViewChange: true
    };
  }

  componentDidMount() {
    this.getUpcomingSession();
  }

  toggleVisibility = (inView) => {
    this.setState({ inView, detectViewChange: inView === false });
  };

  getUpcomingSession = () => {
    request({
      url: '/api/v1/sessions/featured',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (response) => {
        let { session, upcoming } = response;
        session.upcoming = upcoming;
        session.loaded = true;
        this.setState({ session });
      }
    });
  };

  render() {
    const { session, inView, detectViewChange } = this.state;
    const heading = session.upcoming
      ? 'Most Upcoming Session'
      : 'Latest Session';
    const link = `/session/${session.slug}` || '/';
    return (
      <div className={css.upcomingSession}>
        <LazyLoader
          onChange={this.toggleVisibility}
          partialVisibility={true}
          active={detectViewChange}>
          <Fader determinant={inView} duration={750}>
            <Title className={css.heading}>{heading}</Title>
            <div>
              {session.image ? (
                <VanillaLink href={link}>
                  <img
                    src={`${cloudinary.url}/${session.image}`}
                    alt={session.title}
                    className={css.image}
                  />
                </VanillaLink>
              ) : null}
              <div className={css.details}>
                <Title className={css.title}>{session.title}</Title>
                <Subtitle className={css.subtitle}>
                  {zDate.formatDate(session.dateHeld, true)}
                </Subtitle>
                <Divider />
                <Paragraph
                  truncate={45}
                  morelink={link}
                  moretext={'Find out more'}
                  className={css.paragraph}>
                  {session.description}
                </Paragraph>
              </div>
            </div>
          </Fader>
        </LazyLoader>
      </div>
    );
  }
}
