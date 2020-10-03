import classnames from 'classnames';
import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import Responsive from 'react-responsive';

import { Fader } from 'components/transitioner.js';
import { cloudinary } from 'constants/settings.js';
import css from 'styles/components/Layout.module.scss';

export const isSmallDevice = () => {
  if (!window) return false;
  return window.matchMedia('(max-width: 576px)').matches;
};

/**
 * The cover image component.
 * @param {object} props - The component props.
 * @param {string} props.image - The image source.
 * @param {string} props.height - The CSS minimum height value.
 * @param {string} [props.backgroundPosition] - The CSS background position override value.
 * @param {string} [props.className] - The corresponding CSS class.
 * @param {Image} [props.imageTitle] - An image to be displayed in place of cover title text.
 * @param {number} [props.imageVersion] - The Cloudinary version number of the image.
 * @param {string} [props.subtitle] - The Cloudinary version number of the image.
 * @param {string} [props.title] - The Cloudinary version number of the image.
 * @returns {React.Component} The component.
 */
export const Cover = ({
  image: imageToLoad,
  height,
  backgroundPosition,
  className,
  imageTitle,
  imageVersion,
  subtitle,
  title
}) => {
  const [isLoaded, setLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const theme = useSelector(({ theme }) => theme);

  useEffect(() => {
    const version = imageVersion ? `/v${imageVersion}` : '';
    const image = new Image();
    image.src = `${cloudinary.url}${version}/public/bg/${imageToLoad}`;
    image.onload = () => {
      setImageSrc(image.src);
      setLoaded(true);
    };
  }, [isLoaded]);

  return (
    <Fader determinant={isLoaded} duration={500}>
      <Container
        fluid={true}
        className={classnames(css[`cover-${theme}`], className)}
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundPosition,
          minHeight: height
        }}>
        <div className={css.coverText}>
          <Fader determinant={isLoaded} duration={500} delay={250}>
            {imageTitle || <div className={css.coverTitle}>{title}</div>}
          </Fader>
          <Fader determinant={isLoaded} duration={500} delay={750}>
            <div className={css.coverSubtitle}>{subtitle}</div>
          </Fader>
        </div>
      </Container>
    </Fader>
  );
};

export const Partitioner = (props) => {
  return (
    <Container {...props} className={css.partitioner}>
      {props.children}
    </Container>
  );
};

export const Shader = (props) => {
  return (
    <div
      {...props}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: '100%'
      }}>
      {props.children}
    </div>
  );
};

export const Spacer = (props) => {
  const { gridrows, children } = props;
  return (
    <div
      {...props}
      style={{
        display: 'grid',
        height: '100%',
        gridTemplateRows: gridrows || '1fr auto'
      }}>
      {children}
    </div>
  );
};

export const Desktop = (props) => <Responsive {...props} minWidth={992} />;
export const Tablet = (props) => (
  <Responsive {...props} minWidth={768} maxWidth={991} />
);
export const Mobile = (props) => <Responsive {...props} maxWidth={767} />;
export const Default = (props) => <Responsive {...props} minWidth={768} />;

export const zIndices = {
  topicTopToolbar: 0,
  filterMenu: 1010,
  accountMenu: 1050,
  alerts: 1100
};
