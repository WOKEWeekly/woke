import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { EditEntityButton, BackButton } from 'components/button.js';
import { PromoIconsBar } from 'components/icon.js';
import { Shader, Spacer } from 'components/layout.js';
import { Title, Subtitle, Paragraph, Divider } from 'components/text.js';
import { BottomToolbar } from 'components/toolbar.js';
import { Fader, Slider } from 'components/transitioner.js';
import CLEARANCES from 'constants/clearances.js';
import { countriesToString } from 'constants/countries.js';
import { cloudinary } from 'constants/settings.js';
import css from 'styles/pages/Members.module.scss';

class MemberPage extends Component {
  static async getInitialProps({ query }) {
    return { member: query.member };
  }

  constructor() {
    super();
    this.state = {
      isLoaded: false,
      imageLoaded: false
    };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  render() {
    const { isLoaded, imageLoaded } = this.state;

    const { member, user, countries } = this.props;
    member.fullname = `${member.firstname} ${member.lastname}`;
    member.description =
      member.description && member.description.trim().length
        ? member.description
        : 'No description.';
    member.age = zDate.calculateAge(member.birthday);
    member.demonyms = countriesToString(
      JSON.parse(member.ethnicity),
      countries
    );

    const ReturnButton = () => {
      if (member.level === 'Guest') {
        return (
          <BackButton
            title={'Back to Blog'}
            onClick={() => (location.href = '/blog')}
          />
        );
      } else {
        return (
          <BackButton
            title={'Back to Team'}
            onClick={() => (location.href = '/team')}
          />
        );
      }
    };

    return (
      <Spacer>
        <Shader>
          <Container className={css.entity}>
            <Slider determinant={imageLoaded} duration={800} direction={'left'}>
              <img
                src={`${cloudinary.url}/${member.image}`}
                alt={member.fullname}
                className={css.image}
                onLoad={() => this.setState({ imageLoaded: true })}
              />
            </Slider>
            <div className={css.details}>
              <Fader determinant={isLoaded} duration={500}>
                <Title className={css.title}>{member.fullname}</Title>
              </Fader>
              <Fader determinant={isLoaded} duration={500} delay={500}>
                <Subtitle className={css.subtitle}>
                  {member.role} • {member.age} • {member.demonyms}
                </Subtitle>
                <PromoIconsBar socials={member.socials} />
              </Fader>
              <Fader determinant={isLoaded} duration={500} delay={1000}>
                <Divider />
                <Paragraph className={css.description}>
                  {member.description}
                </Paragraph>
              </Fader>
            </div>
          </Container>
        </Shader>

        <BottomToolbar>
          <ReturnButton />

          {user.clearance >= CLEARANCES.ACTIONS.CRUD_TEAM ? (
            <EditEntityButton
              title={'Edit Member'}
              onClick={() =>
                (location.href = `/admin/members/edit/${member.id}`)
              }
            />
          ) : null}
        </BottomToolbar>
      </Spacer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  countries: state.countries
});

export default connect(mapStateToProps)(MemberPage);
