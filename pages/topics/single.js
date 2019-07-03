import React, { Component} from 'react';
import { Container } from 'react-bootstrap';
import Router from 'next/router';

import { alert, universalErrorMsg } from '~/components/alert.js';
import { EditButton, DeleteButton } from '~/components/button.js';
import { ConfirmModal } from '~/components/modal.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Shader, Spacer } from '~/components/layout.js';

import CLEARANCES from '~/constants/clearances.js';
import { formatDate } from '~/constants/date.js';
import Meta from '~/partials/meta.js';
import css from '~/styles/topics.scss';

export default class TopicPage extends Component {
  constructor(){
    super();

    this.state = {
      modalVisible: false
    }
  }

  /** Retrieve topic from server */
  static async getInitialProps({ query }) {
    return { topic: query.topic };
  }

  
  /** Delete topic from database */
  deleteTopic = () => {
    fetch('/deleteTopic', {
      method: 'DELETE',
      body: JSON.stringify(this.props.topic),
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Content-Type': 'application/json',
        'Clearance': CLEARANCES.ACTIONS.CRUD_TOPICS
      }
    }).then(res => {
      res.ok ? Router.push('/topics') : alert.error(res.statusText);
    }).catch(error => {
      alert.error(universalErrorMsg);
      console.error(error);
    });
  }

  /** Show and hide confirmation modal */
  showModal = () => { this.setState({modalVisible: true})}
  hideModal = () => { this.setState({modalVisible: false})}

  render(){
    const { topic } = this.props;
    topic.description = topic.description.trim().length > 0 ? topic.description : 'No description.';

    return (
      <Spacer>
        <Meta
          title={`${topic.title} | #WOKEWeekly`}
          description={topic.description}
          url={`/topics/${topic.slug}`}
          image={`static/images/topics/${topic.image}`}
          alt={topic.title} />

        <Shader>
        <Container className={css.entity}>
          <img
            src={`/static/images/topics/${topic.image}`}
            alt={topic.title}
            className={css.image} />
          <div className={css.details}>
            <Title className={css.title}>{topic.title}</Title>
            <Subtitle className={css.subtitle}>{formatDate(topic.dateHeld, true)}</Subtitle>
            <Divider />
            <Paragraph className={css.description}>{topic.description}</Paragraph>
          </div>
        </Container>

        </Shader>

        {true /** Admin */ ? 
          <BottomToolbar>
            <EditButton
              title={'Edit Topic'}
              onClick={() => Router.push(`/topics/edit/${topic.id}`)} />
      
            <DeleteButton
              title={'Delete Topic'}
              onClick={this.showModal} />
          </BottomToolbar>
        : null}

        <ConfirmModal
          visible={this.state.modalVisible}
          message={'Are you sure you want to delete this topic?'}
          confirmFunc={this.deleteTopic}
          confirmText={'Delete'}
          close={this.hideModal} />
      </Spacer>
    );
  }
}