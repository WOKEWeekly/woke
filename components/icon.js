import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class Icon extends Component {
  render(){
    return (
      <FontAwesomeIcon
        icon={['fas', this.props.name]}
        color={'white'}
        style={{ marginRight: 8 }} />
    )
    
  }
}