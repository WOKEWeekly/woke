import React, { Component, PureComponent } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Router from 'next/router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveTopicSort } from '~/reducers/actions';
import classNames from 'classnames';

import { AddButton, DropdownButton } from '~/components/button.js';
import Cover from '~/components/cover.js';
import { Shader, Spacer } from '~/components/layout.js';
import Loader from '~/components/loader.js';
import { ConfirmModal } from '~/components/modal.js';
import SearchBar from '~/components/searchbar.js';
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
      filtered: [],
      results: [],

      sort: props.topic.sort,
      filters: {},
      searchWord: '',

      isLoaded: false
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
        filtered: topics,
        isLoaded: true
      });

      this.sortTopics(this.state.sort);
    })
    .catch(error => console.error(error));
  }

  /** Sort topics according to value */
  sortTopics = (sort) => {
    const {topics} = this.state;
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
    }, () => {
      this.filterTopics();
    });
  }
  
  /** Filter topics */
	filterTopics = () => {
    const { topics, filters, searchWord } = this.state;

		let results = topics.filter((topic, index, topics) => {
      if (Object.keys(filters).length > 0){
        return (filters.categories.length > 0 ? filters.categories.includes(topic.category) : true)
          && (filters.types.length > 0 ? filters.types.includes(topic.type) : true)
          && (filters.polarity.length > 0 ? filters.polarity.includes(topic.polarity) : true);
      } else {
        return topics;
      }      
    });

    this.setState({ filtered: results }, () => {
      this.searchTopics(searchWord);
    });
  }
  
  /** Search through the topics, filtering via user input */
  searchTopics = (text) => {
    const { filtered } = this.state;

		const searched = filtered.filter(topic =>
			(topic.headline.toLowerCase().indexOf(text.toLowerCase()) > -1
			|| topic.question.toLowerCase().indexOf(text.toLowerCase()) > -1)
		);

		this.setState({
			results: searched,
			searchWord: text
		});
  }

  /** Switch the sort value */
  switchSort = (value) => {
    this.props.saveTopicSort(value);
    this.sortTopics(value);
  }

  handleSearchWord = (event) => { this.searchTopics(event.target.value); }

	render(){

    const { isLoaded, searchWord, results } = this.state;

    const sortItems = [
      'Sort Oldest To Newest',
      'Sort Newest To Oldest',
      'Sort Headline (Ascending)',
      'Sort Headline (Descending',
      'Sort Category (Ascending)',
      'Sort Category (Descending'
    ];

    const TopicGrid = () => {
      if (isLoaded){
        const items = [];

        for (const [index, item] of results.entries()) {
          items.push(<Topic key={index} item={item} getTopics={this.getTopics} />);
        }

        return <div className={css.grid}>{items}</div>;
      } else {
        return <Loader/>;
      }
    };

    return (
      <Shader>
        <Meta
					title={'Topic Bank | #WOKEWeekly'}
					description={'The currency of the franchise.'}
					url={'/topics'} />

        <Spacer gridrows={'auto auto 1fr auto'}>
          <Cover
            title={'Topic Bank'}
            subtitle={'The currency of the franchise.'}
            image={'topics-header.jpg'}
            height={200} />

          <Toolbar>
            <SearchBar
              onChange={this.handleSearchWord}
              placeholder={'Search a topic or keyword...'}
              width={'20em'}
              value={searchWord} />

            <label className={css.count}>{results.length} topics</label>
          </Toolbar>

          <TopicGrid/>

          <Toolbar>
            <AddButton
              title={'Add Topic'}
              onClick={() => Router.push('/topics/add')} />
      
            <DropdownButton
              items={sortItems}
              onSelect={this.switchSort} />
          </Toolbar>
        </Spacer>
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
      if (res.ok) this.props.getTopics();
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