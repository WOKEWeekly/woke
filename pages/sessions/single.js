import React, { Component} from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';
import { EditEntityButton, DeleteEntityButton, BackButton } from '~/components/button.js';
import { ConfirmModal } from '~/components/modal.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Shader, Spacer } from '~/components/layout.js';
import { Fader, Slider } from '~/components/transitioner.js';

import CLEARANCES from '~/constants/clearances.js';
import { formatDate } from '~/constants/date.js';
import request from '~/constants/request.js';

import css from '~/styles/sessions.scss';

class SessionPage extends Component {
  constructor(){
    super();

    this.state = {
      modalVisible: false,
      isLoaded: false,
      imageLoaded: false
    }
  }

  /** Retrieve session from server */
  static async getInitialProps({ query }) {
    return { session: query.session };
  }

  componentDidMount(){
    this.setState({isLoaded: true})
  }
  
  /** Delete session from database */
  deleteSession = () => {
    const { session, user } = this.props;
    request({
      url: '/deleteSession',
      method: 'DELETE',
      body: JSON.stringify(session),
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'Clearance': CLEARANCES.ACTIONS.CRUD_SESSIONS,
      },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully deleted: ${session.title}.` });
        location.href = '/sessions';
      }
    });
  }

  /** Show and hide confirmation modal */
  showModal = () => { this.setState({modalVisible: true})}
  hideModal = () => { this.setState({modalVisible: false})}

  render(){
    const { session, user } = this.props;
    const { isLoaded, imageLoaded } = this.state;
    session.description = session.description.trim().length > 0 ? session.description : 'No description.';

    return (
      <Spacer>
        <Shader>
          <Container className={css.entity}>
            <Slider
              determinant={imageLoaded}
              duration={800}
              direction={'right'}> 
              <img
                src={`/static/images/sessions/${session.image}`}
                alt={session.title}
                className={css.image}
                onLoad={() => this.setState({imageLoaded: true})} />
            </Slider>
            <div className={css.details}>
              <Fader
                determinant={isLoaded}
                duration={500}>
                <Title className={css.title}>{session.title}</Title>
              </Fader>
              <Fader
                determinant={isLoaded}
                duration={500}
                delay={500}>
                <Subtitle className={css.subtitle}>{formatDate(session.dateHeld, true)}</Subtitle>
              </Fader>
              <Fader
                determinant={isLoaded}
                duration={500}
                delay={1000}>
                <Divider />
                <Paragraph className={css.description}>{session.description}</Paragraph>
              </Fader>
            </div>
          </Container>
        </Shader>

        
        <BottomToolbar>
          <BackButton
            title={'Back to Sessions'}
            onClick={() => location.href = '/sessions'} />

          {user.clearance >= CLEARANCES.ACTIONS.CRUD_SESSIONS ? 
            <React.Fragment>
              <EditEntityButton
                title={'Edit Session'}
                onClick={() => Router.push(`/sessions/edit/${session.id}`)} />
        
              <DeleteEntityButton
                title={'Delete Session'}
                onClick={this.showModal}/>
            </React.Fragment>
          : null}
        </BottomToolbar>

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