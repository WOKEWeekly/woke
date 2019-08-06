import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';

import css from '~/styles/_components.scss';
import { socialPlatforms } from '~/constants/settings.js';

export class Icon extends Component {
  render(){
    return (
      <FontAwesomeIcon
        icon={[this.props.prefix || 'fas', this.props.name]}
        color={this.props.color || 'white'}
        style={{ marginRight: '0.4em', ...this.props.style }} />
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

/** Bar of mini icons for social promotion on profiles */
export class PromoIconsBar extends Component {
  render(){
    const socials = JSON.parse(this.props.socials);

    const renderIcons = () => {
      const items = [];
      
      if (socials){
        for (const [index, item] of Object.entries(socials)) {
          if (item && item !== ''){
            let social = socialPlatforms[index];
            if (!social) return;
            items.push(
              <SocialIcon
                key={index}
                className={css.promo_socials}
                icon={social.icon}
                href={`${social.domain}${item}`}
                {...this.props} />
            );
          }
        }  
      }
      return items;
    }

    return <div className={css.promo_bar}>{renderIcons()}</div>
  }
}

export class _SocialsList extends Component {

  render(){

    const listSocials = (socials) => {
      if (!socials) return null;

      const items = [];
      for (const [idx, item] of Object.entries(socials)) {
        if (item && item !== ''){
          let social = socialPlatforms[idx];
          if (!social) return;

          let link = `${social.domain}${item}`;
          items.push(
            <div key={idx} className={css[`socials-${theme}`]}>
              {social.name}:
              <a href={link} target={'_blank'}>{social.domain ? `@${item}` : link}</a>
            </div>
          );
        }
      }

      return items;
    }

    const { theme, socials } = this.props;

    return (
      <div className={'mt-2'}>{listSocials(socials)}</div>
    )
  }
}

/** Template for social icons */
class _SocialIcon extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

  render(){
    if (!this.state.isLoaded) return null;

    const { theme, icon, size } = this.props

    return (
      <a target={'_blank'} {...this.props}>
        <FontAwesomeIcon
          icon={['fab', icon]}
          className={css[`socialIcon-${theme}`]}
          size={size} />
      </a>
    );
  }
}

const mapStateToProps = (state) => ({
  theme: state.theme
});

export const SocialsList = connect(mapStateToProps)(_SocialsList);
export const SocialIcon = connect(mapStateToProps)(_SocialIcon);