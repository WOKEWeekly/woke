import React, { Component } from 'react';
import { connect } from 'react-redux';

import { alert } from 'components/alert.js';
import { SubmitButton } from 'components/button.js';
import { Icon } from 'components/icon';
import { Shader } from 'components/layout.js';
import { ConfirmModal } from 'components/modal.js';
import request from 'constants/request.js';
import { domain } from 'constants/settings.js';
import css from 'styles/Auth.module.scss';

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      ...props.user,
      generateTokenModal: false,
      accessInput: null,
      accessLink: '',
      tokenGenerated: false
    };

    if (props.user.clearance < 8) {
      return (location.href = '/');
    }
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  /** Regenerate a new Topic Bank access token */
  generateTopicBankToken = () => {
    request({
      url: '/api/v1/topics/token',
      method: 'GET',
      headers: { Authorization: `Bearer ${this.props.user.token}` },
      onSuccess: ({ token }) => {
        alert.success('Topic Bank token successfully regenerated.');
        this.setState({
          tokenGenerated: true,
          accessLink: `${domain}/topics?access=${token}`
        });
        this.hideGenerateTokenModal();
      }
    });
  };

  /** Copy access link to clipboard */
  copyAccessLink = () => {
    navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
      if (result.state == 'granted' || result.state == 'prompt') {
        navigator.clipboard.writeText(this.state.accessLink).then(
          () => {
            alert.success('Access link copied!');
          },
          () => {
            alert.error('Could not copy access link.');
          }
        );
      }
    });
  };

  showGenerateTokenModal = () => {
    this.setState({ generateTokenModal: true });
  };
  hideGenerateTokenModal = () => {
    this.setState({ generateTokenModal: false });
  };

  render() {
    const {
      isLoaded,
      generateTokenModal,
      accessLink,
      tokenGenerated
    } = this.state;
    if (!isLoaded) return null;

    return (
      <React.Fragment>
        <Shader>
          <div className={css.container}>
            <SubmitButton onClick={this.showGenerateTokenModal}>
              Regenerate Topic Bank Token
            </SubmitButton>
            <div
              className={css.generatedLink}
              style={{ visibility: tokenGenerated ? 'visible' : 'hidden' }}>
              <a href={accessLink} className={css['link-default']}>
                {accessLink}
              </a>
              <button
                className={css.invisible_button}
                onClick={this.copyAccessLink}>
                <Icon name={'copy'} prefix={'far'} />
              </button>
            </div>
          </div>
        </Shader>

        <ConfirmModal
          visible={generateTokenModal}
          message={`Are you sure you want to regenerate the access token for the Topic Bank? The previous link will no longer work.`}
          confirmFunc={this.generateTopicBankToken}
          confirmText={'Regenerate'}
          close={this.hideGenerateTokenModal}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(Admin);
