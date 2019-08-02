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

    let { children = '', substitutions, theme } = this.props;
    const classes = classNames(css.paragraph, this.props.className);

    return (
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

            // For list items
            case '•': return <li className={css.listitem} key={key}>{paragraph.substring(1).trim()}</li>;

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
                  return <a target={'_blank'} href={text} key={count} className={css[`link-${theme.toLowerCase()}`]}>{array[count]}</a>;
                } else {
                  return text;
                }
              });

              return <p className={css.body} key={key}>{paragraph}</p>;
          }
        })}
      </pre>
    )
  }
}

export class TruncatedParagraph extends Component {
  render(){
    let { children = '', paragraphs, link, more, ellipsis } = this.props;
    const classes = classNames(css.paragraph, this.props.className);

    const blocks = paragraphs ? (paragraphs * 2) - 2 : 2

    return (
      <pre
        {...this.props}
        className={classes}>
        {children.split('\n').map((ln, i, arr) => {
          const line = <span key={i}>{ln}</span>;

          if (i > blocks) return;
  
          if (i === arr.length - 1) {
            return line;
          } else {
            return [line, <br key={i + 'br'} />];
          }
        })}
        {children !== 'No description.' ? <ReadMore link={link} text={more} /> :null}
      </pre>
    )
  }
}

export class Divider extends Component {
  render(){
    return <hr className={css.divider} />
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

const mapStateToProps = state => ({
  theme: state.theme
});

export const Paragraph = connect(mapStateToProps)(_Paragraph);