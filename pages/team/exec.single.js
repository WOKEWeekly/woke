import React, { Component} from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import Router from 'next/router';

import { EditButton, BackButton } from '~/components/button.js';
import { PromoIconsBar } from '~/components/icon.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Shader, Spacer } from '~/components/layout.js';
import { Fader, Slider } from '~/components/transitioner.js';

import CLEARANCES from '~/constants/clearances.js';
import { countriesToString } from '~/constants/countries.js';
import { calculateAge } from '~/constants/date.js';
import Meta from '~/partials/meta.js';
import css from '~/styles/blackex.scss';

class ExecPage extends Component {

  /** Retrieve member from server */
  static async getInitialProps({ query }) {
    return { exec: query.exec };
  }

  constructor(){
    super();
    this.state = {
      isLoaded: false,
      imageLoaded: false
    }
  }

  componentDidMount(){
    this.setState({isLoaded: true})
  }

  render(){
    const { isLoaded, imageLoaded } = this.state;

    const { exec, user } = this.props;
    exec.fullname = `${exec.firstname} ${exec.lastname}`;
    exec.description = exec.description && exec.description.trim().length > 0 ? exec.description : 'No description.';
    exec.age = calculateAge(exec.birthday);
    exec.demonyms = countriesToString(JSON.parse(exec.ethnicity));

    return (
      <Spacer>
        <Meta
          title={`${exec.fullname} | #WOKEWeekly`}
          description={exec.description}
          url={`/executives/${exec.slug}`}
          image={`/static/images/team/${exec.image}`}
          alt={exec.fullname} />

        <Shader>
          <Container className={css.entity}>
            <Slider
              determinant={imageLoaded}
              duration={800}
              direction={'left'}> 
              <img
                src={`/static/images/team/${exec.image}`}
                alt={exec.fullname}
                className={css.image}
                onLoad={() => this.setState({imageLoaded: true})} />
            </Slider>
            <div className={css.details}>
              <Fader
                determinant={isLoaded}
                duration={500}>
                <Title className={css.title}>{exec.fullname}</Title>
              </Fader>
              <Fader
                determinant={isLoaded}
                duration={500}
                delay={500}>
                <Subtitle className={css.subtitle}>
                  {exec.role} • {exec.age} • {exec.demonyms}
                </Subtitle>
                <PromoIconsBar socials={exec.socials} />
              </Fader>
              <Fader
                determinant={isLoaded}
                duration={500}
                delay={1000}>
                <Divider />
                <Paragraph className={css.description}>{exec.description}</Paragraph>
              </Fader>
            </div>
          </Container>
        </Shader>
        
        <BottomToolbar>
          <BackButton
            title={'Back to Executives'}
            onClick={() => Router.push('/executives')} />

          {user.clearance >= CLEARANCES.ACTIONS.CRUD_TEAM ? 
            <EditButton
              title={'Edit Executive'}
              onClick={() => Router.push(`/team/edit/${exec.id}`)}/>
          : null}
        </BottomToolbar>

      </Spacer>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(ExecPage);