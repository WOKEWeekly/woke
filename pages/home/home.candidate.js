import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import { Slider } from '~/components/transitioner.js';

import { countriesToString } from '~/constants/countries.js';
import { calculateAge } from '~/constants/date.js';
import request from '~/constants/request.js';

import css from '~/styles/home.scss';

class _RandomCandidate extends Component {
  constructor(){
    super();
    this.state = { candidate: {} }
  }

  componentDidMount(){
    this.getRandomCandidate();
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
    const { candidate } = this.state;
    const { countries } = this.props;

    if (candidate.loaded){
      candidate.firstname = candidate.name.split(' ')[0];
      candidate.age = calculateAge(candidate.birthday);
      candidate.description = candidate.description.trim().length > 0 ? candidate.description : 'No description.';
      candidate.demonyms = countriesToString(JSON.parse(candidate.ethnicity), countries);
    }

    const link = `/blackexcellence/candidate/${candidate.id}`;

    return (
      <Slider
        determinant={candidate.loaded}
        duration={750}
        delay={1000}
        direction={'right'}
        postTransitions={'background-color .3s'}
        className={css.randomCandidate}>
        <Title className={css.heading}>Check out our candidate:</Title>
        <div>
          {candidate.image ?
          <Link href={link}>
            <img
              src={`/static/images/blackexcellence/${candidate.image}`}
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
      </Slider>
    )
  }
}
const mapStateToProps = state => ({
  countries: state.countries
});

export default connect(mapStateToProps)(_RandomCandidate);