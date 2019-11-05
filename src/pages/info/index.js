import React, { Component } from 'react';
import { connect } from 'react-redux';

import CLEARANCES from '~/constants/clearances.js';

import { EditEntityButton } from '~/components/button.js';
import { Shader, Spacer } from '~/components/layout.js';
import { Icon } from '~/components/icon.js';
import { Paragraph } from '~/components/text.js';
import { BottomToolbar } from '~/components/toolbar.js';
import { Fader } from '~/components/transitioner.js';

import { formatDate } from '~/constants/date.js';
import { accounts } from '~/constants/settings.js';

import css from '~/styles/info.scss';

class Info extends Component {
  /** Retrieve information from server */
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  componentDidMount(){
    this.setState({ isLoaded: true })
  }

  render(){
    const { isLoaded } = this.state;
    const { user, pageText, url, lastModified } = this.props;

    return (
      <Fader determinant={isLoaded} duration={750}>
        <Spacer>
          <Shader>
            <div className={css.container}>
              <Paragraph
                className={css.text}
                substitutions={{lastModified: formatDate(lastModified)}}>{pageText}</Paragraph>

              {url === '/donate' ?
                <button className={css.donate} onClick={() => window.open(accounts.paypal, '_blank')}>
                  <Icon name={'paypal'} prefix={'fab'} />
                  Donate with PayPal
                </button>
              : null}
            </div>
          </Shader>

          {user.clearance >= CLEARANCES.ACTIONS.EDIT_INFO ? 
            <BottomToolbar>
              <EditEntityButton
                title={'Edit Text'}
                onClick={() => location.href = `${url}/edit/`} />
            </BottomToolbar>
          : null}
          </Spacer>
      </Fader>
    );
  
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Info);