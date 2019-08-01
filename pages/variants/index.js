import React, { Component } from 'react';
import { connect } from 'react-redux';
import Router from 'next/router';

import { Cover, Shader, Spacer } from '~/components/layout.js';
import { EditEntityButton } from '~/components/button.js';
import { Paragraph } from '~/components/text.js';
import { BottomToolbar } from '~/components/toolbar.js';

import CLEARANCES from '~/constants/clearances.js';
import css from '~/styles/variants.scss';

class Variants extends Component {
  /** Retrieve information from server */
  static async getInitialProps({ query }) {
    return { ...query };
  }

  render(){
    const { user, description, url, pageText,
    coverImage, imageLogo, imageAlt, } = this.props;
    
    const image = <img
      src={`/static/images/logos/${imageLogo}`}
      alt={imageAlt}
      className={css.imageLogo} />

    return (
      <Shader>
        <Spacer gridrows={'auto 1fr auto'}>
          <Cover
            subtitle={description}
            image={coverImage}
            height={350}
            backgroundPosition={'center'}
            imageTitle={image} />

          <div className={css.container}>
            <Paragraph className={css.text}>{pageText}</Paragraph>
          </div>

          {user.clearance >= CLEARANCES.ACTIONS.EDIT_VARIANTS ? 
            <BottomToolbar>
              <EditEntityButton
                title={'Edit Page'}
                onClick={() => Router.push(`${url}/edit/`)} />
            </BottomToolbar>
          : null}
        </Spacer>
      </Shader>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Variants);