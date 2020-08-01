import React, { useState, useEffect } from 'react';
import { zDate } from 'zavid-modules';

import { LazyLoader } from 'components/loader.js';
import {
  Title,
  Subtitle,
  Divider,
  Paragraph,
  VanillaLink
} from 'components/text.js';
import { Fader } from 'components/transitioner.js';
import request from 'constants/request.js';
import { cloudinary } from 'constants/settings.js';
import css from 'styles/pages/Home.module.scss';

const FeaturedSession = () => {
  const [session, setSession] = useState([]);
  const [isLoaded, setLoaded] = useState(false);
  const [isInView, setInView] = useState(false);

  useEffect(() => {
    getFeaturedSession();
  }, [isLoaded]);

  const getFeaturedSession = () => {
    request({
      url: '/api/v1/sessions/featured',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: ({ session, upcoming }) => {
        session.upcoming = upcoming;
        setSession(session);
        setLoaded(true);
      }
    });
  };

  const heading = session.upcoming ? 'Most Upcoming Session' : 'Latest Session';
  const link = `/sessions/${session.slug}`;
  return (
    <div className={css['home-featured-session']}>
      <LazyLoader setInView={setInView}>
        <Fader determinant={isInView} duration={750}>
          <Title className={css['featured-advert-heading']}>{heading}</Title>
          <div>
            <SessionImage session={session} link={link} />
            <SessionPreview session={session} link={link} />
          </div>
        </Fader>
      </LazyLoader>
    </div>
  );
};

const SessionImage = ({ session, link }) => {
  if (!session.image) return null;
  return (
    <VanillaLink href={link}>
      <img
        src={`${cloudinary.url}/${session.image}`}
        alt={session.title}
        className={css['featured-advert-image']}
      />
    </VanillaLink>
  );
};

const SessionPreview = ({session, link}) => {
  return (
    <div className={css['featured-advert-details']}>
      <Title className={css['featured-advert-title']}>{session.title}</Title>
      <Subtitle className={css['featured-advert-subtitle']}>
        {zDate.formatDate(session.dateHeld, true)}
      </Subtitle>
      <Divider />
      <Paragraph
        truncate={45}
        morelink={link}
        moretext={'Find out more'}
        className={css['featured-advert-paragraph']}>
        {session.description}
      </Paragraph>
    </div>
  );
};

export default FeaturedSession;
