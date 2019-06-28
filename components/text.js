import React, { Component } from 'react';
import Truncate from 'react-truncate';
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
    return (
      <pre
        {...this.props}
        style={{
          ...this.props.style,
          color: 'white',
          display: 'inline',
          fontFamily: fonts.body,
          whiteSpace: 'pre-line'
        }}>{this.props.children}</pre>
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

export class Truncator extends Component {
  render(){
    return (
      <Truncate lines={this.props.lines} ellipsis={this.props.ellipsis || '...'} trimWhitespace>
        {this.props.children.split('\n').map((ln, i, arr) => {
          const line = <span key={i}>{ln}</span>;
  
          if (i === arr.length - 1) {
            return line;
          } else {
            return [line, <br key={i + 'br'} />];
          }
        })}
      </Truncate>
    )
  }
}