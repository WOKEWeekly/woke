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
import { countriesToString } from '~/constants/countries.js';
import { calculateAge } from '~/constants/date.js';
import Meta from '~/partials/meta.js';
import css from '~/styles/blackex.scss';

class CandidatePage extends Component {
  constructor(){
    super();
    this.state = {
      modalVisible: false
    }
  }

  /** Retrieve candidate from server */
  static async getInitialProps({ query }) {
    return { candidate: query.candidate };
  }

  
  /** Delete candidate from database */
  deleteCandidate = () => {
    fetch('/deleteCandidate', {
      method: 'DELETE',
      body: JSON.stringify(this.props.candidate),
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Content-Type': 'application/json',
        'Clearance': CLEARANCES.ACTIONS.CRUD_BLACKEX
      }
    }).then(res => {
      if (res.ok) Router.push('/blackexcellence');
    }).catch(error => console.error(error));
  }

  /** Show and hide confirmation modal */
  showModal = () => { this.setState({modalVisible: true})}
  hideModal = () => { this.setState({modalVisible: false})}

  render(){
    const { candidate, user } = this.props;
    candidate.description = candidate.description.trim().length > 0 ? candidate.description : 'No description.';

    candidate.age = calculateAge(candidate.birthday);
    candidate.demonyms = countriesToString(JSON.parse(candidate.ethnicity));

    return (
      <Spacer>
        <Meta
          title={`#${candidate.id}: ${candidate.name} | #WOKEWeekly`}
          description={candidate.description}
          url={`/blackexcellence/candidate/${candidate.id}`}
          image={`static/images/blackexcellence/${candidate.image}`}
          alt={candidate.title} />

        <Shader>
        <Container className={css.entity}>
          <img
            src={`/static/images/blackexcellence/${candidate.image}`}
            alt={candidate.name}
            className={css.image} />
          <div className={css.details}>
            <Title className={css.title}>{candidate.name}</Title>
            <Subtitle className={css.subtitle}>
            {candidate.age} • {candidate.occupation} • {candidate.demonyms}
            </Subtitle>
            <Divider />
            <Paragraph className={css.description}>{candidate.description}</Paragraph>
          </div>
        </Container>

        </Shader>

        {user.clearance >= CLEARANCES.ACTIONS.CRUD_SESSIONS ? 
          <BottomToolbar>
            <Link href={`/blackexcellence/edit/${candidate.id}`}>
              <EditButton><Icon name={'edit'} />Edit Candidate</EditButton>
            </Link>
      
            <DeleteButton onClick={this.showModal}>
              <Icon name={'trash'} />Delete Candidate
            </DeleteButton>
          </BottomToolbar>
        : null}

        <ConfirmModal
          visible={this.state.modalVisible}
          message={'Are you sure you want to delete this candidate?'}
          confirmFunc={this.deleteCandidate}
          confirmText={'Delete'}
          close={this.hideModal} />
      </Spacer>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(CandidatePage);