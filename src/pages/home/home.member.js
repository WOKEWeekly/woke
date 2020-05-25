import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import LazyLoader from 'react-visibility-sensor';

import { Default, Mobile } from '~/components/layout.js';
import {
  Title,
  Subtitle,
  Divider,
  Paragraph,
  VanillaLink
} from '~/components/text.js';
import { Fader } from '~/components/transitioner.js';

import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import { zText } from 'zavid-modules';

import css from '~/styles/pages/Home.module.scss';

export default class RandomMember extends Component {
  constructor() {
    super();
    this.state = {
      member: {},
      inView: false,
      detectViewChange: true
    };
  }

  componentDidMount() {
    this.getRandomMember();
  }

  toggleVisibility = (inView) => {
    this.setState({ inView, detectViewChange: inView === false });
  };

  getRandomMember = () => {
    request({
      url: '/api/v1/members/random',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (member) => {
        member.loaded = true;
        this.setState({ member });
      }
    });
  };

  render() {
    const { member, inView, detectViewChange } = this.state;

    if (member.loaded) {
      member.fullname = `${member.firstname} ${member.lastname}`;
      member.description =
        member.description && member.description.trim().length > 0
          ? member.description
          : 'No description.';
    }

    const isExecutive = member.level === 'Executive';

    const link = `/team/member/${member.slug}`;
    const heading = `Have you met our ${isExecutive ? 'executive' : 'member'}?`;

    return (
      <div className={css.randomMember}>
        <LazyLoader
          onChange={this.toggleVisibility}
          partialVisibility={true}
          active={detectViewChange}>
          <Fader determinant={inView} duration={750}>
            <div className={css.container}>
              <Mobile>
                <Title className={css.heading}>{heading}</Title>
              </Mobile>
              <Row>
                <Col md={4}>
                  {member.image ? (
                    <VanillaLink href={link}>
                      <img
                        src={`${cloudinary.url}/${member.image}`}
                        alt={member.fullname}
                        className={css.image}
                      />
                    </VanillaLink>
                  ) : null}
                </Col>
                <Col md={8}>
                  <Default>
                    <Title className={css.heading}>{heading}</Title>
                  </Default>
                  <div className={css.details}>
                    <Title className={css.title}>{member.fullname}</Title>
                    <Subtitle className={css.subtitle}>{member.role}</Subtitle>
                    <Divider />
                    <Paragraph
                      link={link}
                      moretext={`Read more on ${member.firstname}`}
                      className={css.paragraph}>
                      {zText.truncateText(member.description)}
                    </Paragraph>
                  </div>
                </Col>
              </Row>
            </div>
          </Fader>
        </LazyLoader>
      </div>
    );
  }
}
