import React, { Component} from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import Link from 'next/link';
import Router from 'next/router';

import { EditButton, DeleteButton } from '~/components/button.js';
import { Icon } from '~/components/icon.js';
import { ConfirmModal } from '~/components/modal.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Shader, Spacer } from '~/components/layout.js';

import CLEARANCES from '~/constants/clearances.js';
import { formatDate } from '~/constants/date.js';
import Meta from '~/partials/meta.js';
import css from '~/styles/sessions.scss';

class SessionPage extends Component {
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
        'Authorization': `Bearer ${this.props.user.token}`,
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
    const { session, user } = this.props;
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

        {user.clearance >= CLEARANCES.ACTIONS.CRUD_SESSIONS ? 
          <BottomToolbar>
            <Link href={`/sessions/edit/${session.id}`}>
              <EditButton><Icon name={'edit'} />Edit Session</EditButton>
            </Link>
      
            <DeleteButton onClick={this.showModal}>
              <Icon name={'trash'} />Delete Session
            </DeleteButton>
          </BottomToolbar>
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

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(SessionPage);