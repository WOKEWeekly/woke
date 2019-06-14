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
      <div
      {...this.props}
      style={{
        display: 'grid',
        height: '100%',
        gridTemplateRows: this.props.gridrows || '1fr auto'
      }}>{this.props.children}</div>
    );
  }
}