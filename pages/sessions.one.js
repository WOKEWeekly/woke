import React, { Component} from 'react';
import { Container } from 'react-bootstrap';
import { formatDate } from '~/constants/date.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import css from '~/styles/sessions.scss';

export default class SessionPage extends Component {
  static async getInitialProps({ query }) {
    return { session: query.session };
  }

  render(){
    const { session } = this.props;
    session.text = session.text.trim().length > 0 ? session.text : 'No description.'

    return (
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
    );
  }
}