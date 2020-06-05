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

import css from '@styles/components/Icon.module.scss';

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
      <FacebookShareButton quote={message} url={url}>
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
      <TwitterShareButton title={message} url={url} via={handle}>
        <TwitterIcon size={50} round={true} />
      </TwitterShareButton>
    );
  }
}

class ShareWhatsapp extends Component {
  render() {
    const { message, url } = this.props;
    return (
      <WhatsappShareButton title={message} separator={'\n'} url={url}>
        <WhatsappIcon size={50} round={true} />
      </WhatsappShareButton>
    );
  }
}

class ShareLinkedin extends Component {
  render() {
    const { message, url } = this.props;
    return (
      <LinkedinShareButton title={message} url={url}>
        <LinkedinIcon size={50} round={true} />
      </LinkedinShareButton>
    );
  }
}

const ShareLink = ({ url }) => {
  const copyLink = () => {
    navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
      if (result.state == 'granted' || result.state == 'prompt') {
        navigator.clipboard.writeText(url).then(
          () => alert.success('Copied this article\'s link to clipboard!'),
          () => alert.error('Failed to copy this link.')
        );
      }
    });
  };
  return (
    <button className={css['copy-link-button']} onClick={copyLink}>
      <div>
        <Icon name={'link'} className={css['copy-link-icon']} />
      </div>
    </button>
  );
};
