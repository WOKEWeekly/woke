import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';
import classNames from 'classnames';

import { Icon } from '~/components/icon.js';
import { cloudinary } from '~/constants/settings.js';
import css from '~/styles/_components.scss';

export class Title extends Component {
  render(){
    const classes = classNames(css.title, this.props.className);
    return (
      <div
        {...this.props}
        className={classes}>
        {this.props.children}
      </div>
    )
  }
}

export class Subtitle extends Component {
  render(){
    const classes = classNames(css.subtitle, this.props.className);
    return (
      <div
        {...this.props}
        className={classes}>
        {this.props.children}
      </div>
    )
  }
}

export class _Paragraph extends Component {
  render(){

    let { children, substitutions, theme, link, more } = this.props;
    const classes = classNames(css.paragraph, this.props.className);

    if (!children) children = '';

    return (
      <React.Fragment>
        <pre
          {...this.props}
          className={classes}>
          {children.split('\n').map((paragraph, key) => {
            if (paragraph.length === 0) return null;

            switch (paragraph.charAt(0)){
              // For headings
              case '*': return <div className={css.heading} key={key}>{paragraph.substring(1)}</div>;

              // For subheadings
              case '>': return <div className={css.subheading} key={key}>{paragraph.substring(1)}</div>;

              // For images
              case ';': return (
                <div className={css.image}>
                  <img src={`${cloudinary.url}/public/fillers/${paragraph.substring(1)}`} key={key} />
                </div>
              );

              // For dividers
              case '_': return (
                <Divider style={{margin: '2rem 0 1rem'}}/>
              );

              // For list items
              case '•': return (
                <div className={css.listitem} key={key}>
                  <span>●</span>
                  <span>{paragraph.substring(1).trim()}</span>
                </div>
              );

              // Normal paragraph text
              default:
                const linkRegex = new RegExp(/\<\[(.*?)\]\s(.*?)\>/g); // Regular expression for links
                const subRegex = new RegExp(/\<\$(.*?)\$\>/g); // Regular expression for substitutions

                /** Substitute variables */
                paragraph = paragraph.replace(subRegex, (match, p1) => substitutions[p1]);

                const parts = paragraph.split(linkRegex);
                paragraph = parts.map((text, count, array) => {
                  if (parts.length < 2) return text;

                  // Hyperlinking text
                  if (text.startsWith('/') || text.startsWith('mailto:') || text.startsWith('http')){
                    array.splice(count, 1);
                    return (
                    <a
                      target={'_blank'}
                      rel={'noreferrer'}
                      href={text}
                      key={count}
                      className={css[`link-${theme.toLowerCase()}`]}>{array[count]}</a>
                    )
                  } else {
                    return text;
                  }
                });

                return <p className={css.body} key={key}>{paragraph}</p>;
            }
          })}
        </pre>
        {more ? <ReadMore link={link} text={more === true ? null : more} /> : null}
      </React.Fragment>
    )
  }
}

export class QuoteWrapper extends Component {
  render(){
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
  render(){
    const classes = classNames(css.divider, this.props.className);
    return <hr className={classes} style={this.props.style} />
  }
}

export class ReadMore extends Component {
  render(){
    const text = this.props.text || 'Read more';
    return (
      <Link href={this.props.link}>
        <div className={css.readmore}>
          <Icon name={'external-link-alt'} className={css.linkIcon} />{text}
        </div>
      </Link>
    )
  }
}

export class ExpandText extends Component {
  render(){
    const { text = 'Read more...', onClick } = this.props;
    return (
      <button className={css.invisible_button} onClick={onClick} style={{padding: 0}}>
        <div className={css.expandText}>{text}</div>
      </button>
    )
  }
}

/**
 * Truncate a piece of text to a certain number of words.
 * @param {string} text - The text to be truncated.
 * @param {int} limit - The number of words to be truncated to. Default value is 45.
 * @returns {string} The truncated text.
 */
export const truncateText = (text, limit = 45) => {
  if (!text) text = '';

  const parts = text.split(' ').map(paragraph => {
    if (paragraph.length === 0) return null;

    switch (paragraph.charAt(0)){
      case '*': return null;                    // For headings
      case '>': return paragraph.substring(1);  // For subheadings
      case ';': return null;                    // For images
      case '•': return paragraph;               // For list items

      // Normal paragraph text
      default:
        const linkRegex = new RegExp(/\<\[(.*?)\]\s(.*?)\>/g);  // Regular expression for links
        const subRegex = new RegExp(/\<\$(.*?)\$\>/g);          // Regular expression for substitutions
        return paragraph.replace(subRegex, null).replace(linkRegex, '$1');
    }
  });

  const words = parts.filter(e => e != null);
  text = words.slice(0, limit).join(' ');
  
  if (words.length <= limit) return text;

  return `${text}....`;
}

const mapStateToProps = state => ({
  theme: state.theme
});

export const Paragraph = connect(mapStateToProps)(_Paragraph);