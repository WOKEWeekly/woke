import React, { useState, useEffect } from 'react';
import { zDate } from 'zavid-modules';

import { CountryFlags } from 'components/emoji.js';
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

const RandomCandidate = () => {
  const [candidate, setCandidate] = useState([]);
  const [isLoaded, setLoaded] = useState(false);
  const [isInView, setInView] = useState(false);

  useEffect(() => {
    getRandomCandidate();
  }, [isLoaded]);

  const getRandomCandidate = () => {
    request({
      url: '/api/v1/candidates/random',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (candidate) => {
        candidate.firstname = candidate.name.split(' ')[0];
        candidate.age = zDate.calculateAge(candidate.birthday);
        try {
          candidate.description =
            candidate.description.trim() || 'No description.';
        } catch (ex) {
          candidate.description = 'No description.';
        }
        setCandidate(candidate);
        setLoaded(true);
      }
    });
  };

  const link = `/blackexcellence/${candidate.id}`;

  return (
    <div className={css['home-random-candidate']}>
      <LazyLoader setInView={setInView}>
        <Fader determinant={isInView} duration={750}>
          <Title className={css['featured-advert-heading']}>
            Check out our candidate:
          </Title>
          <div>
            <CandidateImage candidate={candidate} link={link} />
            <CandidatePreview candidate={candidate} link={link} />
          </div>
        </Fader>
      </LazyLoader>
    </div>
  );
};

const CandidateImage = ({ candidate, link }) => {
  if (!candidate.image) return null;
  return (
    <VanillaLink href={link}>
      <img
        src={`${cloudinary.url}/${candidate.image}`}
        alt={candidate.name}
        className={css['featured-advert-image']}
      />
    </VanillaLink>
  );
};

const CandidatePreview = ({ candidate, link }) => {
  return (
    <div className={css['featured-advert-details']}>
      <Title className={css['featured-advert-title']}>{candidate.name}</Title>
      <Subtitle className={css['featured-advert-subtitle']}>
        {candidate.age} • {candidate.occupation}
        <CountryFlags
          ethnicities={candidate.ethnicity}
          size={25}
          className={css['home-country-flags']}
        />
      </Subtitle>
      <Divider />
      <Paragraph
        truncate={45}
        morelink={link}
        moretext={`Discover more on ${candidate.firstname}`}
        className={css['featured-advert-paragraph']}>
        {candidate.description}
      </Paragraph>
    </div>
  );
};

export default RandomCandidate;
