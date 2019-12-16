import React, { Component } from 'react';
import {Col, Row} from 'react-bootstrap';
import Link from 'next/link';
import LazyLoader from 'react-visibility-sensor';

import { Default, Mobile } from '~/components/layout.js';
import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import { Fader } from '~/components/transitioner.js';

import request from '~/constants/request.js';
import { cdn } from '~/constants/settings.js';

import css from '~/styles/home.scss';

export default class RandomMember extends Component{
  constructor(){
    super();
    this.state = {
      member: {},
      inView: false,
      detectViewChange: true
    }
  }

  componentDidMount(){
    this.getRandomMember();
  }

  toggleVisibility = (inView) => {
    this.setState({ inView, detectViewChange: inView === false });
  }

  getRandomMember = () => {
    request({
      url: '/getRandomMember',
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: (member) => {
        member.loaded = true;
        this.setState({member})
      }
    });
  }

  render(){
    const { member, inView, detectViewChange } = this.state;

    if (member.loaded){
      member.fullname = `${member.firstname} ${member.lastname}`;
      member.description = member.description && member.description.trim().length > 0 ? member.description : 'No description.';
    }

    const isExecutive = member.level === 'Executive';

    const link = isExecutive ? `/executives/${member.slug}` : `/team/member/${member.slug}`;
    const heading = `Have you met our ${isExecutive ? 'executive' : 'member'}?`

    return (
      <div className={css.randomMember}>
        <LazyLoader onChange={this.toggleVisibility} partialVisibility={true} active={detectViewChange}>
          <Fader determinant={inView} duration={750}>
            <div className={css.container}>
            <Mobile><Title className={css.heading}>{heading}</Title></Mobile>
              <Row>
                <Col md={4}>
                  {member.image ?
                  <Link href={link}>
                    <img
                      src={`${cdn}/${member.image}`}
                      alt={member.fullname}
                      className={css.image} />
                  </Link> : null}
                </Col>
                <Col md={8}>
                <Default><Title className={css.heading}>{heading}</Title></Default>
                  <div className={css.details}>
                    <Title className={css.title}>{member.fullname}</Title>
                    <Subtitle className={css.subtitle}>{member.role}</Subtitle>
                    <Divider/>
                    <Paragraph
                      link={link}
                      more={`Read more on ${member.firstname}`}
                      className={css.paragraph}>{truncateText(member.description)}</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>
          </Fader>
        </LazyLoader>
      </div>
    )
  }
}