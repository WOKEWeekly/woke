import React, { Component } from 'react';
import {Container} from 'react-bootstrap';
import classNames from 'classnames';;
import css from '~/styles/_components.scss';

export default class Cover extends Component {
	render(){
    const { backgroundPosition, height, image, title, subtitle} = this.props;
    const classes = classNames(css.cover, this.props.className);
		return (
      <Container fluid={true} className={classes} style={{
        backgroundImage: `url(/static/images/bg/${image})`,
        backgroundPosition: backgroundPosition,
        minHeight: height,
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
      <div className={css.title}>{this.props.children}</div>
    );
  }
}

class Subtitle extends Component {
  render(){
    return (
      <div className={css.subtitle}>{this.props.children}</div>
    );
  }
}