import React, { Component } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';
import classNames from 'classnames';
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
                  <img src={`/static/images/fillers/${paragraph.substring(1)}`} key={key} />
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

export class Divider extends Component {
  render(){
    const classes = classNames(css.divider, this.props.className);
    return <hr className={classes} style={this.props.style} />
  }
}

export class ReadMore extends Component {
  render(){
    const text = this.props.text || 'Read more...';
    return (
      <Link href={this.props.link}>
        <div className={css.readmore}>
          {text}
        </div>
      </Link>
    )
  }
}

export const truncateText = (text, limit) => {
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

  text = parts.filter(e => e != null).slice(0, limit || 45).join(' ');

  return `${text}....`;
}

const mapStateToProps = state => ({
  theme: state.theme
});

export const Paragraph = connect(mapStateToProps)(_Paragraph);