import React, { Component } from 'react';
import {Col, Row } from 'react-bootstrap';
import { FooterIcon } from '~/components/icon';

import { accounts } from '~/constants/settings.js';

import css from '~/styles/_partials.scss';


export default class Footer extends Component {
  constructor(){
    super();
    this.state = {
      isLoaded: false
    }
  }

  componentDidMount(){
    this.setState({isLoaded: true})
  }

	render(){
    if (!this.state.isLoaded) return null;

    return (
      <div className={css.footer} >
        <Col md={4}><Socials/></Col>
      </div>
    );
	}
}

/** Social media icons in footer */
class Socials extends Component {
  render(){
    return (
      <div>
        <Row style={{justifyContent: 'center'}}>
          <FooterIcon icon={"facebook-f"} href={accounts.facebook} />
          <FooterIcon icon={"twitter"} href={accounts.twitter} />
          <FooterIcon icon={"instagram"} href={accounts.instagram} />
        </Row>
        <Row style={{justifyContent: 'center'}}>
          <FooterIcon icon={"linkedin-in"} href={accounts.linkedin} />
          <FooterIcon icon={"youtube"} href={accounts.youtube} />
        </Row>
      </div>
    )
  }
}