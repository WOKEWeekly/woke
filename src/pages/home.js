import React, { Suspense, useState } from 'react';
import { Container, Col, Row } from 'react-bootstrap';

import { Cover, Shader } from 'components/layout.js';
import css from 'styles/pages/Home.module.scss';

const ThreePart = React.lazy(() =>
  import('partials/pages/home/home.threepart')
);
const ReviewsPreview = React.lazy(() =>
  import('partials/pages/home/home.reviews')
);
const FeaturedSession = React.lazy(() =>
  import('partials/pages/home/home.session')
);
const RandomCandidate = React.lazy(() =>
  import('partials/pages/home/home.candidate')
);
const RandomTopic = React.lazy(() => import('partials/pages/home/home.topic'));
const RandomMember = React.lazy(() =>
  import('partials/pages/home/home.member')
);

const Home = () => {
  return (
    <Shader>
      <Cover
        title={'Awakening Through Conversation.'}
        subtitle={
          'Debates and discussions centered around and beyond the UK black community.'
        }
        image={'header-home.jpg'}
        height={575}
        className={css['home-cover']}
      />

      <Container fluid={true}>
        <Suspense fallback={null}>
          <Row>
            <ThreePart />
          </Row>

          <Row>
            <ReviewsPreview />
          </Row>

          <Row>
            <Col md={6} className={'p-0'}>
              <FeaturedSession />
            </Col>
            <Col md={6} className={'p-0'}>
              <RandomCandidate />
            </Col>
          </Row>

          <Row>
            <RandomTopic />
          </Row>
          <Row>
            <RandomMember />
          </Row>
        </Suspense>
      </Container>
    </Shader>
  );
};

export default Home;
