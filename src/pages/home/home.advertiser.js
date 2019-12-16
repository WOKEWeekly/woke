import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Slider } from '~/components/transitioner.js';
import LazyLoader from 'react-visibility-sensor';
import { cdn } from '~/constants/settings.js';

import css from '~/styles/home.scss';

export default class ThreePart extends Component {
  constructor(){
    super();
    this.state = {
      inView: false,
      detectViewChange: true
    }
  }

  toggleVisibility = (inView) => {
    this.setState({ inView, detectViewChange: inView === false });
  }

  render(){
    const { inView, detectViewChange } = this.state;
    return (
      <LazyLoader onChange={this.toggleVisibility} partialVisibility={true} active={detectViewChange}>
        <Row className={css.threepart}>
          <Part
            headline={'Enlightenment'}
            description={'Facilitating open-floor conversation to shape the minds and alter the perspectives of participants.'}
            image={'three-part-1.jpg'}
            inView={inView} />
          <Part
            headline={'Expression'}
            description={'Providing a safe-space for freedom of expression and opinions to be heard.'}
            image={'three-part-2.jpg'}
            inView={inView} />
          <Part
            headline={'Community'}
            description={'Encouraging unity amongst the community irrespective of social status or background.'}
            image={'three-part-3.jpg'}
            inView={inView} />
        </Row>
      </LazyLoader>
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
    image.src = `${cdn}/public/fillers/${this.props.image}`;
    image.onload = () => this.setState({imageLoaded: true, imageSrc: image.src});
  }

  static getDerivedStateFromProps(props) {
    return { inView: props.inView }
  }

	render(){
    const { imageLoaded, imageSrc } = this.state;
    const { inView } = this.props;
		return (
      <Slider
        determinant={imageLoaded && inView}
        duration={750}
        delay={0}
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