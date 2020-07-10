import classNames from 'classnames';
import React, { Component } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon
} from 'react-share';

import css from 'styles/components/Icon.module.scss';

import { alert } from './alert';
import { Icon } from './icon';
import { Title } from './text';

export class SocialMediaShareBlock extends Component {
  render() {
    const { message, url } = this.props;

    return (
      <div className={css['social-media-share-block']}>
        <Title>Share This Post:</Title>
        <div className={css['social-media-share-buttons']}>
          <ShareFacebook message={message} url={url} />
          <ShareTwitter message={message} url={url} />
          <ShareLinkedin message={message} url={url} />
          <ShareWhatsapp message={message} url={url} />
          <ShareLink url={url} />
        </div>
      </div>
    );
  }
}

class ShareFacebook extends Component {
  render() {
    const { message, url } = this.props;
    return (
      <FacebookShareButton
        className={css['post_share_icons_onhover']}
        quote={message}
        url={url}>
        <FacebookIcon size={50} round={true} />
      </FacebookShareButton>
    );
  }
}

class ShareTwitter extends Component {
  render() {
    const { message, url } = this.props;
    const handle = 'wokeweeklyuk'; // TODO: Abstract handle
    return (
      <TwitterShareButton
        className={css['post_share_icons_onhover']}
        title={message}
        url={url}
        via={handle}>
        <TwitterIcon size={50} round={true} />
      </TwitterShareButton>
    );
  }
}

class ShareWhatsapp extends Component {
  render() {
    const { message, url } = this.props;
    return (
      <WhatsappShareButton
        className={css['post_share_icons_onhover']}
        title={message}
        separator={'\n'}
        url={url}>
        <WhatsappIcon size={50} round={true} />
      </WhatsappShareButton>
    );
  }
}

class ShareLinkedin extends Component {
  render() {
    const { message, url } = this.props;

    return (
      <LinkedinShareButton
        className={css['post_share_icons_onhover']}
        title={message}
        url={url}>
        <LinkedinIcon size={50} round={true} />
      </LinkedinShareButton>
    );
  }
}

const ShareLink = ({ url }) => {
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert.success("Copied this article's link to clipboard!");
  };
  const classes = classNames(
    css['copy-link-button'],
    css.post_share_icons_onhover
  );
  return (
    <button className={classes} onClick={copyLink}>
      <div>
        <Icon name={'link'} className={css['copy-link-icon']} />
      </div>
    </button>
  );
};
