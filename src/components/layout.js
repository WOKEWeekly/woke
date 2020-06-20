import classNames from 'classnames';
import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import Responsive from 'react-responsive';

import { Fader } from 'components/transitioner.js';

import { cloudinary } from 'constants/settings.js';

import css from 'styles/components/Layout.module.scss';

export const isSmallDevice = () => {
  return window.matchMedia('(max-width: 576px)').matches;
};

class ICover extends Component {
  constructor() {
    super();
    this.state = {
      imageLoaded: false,
      imageSrc: ''
    };
  }

  componentDidMount() {
    const image = new Image();
    image.src = `${cloudinary.url}/public/bg/${this.props.image}`;
    image.onload = () =>
      this.setState({ imageLoaded: true, imageSrc: image.src });
  }

  render() {
    const {
      backgroundPosition,
      height,
      title,
      subtitle,
      imageTitle,
      theme
    } = this.props;
    const { imageLoaded, imageSrc } = this.state;

    const classes = classNames(css[`cover-${theme}`], this.props.className);

    return (
      <Fader determinant={imageLoaded} duration={1000}>
        <Container
          fluid={true}
          className={classes}
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundPosition: backgroundPosition,
            minHeight: height
          }}>
          <div className={css.coverText}>
            <Fader determinant={imageLoaded} duration={500} delay={250}>
              {imageTitle || <div className={css.coverTitle}>{title}</div>}
            </Fader>
            <Fader determinant={imageLoaded} duration={500} delay={750}>
              <div className={css.coverSubtitle}>{subtitle}</div>
            </Fader>
          </div>
        </Container>
      </Fader>
    );
  }
}

export class Partitioner extends Component {
  render() {
    return (
      <Container {...this.props} className={css.partitioner}>
        {this.props.children}
      </Container>
    );
  }
}

export class Shader extends Component {
  render() {
    return (
      <div
        {...this.props}
        style={{
          backgroundColor: 'rgba(0, 0, 0, .5)',
          width: '100%'
        }}>
        {this.props.children}
      </div>
    );
  }
}

export class Spacer extends Component {
  render() {
    return (
      <div
        {...this.props}
        style={{
          display: 'grid',
          height: '100%',
          gridTemplateRows: this.props.gridrows || '1fr auto'
        }}>
        {this.props.children}
      </div>
    );
  }
}

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

const mapStateToProps = (state) => ({
  theme: state.theme
});

export const Cover = connect(mapStateToProps)(ICover);
