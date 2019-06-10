import React, { Component} from 'react';
import { Button, Container } from 'react-bootstrap';
import Link from 'next/link';
import Router from 'next/router';

import { EditButton, DeleteButton } from '~/components/button.js';
import Icon from '~/components/icon.js';
import { ConfirmModal } from '~/components/modal.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import Toolbar from '~/components/toolbar.js';
import { Shader, Spacer } from '~/components/layout.js';

import { formatDate } from '~/constants/date.js';
import Meta from '~/partials/meta.js';
import css from '~/styles/sessions.scss';

export default class SessionPage extends Component {
  constructor(){
    super();

    this.state = {
      modalVisible: false
    }
  }

  /** Retrieve session from server */
  static async getInitialProps({ query }) {
    return { session: query.session };
  }

  
  /** Delete session from database */
  deleteSession = () => {
    fetch('/deleteSession', {
      method: 'DELETE',
      body: JSON.stringify(this.props.session),
      headers: {
        'Authorization': 'authorized',
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.ok) Router.push('/sessions');
    }).catch(error => console.error(error));
  }

  /** Show and hide confirmation modal */
  showModal = () => { this.setState({modalVisible: true})}
  hideModal = () => { this.setState({modalVisible: false})}

  render(){
    const { session } = this.props;
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

        {true /** Admin */ ? 
          <Toolbar>
            <Link href={`/sessions/edit/${session.id}`}>
              <EditButton><Icon name={'edit'} />Edit Session</EditButton>
            </Link>
      
            <DeleteButton onClick={this.showModal}>
              <Icon name={'trash'} />Delete Session
            </DeleteButton>
          </Toolbar>
        : null}

        <ConfirmModal
          visible={this.state.modalVisible}
          message={'Are you sure you want to delete this session?'}
          confirmFunc={this.deleteSession}
          confirmText={'Delete'}
          close={this.hideModal} />
      </Spacer>
    );
  }
}