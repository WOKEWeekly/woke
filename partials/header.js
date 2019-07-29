import React, { Component } from 'react';
import { Container, Col, Row, Dropdown, Nav, Navbar } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clearUser } from '~/reducers/actions';
import Router from 'next/router';

import { alert, setAlert, checkAlert, displayErrorMessage } from '~/components/alert.js';
import { Icon, HeaderIcon } from '~/components/icon';
import { Default, Mobile, zIndices } from '~/components/layout';

import { accounts, emails } from '~/constants/settings.js';
import CLEARANCES from '~/constants/clearances.js';
import Login from '~/pages/_auth/login';
import css from '~/styles/_partials.scss';

/** Little top bar for social media icons and account details */
class PreNavbar extends Component {
  constructor(){
    super();
    this.state = {
      isLoaded: false,
      modalVisible: false
    }

    checkAlert();
  }

  componentDidMount(){
    this.setState({isLoaded: true})
  }

  /** Show and hide login modal */
  showModal = () => this.setState({modalVisible: true});
  hideModal = () => this.setState({modalVisible: false});

  /** Log out, de-authenticating the user */
  logOut = () => {
    fetch('/logout', { method: 'POST' })
    .then(res => {
      if (res.ok){
        this.props.clearUser();
        setAlert({ type: 'info', message: 'You have successfully logged out.' });
        location.reload();
      } else {
        alert.error(res.statusText);
      }
    }).catch(error => {
      displayErrorMessage(error);
    });
  }

  render(){

    /** If authenticated, show name. Else, show option to login/register */
    const renderAccount = () => {
      const { firstname, lastname, fullname, isAuthenticated } = this.props.user;
  
      if (isAuthenticated){
        return (
          <Col xs={6} className={css.auth}>
            <Dropdown style={{zIndex: zIndices.accountMenu}} alignRight>
              <Dropdown.Toggle variant="dark">
                <Icon name={'user'} />
                <Default>{fullname}</Default>
                <Mobile>{firstname} {lastname.substring(0,1)}.</Mobile>
              </Dropdown.Toggle>
              <Dropdown.Menu className={css.dropdown_menu}>
                <Dropdown.Item className={css.dropdown_item} onClick={() => Router.push('/account')} eventKey={'1'}>Your Account</Dropdown.Item>
                <Dropdown.Item className={css.dropdown_item} onClick={this.logOut}>Log Out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        );
      } else {
        return (
          <Col xs={6} className={css.no_auth}>
            <button className={css.link} onClick={this.showModal}>Login</button>
            <a className={css.divider}>|</a>
            <button className={css.link} onClick={() => location.href = '/signup'}>Sign Up</button>
          </Col>
        );
      }
    }

    if (this.state.isLoaded){
      return (
        <div className={css.prenav}>
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
        </div>
      );
    } else {
      return null;
    }
    
  }
}

/** Main navigation bar with routes */
export class MainNavbar extends Component {
  constructor(){
    super();
    this.state = {
      imageLoaded: false,
      imageSrc: ''
    }
  }

  componentDidMount(){
    const image = new Image();
    image.src = '/static/images/bg/nav-bg.jpg';
    image.onload = () => this.setState({imageLoaded: true, imageSrc: image.src});
  }

  render(){
    const { user } = this.props;
    const { imageLoaded, imageSrc } = this.state;

    if (imageLoaded){
      return (
        <Navbar className={css.nav} variant="dark" expand="lg" sticky="top" style={{backgroundImage: `url(${imageSrc})`}}>
          <Navbar.Brand href="/">
            <img
              src="/static/images/logos/wokeweekly-logo.png"
              height="40"
              alt="#WOKEWeekly Logo" />
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ml-auto">
              <Nav.Link href="/sessions" className={css.links}>Sessions</Nav.Link>
              {user.clearance >= CLEARANCES.ACTIONS.VIEW_TOPICS ?
              <Nav.Link href="/topics" className={css.links}>Topic Bank</Nav.Link> : null}
              {/* <Nav.Link href="#link" className={css.links}>Forum</Nav.Link> */}
              <Nav.Link href="/blackexcellence" className={css.links}>#BlackExcellence</Nav.Link>
              <Nav.Link href="/executives" className={css.links}>The Executives</Nav.Link>
              <Nav.Link href="/about" className={css.links}>About Us</Nav.Link>
              <Nav.Link href={`mailto: ${emails.enquiries}`} className={css.links}>Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      );
    } else {
      return null;
    }
    
  }
}

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    clearUser
  }, dispatch)
);

export const PreNavBar = connect(mapStateToProps, mapDispatchToProps)(PreNavbar);
export const MainNavBar = connect(mapStateToProps, mapDispatchToProps)(MainNavbar);