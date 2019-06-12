import React, { Component } from 'react';
import { Container, Col, Row, Nav, Navbar } from 'react-bootstrap';
import { connect } from 'react-redux';
import { HeaderIcon } from '~/components/icon';

import Login from './login';
import { accounts, emails } from '~/constants/settings.js';
import css from '~/styles/_partials.scss';

/** Little top bar for social media icons and account details */
class PreNavbar extends Component {
  constructor(){
    super();
    this.state = {
      modalVisible: false
    }
  }

  /** Show and hide login modal */
  showModal = () => { this.setState({modalVisible: true}); }
  hideModal = () => { this.setState({modalVisible: false}); }

  render(){

    /** If authenticated, show name. Else, show option to login/register */
    const renderAccount = () => {
      const { fullname, isAuthenticated } = this.props.user;
  
      if (isAuthenticated){
        return (
          <Col xs={6} className={css.auth}>
            <a href="#signup">{fullname}</a>
          </Col>
        );
      } else {
        return (
          <Col xs={6} className={css.no_auth}>
            <button onClick={this.showModal}>Login</button>
            <a>|</a>
            <a href="#signup">Sign Up</a>
          </Col>
        );
      }
    }

    return (
      <Container className={css.prenav} fluid={true}>
        <Container>
          <Row>
            <Col xs={6}>
              <HeaderIcon icon={"facebook-f"} href={accounts.facebook} />
              <HeaderIcon icon={"twitter"} href={accounts.twitter} />
              <HeaderIcon icon={"instagram"} href={accounts.instagram} />
              <HeaderIcon icon={"linkedin-in"} href={accounts.linkedin} />
              <HeaderIcon icon={"youtube"} href={accounts.youtube} />
            </Col>
            {renderAccount()}
          </Row>
        </Container>

        <Login visible={this.state.modalVisible} close={this.hideModal} />
      </Container>
    );
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
            <Nav.Link href="/topics" className={css.links}>Topic Bank</Nav.Link>
            <Nav.Link href="#link" className={css.links}>Forum</Nav.Link>
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

const mapStateToProps = state => ({
  user: state.user
});

export const PreNavBar = connect(mapStateToProps)(PreNavbar);