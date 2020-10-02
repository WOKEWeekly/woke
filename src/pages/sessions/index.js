import React, { Component, PureComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { zDate } from 'zavid-modules';

import { AddEntityButton, RadioButtonGroup } from 'components/button.js';
import { SortDropdown } from 'components/dropdown.js';
import { Icon } from 'components/icon.js';
import { Cover, Shader, Spacer } from 'components/layout.js';
import { Loader, Empty } from 'components/loader.js';
import {
  Title,
  Subtitle,
  Divider,
  Paragraph,
  VanillaLink
} from 'components/text.js';
import { BottomToolbar } from 'components/toolbar.js';
import { Zoomer, Slider, Fader } from 'components/transitioner.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import { cloudinary } from 'constants/settings.js';
import { saveSessionSort, saveSessionView } from 'reducers/actions';
import css from 'styles/pages/Sessions.module.scss';

class Sessions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sessions: [],
      isLoaded: false,
      view: props.session.view,
      sort: props.session.sort
    };
  }

  /** Get sessions on mount */
  componentDidMount() {
    this.getSessions();
  }

  /** Get all sessions */
  getSessions = () => {
    request({
      url: '/api/v1/sessions',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (sessions) => {
        this.setState(
          {
            sessions: sessions,
            isLoaded: true
          },
          () => {
            this.sortSessions(this.state.sort);
          }
        );
      }
    });
  };

  sortSessions = (sort) => {
    const { sessions } = this.state;
    let order = '';

    switch (sort) {
      case '1':
        order = 'ASC';
        break;
      case '2':
        order = 'DESC';
        break;
      default:
        order = 'DESC';
        break;
    }

    sessions.sort(function (a, b) {
      a = a.dateHeld;
      b = b.dateHeld;
      return a < b ? -1 : a > b ? 1 : 0;
    });

    this.setState({
      sessions: order === 'DESC' ? sessions.reverse() : sessions,
      sort: sort
    });
  };

  switchView = (value) => {
    this.setState({ view: value });
    this.props.saveSessionView(value);
  };
  switchSort = (value) => {
    this.props.saveSessionSort(value);
    this.sortSessions(value);
  };

  render() {
    const { isLoaded, sessions, view } = this.state;
    const { user } = this.props;

    const sortItems = ['Sort By Date (Ascending)', 'Sort by Date (Descending)'];
    const radioItems = [
      {
        label: (
          <div>
            <Icon name={'th-large'} />
            Grid
          </div>
        ),
        value: 'grid'
      },
      {
        label: (
          <div>
            <Icon name={'list-ul'} />
            List
          </div>
        ),
        value: 'list'
      }
    ];

    const SessionCollection = () => {
      if (!isLoaded) {
        return <Loader />;
      } else if (sessions.length === 0) {
        return <Empty message={'No sessions found.'} />;
      } else {
        const items = [];

        for (const [index, item] of sessions.entries()) {
          items.push(
            <Session key={index} idx={index} item={item} view={view} />
          );
        }

        if (view === 'grid') {
          return <div className={css.grid}>{items}</div>;
        } else {
          return <div className={css.list}>{items}</div>;
        }
      }
    };

    return (
      <Shader>
        <Spacer gridrows={'auto 1fr auto'}>
          <Cover
            title={'Sessions'}
            subtitle={'Where the magic happens...'}
            image={'header-sessions.jpg'}
            imageVersion={1593013330}
            height={200}
            backgroundPosition={'center'}
            className={css.cover}
          />

          <Fader determinant={isLoaded} duration={1500}>
            <SessionCollection />
          </Fader>

          <BottomToolbar>
            {user.clearance >= CLEARANCES.ACTIONS.TOPICS.MODIFY ? (
              <AddEntityButton
                title={'Add Session'}
                onClick={() => (location.href = '/admin/sessions/add')}
              />
            ) : null}

            <RadioButtonGroup
              name={'view'}
              items={radioItems}
              value={view}
              onChange={this.switchView}
            />

            <SortDropdown
              items={sortItems}
              title={'Sort'}
              onSelect={this.switchSort}
            />
          </BottomToolbar>
        </Spacer>
      </Shader>
    );
  }
}

class Session extends PureComponent {
  constructor() {
    super();
    this.state = { isLoaded: false };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  render() {
    const { isLoaded } = this.state;
    const { item, idx, view } = this.props;
    item.description =
      item.description && item.description.trim().length > 0
        ? item.description
        : 'No description.';

    const link = `/sessions/${item.slug}`;

    if (view === 'grid') {
      return (
        <Zoomer
          determinant={isLoaded}
          duration={400}
          delay={75 * idx}
          className={css.container}>
          <VanillaLink href={link}>
            <div className={css.cell}>
              <img
                src={`${cloudinary.url}/${cloudinary.lazy}/${item.image}`}
                alt={item.title}
                className={css.image}
              />
              <div className={css.details}>
                <Title className={css.title}>{item.title}</Title>
                <Subtitle className={css.date}>
                  {zDate.formatDate(item.dateHeld, { withWeekday: true })}
                </Subtitle>
              </div>
            </div>
          </VanillaLink>
        </Zoomer>
      );
    } else {
      return (
        <Slider
          determinant={isLoaded}
          duration={400}
          delay={75 * idx}
          direction={'left'}>
          <VanillaLink href={link}>
            <Row className={css.item}>
              <Col md={4} className={'p-0'}>
                <img
                  src={`${cloudinary.url}/${cloudinary.lazy}/${item.image}`}
                  alt={item.title}
                  className={css.image}
                />
              </Col>
              <Col md={8}>
                <div className={css.details}>
                  <Title className={css.title}>{item.title}</Title>
                  <Subtitle className={css.date}>
                    {zDate.formatDate(item.dateHeld, { withWeekday: true })}
                  </Subtitle>
                  <Divider />
                  <Paragraph
                    className={css.description}
                    truncate={60}
                    morelink={link}
                    moretext={'Read more'}>
                    {item.description}
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </VanillaLink>
        </Slider>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      saveSessionSort,
      saveSessionView
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Sessions);
