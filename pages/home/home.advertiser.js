import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Slider } from '~/components/transitioner.js';

import css from '~/styles/home.scss';

export default class ThreePart extends Component {
  render(){
    return (
      <Row className={css.threepart}>
        <Part
          headline={'Enlightenment'}
          description={'Facilitating open-floor conversation to shape the minds and alter the perspectives of participants.'}
          image={'three-part-1.jpg'} />
        <Part
          headline={'Expression'}
          description={'Providing a safe-space for freedom of expression and opinions to be heard.'}
          image={'three-part-2.jpg'} />
        <Part
          headline={'Community'}
          description={'Encouraging unity amongst the community irrespective of social status or background.'}
          image={'three-part-3.jpg'} />
      </Row>
    )
  }
}

class Part extends Component {
  constructor(){
    super();
    this.state = {
      imageLoaded: false,
      imageSrc: ''
    }
  }

  componentDidMount(){
    const image = new Image();
    image.src = `/static/images/fillers/${this.props.image}`;
    image.onload = () => this.setState({imageLoaded: true, imageSrc: image.src});
  }

	render(){
    const { imageLoaded, imageSrc } = this.state;
		return (
      <Slider
        determinant={imageLoaded}
        duration={1000}
        delay={500}
        direction={'bottom'}
        postTransitions={'background-color .3s ease 0s'}
        notDiv>
        <Col lg={4} className={css.colpart}>
          <div className={css.part} style={{backgroundImage: `url(${imageSrc})`}}>
            <div className={css.caption}>
              <div className={css.headline}>{this.props.headline}</div>
              <div className={css.description}>{this.props.description}</div>
            </div>
          </div>
        </Col>
      </Slider>
		);
	}
}