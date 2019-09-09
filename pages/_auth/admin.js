import React, { Component} from 'react';
import { connect } from 'react-redux';

import { alert } from '~/components/alert.js';
import { TextInput } from '~/components/form';
import { Shader } from '~/components/layout.js';
import { ConfirmModal } from '~/components/modal.js';

import { domain } from '~/constants/settings.js';
import request from '~/constants/request.js';
import css from '~/styles/auth.scss';

class Admin extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      ...props.user,
      generateTokenModal: false,
      accessInput: null,
      accessLink: '',
      tokenGenerated: false,
    }

    if (props.user.clearance < 8){
      return location.href = '/';
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

  /** Regenerate a new Topic Bank access token */
  generateTopicBankToken = () => {
    request({
      url: '/generateTopicBankToken',
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Content-Type': 'application/json'
      },
      onSuccess: (response) => {
        alert.success('Topic Bank token successfully regenerated.');
        this.setState({
          tokenGenerated: true,
          accessLink: `${domain}/topics?access=${response.token}`
        });
        this.hideGenerateTokenModal(); 
      }
    });
  }

  /** Copy access link to clipboard */
  copyAccessLink = () => {
    navigator.permissions.query({name: "clipboard-write"}).then(result => {
      if (result.state == "granted" || result.state == "prompt") {
        navigator.clipboard.writeText(this.state.accessLink).then(() => {
          alert.success('Access link copied!')
        }, () => {
          alert.error('Could not copy access link.');
        });
      }
    });
  }

  showGenerateTokenModal = () => { this.setState({generateTokenModal: true})}
  hideGenerateTokenModal = () => { this.setState({generateTokenModal: false})}

  render(){
    const { isLoaded, generateTokenModal, accessLink, tokenGenerated } = this.state
    if (!isLoaded) return null;

    return (
      <React.Fragment>
        <Shader>
          <div className={css.container}>
            <button onClick={this.showGenerateTokenModal}>Regenerate Topic Bank Token</button>
            <div style={{ visibility: tokenGenerated ? 'visible' : 'hidden'}}>
              <TextInput
                value={accessLink}
                onChange={null}
                readOnly />
              <button onClick={this.copyAccessLink}>Copy Link</button>
            </div>
            
          </div>
        </Shader>

        <ConfirmModal
          visible={generateTokenModal}
          message={
            `Are you sure you want to regenerate the access token for the Topic Bank? The previous link will no longer work.`
          }
          confirmFunc={this.generateTopicBankToken}
          confirmText={'Regenerate'}
          close={this.hideGenerateTokenModal} />
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Admin);