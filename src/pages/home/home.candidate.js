import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';
import LazyLoader from 'react-visibility-sensor';

import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import { Fader } from '~/components/transitioner.js';

import { countriesToString } from '~/constants/countries.js';
import { calculateAge } from '~/constants/date.js';
import request from '~/constants/request.js';
import { cdn } from '~/constants/settings.js';

import css from '~/styles/home.scss';

class _RandomCandidate extends Component {
  constructor(){
    super();
    this.state = {
      candidate: {},
      inView: false,
      detectViewChange: true
    }
  }

  componentDidMount(){
    this.getRandomCandidate();
  }

  toggleVisibility = (inView) => {
    this.setState({ inView, detectViewChange: inView === false });
  }

  getRandomCandidate = () => {
    request({
      url: '/getRandomCandidate',
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: (candidate) => {
        candidate.loaded = true;
        this.setState({candidate})
      }
    });
  }

  render(){
    const { candidate, inView, detectViewChange } = this.state;
    const { countries } = this.props;

    if (candidate.name && candidate.loaded){
      candidate.firstname = candidate.name.split(' ')[0];
      candidate.age = calculateAge(candidate.birthday);
      candidate.description = candidate.description.trim().length > 0 ? candidate.description : 'No description.';
      candidate.demonyms = countriesToString(JSON.parse(candidate.ethnicity), countries);
    }

    const link = `/blackexcellence/candidate/${candidate.id}`;

    return (
      <div className={css.randomCandidate}>
        <LazyLoader onChange={this.toggleVisibility} partialVisibility={true} active={detectViewChange}>
          <Fader determinant={inView} duration={750}>
            <Title className={css.heading}>Check out our candidate:</Title>
            <div>
              {candidate.image ?
              <Link href={link}>
                <img
                  src={`${cdn.url}/${candidate.image}`}
                  alt={candidate.name}
                  className={css.image} />
              </Link> : null}
              <div className={css.details}>
                <Title className={css.title}>{candidate.name}</Title>
                <Subtitle className={css.subtitle}>
                  {candidate.age} • {candidate.occupation} • {candidate.demonyms}
                </Subtitle>
                <Divider/>
                <Paragraph
                  link={link}
                  more={`Discover more on ${candidate.firstname}`}
                  className={css.paragraph}>{truncateText(candidate.description)}</Paragraph>
              </div>
            </div>
          </Fader>
        </LazyLoader>
      </div>
    )
  }
}
const mapStateToProps = state => ({
  countries: state.countries
});

export default connect(mapStateToProps)(_RandomCandidate);