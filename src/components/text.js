import classNames from 'classnames';
import React, { Component } from 'react';
import InstagramEmbed from 'react-instagram-embed';
import { useSelector } from 'react-redux';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { zText } from 'zavid-modules';

import { Icon } from 'components/icon.js';
import css from 'styles/components/Text.module.scss';

/**
 * A title component for headings.
 * @param {string} props - Inherited properties.
 * @param {string} props.className The CSS styling.
 * @returns {React.Component} A title component.
 */
export const Title = ({ children, className }) => {
  const classes = classNames(css['title'], className);
  return <div className={classes}>{children}</div>;
};

/**
 * A subtitle component for subheadings.
 * @param {string} props - Inherited properties.
 * @param {string} props.className The CSS styling.
 * @returns {React.Component} A subtitle component.
 */
export const Subtitle = ({ children, className }) => {
  const classes = classNames(css['subtitle'], className);
  return <div className={classes}>{children}</div>;
};

/**
 * A paragraph component for a formatted body of text.
 * @param {string} props - Inherited properties from the paragraph component.
 * @param {string} props.children - The text to be formatted.
 * @param {string} [props.className] - The CSS styling.
 * @param {object} [props.substitutions] - A map of variable substitutions
 * to be made to the text.
 * @param {string} [props.cssOverrides] - The CSS styling overrides for the emphasis
 * and section formatting.
 * @param {string} [props.morelink] - The hyperlink for the embedded {@link ReadMore} component.
 * @param {string} [props.moretext] - The text to be formatted.
 * @param {object} [props.moreclass] - The CSS styling for the embedded {@link ReadMore} component.
 * @param {number} [props.truncate] - Number of words to truncate off text. No truncation by default.
 * @returns {React.Component} A formatted paragraph component.
 */
export const Paragraph = ({
  children,
  className,
  cssOverrides,
  moreclass,
  morelink,
  moretext,
  substitutions,
  truncate = 0
}) => {
  const theme = useSelector(({ theme }) => theme);
  const classes = classNames(css['paragraph'], className);

  let text = truncate
    ? zText.truncateText(children, { limit: truncate })
    : children;
  text = zText.applySubstitutions(text, substitutions);
  text = zText.formatText(text, {
    css: {
      heading: css['paragraph-heading'],
      subheading: css['paragraph-subheading'],
      image: {
        full: css['paragraph-image-full'],
        float: css['paragraph-image-float']
      },
      blockquote: css['paragraph-blockquote'],
      paragraph: css['paragraph-body'],
      divider: css['paragraph-divider'],
      hyperlink: css[`link-${theme.toLowerCase()}`],
      ...cssOverrides
    },
    socialWrappers: {
      Tweet: EmbeddedTweet,
      InstagramPost: EmbeddedInsta
    }
  });

  const ReadMoreLabel = () => {
    if (children && children.length <= truncate) return null;
    if (!moretext || !morelink) return null;
    return <ReadMore className={moreclass} link={morelink} text={moretext} />;
  };

  return (
    <>
      <pre className={classes}>{text}</pre>
      <ReadMoreLabel />
    </>
  );
};

export const QuoteWrapper = ({ children }) => {
  return (
    <div className={css['quote-wrapper']}>
      <span className={css['quote-left']}>“</span>
      <span className={css['quote-text']}>{children}</span>
      <span className={css['quote-right']}>”</span>
    </div>
  );
};

export class Divider extends Component {
  render() {
    const classes = classNames(css['paragraph-divider'], this.props.className);
    return <hr className={classes} style={this.props.style} />;
  }
}

export const ReadMore = ({ link, text = 'Read more', className }) => {
  const classes = classNames(css['paragraph-read-more'], className);
  return (
    <VanillaLink href={link}>
      <div className={classes}>
        <Icon name={'external-link-alt'} className={css['link-icon']} />
        {text}
      </div>
    </VanillaLink>
  );
};

export const ExpandText = ({ text = 'Read more...', onClick, className }) => {
  const classes = classNames(css['invisible_button'], className);
  return (
    <button className={classes} onClick={onClick} style={{ padding: 0 }}>
      <div className={css['paragraph-expand-text']}>{text}</div>
    </button>
  );
};

export const VanillaLink = ({
  className,
  href,
  children,
  openNewTab = false
}) => {
  const classes = classNames(css['vanilla-link'], className);
  return (
    <a
      className={classes}
      href={href}
      {...(openNewTab && {
        target: '_blank',
        rel: 'noopener noreferrer'
      })}>
      {children}
    </a>
  );
};

/**
 * Component for embedding tweets into articles.
 * @param {object} props - The properties.
 * @param {object} props.id - The ID of the tweet
 * @returns {React.Component} The component.
 */
const EmbeddedTweet = ({ id }) => {
  return <TwitterTweetEmbed tweetId={id} />;
};

/**
 * Component for embedding Instagram posts into articles.
 * @param {object} props - The properties.
 * @param {object} props.url - The url of the Instagram post.
 * @param {object} props.hideCaption - The option to hide the post's caption.
 * @returns {React.Component} The component.
 */
const EmbeddedInsta = ({ url, hideCaption = false }) => {
  return <InstagramEmbed url={url} maxWidth={500} hideCaption={hideCaption} />;
};
