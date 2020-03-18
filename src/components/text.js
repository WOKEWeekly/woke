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
    let { children = '', substitutions, theme, link, more } = this.props;
    const classes = classNames(css.paragraph, this.props.className);

	children = applySubstitutions(children, substitutions);
    children = prefixFormatting(children, css[`link-${theme.toLowerCase()}`]);

    return (
      <React.Fragment>
        <pre
          {...this.props}
          className={classes}>
          {children}
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
 * Apply the prefix formatting for hierarchical or listed text.
 * Text needs this formatting first before markdown formatting is applied.
 * @param {string} text - The text to which hierarchical formatting will be applied.
 * @param {Object} hyperlinkClass - The CSS class to be passed into the next function.
 * @returns The text with formatting applied. 
 */
const prefixFormatting = (text, hyperlinkClass) => {
  if (text === null) return '';

  return text.split('\n').map((paragraph, key) => {
    if (paragraph.length === 0) return null;

    switch (paragraph.charAt(0)){
      // For headings
      case '*': return <div className={css.heading} key={key}>{paragraph.substring(1)}</div>;

      // For subheadings
      case '>': return <div className={css.subheading} key={key}>{paragraph.substring(1)}</div>;

      // For images
      case ';':
        const isFullImage = paragraph.charAt(1) === ';';
        const imageType = isFullImage ? 'fullImage' : 'floatImage';
        const offset = isFullImage ? 2 : 1;
        
        return (
          <div className={css[imageType]} key={key}>
            <img src={`${cloudinary.url}/public/fillers/${paragraph.substring(offset)}`} />
          </div>
        );

      // For dividers
      case '_': return (
        <Divider key={key} style={{margin: '2rem 0 1rem'}}/>
      );

      // For list items
      case '•': return (
        <div className={css.listitem} key={key}>
          <span>●</span>
          <span>{applyFormatting(paragraph.substring(1).trim())}</span>
        </div>
      );

      // For normal paragraph text
      default:
        const finalText = applyFormatting(paragraph, hyperlinkClass);
        return <p className={css.body} key={key}>{finalText}</p>;
    }
  });
}

/**
 * Apply markdown-like formatting to text.
 * @param {string} text - The text to which formatting needs to be applied.
 * @param {Object} hyperlinkClass - The CSS class for hyperlinks.
 * @returns The formatted text.
 */
const applyFormatting = (text, hyperlinkClass) => {
  if (text === null) return '';

  const linkRegex = new RegExp(/\<\[(.*?)\]\s(.*?)\>/); // Regex for links
  const boldRegex = new RegExp(/(\*\*.*?\*\*)/); // Regex for bold text

  const regexArray = [linkRegex.source, boldRegex.source];
  const combined = new RegExp(regexArray.join('|'), 'g');

  const parts = text.split(combined).filter(e => e != null);

  const finalText = parts.map((partText, count, array) => {
    // Bold text
    if (boldRegex.test(partText)){
      return <strong key={count}>{partText.substring(2, partText.length - 2)}</strong>;
    }

    // Hyperlink text
    if (
		partText.startsWith('/') ||
		partText.startsWith('mailto:') ||
		partText.startsWith('http')
	){
      array.splice(count, 1);
      return (
      <a
        target={'_blank'}
        rel={'noreferrer'}
        href={partText}
        key={count}
        className={hyperlinkClass}>{array[count]}</a>
      )
    } else {
      return partText;
    }
  });

  return finalText
}

/**
 * Apply the variable substitutions to the text, swapping our placeholders for
 * dynamic values. 
 * @param {string} text - The original text containing the variables to be substituted.
 * @param {Object} substitutions - The mapping specifying the values to substitute the placeholder variables.
 * @returns The full text with variables substitutions applied.
 */
const applySubstitutions = (text, substitutions) => {
  if (text !== null){
    const subRegex = new RegExp(/\<\$(.*?)\$\>/g); // Regex for substitutions
    text = text.replace(subRegex, (match, p1) => substitutions[p1]);
  }
	return text;
}

/**
 * Truncate a piece of text to a certain number of words.
 * @param {string} text - The text to be truncated.
 * @param {int} [limit=45] - The number of words to be truncated to. Default value is 45.
 * @returns The truncated text.
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