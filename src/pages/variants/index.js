import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Cover, Shader, Spacer } from '~/components/layout.js';
import { EditEntityButton } from '~/components/button.js';
import { Paragraph } from '~/components/text.js';
import { BottomToolbar } from '~/components/toolbar.js';
import { Fader } from '~/components/transitioner.js';
import { cloudinary } from '~/constants/settings.js';

import CLEARANCES from '~/constants/clearances.js';
import css from '~/styles/info.scss';

class Variants extends Component {
  /** Retrieve information from server */
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor(){
    super();
    this.state = { isLoaded: false}
  }

  componentDidMount(){
    this.setState({isLoaded: true});
  }

  render(){
    const { user, description, url, pageText,
    coverImage, imageLogo, imageAlt, } = this.props;
    
    const image = <img
      src={`${cloudinary.url}/public/logos/${imageLogo}`}
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

          <Fader determinant={this.state.isLoaded} duration={750} delay={1500}>
            <div className={css.container}>
              <Paragraph className={css.text}>{pageText}</Paragraph>
            </div>
          </Fader>

          {user.clearance >= CLEARANCES.ACTIONS.EDIT_VARIANTS ? 
            <BottomToolbar>
              <EditEntityButton
                title={'Edit Page'}
                onClick={() => location.href = `${url}/edit/`} />
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