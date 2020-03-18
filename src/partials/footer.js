import React, { Component } from 'react';
import {Col, Row } from 'react-bootstrap';

import { FooterIcon } from '~/components/icon';
import { Divider } from '~/components/text.js';

import { accounts, emails } from '~/constants/settings.js';

import css from '~/styles/_partials.scss';

export default class Footer extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  componentDidMount(){
    this.setState({isLoaded: true})
  }

	render(){
    if (!this.state.isLoaded) return null;

    return (
      <div className={css.footer}>
        <Divider />
        <Row>
          <Links/>
        </Row>
      </div>
    );
	}
}

/** Links for all necessary */
class Links extends Component {
  render(){
    return (
      <React.Fragment>
        <Col className={css.footerLinks} lg={9}>
          <a href={'/about'}>About #WOKEWeekly</a>
          <a href={'/recruitment'}>Recruitment</a>
          <a href={'/privacy'}>Privacy Policy</a>
          <a href={'/cookies'}>Cookies</a>
          <a href={'/faq'}>FAQs</a>
          <a href={'/donate'}>Donate</a>
          <a href={`mailto: ${emails.enquiries}`}>Contact Us</a>
        </Col>
        <Col className={css.author} lg={3}>
          Powered by #WOKEWeekly&reg;
        </Col>
      </React.Fragment>
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