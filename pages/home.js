import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Container, Col, Row} from 'react-bootstrap';
import Link from 'next/link';

import { Cover, Shader, Default, Mobile } from '~/components/layout.js';
import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import { Fader, Slider } from '~/components/transitioner.js';
import { Voter } from '~/components/voter.js';

import { countriesToString } from '~/constants/countries.js';
import { formatDate, calculateAge } from '~/constants/date.js';
import request from '~/constants/request.js';

import Review from '~/pages/reviews/unit.js';

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
          image={'header-home.jpg'}
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

          <Row><ReviewsPreview/></Row>

          <Row>
            <Col md={6} className={'p-0'}><UpcomingSession/></Col>
            <Col md={6} className={'p-0'}><RandomCandidate/></Col>
          </Row>

          <Row><TopicVoter/></Row>
          <Row><RandomMember/></Row>
          <Row><ForumAdvertiser/></Row>
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

class ReviewsHeading extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  componentDidMount() {
    this.setState({isLoaded: true})
  }

  render(){
    const { isLoaded } = this.state;

    return (
      <Fader determinant={isLoaded} duration={1500} delay={1000} className={css.reviewsPreview}>
        <Title className={css.heading}>What are people saying about us?</Title>
      </Fader>
    );
  }
}

class ReviewsPreview extends Component {
  constructor(){
    super();
    this.state = {
      reviews: []
    }
  }

  componentDidMount(){
    this.getReviews();
  }
  
  getReviews = () => {
    request({
      url: '/getReviews?limit=3',
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: (reviews) => {
        this.setState({reviews});
      }
    });
  }

  render(){
    const { reviews } = this.state;
    if (reviews.length === 0) return null;

    const items = [];

    for (const [index, item] of reviews.entries()) {
      items.push(
        <Review
          key={index}
          idx={index}
          item={item}
          showFullText={false}
          showAdminControls={false} />
      );
    }

    return (
      <div className={css.reviewsPreview}>
        <ReviewsHeading />
        <div className={css.reviewsList}>{items}</div>
      </div>
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
    request({
      url: '/getUpcomingSession',
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: (response) => {
        let { session, upcoming } = response;
        session.upcoming = upcoming;
        session.loaded = true;
        this.setState({session})
      }
    });
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
            <Paragraph
              link={link}
              more={'Find out more'}
              className={css.paragraph}>{truncateText(session.description)}</Paragraph>
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
    request({
      url: '/getRandomCandidate',
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: (candidate) => {
        candidate.loaded = true;
        this.setState({candidate})
      }
    });
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
            <Paragraph
              link={link}
              more={`Discover more on ${candidate.firstname}`}
              className={css.paragraph}>{truncateText(candidate.description)}</Paragraph>
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

class RandomMember extends Component{
  constructor(){
    super();
    this.state = { member: {} }
  }

  componentDidMount(){
    this.getRandomMember();
  }

  getRandomMember = () => {
    request({
      url: '/getRandomMember',
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      },
      onSuccess: (member) => {
        member.loaded = true;
        this.setState({member})
      }
    });
  }

  render(){
    const { member } = this.state;

    if (member.loaded){
      member.fullname = `${member.firstname} ${member.lastname}`;
      member.description = member.description && member.description.trim().length > 0 ? member.description : 'No description.';
    }

    const isExecutive = member.level === 'Executive';

    const link = isExecutive ? `/executives/${member.slug}` : `/team/member/${member.slug}`;
    const heading = `Have you met our ${isExecutive ? 'executive' : 'member'}?`

    return (
      <Fader
        determinant={member.loaded}
        duration={750}
        delay={1500}
        postTransitions={'background-color .3s'}
        className={css.randomMember}>
        <div className={css.container}>
        <Mobile><Title className={css.heading}>{heading}</Title></Mobile>
          <Row>
            <Col md={4}>
              {member.image ?
              <Link href={link}>
                <img
                  src={`/static/images/team/${member.image}`}
                  alt={member.fullname}
                  className={css.image} />
              </Link> : null}
            </Col>
            <Col md={8}>
            <Default><Title className={css.heading}>{heading}</Title></Default>
              <div className={css.details}>
                <Title className={css.title}>{member.fullname}</Title>
                <Subtitle className={css.subtitle}>{member.role}</Subtitle>
                <Divider/>
                <Paragraph
                  link={link}
                  more={`Read more on ${member.firstname}`}
                  className={css.paragraph}>{truncateText(member.description)}</Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </Fader>
    )
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

const mapStateToProps = state => ({
  countries: state.countries
});

const RandomCandidate = connect(mapStateToProps)(_RandomCandidate);