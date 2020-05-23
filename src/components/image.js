import React from 'react';
import { cloudinary } from 'constants/settings.js';

export const TRANSFORMATIONS = {
  ['small-square']: '/w_400,h_400,c_fill',
  ['small-wide']: '/w_1280,h_720,c_fill',
  ['medium-square']: '/w_800,h_800,c_fill',
  ['medium-wide']: '/w_1280,h_720,c_fill'
};

export const CloudinaryImage = ({ src, lazy = '', alt, title, className }) => {
  if (!src) return null;
  const params = lazy ? TRANSFORMATIONS[lazy] : '';
  return (
    <div className={className}>
      <img
        src={`${cloudinary.url}${params}/${src}`}
        alt={alt}
        title={title}
        style={{ width: '100%' }}
      />
    </div>
  );
};
