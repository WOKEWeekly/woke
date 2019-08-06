import React, { Component } from 'react';
import { Container, Col, Row, Dropdown, Nav, Navbar } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clearUser } from '~/reducers/actions';
import Router from 'next/router';

import { alert, setAlert, checkAlert, displayErrorMessage } from '~/components/alert.js';
import { Icon, HeaderIcon } from '~/components/icon';
import { Default, Mobile, zIndices } from '~/components/layout';

import { accounts } from '~/constants/settings.js';
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
      const { user, theme } = this.props;
      const { firstname, lastname, clearance, fullname, isAuthenticated } = user;
  
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
                <Dropdown.Item className={css.dropdown_item} onClick={() => Router.push('/account')}>Your Account</Dropdown.Item>
                {clearance >= CLEARANCES.ACTIONS.VIEW_TEAM ?
                <Dropdown.Item className={css.dropdown_item} onClick={() => location.href = '/team'}>Team Members</Dropdown.Item>
                :null}
                <Dropdown.Item className={css.dropdown_item} onClick={this.logOut}>Log Out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        );
      } else {
        return (
          <Col xs={6} className={css[`no_auth-${theme}`]}>
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
    image.src = `/static/images/bg/nav-${this.props.theme}-bg.jpg`;
    image.onload = () => this.setState({imageLoaded: true, imageSrc: image.src});
  }

  render(){
    const { user, theme } = this.props;
    const { imageLoaded, imageSrc } = this.state;

    const classes = css[`${theme}-links`];

    if (!imageLoaded) return null;

    return (
      <Navbar className={css[`nav-${theme}`]} variant="dark" expand="lg" sticky="top"
        style={{ backgroundImage: `url(${imageSrc})` }}>
        <Navbar.Brand className={css.brand} href="/">
          <img
            src="/static/images/logos/wokeweekly-logo.png"
            height="40"
            alt="#WOKEWeekly Logo" />
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ml-auto">
            <Nav.Link href="/sessions" className={classes}>Sessions</Nav.Link>
            {user.clearance >= CLEARANCES.ACTIONS.VIEW_TOPICS ?
            <Nav.Link href="/topics" className={classes}>Topic Bank</Nav.Link> : null}
            {/* <Nav.Link href="#link" className={classes}>Forum</Nav.Link> */}
            <Nav.Link href="/blackexcellence" className={classes}>#BlackExcellence</Nav.Link>
            <Nav.Link href="/mentalhealth" className={classes}>Mental Health</Nav.Link>
            <Nav.Link href="/executives" className={classes}>The Executives</Nav.Link>
            <Nav.Link href="/about" className={classes}>About Us</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  theme: state.theme
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    clearUser
  }, dispatch)
);

export const PreNavBar = connect(mapStateToProps, mapDispatchToProps)(PreNavbar);
export const MainNavBar = connect(mapStateToProps, mapDispatchToProps)(MainNavbar);