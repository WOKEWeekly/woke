import classNames from 'classnames';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { zText } from 'zavid-modules';

import { Icon } from '@components/icon.js';

import css from '@styles/components/Text.module.scss';

/**
 * A title component for headings.
 * @param {string} props - Inherited properties.
 * @param {string} props.className The CSS styling.
 * @returns {React.Component} A title component.
 */
export const Title = ({ children, className }) => {
  const classes = classNames(css.title, className);
  return <div className={classes}>{children}</div>;
};

/**
 * A subtitle component for subheadings.
 * @param {string} props - Inherited properties.
 * @param {string} props.className The CSS styling.
 * @returns {React.Component} A subtitle component.
 */
export const Subtitle = ({ children, className }) => {
  const classes = classNames(css.subtitle, className);
  return <div className={classes}>{children}</div>;
};

/**
 * A paragraph component for a formatted body of text.
 * @param {string} props - Inherited properties from the paragraph component.
 * @param {string} props.children - The text to be formatted.
 * @param {string} props.className - The CSS styling.
 * @param {object} props.substitutions - A map of variable substitutions
 * to be made to the text.
 * @param {string} props.theme - The current theme from the Redux state.
 * @param {string} props.cssOverrides - The CSS styling overrides for the emphasis and section formatting.
 * @param {string} props.link - The hyperlink for the embedded {@link ReadMore} component.
 * @param {string} props.moretext - The text to be formatted.
 * @param {object} props.moreClass - The CSS styling for the embedded {@link ReadMore} component.
 * @returns {React.Component} A formatted paragraph component.
 */
const IParagraph = ({
  children,
  substitutions,
  theme,
  link,
  moretext,
  moreClass,
  className,
  cssOverrides
}) => {
  const classes = classNames(css.paragraph, className);

  children = zText.applySubstitutions(children, substitutions);
  children = zText.formatText(children, {
    css: {
      heading: css.heading,
      subheading: css.subheading,
      image: {
        full: css.fullImage,
        float: css.floatImage
      },
      paragraph: css.body,
      divider: css.divider,
      hyperlink: css[`link-${theme.toLowerCase()}`],
      ...cssOverrides
    }
  });

  const ReadMoreLabel = () => {
    if (!moretext || !link) return null;
    return <ReadMore className={moreClass} link={link} text={moretext} />;
  };

  return (
    <>
      <pre className={classes}>{children}</pre>
      <ReadMoreLabel />
    </>
  );
};

export class QuoteWrapper extends Component {
  render() {
    return (
      <div className={css.quoteWrapper}>
        {/* <div><Icon name={'quote-left'} className={css.quotes} /></div> */}
        <div className={css.quoteLeft}>“</div>
        {this.props.children}
        <div className={css.quoteRight}>”</div>
      </div>
    );
  }
}

export class Divider extends Component {
  render() {
    const classes = classNames(css.divider, this.props.className);
    return <hr className={classes} style={this.props.style} />;
  }
}

export const ReadMore = ({ link, text = 'Read more', className }) => {
  const classes = classNames(css.readmore, className);
  return (
    <VanillaLink href={link}>
      <div className={classes}>
        <Icon name={'external-link-alt'} className={css.linkIcon} />
        {text}
      </div>
    </VanillaLink>
  );
};

export class ExpandText extends Component {
  render() {
    const { text = 'Read more...', onClick } = this.props;
    return (
      <button
        className={css.invisible_button}
        onClick={onClick}
        style={{ padding: 0 }}>
        <div className={css.expandText}>{text}</div>
      </button>
    );
  }
}

export class VanillaLink extends Component {
  render() {
    const { href, children } = this.props;
    return (
      <a className={css.noUnderline} href={href}>
        {children}
      </a>
    );
  }
}

const mapStateToProps = (state) => ({
  theme: state.theme
});

export const Paragraph = connect(mapStateToProps)(IParagraph);
