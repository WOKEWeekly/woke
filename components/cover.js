import React, { Component } from "react";
import {Container} from 'react-bootstrap';

import { fonts } from '~/constants/theme.js';

export default class Cover extends Component {
	render(){
		return (
      <Container fluid={true} style={{
        backgroundAttachment: 'fixed',
        backgroundImage: `url(${this.props.image})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        height: this.props.height,
        textAlign: 'center'
      }}>
        <div style={{
          position: 'relative',
          top: '30%',
        }}>
          <Title>{this.props.title}</Title>
          <Subtitle>{this.props.subtitle}</Subtitle>
        </div>
      </Container>
		);
	}
}

class Title extends Component {
  render(){
    return (
      <div style={{
        color: 'white',
        fontFamily: fonts.body,
        fontSize: 40
      }}>{this.props.children}</div>
    );
  }
}

class Subtitle extends Component {
  render(){
    return (
      <div style={{
        color: 'white',
        fontFamily: fonts.body,
        fontSize: 20,
      }}>{this.props.children}</div>
    );
  }
}