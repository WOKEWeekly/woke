import React, {Component} from 'react';

export class Wrapper extends Component {
  render(){
    return (
      <div style={{
        display: 'grid',
        gridTemplateRows: '1fr auto'
      }}>{this.props.children}</div>
    );
  }
}