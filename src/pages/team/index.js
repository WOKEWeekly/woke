import React, { useEffect, useState, memo } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import { CountryFlags } from '@components/emoji.js';
import { CloudinaryImage } from '@components/image.js';
import { Cover, Shader, Spacer, Mobile } from '@components/layout.js';
import { Title, Subtitle, Paragraph, VanillaLink } from '@components/text.js';
import { Fader } from '@components/transitioner.js';

import request from '@constants/request.js';

import css from '@styles/pages/Members.module.scss';

const heading = 'Meet The Team';
const description =
  'Explore the profiles of the very members who make #WOKE what it is today.';

export const Team = () => {
  const [isLoaded, setLoaded] = useState(false);
  const [members, setMembers] = useState([]);
  const [executives, setExecutives] = useState([]);

  useEffect(() => {
    request({
      url: '/api/v1/members/verified',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (response) => {
        let members = [];
        let executives = [];
        response.forEach((member) => {
          if (member.level === 'Executive') {
            executives.push(member);
          } else {
            members.push(member);
          }
        });
        setExecutives(executives);
        setMembers(members);
        setLoaded(true);
      }
    });
  }, [isLoaded]);

  const ExecutivesBlock = () => {
    const items = executives.map((executive, key) => {
      return <Member key={key} index={key} member={executive} />;
    });
    return (
      <>
        <Title className={css['heading']}>The Executives</Title>
        <div className={css['member-block']}>{items}</div>
      </>
    );
  };

  const MembersBlock = () => {
    const items = members.map((member, key) => {
      return <Member key={key} index={key} member={member} />;
    });
    return (
      <>
        <Title className={css['heading']}>
          The Managers &amp; Coordinators
        </Title>
        <div className={css['member-block']}>{items}</div>
      </>
    );
  };

  return (
    <Shader>
      <Spacer gridrows={'auto 1fr auto'}>
        <Cover
          title={heading}
          subtitle={description}
          image={'header-team.jpg'}
          height={200}
          backgroundPosition={'center'}
        />

        <Container>
          <Fader determinant={isLoaded} duration={750} delay={500}>
            <ExecutivesBlock />
            <MembersBlock />
          </Fader>
        </Container>
      </Spacer>
    </Shader>
  );
};

const Member = memo(({ member, index }) => {
  const [isLoaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  const isExecutive = member.level === 'Executive';
  const className = css[isExecutive ? 'executive-cell' : 'member-cell'];

  return (
    <Fader
      determinant={isLoaded}
      duration={750}
      delay={750 + 200 * index}
      className={className}>
      <VanillaLink href={`/team/${member.slug}`}>
        <div className={css['member-flex']}>
          <CloudinaryImage
            src={member.image}
            alt={member.firstname}
            lazy={'ms'}
            className={css['member-image']}
          />
          <div className={css['member-details']}>
            <Title className={css['member-name']}>
              {member.firstname} {member.lastname}{' '}
              <CountryFlags
                ethnicities={member.ethnicity}
                size={22}
                className={css['member-flags']}
              />
            </Title>
            <Subtitle className={css['member-role']}>{member.role}</Subtitle>
            <Mobile>
              <Paragraph
                truncate={15}
                className={css['member-excerpt']}
                moretext={`Read about ${member.firstname}`}
                morelink={`/team/${member.slug}`}
                moreclass={css['member-readmore']}>
                {member.description}
              </Paragraph>
            </Mobile>
          </div>
        </div>
      </VanillaLink>
    </Fader>
  );
});

Team.getInitialProps = async ({ query }) => {
  return { article: query.article };
};

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(Team);
