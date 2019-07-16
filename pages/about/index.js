import React, { Component } from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import CLEARANCES from '~/constants/clearances.js';

import { EditButton } from '~/components/button.js';
import { Shader, Spacer } from '~/components/layout.js';
import { Paragraph } from '~/components/text.js';
import { BottomToolbar } from '~/components/toolbar.js';

import Meta from '~/partials/meta.js';

import css from '~/styles/about.scss';

class About extends Component {
  constructor(){
    super();
    this.state = {
      isLoaded: false,
      text: ''
    }
  }

  componentDidMount(){
    this.getDescription();
  }

  /** Retrieve text from about.txt */
  getDescription = () => {
    fetch('/static/resources/about.txt')
    .then(res => res.text())
    .then(text => this.setState({ text, isLoaded: true}));
  }

  render(){
    const { isLoaded, text } = this.state;
    const { user } = this.props;

    if (!isLoaded) return null;

    return (
      <Spacer>
        <Meta
          title={'About Us'}
          description={text}
          url={'/about'} />

        <Shader>
          <div className={css.container}>
            <Paragraph className={css.text}>{text}</Paragraph>
          </div>
        </Shader>

        <BottomToolbar>
          {user.clearance >= CLEARANCES.ACTIONS.EDIT_ABOUT ? 
            <EditButton
              title={'Edit Text'}
              onClick={() => Router.push('/about/edit/')} />
          : null}
        </BottomToolbar>
      </Spacer>
    );
  
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(About);