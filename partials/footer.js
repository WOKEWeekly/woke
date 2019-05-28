import React, { Component } from 'react';
import {Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { accounts } from '~/constants/settings.js';
import { colors } from '~/constants/theme.js';

import css from '~/styles/_partials.scss';


export default class Footer extends Component {
	render(){
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
          <Icon icon={"facebook-f"} href={accounts.facebook} />
          <Icon icon={"twitter"} href={accounts.twitter} />
          <Icon icon={"instagram"} href={accounts.instagram} />
        </Row>
        <Row style={{justifyContent: 'center'}}>
          <Icon icon={"linkedin-in"} href={accounts.linkedin} />
          <Icon icon={"youtube"} href={accounts.youtube} />
        </Row>
      </div>
    )
  }
}

/** Social media icon template */
class Icon extends Component {
  constructor(){
    super();
    this.state = {
      isLoaded: false
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

  render(){
    if (this.state.isLoaded){
      return (
        <div className={css.socials}>
          <a href={this.props.href}>
            <FontAwesomeIcon
              icon={["fab", this.props.icon]}
              color={colors.primary}
              size={'3x'} />
          </a>
        </div>
      )
    } else {
      return null;
    }
   
  }
}