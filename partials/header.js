import React, { Component } from "react";
import {Container, Nav, Navbar, NavDropdown} from 'react-bootstrap';

import { emails } from '../constants/info.js';

export default class Header extends Component {
	render(){
		return (
      <div>
        <Container>
          <a href="#home">Nice</a>
        </Container>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Navbar.Brand href="#home">
            <img
              src="/static/images/logos/wokeweekly-logo.png"
              height="70"
              className="d-inline-block align-top"
              alt="#WOKEWeekly Logo" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Sessions</Nav.Link>
              <Nav.Link href="#link">Topic Suggestions</Nav.Link>
              <NavDropdown title="Topics" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Topic Suggestions</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">Topic Bank</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="#link">#BlackExcellence</Nav.Link>
              <Nav.Link href="#link">The Exec</Nav.Link>
              <Nav.Link href="#link">About</Nav.Link>
              <Nav.Link href={`mailto: ${emails.enquiries}`}>Contact</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
		);
	}
}