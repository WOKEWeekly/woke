import React, { Component} from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import { EditEntityButton, BackButton } from '~/components/button.js';
import { PromoIconsBar } from '~/components/icon.js';
import { Title, Subtitle, Paragraph, Divider } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Shader, Spacer } from '~/components/layout.js';
import { Fader, Slider } from '~/components/transitioner.js';

import CLEARANCES from '~/constants/clearances.js';
import { countriesToString } from '~/constants/countries.js';
import { calculateAge } from '~/constants/date.js';
import { cdn } from '~/constants/settings.js';
import css from '~/styles/team.scss';

class MemberPage extends Component {

  /** Retrieve member from server */
  static async getInitialProps({ query }) {
    return { member: query.member };
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

    const { member, user, countries } = this.props;
    member.fullname = `${member.firstname} ${member.lastname}`;
    member.description = member.description && member.description.trim().length > 0 ? member.description : 'No description.';
    member.age = calculateAge(member.birthday);
    member.demonyms = countriesToString(JSON.parse(member.ethnicity), countries);

    const isExecutive = member.level === 'Executive';

    return (
      <Spacer>
        <Shader>
          <Container className={css.entity}>
            <Slider
              determinant={imageLoaded}
              duration={800}
              direction={'left'}> 
              <img
                src={`${cdn}${member.image}`}
                alt={member.fullname}
                className={css.image}
                onLoad={() => this.setState({imageLoaded: true})} />
            </Slider>
            <div className={css.details}>
              <Fader
                determinant={isLoaded}
                duration={500}>
                <Title className={css.title}>{member.fullname}</Title>
              </Fader>
              <Fader
                determinant={isLoaded}
                duration={500}
                delay={500}>
                <Subtitle className={css.subtitle}>
                  {member.role} • {member.age} • {member.demonyms}
                </Subtitle>
                <PromoIconsBar socials={member.socials} />
              </Fader>
              <Fader
                determinant={isLoaded}
                duration={500}
                delay={1000}>
                <Divider />
                <Paragraph className={css.description}>{member.description}</Paragraph>
              </Fader>
            </div>
          </Container>
        </Shader>
        
        <BottomToolbar>
          {isExecutive ?
          <BackButton
            title={'Back to Executives'}
            onClick={() => location.href = '/executives'} /> : null}

          {user.clearance >= CLEARANCES.ACTIONS.CRUD_TEAM ? 
            <EditEntityButton
              title={isExecutive ? 'Edit Executive' : 'Edit Member'}
              onClick={() => location.href = `/team/edit/${member.id}`}/>
          : null}
        </BottomToolbar>

      </Spacer>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user,
  countries: state.countries
});

export default connect(mapStateToProps)(MemberPage);