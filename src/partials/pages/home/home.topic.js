import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';

import { LazyLoader } from 'components/loader.js';
import { Title, Subtitle } from 'components/text.js';
import { Fader } from 'components/transitioner.js';
import { Voter } from 'components/voter.js';
import request from 'constants/request.js';
import css from 'styles/pages/Home.module.scss';

const RandomTopic = () => {
  const [topic, setTopic] = useState({});
  const [voteState, setVoteState] = useState({
    votes: 0,
    result1: 50,
    result2: 50,
    hasVoted: false
  });

  const [isLoaded, setLoaded] = useState(false);
  const [isInView, setInView] = useState(false);

  useEffect(() => {
    getRandomTopic();
  }, [isLoaded]);

  /** Retrieve a random polar topic from database */
  const getRandomTopic = () => {
    request({
      url: '/api/v1/topics/random',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (topic) => {
        topic.loaded = true;
        setTopic(topic);
        setVoteState({
          votes: topic.yes + topic.no,
          result1: 50,
          result2: 50,
          hasVoted: false
        });
        setLoaded(true);
      }
    });
  };

  const submitVote = (event) => {
    const option = event.target.name;

    /** Update the vote count on topic */
    request({
      url: `/api/v1/topics/${topic.id}/vote/${option}`,
      method: 'PUT',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: ({ yes, no }) => {
        const votes = yes + no;
        setVoteState({
          votes,
          result1: (yes / votes) * 100,
          result2: (no / votes) * 100,
          hasVoted: true
        });
        unloadTopic();
      }
    });
  };

  /** Wait 3.5 seconds before unloading topic */
  const unloadTopic = () => {
    setTimeout(() => {
      setTopic(
        Object.assign({}, topic, {
          loaded: false
        })
      );
      loadNewTopic();
    }, 3500);
  };

  /** Wait 1.5 seconds before loading new topic */
  const loadNewTopic = () => {
    setTimeout(() => {
      getRandomTopic();
    }, 1500);
  };

  const { result1, result2, hasVoted } = voteState;

  return (
    <div className={css['home-random-topic']}>
      <Container>
        <LazyLoader setInView={setInView}>
          <Fader determinant={isInView} duration={750}>
            <Subtitle className={css['random-topic-heading']}>
              Quick Question
            </Subtitle>
            <Fader
              determinant={topic.loaded}
              duration={400}
              delay={500}
              className={css['random-topic-container']}>
              <Title className={css['random-topic-headline']}>
                {topic.headline}
              </Title>
              <Subtitle className={css['random-topic-question']}>
                {topic.question}
              </Subtitle>
              <Voter
                className={css['random-topic-voter']}
                option1={topic.option1}
                option2={topic.option2}
                result1={result1}
                result2={result2}
                hasVoted={hasVoted}
                onVote={submitVote}
              />
              <Fader
                determinant={hasVoted}
                duration={750}
                className={css['random-topic-vote-thanks']}>
                Thank you for your vote!
              </Fader>
            </Fader>
          </Fader>
        </LazyLoader>
      </Container>
    </div>
  );
};

export default RandomTopic;
