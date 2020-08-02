import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import LazyLoad from 'react-lazyload';
import VisibilitySensor from 'react-visibility-sensor';

import css from 'styles/components/Layout.module.scss';

/**
 * The component wrapper used to lazy load elements.
 * @param {object} props - The component props.
 * @param {any} props.children - The element to be lazy loaded.
 * @param {Function} props.setInView - The hook to set whether the child
 * element is in the viewport.
 * @param {number} [props.height] - The height of the placeholder. Defaults to 400px.
 * @param {number} [props.offset] - The distance from the edge of the viewport
 * before the element is loaded in. Defaults to -100.
 * @returns {React.Component} The lazy loader component.
 */
export const LazyLoader = ({
  children,
  setInView,
  height = 400,
  offset = -100
}) => {
  const [shouldDetectChange, setDetectivity] = useState(true);

  const toggleVisibility = () => {
    setInView(true);
    setDetectivity(false);
  };

  return (
    <LazyLoad height={height} offset={offset} once>
      <VisibilitySensor
        onChange={toggleVisibility}
        partialVisibility={true}
        active={shouldDetectChange}>
        {children}
      </VisibilitySensor>
    </LazyLoad>
  );
};

export const VisibleLoader = ({
  children,
  setInView
}) => {
  const [shouldDetectChange, setDetectivity] = useState(true);

  const toggleVisibility = () => {
    setInView(true);
    setDetectivity(false);
  };

  return (
    <VisibilitySensor
      onChange={toggleVisibility}
      partialVisibility={true}
      active={shouldDetectChange}>
      {children}
    </VisibilitySensor>
  );
};

export class Loader extends React.Component {
  render() {
    return (
      <div className={css.loader}>
        <Spinner animation="border" className={css.spinner} size={'sm'} />
        <span className={css.spinner}>Loading...</span>
      </div>
    );
  }
}

export class LoaderIcon extends React.Component {
  render() {
    return (
      <div className={css.loader}>
        <Spinner animation="border" className={css.spinner} size={'lg'} />
      </div>
    );
  }
}

export class Empty extends React.Component {
  render() {
    return (
      <div className={css.loader}>
        <span className={css.spinner}>{this.props.message}</span>
      </div>
    );
  }
}
