import React, { Component, PureComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveSessionSort, saveSessionView } from '~/reducers/actions';
import { zDate } from 'zavid-modules';

import { AddEntityButton, RadioButtonGroup } from '~/components/button.js';
import { SortDropdown } from '~/components/dropdown.js';
import { Icon } from '~/components/icon.js';
import { Cover, Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Zoomer, Slider, Fader } from '~/components/transitioner.js';

import CLEARANCES from '~/constants/clearances.js';
import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import css from '~/styles/pages/Sessions.module.scss';


class Sessions extends Component {
  constructor(props){
    super(props);
    this.state = {
      sessions: [],
      isLoaded: false,
      view: props.session.view,
      sort: props.session.sort,
    }
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
      headers: { 'Authorization': process.env.AUTH_KEY },
      onSuccess: (sessions) => {
        this.setState({
          sessions: sessions,
          isLoaded: true
        }, () => {
          this.sortSessions(this.state.sort);
        });
      }
    });
  }

  sortSessions = (sort) => {
    const { sessions } = this.state;
    let order = '';

    switch (sort){
			case '1': order = 'ASC'; break;
			case '2': order = 'DESC'; break;
			default: order = 'DESC'; break;
		}

    sessions.sort(function (a,b) {
      a = a.dateHeld;
      b = b.dateHeld;
      return a < b ? -1 : a > b ? 1 : 0
		});

    this.setState({
      sessions: order === 'DESC' ? sessions.reverse() : sessions,
      sort: sort
    });
  }

  switchView = (value) => {
    this.setState({ view: value });
    this.props.saveSessionView(value);
  }
  switchSort = (value) => {
    this.props.saveSessionSort(value);
    this.sortSessions(value);
  }

	render(){

    const { isLoaded, sessions, view } = this.state;
    const { user } = this.props;

    const sortItems = ['Sort By Date (Ascending)', 'Sort by Date (Descending)'];
    const radioItems = [
      { label: <div><Icon name={'th-large'} />Grid</div>, value: 'grid' },
      { label: <div><Icon name={'list-ul'} />List</div>, value: 'list' }
    ];

    const SessionCollection = () => {
      if (!isLoaded){
        return <Loader/>;
      } else if (sessions.length === 0) {
        return <Empty message={'No sessions found.'} />;
      } else {
        const items = [];

        for (const [index, item] of sessions.entries()) {
          items.push(<Session key={index} idx={index} item={item} view={view} />);
        }

        if (view === 'grid'){
          return <div className={css.grid}>{items}</div>;
        } else {
          return <div className={css.list}>{items}</div>;
        }
      }
    }

    return (
      <Shader>
        <Spacer gridrows={'auto 1fr auto'}>
          <Cover
            title={'Sessions'}
            subtitle={'Where the magic happens...'}
            image={'header-sessions.jpg'}
            height={200}
            className={css.cover} />

          <Fader determinant={isLoaded} duration={1500}>
            <SessionCollection/>
          </Fader>

          <BottomToolbar>
            {user.clearance >= CLEARANCES.ACTIONS.CRUD_TOPICS ?
            <AddEntityButton
              title={'Add Session'}
              onClick={() => location.href = '/sessions/add'} /> : null}

            <RadioButtonGroup
              name={'view'}
              items={radioItems}
              value={view}
              onChange={this.switchView} />
      
            <SortDropdown
              items={sortItems}
              title={'Sort'}
              onSelect={this.switchSort} />
          </BottomToolbar>
        </Spacer>
      </Shader>
    );
	}
}

class Session extends PureComponent {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  render(){
    const { item, idx, view } = this.props;
    item.description = item.description && item.description.trim().length > 0 ? item.description : 'No description.';

    const link = `/session/${item.slug}`;
    
    if (view === 'grid'){
      return (
        <Zoomer
          determinant={this.state.isLoaded}
          duration={400}
          delay={75 * idx}
          className={css.container}>
          <a href={link}>
            <div className={css.cell}>
              <img
                src={`${cloudinary.url}/${cloudinary.lazy}/${item.image}`}
                alt={item.title}
                className={css.image}
                onLoad={() => this.setState({isLoaded: true})} />
              <div className={css.details}>
                <Title className={css.title}>{item.title}</Title>
                <Subtitle className={css.date}>{zDate.formatDate(item.dateHeld, true)}</Subtitle>
              </div>
            </div>
          </a>
        </Zoomer>
      );
    } else {
      return (
        <Slider
          determinant={this.state.isLoaded}
          duration={400}
          delay={75 * idx}
          direction={'left'}>
          <a href={link}>
            <Row className={css.item}>
              <Col md={4} className={'p-0'}>
                <img
                  src={`${cloudinary.url}/${cloudinary.lazy}/${item.image}`}
                  alt={item.title}
                  className={css.image}
                  onLoad={() => this.setState({isLoaded: true})} />
              </Col>
              <Col md={8}>
                <div className={css.details}>
                  <Title className={css.title}>{item.title}</Title>
                  <Subtitle className={css.date}>{zDate.formatDate(item.dateHeld, true)}</Subtitle>
                  <Divider />
                  <Paragraph
                    className={css.description}
                    link={link}
                    moretext={'Read more'}>
                    {truncateText(item.description, 60)}
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </a>
        </Slider>
      );
    }
    
  }
}

const mapStateToProps = state => ({
  session: state.session,
  user: state.user
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    saveSessionSort,
    saveSessionView
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Sessions);