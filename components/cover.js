import React, { Component } from 'react';
import {Container} from 'react-bootstrap';

import { fonts } from '~/constants/theme.js';

import css from '~/styles/_components.scss';

export default class Cover extends Component {
	render(){
    const { backgroundAttachment, backgroundPosition, height, image, title, subtitle} = this.props;
		return (
      <Container fluid={true} className={css.cover} style={{
        backgroundAttachment: backgroundAttachment,
        backgroundPosition: backgroundPosition,
        backgroundImage: `url(/static/images/bg/${image})`,
        minHeight: height,
        textAlign: 'center'
      }}>
        <div>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
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