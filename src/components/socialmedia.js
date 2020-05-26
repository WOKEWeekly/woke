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

import { Title } from './text';

export class SocialMediaShareBlock extends Component {
  render() {
    const { message, url } = this.props;

    return (
      <div className={css.smshareblock}>
        <Title>Share This Post:</Title>
        <div className={'mt-2'}>
          <ShareFacebook message={message} url={url} />
          <ShareTwitter message={message} url={url} />
          <ShareLinkedin message={message} url={url} />
          <ShareWhatsapp message={message} url={url} />
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
