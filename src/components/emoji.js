import { Emoji } from 'emoji-mart';
import React from 'react';
import { connect } from 'react-redux';

import { getISOCode } from '@constants/countries.js';

const mapStateToProps = (state) => ({
  countries: state.countries
});

export const CountryFlags = connect(mapStateToProps)(
  ({ ethnicities = [], countries, size = 16, className }) => {
    ethnicities = JSON.parse(ethnicities);
    const CountryEmojis = () => {
      return ethnicities.map((ethnicity, key) => {
        const iso = getISOCode(ethnicity, countries).toLowerCase();
        return <Emoji key={key} emoji={`flag-${iso}`} size={size} />;
      });
    };
    return (
      <span className={className}>
        <CountryEmojis />
      </span>
    );
  }
);
