import React, { Component } from "react";
import {Container} from 'react-bootstrap';

import { colors, fonts } from '~/constants/theme.js';

import css from '~/styles/app.scss';

export default class Cover extends Component {
	render(){
		return (
      <Container fluid={true} className={css.cover} style={{
        backgroundImage: `url(${this.props.image})`,
        height: this.props.height,
        textAlign: 'center'
      }}>
        <div>
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
        fontSize: 40,
        lineHeight: 1.3
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