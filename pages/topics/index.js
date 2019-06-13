import React, { Component, PureComponent } from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import Link from 'next/link';
import Router from 'next/router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveTopicSort } from '~/reducers/actions';

import classNames from 'classnames';

import Cover from '~/components/cover.js';
import { Icon } from '~/components/icon.js';
import { Shader } from '~/components/layout.js';
import { ConfirmModal } from '~/components/modal.js';
import { Title, Subtitle } from '~/components/text.js';
import Toolbar from '~/components/toolbar.js';

import { categories } from '~/constants/categories.js';
import CLEARANCES from '~/constants/clearances.js';

import Meta from '~/partials/meta.js';
import css from '~/styles/topics.scss';
import '~/styles/_categories.scss';


class TopicBank extends Component {
  constructor(props){
    super(props);
    this.state = {
      topics: [],
      isLoaded: false,
      sort: props.topic.sort,
      modalVisible: false
    }
  }

  /** Get topics on mount */
  componentDidMount() {
    this.getTopics();
  }

  /** Retrieve all topics */
  getTopics = () => {
    fetch('/getTopics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(topics => {
      this.setState({
        topics: topics,
        isLoaded: true
      });

      this.sortTopics(this.state.sort);
    })
    .catch(error => console.error(error));
  }

  /** Render all topics */
  renderTopics = () => {
    const { topics } = this.state;
    const items = [];

    for (const [index, item] of topics.entries()) {
      items.push(<Topic key={index} item={item} />);
    }

    return items;
  }

  /** Sort topics according to value */
  sortTopics = (sort) => {
    const { topics } = this.state;
    let key, order = '';

		switch (sort){
			case '1': key = 'id'; order = 'ASC'; break;
			case '2': key = 'id'; order = 'DESC'; break;
			case '3': key = 'headline'; order = 'ASC'; break;
			case '4': key = 'headline'; order = 'DESC'; break;
			case '5': key = 'category'; order = 'ASC'; break;
			case '6': key = 'category'; order = 'DESC'; break;
			default: key = 'headline'; order = 'ASC'; break;
		}

    topics.sort(function (a,b) {
			if (typeof a[key] === 'string'){
				a = a[key].toLowerCase().replace(/[^a-zA-Z 0-9]+/g, '').replace('the ', '');
				b = b[key].toLowerCase().replace(/[^a-zA-Z 0-9]+/g, '').replace('the ', '');
				return a < b ? -1 : a > b ? 1 : 0
			} else {
				a = a[key];
				b = b[key];
				return a < b ? -1 : a > b ? 1 : 0
			}
		});

		this.setState({
      topics: order === 'DESC' ? topics.reverse() : topics,
      sort: sort
    });
  }

  /** Switch the sort value */
  switchSort = (value) => {
    this.props.saveTopicSort(value);
    this.sortTopics(value);
  }

	render(){

    const { isLoaded } = this.state;

    return (
      <Shader>
        <Meta
					title={'Topic Bank | #WOKEWeekly'}
					description={'The currency of the franchise.'}
					url={'/topics'} />

        <Cover
          title={'Topic Bank'}
          subtitle={'The currency of the franchise.'}
          image={'topics-header.jpg'}
          height={200} />

        <div className={css.grid}>
          {isLoaded ? this.renderTopics() : null}
        </div>

        <Toolbar>
          <Link href={'/topics/add'}>
            <Button variant="dark">
              <Icon name={'plus'} />Add Topic
            </Button>
          </Link>

          {/* <ToggleButtonGroup
            className={css.view}
            type={'radio'}
            name={'view'}
            defaultValue={view}
            onChange={this.switchView}>
            <ToggleButton variant="dark" value={1}><Icon name={'th-large'} />Grid</ToggleButton>
            <ToggleButton variant="dark" value={2}><Icon name={'list-ul'} />List</ToggleButton>
          </ToggleButtonGroup> */}
    
          <Dropdown className={css.sort} onSelect={this.switchSort}>
            <Dropdown.Toggle variant="dark"><Icon name={'sort-amount-down'} />Sort</Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey={1}>Sort Oldest to Newest</Dropdown.Item>
              <Dropdown.Item eventKey={2}>Sort Newest to Oldest</Dropdown.Item>
              <Dropdown.Item eventKey={3}>Sort by Headline (Ascending)</Dropdown.Item>
              <Dropdown.Item eventKey={4}>Sort by Headline (Descending)</Dropdown.Item>
              <Dropdown.Item eventKey={5}>Sort by Category (Ascending)</Dropdown.Item>
              <Dropdown.Item eventKey={6}>Sort by Category (Descending)</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Toolbar>
      </Shader>
    );
	}
}

class _Topic extends PureComponent {
  constructor(){
    super();
    this.state = {
      modalVisible: false
    }
  }

  /** Show and hide confirmation modal */
  showModal = () => { this.setState({modalVisible: true})}
  hideModal = () => { this.setState({modalVisible: false})}

  /** Delete topic from database */
  deleteTopic = () => {
    fetch('/deleteTopic', {
      method: 'DELETE',
      body: JSON.stringify(this.props.item),
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Content-Type': 'application/json',
        'Clearance': CLEARANCES.ACTIONS.CRUD_TOPICS
      }
    }).then(res => {
      if (res.ok) location.reload();
    }).catch(error => console.error(error));
  }

  render(){
    const { item } = this.props;
    const category = categories.find(category => category.label === item.category).short;
    const classes = classNames(css.cell, category);

    return (
      <div className={classes}>
        <Title className={css.headline}>{item.headline}</Title>
        <Subtitle className={css.question}>{item.question}</Subtitle>
        <Subtitle className={css.details}>{item.type} • {item.category}</Subtitle>
        <ButtonGroup className={css.buttons}>
          <Button variant={'success'} onClick={() => Router.push(`/topics/edit/${item.id}`)}>Edit</Button>
          <Button variant={'danger'} onClick={this.showModal}>Delete</Button>
        </ButtonGroup>

        <ConfirmModal
          visible={this.state.modalVisible}
          message={
            `Are you sure you want to delete the topic:
            "${item.headline}: ${item.question}"?`
          }
          confirmFunc={this.deleteTopic}
          confirmText={'Delete'}
          close={this.hideModal} />
      </div>
    ); 
  }
}

const mapStateToProps = state => ({
  topic: state.topic,
  user: state.user
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    saveTopicSort
  }, dispatch)
);

const Topic = connect(mapStateToProps)(_Topic);
export default connect(mapStateToProps, mapDispatchToProps)(TopicBank);