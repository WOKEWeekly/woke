import React, { Component } from 'react';
import {Container, Col, Row} from 'react-bootstrap';
import Meta from '~/partials/meta.js';

import { Cover, Shader } from '~/components/layout.js';
import { Fader, FadeSlider } from '~/components/transitioner.js';
import { Title, Subtitle, Paragraph, Divider, TruncatedParagraph, ReadMore } from '~/components/text.js';

import { countriesToString } from '~/constants/countries.js';
import { formatDate, calculateAge } from '~/constants/date.js';
import css from '~/styles/home.scss';

export default class Home extends Component {
  constructor(){
    super();
    this.state = {
      isLoaded: false
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

	render(){
    if (this.state.isLoaded){
      return (
        <Shader>
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

            <Row>
              <Col md={6}><UpcomingSession/></Col>
              <Col md={6}><RandomCandidate/></Col>
            </Row>
          </Container>
        </Shader>
      );
    } else {
      return null;
    }
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

class UpcomingSession extends Component {
  constructor(){
    super();
    this.state = {
      session: {}
    }
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
    return (
      <Fader determinant={session.loaded} duration={1000} delay={500} className={css.upcomingSession}>
        <Title className={css.heading}>{heading}</Title>
        <div>
          <img
            src={`/static/images/sessions/${session.image}`}
            alt={session.title}
            className={css.image} />
          <div className={css.details}>
            <Title className={css.title}>{session.title}</Title>
            <Subtitle className={css.subtitle}>{formatDate(session.dateHeld, true)}</Subtitle>
            <Divider/>
            <TruncatedParagraph className={css.paragraph}>{session.description}</TruncatedParagraph>
          </div>
        </div>
      </Fader>
    )
  }
}

class RandomCandidate extends Component {
  constructor(){
    super();
    this.state = {
      candidate: {}
    }
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

    if (!candidate.loaded) return null;

    candidate.description = candidate.description.trim().length > 0 ? candidate.description : 'No description.';
    candidate.age = calculateAge(candidate.birthday);
    candidate.demonyms = countriesToString(JSON.parse(candidate.ethnicity));

    return (
      <Fader determinant={candidate.loaded} duration={1000} delay={500} className={css.upcomingSession}>
        <Title className={css.heading}>Check out our candidate:</Title>
        <div>
          <img
            src={`/static/images/blackexcellence/${candidate.image}`}
            alt={candidate.name}
            className={css.image} />
          <div className={css.details}>
            <Title className={css.title}>{candidate.name}</Title>
            <Subtitle className={css.subtitle}>
              {candidate.age} • {candidate.occupation} • {candidate.demonyms}
            </Subtitle>
            <Divider/>
            <TruncatedParagraph blocks={3} className={css.paragraph}>{candidate.description}</TruncatedParagraph>
          </div>
        </div>
      </Fader>
    )
  }
}