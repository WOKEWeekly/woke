import { Emoji } from 'emoji-mart';
import React from 'react';
import { useSelector } from 'react-redux';

import { getISOCode } from 'constants/countries.js';

export const CountryFlags = ({ ethnicities, size = 16, className }) => {
  const countries = useSelector(({ countries }) => countries);

  try {
    ethnicities = JSON.parse(ethnicities);
  } catch {
    ethnicities = [];
  }

  return (
    <span className={className}>
      {ethnicities.map((ethnicity, key) => {
        const code = getISOCode(ethnicity, countries);
        const iso = code ? code.toLowerCase() : '';
        return <Emoji key={key} emoji={`flag-${iso}`} size={size} />;
      })}
    </span>
  );
};
