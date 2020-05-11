import React, { Component } from 'react';
import { connect } from 'react-redux';
import LazyLoader from 'react-visibility-sensor';

import {
  Title,
  Subtitle,
  Divider,
  Paragraph,
  VanillaLink
} from '~/components/text.js';
import { Fader } from '~/components/transitioner.js';

import { countriesToString } from '~/constants/countries.js';
import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import { zDate, zText } from 'zavid-modules';

import css from '~/styles/pages/Home.module.scss';

class RandomCandidate extends Component {
  constructor() {
    super();
    this.state = {
      candidate: {},
      inView: false,
      detectViewChange: true
    };
  }

  componentDidMount() {
    this.getRandomCandidate();
  }

  toggleVisibility = (inView) => {
    this.setState({ inView, detectViewChange: inView === false });
  };

  getRandomCandidate = () => {
    request({
      url: '/api/v1/candidates/random',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (candidate) => {
        if (candidate) {
          candidate.loaded = true;
          this.setState({ candidate });
        }
      }
    });
  };

  render() {
    const { candidate, inView, detectViewChange } = this.state;
    const { countries } = this.props;

    if (candidate.name && candidate.loaded) {
      candidate.firstname = candidate.name.split(' ')[0];
      candidate.age = zDate.calculateAge(candidate.birthday);
      candidate.description =
        candidate.description.trim().length > 0
          ? candidate.description
          : 'No description.';
      candidate.demonyms = countriesToString(
        JSON.parse(candidate.ethnicity),
        countries
      );
    }

    const link = `/blackexcellence/candidate/${candidate.id}`;

    return (
      <div className={css.randomCandidate}>
        <LazyLoader
          onChange={this.toggleVisibility}
          partialVisibility={true}
          active={detectViewChange}>
          <Fader determinant={inView} duration={750}>
            <Title className={css.heading}>Check out our candidate:</Title>
            <div>
              {candidate.image ? (
                <VanillaLink href={link}>
                  <img
                    src={`${cloudinary.url}/${candidate.image}`}
                    alt={candidate.name}
                    className={css.image}
                  />
                </VanillaLink>
              ) : null}
              <div className={css.details}>
                <Title className={css.title}>{candidate.name}</Title>
                <Subtitle className={css.subtitle}>
                  {candidate.age} • {candidate.occupation} •{' '}
                  {candidate.demonyms}
                </Subtitle>
                <Divider />
                <Paragraph
                  link={link}
                  moretext={`Discover more on ${candidate.firstname}`}
                  className={css.paragraph}>
                  {zText.truncateText(candidate.description)}
                </Paragraph>
              </div>
            </div>
          </Fader>
        </LazyLoader>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  countries: state.countries
});

export default connect(mapStateToProps)(RandomCandidate);
