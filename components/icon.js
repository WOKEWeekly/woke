import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { colors } from '~/constants/theme.js';

import css from '~/styles/_components.scss';

export class Icon extends Component {
  render(){
    return (
      <FontAwesomeIcon
        icon={['fas', this.props.name]}
        color={this.props.color || 'white'}
        style={{ marginRight: '0.4em' }} />
    ) 
  }
}

/** Header social media icons */
export class HeaderIcon extends Component {
  render(){
    return (
      <SocialIcon
        icon={this.props.icon}
        href={this.props.href}
        className={css.header_socials} />
    )
  }
}

/** Footer social media icons */
export class FooterIcon extends Component {
  render(){
    return (
      <div className={css.footer_socials}>
        <SocialIcon
          icon={this.props.icon}
          href={this.props.href}
          size={'3x'} />
      </div>
    )
  }
}

/** Mini icons for social promotion on profiles */
export class PromoIcon extends Component {
  render(){
    return (
      <SocialIcon
        className={css.promo_socials}
        icon={this.props.icon}
        href={this.props.href}
        {...this.props} />
    )
  }
}

/** Template for social icons */
export class SocialIcon extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

  render(){
    if (this.state.isLoaded){
      return (
        <a {...this.props}>
          <FontAwesomeIcon
            icon={['fab', this.props.icon]}
            color={colors.primary}
            size={this.props.size} />
        </a>
      );
    } else {
      return null;
    }
  }
}