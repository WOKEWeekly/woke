import React, { Component} from 'react';
import { Button, Container } from 'react-bootstrap';

import Icon from '~/components/icon.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import Toolbar from '~/components/toolbar.js';
import { Wrapper } from '~/components/layout.js';

import { formatDate } from '~/constants/date.js';

import css from '~/styles/sessions.scss';

export default class SessionPage extends Component {
  static async getInitialProps({ query }) {
    return { session: query.session };
  }

  render(){
    const { session } = this.props;
    session.text = session.text.trim().length > 0 ? session.text : 'No description.';

    return (
      <Wrapper>
        <Container className={css.entity}>
          <img
            src={`/static/images/sessions/${session.image}`}
            alt={session.title}
            className={css.image} />
          <div className={css.details}>
            <Title className={css.title}>{session.title}</Title>
            <Subtitle className={css.subtitle}>{formatDate(session.dateHeld, true)}</Subtitle>
            <Divider />
            <Paragraph className={css.description}>{session.text}</Paragraph>
          </div>
        </Container>
        {true ? toolbar : null}
      </Wrapper>
      
    );
  }
}

const toolbar = (
  <Toolbar>
    <Button variant="success"><Icon name={'edit'} />Edit Session</Button>
    <Button variant="danger"><Icon name={'trash'} />Delete Session</Button>
  </Toolbar>
);