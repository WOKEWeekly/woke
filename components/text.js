import React, { Component } from 'react';
import { fonts } from '~/constants/theme.js';

export class Title extends Component {
  render(){
    return (
      <div
        {...this.props}
        style={{
          color: 'white',
          fontFamily: fonts.title,
        }}>{this.props.children}</div>
    )
  }
}

export class Subtitle extends Component {
  render(){
    return (
      <div
        {...this.props}
        style={{
          color: 'white',
          fontFamily: fonts.body,
        }}>{this.props.children}</div>
    )
  }
}

export class Paragraph extends Component {
  render(){

    let { style, children } = this.props;
    if (!children) children = '';

    return (
      <pre
        {...this.props}
        style={{
          ...style,
          color: 'white',
          display: 'inline',
          fontFamily: fonts.body,
          whiteSpace: 'pre-line'
        }}>
        {children.split('\n').map((paragraph, i, arr) => {
          const line = <p key={i}>{paragraph}</p>;
  
          if (paragraph.length > 0) {
            return line;
          } else {
            return null;
          }
        })}
      </pre>
    )
  }
}

export class TruncatedParagraph extends Component {
  render(){
    let { style, children, blocks } = this.props;
    if (!children) children = '';
    return (
      <pre
        {...this.props}
        style={{
          ...style,
          color: 'white',
          display: 'inline',
          fontFamily: fonts.body,
          whiteSpace: 'pre-line'
        }}>
        {children.split('\n').map((ln, i, arr) => {
          const line = <span key={i}>{ln}</span>;

          if (i > 1) return;
  
          if (i === arr.length - 1) {
            return line;
          } else {
            return [line, <br key={i + 'br'} />];
          }
        })}
        <ReadMore />
      </pre>
    )
  }
}

export class Divider extends Component {
  render(){
    return (
      <hr style={{
        backgroundColor: 'white',
        overflow: 'hidden'
      }} />
    )
  }
}

export class ReadMore extends Component {
  render(){
    return (
      <React.Fragment>
        <div style={{color: 'skyblue', display: 'block', marginTop: '.5em'}}>
          Read More...
        </div>
      </React.Fragment>
    )
  }
}