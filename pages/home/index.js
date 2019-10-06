import React, { Component, Suspense } from 'react';
import {Container, Col, Row} from 'react-bootstrap';

import { Cover, Shader } from '~/components/layout.js';
import { LoaderIcon } from '~/components/loader.js';
import { Paragraph } from '~/components/text.js';
import { Fader } from '~/components/transitioner.js';

import css from '~/styles/home.scss';

// import ThreePart from './home.advertiser';

const ThreePart = React.lazy(() => import('./home.advertiser'));
const ReviewsPreview = React.lazy(() => import('./home.reviews'));
const UpcomingSession = React.lazy(() => import('./home.session'));
const RandomCandidate = React.lazy(() => import('./home.candidate'));
const TopicVoter = React.lazy(() => import('./home.voter'));
const RandomMember = React.lazy(() => import('./home.member'));


export default class Home extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

	render(){
    if (!this.state.isLoaded) return null;

    return (
      <Shader>
        <Cover
          title={'Awakening Through Conversation.'}
          subtitle={'Debates and discussions centered around and beyond the UK black community.'}
          image={'header-home.jpg'}
          height={575}
          className={css.cover} />

        <Container fluid={true}>
          <Suspense fallback={<LoaderIcon />}>
            <ThreePart />

            <Row><ReviewsPreview/></Row>

            <Row>
              <Col md={6} className={'p-0'}><UpcomingSession/></Col>
              <Col md={6} className={'p-0'}><RandomCandidate/></Col>
            </Row>

            <Row><TopicVoter/></Row>
            <Row><RandomMember/></Row>
            <Row><ForumAdvertiser/></Row>
          </Suspense>
        </Container>
      </Shader>
    );
	}
}

class ForumAdvertiser extends Component {
  constructor(){
    super();
    this.state = {
      imageLoaded: false,
      imageSrc: ''
    }
  }

  componentDidMount(){
    const image = new Image();
    image.src = `/static/images/bg/bg-home-forum.jpg`;
    image.onload = () => this.setState({imageLoaded: true, imageSrc: image.src});
  }

  render(){
    const { imageLoaded, imageSrc } = this.state;
    const text = `Wouldn't it make sense if you could suggest more topics for us to cover at our sessions?\n\nFORUM COMING SOON...`;
    
    return (
      <Fader
        determinant={imageLoaded}
        duration={750}
        delay={0}
        postTransitions={'background-color .3s'}
        className={css.forumAdvertiser}
        style={{backgroundImage: `url(${imageSrc})`}}>
        <div className={css.container}>
          <Paragraph className={css.coverText}>{text}</Paragraph>
        </div>
      </Fader>
    )
  }
}