import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Container, Col, Row} from 'react-bootstrap';
import Link from 'next/link';

import { alert, displayErrorMessage } from '~/components/alert.js';
import { Cover, Shader, Default, Mobile } from '~/components/layout.js';
import { Title, Subtitle, Divider, TruncatedParagraph } from '~/components/text.js';
import { Fader, Slider } from '~/components/transitioner.js';
import { Voter } from '~/components/voter.js';

import { countriesToString } from '~/constants/countries.js';
import { formatDate, calculateAge } from '~/constants/date.js';
import css from '~/styles/home.scss';

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

          <Row>
            <Col md={6} className={'p-0'}><UpcomingSession/></Col>
            <Col md={6} className={'p-0'}><RandomCandidate/></Col>
          </Row>

          <Row><TopicVoter/></Row>
          <Row><RandomExecutive/></Row>
        </Container>
      </Shader>
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
      <Slider
        determinant={imageLoaded}
        duration={1000}
        delay={500}
        direction={'bottom'}
        postTransitions={'background-color .3s ease 0s'}
        notDiv>
        <Col md={4} className={css.colpart}>
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

class UpcomingSession extends Component {
  constructor(){
    super();
    this.state = { session: {} }
  }

  componentDidMount(){
    this.getUpcomingSession();
  }

  getUpcomingSession = () => {
    fetch('/getUpcomingSession', {
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      }
    })
    .then(res => res.json())
    .then(result => {
      let { session, upcoming } = result;
      session.upcoming = upcoming;
      session.loaded = true;
      this.setState({session})
    })
    .catch(error => console.error(error));
  }

  render(){
    const { session } = this.state;
    const heading = session.upcoming ? 'Most Upcoming Session' : 'Latest Session';
    const link = `/session/${session.slug}` || '/';
    return (
      <Slider
        determinant={session.loaded}
        duration={750}
        delay={1000}
        direction={'left'}
        postTransitions={'background-color .3s'}
        className={css.upcomingSession}>
        <Title className={css.heading}>{heading}</Title>
        <div>
          {session.image ?
          <Link href={link}>
            <img
              src={`/static/images/sessions/${session.image}`}
              alt={session.title}
              className={css.image} />
          </Link> : null}
          <div className={css.details}>
            <Title className={css.title}>{session.title}</Title>
            <Subtitle className={css.subtitle}>{formatDate(session.dateHeld, true)}</Subtitle>
            <Divider/>
            <TruncatedParagraph
              paragraphs={1}
              link={link}
              className={css.paragraph}>{session.description}</TruncatedParagraph>
          </div>
        </div>
      </Slider>
    )
  }
}

class _RandomCandidate extends Component {
  constructor(){
    super();
    this.state = { candidate: {} }
  }

  componentDidMount(){
    this.getRandomCandidate();
  }

  getRandomCandidate = () => {
    fetch('/getRandomCandidate', {
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      }
    })
    .then(res => res.json())
    .then(candidate => {
      candidate.loaded = true;
      this.setState({candidate})
    })
    .catch(error => console.error(error));
  }

  render(){
    const { candidate } = this.state;
    const { countries } = this.props;

    if (candidate.loaded){
      candidate.firstname = candidate.name.split(' ')[0];
      candidate.age = calculateAge(candidate.birthday);
      candidate.description = candidate.description.trim().length > 0 ? candidate.description : 'No description.';
      candidate.demonyms = countriesToString(JSON.parse(candidate.ethnicity), countries);
    }

    const link = `/blackexcellence/candidate/${candidate.id}`;

    return (
      <Slider
        determinant={candidate.loaded}
        duration={750}
        delay={1000}
        direction={'right'}
        postTransitions={'background-color .3s'}
        className={css.randomCandidate}>
        <Title className={css.heading}>Check out our candidate:</Title>
        <div>
          {candidate.image ?
          <Link href={link}>
            <img
              src={`/static/images/blackexcellence/${candidate.image}`}
              alt={candidate.name}
              className={css.image} />
          </Link> : null}
          <div className={css.details}>
            <Title className={css.title}>{candidate.name}</Title>
            <Subtitle className={css.subtitle}>
              {candidate.age} • {candidate.occupation} • {candidate.demonyms}
            </Subtitle>
            <Divider/>
            <TruncatedParagraph
              paragraphs={1}
              link={link}
              more={`Read more on ${candidate.firstname}...`}
              className={css.paragraph}>{candidate.description}</TruncatedParagraph>
          </div>
        </div>
      </Slider>
    )
  }
}

