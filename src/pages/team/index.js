import React, { useEffect, useState, memo } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import { CloudinaryImage } from '@components/image.js';
import { Cover, Shader, Spacer } from '@components/layout.js';
import { Title, Subtitle, VanillaLink } from '@components/text.js';
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
        <Title className={css.heading}>The Executives</Title>
        <div className={css.memberBlock}>{items}</div>
      </>
    );
  };

  const MembersBlock = () => {
    const items = members.map((member, key) => {
      return <Member key={key} index={key} member={member} />;
    });
    return (
      <>
        <Title className={css.heading}>The Managers &amp; Coordinators</Title>
        <div className={css.memberBlock}>{items}</div>
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
  const className = isExecutive ? css.executiveCell : css.memberCell;

  return (
    <Fader
      determinant={isLoaded}
      duration={750}
      delay={750 + 200 * index}
      className={className}>
      <VanillaLink href={`/team/member/${member.slug}`}>
        <div className={css.memberDetails}>
          <CloudinaryImage
            src={member.image}
            alt={member.firstname}
            lazy={'ms'}
            className={css.memberImage}
          />
          <Title className={css.memberName}>
            {member.firstname} {member.lastname}
          </Title>
          <Subtitle className={css.memberRole}>{member.role}</Subtitle>
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
