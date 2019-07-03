import React, { Component } from 'react';
import {Container, Col, Row} from 'react-bootstrap';
import Meta from '~/partials/meta.js';
import { Cover } from '~/components/layout.js';
import css from "~/styles/home.scss";
import { FadeSlider } from '~/components/transitioner.js';

export default class Home extends Component {
	render(){
		return (
			<div>
				<Meta
					title={'#WOKEWeekly - Awakening Through Conversation'}
					description={'Debates and discussions centered around and beyond the UK black community at university campuses. Providing a safe-space for expression and opinions to be heard and encouraging unity amongst the community through conversation, bringing together those divided by social status, religion and interest.'}
					url={'/'} />

				<Cover
					title={'Awakening Through Conversation.'}
					subtitle={'Debates and discussions centered around and beyond the UK black community.'}
					image={'home-header.jpg'}
          height={575}
          className={css.cover} />

				<Container fluid={true}>
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
				</Container>
			</div>
		);
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
    image.src = `/static/images/bg/${this.props.image}`;
    image.onload = () => this.setState({imageLoaded: true, imageSrc: image.src});
  }

	render(){
    const { imageLoaded, imageSrc } = this.state;
		return (
      <FadeSlider determinant={imageLoaded} duration={1000} delay={500} direction={'bottom'} notDiv>
        <Col md={4} className={css.colpart}>
          <div className={css.part} style={{backgroundImage: `url(${imageSrc})`}}>
            <div className={css.caption}>
              <div className={css.headline}>{this.props.headline}</div>
              <div className={css.description}>{this.props.description}</div>
            </div>
          </div>
        </Col>
      </FadeSlider>
		);
	}
}