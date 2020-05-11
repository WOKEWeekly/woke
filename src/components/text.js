import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { Icon } from '~/components/icon.js';
import css from '~/styles/components/Text.module.scss';

import { zText } from 'zavid-modules';

export class Title extends Component {
  render() {
    const classes = classNames(css.title, this.props.className);
    return (
      <div {...this.props} className={classes}>
        {this.props.children}
      </div>
    );
  }
}

export class Subtitle extends Component {
  render() {
    const classes = classNames(css.subtitle, this.props.className);
    return (
      <div {...this.props} className={classes}>
        {this.props.children}
      </div>
    );
  }
}

export class IParagraph extends Component {
  render() {
    let { children = '', substitutions, theme, link, moretext } = this.props;
    const classes = classNames(css.paragraph, this.props.className);

    children = zText.applySubstitutions(children, substitutions);
    children = zText.formatText(children, css[`link-${theme.toLowerCase()}`]);

    const ReadMoreLabel = () => {
      if (!moretext) return null;
      if (moretext === true) moretext = null;
      return <ReadMore link={link} text={moretext} />;
    };

    return (
      <React.Fragment>
        <pre {...this.props} className={classes}>
          {children}
        </pre>
        <ReadMoreLabel />
      </React.Fragment>
    );
  }
}

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

export class ReadMore extends Component {
  render() {
    const { link, text = 'Read more' } = this.props;
    return (
      <VanillaLink href={link}>
        <div className={css.readmore}>
          <Icon name={'external-link-alt'} className={css.linkIcon} />
          {text}
        </div>
      </VanillaLink>
    );
  }
}

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
