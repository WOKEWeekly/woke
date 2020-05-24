/* eslint-disable import/order */
import React from 'react';
import { cloudinary } from '@constants/settings.js';

/**
 * Constants for Cloudinary lazy transformations.
 * Size: s = small, m = medium
 * Shape: s = square, w = wide
 */
export const TRANSFORMATIONS = {
  ss: '/w_400,h_400,c_fill',
  sw: '/w_1280,h_720,c_fill',
  ms: '/w_800,h_800,c_fill',
  mw: '/w_1280,h_720,c_fill'
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
