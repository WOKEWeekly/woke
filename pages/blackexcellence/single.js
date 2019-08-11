import React, { Component} from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';
import { EditEntityButton, DeleteEntityButton, BackButton } from '~/components/button.js';
import { ConfirmModal } from '~/components/modal.js';
import { PromoIconsBar } from '~/components/icon.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Shader, Spacer } from '~/components/layout.js';
import { Fader, Slider } from '~/components/transitioner.js';

import CLEARANCES from '~/constants/clearances.js';
import { countriesToString } from '~/constants/countries.js';
import { calculateAge } from '~/constants/date.js';
import request from '~/constants/request.js';

import css from '~/styles/blackex.scss';

class CandidatePage extends Component {
  constructor(){
    super();
    this.state = {
      modalVisible: false,
      isLoaded: false,
      imageLoaded: false
    }
  }

  /** Retrieve candidate from server */
  static async getInitialProps({ query }) {
    return { candidate: query.candidate };
  }

  componentDidMount(){
    this.setState({isLoaded: true})
  }
  
  /** Delete candidate from database */
  deleteCandidate = () => {
    const { candidate, user } = this.props;

    request({
      url: '/deleteCandidate',
      method: 'DELETE',
      body: JSON.stringify(candidate),
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'Clearance': CLEARANCES.ACTIONS.CRUD_BLACKEX
      },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully deleted ${candidate.name}.` });
        location.href = '/blackexcellence';
      }
    });
  }

  /** Show and hide confirmation modal */
  showModal = () => { this.setState({modalVisible: true})}
  hideModal = () => { this.setState({modalVisible: false})}

  render(){
    const { candidate, user, countries } = this.props;
    candidate.description = candidate.description.trim().length > 0 ? candidate.description : 'No description.';
    candidate.age = calculateAge(candidate.birthday);
    candidate.demonyms = countriesToString(JSON.parse(candidate.ethnicity), countries);

    const { isLoaded, imageLoaded } = this.state;

    return (
      <Spacer>
        <Shader>
          <Container className={css.entity}>
            <Slider
              determinant={imageLoaded}
              duration={800}
              direction={'left'}> 
              <img
                src={`/static/images/blackexcellence/${candidate.image}`}
                alt={candidate.name}
                className={css.image}
                onLoad={() => this.setState({imageLoaded: true})} />
            </Slider>
            <div className={css.details}>
              <Fader
                determinant={isLoaded}
                duration={500}>
                <Title className={css.title}>{candidate.name}</Title>
              </Fader>
              <Fader
                determinant={isLoaded}
                duration={500}
                delay={500}>
                <Subtitle className={css.subtitle}>
                  {candidate.age} • {candidate.occupation} • {candidate.demonyms}
                </Subtitle>
                <PromoIconsBar socials={candidate.socials} />
              </Fader>
              <Fader
                determinant={isLoaded}
                duration={500}
                delay={1000}>
                <Divider />
                <Paragraph className={css.description}>{candidate.description}</Paragraph>
              </Fader>
            </div>
          </Container>
        </Shader>
        
        <BottomToolbar>
          <BackButton
            title={'Back to Candidates'}
            onClick={() => location.href = '/blackexcellence'} />

          {user.clearance >= CLEARANCES.ACTIONS.CRUD_BLACKEX ? 
            <React.Fragment>
              <EditEntityButton
                title={'Edit Candidate'}
                onClick={() => Router.push(`/blackexcellence/edit/${candidate.id}`)}/>
              <DeleteEntityButton
                title={'Delete Candidate'}
                onClick={this.showModal} />
            </React.Fragment>
          : null}
        </BottomToolbar>

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
  user: state.user,
  countries: state.countries
});

export default connect(mapStateToProps)(CandidatePage);