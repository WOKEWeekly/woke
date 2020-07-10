import React, { Component, Suspense } from 'react';
import { Container, Col, Row } from 'react-bootstrap';

import { Cover, Shader } from 'components/layout.js';
import css from 'styles/pages/Home.module.scss';

const ThreePart = React.lazy(() =>
  import('partials/pages/home/home.advertiser')
);
const ReviewsPreview = React.lazy(() =>
  import('partials/pages/home/home.reviews')
);
const UpcomingSession = React.lazy(() =>
  import('partials/pages/home/home.session')
);
const RandomCandidate = React.lazy(() =>
  import('partials/pages/home/home.candidate')
);
const TopicVoter = React.lazy(() => import('partials/pages/home/home.voter'));
const RandomMember = React.lazy(() =>
  import('partials/pages/home/home.member')
);

export default class Home extends Component {
  constructor() {
    super();
    this.state = { isLoaded: false };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  render() {
    if (!this.state.isLoaded) return null;

    return (
      <Shader>
        <Cover
          title={'Awakening Through Conversation.'}
          subtitle={
            'Debates and discussions centered around and beyond the UK black community.'
          }
          image={'header-home.jpg'}
          height={575}
          className={css.cover}
        />

        <Container fluid={true}>
          <Suspense fallback={null}>
            <ThreePart />

            <ReviewsPreview />

            <Row>
              <Col md={6} className={'p-0'}>
                <UpcomingSession />
              </Col>
              <Col md={6} className={'p-0'}>
                <RandomCandidate />
              </Col>
            </Row>

            <Row>
              <TopicVoter />
            </Row>
            <Row>
              <RandomMember />
            </Row>
          </Suspense>
        </Container>
      </Shader>
    );
  }
}
