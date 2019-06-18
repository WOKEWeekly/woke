import React, {Component} from 'react';
import Responsive from 'react-responsive';
 
export const Desktop = props => <Responsive {...props} minWidth={992} />;
export const Tablet = props => <Responsive {...props} minWidth={768} maxWidth={991} />;
export const Mobile = props => <Responsive {...props} maxWidth={767} />;
export const Default = props => <Responsive {...props} minWidth={768} />;

export const zIndices = {
  accountMenu: 1050
}

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