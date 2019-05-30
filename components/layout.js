import React, {Component} from 'react';

export class Shader extends Component {
  render(){
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, .7)',
        width: '100%'
      }}>{this.props.children}</div>
    );
  }
}

export class Spacer extends Component {
  render(){
    return (
      <div style={{
        display: 'grid',
        gridTemplateRows: '1fr auto'
      }}>{this.props.children}</div>
    );
  }
}