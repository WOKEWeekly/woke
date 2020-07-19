import React, { useState, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';

import { CountryFlags } from 'components/emoji.js';
import { Default, Mobile } from 'components/layout.js';
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

const RandomMember = () => {
  const [member, setMember] = useState({});
  const [isLoaded, setLoaded] = useState(false);
  const [isInView, setInView] = useState(false);

  useEffect(() => {
    getRandomMember();
  }, [isLoaded]);

  const getRandomMember = () => {
    request({
      url: '/api/v1/members/random',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (member) => {
        member.fullname = `${member.firstname} ${member.lastname}`;
        try {
          member.description = member.description.trim() || 'No description.';
        } catch (ex) {
          member.description = 'No description.';
        }
        setMember(member);
        setLoaded(true);
      }
    });
  };

  const isExecutive = member.level === 'Executive';

  const link = `/team/${member.slug}`;
  const heading = `Have you met our ${isExecutive ? 'executive' : 'member'}?`;

  const MemberImage = () => {
    if (!member.image) return null;
    return (
      <Col sm={4}>
        <VanillaLink href={link}>
          <img
            src={`${cloudinary.url}/${member.image}`}
            alt={member.fullname}
            className={css['random-member-image']}
          />
        </VanillaLink>
      </Col>
    );
  };

  const MemberPreview = () => {
    return (
      <Col sm={8}>
        <Default>
          <Title className={css['random-member-heading']}>{heading}</Title>
        </Default>
        <div className={css['random-member-details']}>
          <Title className={css['random-member-name']}>{member.fullname}</Title>
          <Subtitle className={css['random-member-role']}>
            <span>{`${member.role} • `}</span>
            <CountryFlags
              ethnicities={member.ethnicity}
              size={25}
              className={css['random-member-flags']}
            />
          </Subtitle>
          <Divider />
          <Paragraph
            truncate={45}
            morelink={link}
            moretext={`Read more on ${member.firstname}`}
            className={css['random-member-preview']}>
            {member.description}
          </Paragraph>
        </div>
      </Col>
    );
  };

  return (
    <div className={css['home-random-member']}>
      <LazyLoader setInView={setInView}>
        <Fader determinant={isInView} duration={750}>
          <div className={css['random-member-container']}>
            <Mobile>
              <Title className={css['random-member-heading']}>{heading}</Title>
            </Mobile>
            <Row>
              <MemberImage />
              <MemberPreview />
            </Row>
          </div>
        </Fader>
      </LazyLoader>
    </div>
  );
};

export default RandomMember;
