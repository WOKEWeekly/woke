import React, { Component} from 'react';
import { Title } from './text';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, LinkedinShareButton,
  FacebookIcon, TwitterIcon, LinkedinIcon, WhatsappIcon } from 'react-share';

export class SocialMediaShareBlock extends Component {
  render(){
    const { message, url } = this.props;

    const css = {
      smshareblock: { margin: '1.5em 0' },
      button
    } 

    return (
      <div className={css.smshareblock}>
        <Title>Share This Post:</Title>
        <div className={"mt-2"}>
          <ShareFacebook message={message} url={url} />
          <ShareTwitter message={message} url={url} />
          <ShareLinkedin message={message} url={url} />
          <ShareWhatsapp message={message} url={url} />
        </div>
        <style jsx>{`
          .smshareblock {
            margin: 1.5em 0;
            button {
              margin-right: .2em;
            }
          }
        `}</style>
      </div>
    )
  }
}

class ShareFacebook extends Component {
  render(){
    const { message, url } = this.props;
    return (
      <FacebookShareButton
        quote={message}
        url={url}>
        <FacebookIcon size={50} round={true} />
      </FacebookShareButton>
    )
  }
}

class ShareTwitter extends Component {
  render(){
    const { message, url } = this.props;
    const handle = 'wokeweeklyuk'; // TODO: Abstract handle
    return (
      <TwitterShareButton
        title={message}
        url={url}
        via={handle}>
        <TwitterIcon size={50} round={true} />
      </TwitterShareButton>
    )
  }
}

class ShareWhatsapp extends Component {
  render(){
    const { message, url } = this.props;
    return (
      <WhatsappShareButton
        title={message}
        separator={'\n'}
        url={url}>
        <WhatsappIcon size={50} round={true} />
      </WhatsappShareButton>
    )
  }
}

class ShareLinkedin extends Component {
  render(){
    const { message, url } = this.props;
    return (
      <LinkedinShareButton
        title={message}
        url={url}>
        <LinkedinIcon size={50} round={true} />
      </LinkedinShareButton>
    )
  }
}