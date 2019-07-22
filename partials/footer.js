import React, { Component } from 'react';
import {Col, Row } from 'react-bootstrap';
import Link from 'next/link';
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
        <Row>
          <Col md={4}><Links/></Col>
          <Col md={4}></Col>
          <Col md={4}><Socials/></Col>
        </Row>
      </div>
    );
	}
}

/** Links for all necessary */
class Links extends Component {
  render(){
    return (
      <div style={{
        color: 'white',
        fontFamily: 'Raleway',
        display: 'grid'
      }}>
        <Link>Privacy Policy</Link>
        <Link>Cookies</Link>
        <Link>FAQs</Link>
      </div>
    )
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