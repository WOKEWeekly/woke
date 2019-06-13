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
    return (
      <pre
        {...this.props}
        style={{
          color: 'white',
          display: 'inline',
          fontFamily: fonts.body,
          fontSize: '1rem',
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