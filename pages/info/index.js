import React, { Component } from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import CLEARANCES from '~/constants/clearances.js';

import { EditEntityButton } from '~/components/button.js';
import { Shader, Spacer } from '~/components/layout.js';
import { Paragraph } from '~/components/text.js';
import { BottomToolbar } from '~/components/toolbar.js';
import { Fader } from '~/components/transitioner.js';

import { formatDate } from '~/constants/date.js';

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
            </div>
          </Shader>

          {user.clearance >= CLEARANCES.ACTIONS.EDIT_INFO ? 
            <BottomToolbar>
              <EditEntityButton
                title={'Edit Text'}
                onClick={() => Router.push(`${url}/edit/`)} />
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