import React, { Component } from 'react';
import {Container} from 'react-bootstrap';

import { Title, Subtitle } from '~/components/text.js';
import { Fader } from '~/components/transitioner.js';
import { Voter } from '~/components/voter.js';

import request from '~/constants/request.js';

import css from '~/styles/home.scss';

export default class TopicVoter extends Component {
  constructor(){
    super();
    this.state = {
      topic: {},
      votes: 0,
      result1: 50,
      result2: 50,
      hasVoted: false,
      isLoaded: false
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true})
    this.getRandomTopic();
  }

  /** Retrieve a random polar topic from database */
  getRandomTopic = () => {
    request({
      url: '/getRandomTopic',
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: (topic) => {
        topic.loaded = true;
        this.setState({
          topic: topic,
          votes: topic.yes + topic.no,
          result1: 50,
          result2: 50,
          hasVoted: false
        });
      }
    });
  }

  submitVote = (event) => {
    let { topic, votes } = this.state;
    const option = event.target.name;

    topic.vote = option;

    /** Update the vote count on topic */
    request({
      url: '/incrementVote',
      method: 'PUT',
      body: JSON.stringify(topic),
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: () => {
        topic[option]++;
        votes++;
        const result1 = (topic.yes / votes) * 100;
        const result2 = (topic.no / votes) * 100;
        this.setState({votes, result1, result2, hasVoted: true}, () => {
          setTimeout(() => { // Wait 5 seconds before loading new topic
            this.setState({ topic: { ...this.state.topic, loaded: false } });
            setTimeout(() => { this.getRandomTopic(); }, 1500);
          }, 3500);
        });
      }
    });
  }

  render(){
    const { topic, result1, result2, hasVoted, isLoaded } = this.state;
    return (
      <Fader
        determinant={isLoaded}
        duration={750}
        delay={1250}
        postTransitions={'background .3s'}
        className={css.topicVoter}>
        <Container>
          <Subtitle className={css.heading}>Quick Question</Subtitle>
          <Fader determinant={topic.loaded} duration={400} delay={500} className={css.container}>
            <Title className={css.headline}>{topic.headline}</Title>
            <Subtitle className={css.question}>{topic.question}</Subtitle>
            <Voter
              className={css.voter}
              option1={topic.option1}
              option2={topic.option2}
              result1={result1}
              result2={result2}
              hasVoted={hasVoted}
              onVote={this.submitVote} />
            {/* <div className={css.voteCount}>{votes} {votes === 1 ? 'vote' : 'votes'}</div> */}
            <Fader determinant={hasVoted} duration={750} className={css.voteThanks}>
              Thank you for your vote!
            </Fader>
          </Fader>
        </Container>
        </Fader>
    )
  }
}