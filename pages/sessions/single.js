import React, { Component} from 'react';
import { Button, Container } from 'react-bootstrap';
import Link from 'next/link';

import Icon from '~/components/icon.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import Toolbar from '~/components/toolbar.js';
import { Shader, Spacer } from '~/components/layout.js';

import { formatDate } from '~/constants/date.js';
import Meta from '~/partials/meta.js';
import css from '~/styles/sessions.scss';

export default class SessionPage extends Component {
  static async getInitialProps({ query }) {
    return { session: query.session };
  }

  render(){
    const { session } = this.props;
    if (session){
    
      session.description = session.description.trim().length > 0 ? session.description : 'No description.';

      return (
        <Spacer>
          <Meta
            title={`${session.title} | #WOKEWeekly`}
            description={session.description}
            url={`/sessions/${session.slug}`}
            image={`static/images/sessions/${session.image}`}
            alt={session.title} />

          <Shader>
          <Container className={css.entity}>
            <img
              src={`/static/images/sessions/${session.image}`}
              alt={session.title}
              className={css.image} />
            <div className={css.details}>
              <Title className={css.title}>{session.title}</Title>
              <Subtitle className={css.subtitle}>{formatDate(session.dateHeld, true)}</Subtitle>
              <Divider />
              <Paragraph className={css.description}>{session.description}</Paragraph>
            </div>
          </Container>

          </Shader>

          {true /** Admin */ ? toolbar(session.id) : null}
        </Spacer>
        
      );
    } else {
      return null;
    }
  }
}

const toolbar = (id) => {
  return (
    <Toolbar>
      <Link href={`/sessions/edit/${id}`}>
        <Button variant="success"><Icon name={'edit'} />Edit Session</Button>
      </Link>

      <Button variant="danger"><Icon name={'trash'} />Delete Session</Button>
    </Toolbar>
    );
  };