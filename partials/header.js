import React, { Component } from 'react';
import {Container, Col, Row, Nav, Navbar, NavDropdown} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { accounts, emails } from '~/constants/settings.js';
import { colors } from '~/constants/theme.js';

import css from '~/styles/partials.scss';

/** Little top bar for social media icons and account details */
export class PreNavBar extends Component {
  render(){
    return (
      <Container className={css.prenav} fluid={true}>
        <Container>
          <Row>
            <Col xs={6}>
              <Icon icon={"facebook-f"} href={accounts.facebook} />
              <Icon icon={"twitter"} href={accounts.twitter} />
              <Icon icon={"instagram"} href={accounts.instagram} />
              <Icon icon={"linkedin-in"} href={accounts.linkedin} />
              <Icon icon={"youtube"} href={accounts.youtube} />
            </Col>
            <Col xs={6} className={css.auth}>
              <a href="#login">Login</a>
              <a>|</a>
              <a href="#signup">Sign Up</a>
            </Col>
          </Row>
        </Container>
      </Container>
    )
  }
}

/** Main navigation bar with routes */
export class MainNavBar extends Component {
  render(){
    return (
      <Navbar className={css.nav} variant="dark" expand="lg" sticky="top">
        <Navbar.Brand href="/home">
          <img
            src="/static/images/logos/wokeweekly-logo.png"
            height="40"
            alt="#WOKEWeekly Logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="/sessions" className={css.links}>Sessions</Nav.Link>
            <Nav.Link href="#link" className={css.links}>Forum</Nav.Link>
            <NavDropdown className={css.links} title="Topics" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1" className={css.links}>Topic Suggestions</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2" className={css.links}>Topic Bank</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#link" className={css.links}>#BlackExcellence</Nav.Link>
            <Nav.Link href="#link" className={css.links}>The Exec.</Nav.Link>
            <Nav.Link href="#link" className={css.links}>About</Nav.Link>
            <Nav.Link href={`mailto: ${emails.enquiries}`} className={css.links}>Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

/** Social media icon template */
class Icon extends Component {
  render(){
    return (
      <a
        href={this.props.href}
        style={{fontSize: 24}}>
        <FontAwesomeIcon
          icon={['fab', this.props.icon]}
          color={colors.primary}
          className={css.socials} />
      </a>
    )
  }
}