class TopicVoter extends Component {
  constructor(){
    super();
    this.state = {
      topic: {},
      votes: 0,
      result1: 0,
      result2: 0,
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
    fetch('/getRandomTopic', {
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      }
    })
    .then(res => res.json())
    .then(topic => {
      topic.loaded = true;
      this.setState({
        topic: topic,
        votes: topic.yes + topic.no,
        hasVoted: false
      })
    })
    .catch(error => console.error(error));
  }

  submitVote = (event) => {
    let { topic, votes } = this.state;
    const option = event.target.name;

    topic.vote = option;

    /** Update the vote count on topic */
    fetch('/incrementVote', {
      method: 'PUT',
      body: JSON.stringify(topic),
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      }
    })
    .then(res => Promise.all([res, res.json()]))
    .then(([status, response]) => { 
      if (status.ok){
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
      } else {
        alert.error(response.message)
      }
    }).catch(error => {
      displayErrorMessage(error);
    });
  }

  render(){
    const { topic, votes, result1, result2, hasVoted, isLoaded } = this.state;
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
            <div className={css.voteCount}>{votes} {votes === 1 ? 'vote' : 'votes'}</div>
            <Fader determinant={hasVoted} duration={750} className={css.voteThanks}>
              Thank you for your vote!
            </Fader>
          </Fader>
        </Container>
        </Fader>
    )
  }
}

class RandomExecutive extends Component{
  constructor(){
    super();
    this.state = { exec: {} }
  }

  componentDidMount(){
    this.getRandomExecutive();
  }

  getRandomExecutive = () => {
    fetch('/getRandomExecutive', {
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      }
    })
    .then(res => res.json())
    .then(exec => {
      exec.loaded = true;
      this.setState({exec})
    })
    .catch(error => console.error(error));
  }

  render(){
    const { exec } = this.state;

    if (exec.loaded){
      exec.fullname = `${exec.firstname} ${exec.lastname}`;
      exec.description = exec.description.trim().length > 0 ? exec.description : 'No description.';
    }

    const link = `/executives/${exec.slug}`;

    return (
      <Fader
        determinant={exec.loaded}
        duration={750}
        delay={1500}
        postTransitions={'background-color .3s'}
        className={css.randomExecutive}>
        <div className={css.container}>
        <Mobile><Title className={css.heading}>Have you met our executive?</Title></Mobile>
          <Row>
            <Col md={4}>
              {exec.image ?
              <Link href={link}>
                <img
                  src={`/static/images/team/${exec.image}`}
                  alt={exec.fullname}
                  className={css.image} />
              </Link> : null}
            </Col>
            <Col md={8}>
            <Default><Title className={css.heading}>Have you met our executive?</Title></Default>
              <div className={css.details}>
                <Title className={css.title}>{exec.fullname}</Title>
                <Subtitle className={css.subtitle}>{exec.role}</Subtitle>
                <Divider/>
                <TruncatedParagraph
                  paragraphs={1}
                  link={link}
                  more={`Read more on ${exec.firstname}...`}
                  className={css.paragraph}>{exec.description}</TruncatedParagraph>
              </div>
            </Col>
          </Row>
        </div>
      </Fader>
    )
  }
}

const mapStateToProps = state => ({
  countries: state.countries
});

const RandomCandidate = connect(mapStateToProps)(_RandomCandidate);