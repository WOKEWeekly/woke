import React, { Component, PureComponent, Suspense } from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveTopicSort, saveTopicFilters } from '~/reducers/actions';
import classNames from 'classnames';

import { alert, setAlert } from '~/components/alert.js';
import { AddEntityButton } from '~/components/button.js';
import { SortDropdown, FilterDropdown } from '~/components/dropdown.js';
import { Checkbox, SearchBar } from '~/components/form.js';
import { Icon } from '~/components/icon.js';
import { Cover, Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { ConfirmModal } from '~/components/modal.js';
import { Title, Subtitle } from '~/components/text.js';
import { TopToolbar, BottomToolbar } from '~/components/toolbar.js';
import { Fader } from '~/components/transitioner.js';

import CATEGORIES from '~/constants/categories.js';
import CLEARANCES from '~/constants/clearances.js';
import request from '~/constants/request.js';

import css from '~/styles/pages/Topics.module.scss';

const { categories, types, polarity, misc } = CATEGORIES;

class TopicBank extends Component {
  static getInitialProps({ query }) {
    return { ...query };
  }

  constructor(props) {
    super(props);
    this.state = {
      topics: [],
      filtered: [],
      results: [],

      sort: props.topic.sort,
      filters: props.topic.filters,
      searchWord: '',

      topicsLoaded: false
    };

    if (props.hasAccess === false) {
      if (props.user.clearance < CLEARANCES.ACTIONS.VIEW_TOPICS) {
        if (location.href.indexOf('?') > -1)
          setAlert({
            type: 'error',
            message: 'This link is invalid or expired.'
          });

        return (location.href = '/');
      }
    }
  }

  /** Get topics on mount */
  componentDidMount() {
    this.getTopics();
  }

  /** Retrieve all topics */
  getTopics = (callback) => {
    const { user, hasAccess } = this.props;
    request({
      url: '/api/v1/topics',
      method: 'GET',
      headers: {
        Admission: hasAccess,
        Authorization: `Bearer ${user.token}`
      },
      onSuccess: (response) => {
        this.setState(
          {
            topics: response,
            filtered: response,
            topicsLoaded: true
          },
          () => {
            this.sortTopics(this.state.sort);
            if (callback) callback();
          }
        );
      }
    });
  };

  /** Sort topics according to value */
  sortTopics = (sort) => {
    const { topics } = this.state;
    let key,
      order = '';

    if (!topics.length) return;

    switch (sort) {
      case '1':
        key = 'id';
        order = 'ASC';
        break;
      case '2':
        key = 'id';
        order = 'DESC';
        break;
      case '3':
        key = 'headline';
        order = 'ASC';
        break;
      case '4':
        key = 'headline';
        order = 'DESC';
        break;
      case '5':
        key = 'category';
        order = 'ASC';
        break;
      case '6':
        key = 'category';
        order = 'DESC';
        break;
      default:
        key = 'headline';
        order = 'ASC';
        break;
    }

    topics.sort(function (a, b) {
      if (typeof a[key] === 'string') {
        a = a[key]
          .toLowerCase()
          .replace(/[^a-zA-Z 0-9]+/g, '')
          .replace('the ', '');
        b = b[key]
          .toLowerCase()
          .replace(/[^a-zA-Z 0-9]+/g, '')
          .replace('the ', '');
        return a < b ? -1 : a > b ? 1 : 0;
      } else {
        a = a[key];
        b = b[key];
        return a < b ? -1 : a > b ? 1 : 0;
      }
    });

    // Filter topics after setting state
    this.setState(
      {
        topics: order === 'DESC' ? topics.reverse() : topics,
        sort: sort
      },
      () => this.filterTopics()
    );
  };

  /** Filter topics */
  filterTopics = () => {
    if (this.state.filters) {
      const { topics, filters, searchWord } = this.state;

      let results;

      try {
        // Filter upon condition of presence of values in filter arrays
        results = topics.filter((topic, index, topics) => {
          if (Object.keys(filters).length > 0) {
            const filterCategory = filters.categories.length
              ? filters.categories.includes(topic.category)
              : true;
            const filterTypes = filters.types.length
              ? filters.types.includes(topic.type)
              : true;
            const filterPolarity = filters.polarity.length
              ? filters.polarity.includes(
                  topic.polarity === 1 ? 'Polar' : 'Non-Polar'
                )
              : true;
            const filterValidated = filters.misc.length
              ? filters.misc.includes(topic.validated === 1 && 'Validated')
              : true;
            const filterSensitive = filters.misc.length
              ? filters.misc.includes(topic.sensitivity === 1 && 'Sensitive')
              : true;

            return (
              filterCategory &&
              filterTypes &&
              filterPolarity &&
              (filterValidated || filterSensitive)
            );
          } else {
            return topics;
          }
        });
      } catch (err) {
        results = topics;
      }

      // Search topics after filtering
      this.setState({ filtered: results }, () => {
        this.props.saveTopicFilters(filters);
        this.searchTopics(searchWord);
      });
    } else {
      this.searchTopics(this.state.searchWord);
    }
  };

  /** Search through the topics, filtering via user input */
  searchTopics = (text) => {
    const { filtered } = this.state;

    // If headline or question matches search, include in list. Case-insensitive
    const searched = filtered.filter(
      (topic) =>
        topic.headline.toLowerCase().indexOf(text.toLowerCase()) > -1 ||
        topic.question.toLowerCase().indexOf(text.toLowerCase()) > -1
    );

    this.setState({
      results: searched,
      searchWord: text
    });
  };

  /** Switch the sort value */
  switchSort = (value) => {
    this.props.saveTopicSort(value);
    this.sortTopics(value);
  };

  // Handle search on every new character entry
  handleSearchWord = (event) => {
    this.searchTopics(event.target.value);
  };

  // Handle filter changes on checkbox check
  handleFilter = (event) => {
    const { filters } = this.state;
    const { name, checked } = event.target;

    let [label, filter] = name.split(', ');

    if (checked) {
      filters[filter].push(label);
    } else {
      let idx = filters[filter].indexOf(label);
      filters[filter].splice(idx, 1);
    }

    this.setState({ filters }, () => this.filterTopics());
  };

  render() {
    const { topicsLoaded, searchWord, results, filters } = this.state;
    const { user } = this.props;

    const hasPrivileges = user.clearance >= CLEARANCES.ACTIONS.CRUD_TOPICS;

    const sortItems = [
      'Sort Oldest To Newest',
      'Sort Newest To Oldest',
      'Sort Headline (Ascending)',
      'Sort Headline (Descending)',
      'Sort Category (Ascending)',
      'Sort Category (Descending)'
    ];

    const TopicGrid = () => {
      if (!topicsLoaded) {
        return <Loader />;
      } else if (results.length === 0) {
        return <Empty message={'No topics found.'} />;
      } else {
        const items = [];

        for (const [index, item] of results.entries()) {
          items.push(
            <Topic
              key={index}
              idx={index}
              item={item}
              getTopics={this.getTopics}
              hasPrivileges={hasPrivileges}
            />
          );
        }

        return <div className={css.grid}>{items}</div>;
      }
    };

    return (
      <Shader>
        <Spacer gridrows={'auto auto 1fr auto'}>
          <Cover
            title={'Topic Bank'}
            subtitle={'The currency of the franchise.'}
            image={'header-topics.jpg'}
            height={200}
            className={css.cover}
          />

          <TopToolbar>
            <SearchBar
              onChange={this.handleSearchWord}
              placeholder={'Search a topic or keyword...'}
              value={searchWord}
            />
            <label className={css.count}>{results.length} topics</label>
          </TopToolbar>

          <TopicGrid />

          <BottomToolbar>
            {hasPrivileges ? (
              <AddEntityButton
                title={'Add Topic'}
                onClick={() => (location.href = '/topics/add')}
              />
            ) : null}

            <SortDropdown
              items={sortItems}
              title={'Sort'}
              onSelect={this.switchSort}
            />

            <TopicFilter filters={filters} handleFilter={this.handleFilter} />
          </BottomToolbar>
        </Spacer>
      </Shader>
    );
  }
}

class _Topic extends PureComponent {
  constructor() {
    super();
    this.state = {
      modalVisible: false,
      isLoaded: false
    };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  /** Show and hide confirmation modal */
  showModal = () => {
    this.setState({ modalVisible: true });
  };
  hideModal = () => {
    this.setState({ modalVisible: false });
  };

  /** Delete topic from database */
  deleteTopic = () => {
    const { item: topic, user } = this.props;
    request({
      url: `/api/v1/topics/${topic.id}`,
      method: 'DELETE',
      body: JSON.stringify(topic),
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        alert.success(
          `You've successfully deleted "${topic.headline}: ${topic.question}".`
        );
        this.props.getTopics(() => this.hideModal());
      }
    });
  };

  render() {
    const { item, idx, hasPrivileges } = this.props;
    const category = categories.find(
      (category) => category.label === item.category
    ).short;
    const classes = classNames(css.cell, category);

    const AdminButtons = () => {
      if (!hasPrivileges) return null;
      return (
        <ButtonGroup className={css.buttons}>
          <Button
            variant={'success'}
            onClick={() => (location.href = `/topics/edit/${item.id}`)}>
            Edit
          </Button>
          <Button variant={'danger'} onClick={this.showModal}>
            Delete
          </Button>
        </ButtonGroup>
      );
    };

    const ValSens = () => {
      if (!(item.validated || item.sensitivity)) return null;
      return (
        <div className={css.valSens}>
          {item.sensitivity ? (
            <Icon name={'skull-crossbones'} className={css.val} />
          ) : (
            <div />
          )}
          {item.validated ? (
            <Icon name={'check-circle'} className={css.sens} />
          ) : null}
        </div>
      );
    };

    return (
      <Suspense fallback={<Loader />}>
        <Fader
          key={idx}
          determinant={this.state.isLoaded}
          duration={500}
          className={classes}>
          <Title className={css.headline}>{item.headline}</Title>
          <Subtitle className={css.question}>{item.question}</Subtitle>
          <ValSens />
          <Subtitle className={css.details}>
            {item.type} • {item.category}
          </Subtitle>
          <AdminButtons />
        </Fader>

        <ConfirmModal
          visible={this.state.modalVisible}
          message={`Are you sure you want to delete the topic:
            "${item.headline}: ${item.question}"?`}
          confirmFunc={this.deleteTopic}
          confirmText={'Delete'}
          close={this.hideModal}
        />
      </Suspense>
    );
  }
}

class TopicFilter extends Component {
  render() {
    const { filters, handleFilter } = this.props;

    /** Ensure any new categories added won't affect Redux store */
    for (const key of Object.keys(CATEGORIES)) {
      if (!filters[key]) filters[key] = [];
    }

    return (
      <FilterDropdown title={'Filter'}>
        <div className={css.menuSection}>
          <div>
            <Dropdown.Item disabled>Filter by category</Dropdown.Item>
            <Dropdown.Divider />
            {categories.map((item, index) => {
              return (
                <Checkbox
                  name={`${item.label}, categories`}
                  key={index}
                  label={item.label}
                  checked={filters.categories.includes(item.label)}
                  onChange={handleFilter}
                />
              );
            })}
          </div>
          <div>
            <div>
              <Dropdown.Item disabled>Filter by type</Dropdown.Item>
              <Dropdown.Divider />
              {types.map((item, index) => {
                return (
                  <Checkbox
                    name={`${item.label}, types`}
                    key={index}
                    label={item.label}
                    checked={filters.types.includes(item.label)}
                    onChange={handleFilter}
                  />
                );
              })}
            </div>
            <div className={css.polarityBlock}>
              <Dropdown.Item disabled>Filter by polarity</Dropdown.Item>
              <Dropdown.Divider />
              {polarity.map((item, index) => {
                return (
                  <Checkbox
                    name={`${item.label}, polarity`}
                    key={index}
                    label={item.label}
                    checked={filters.polarity.includes(item.label)}
                    onChange={handleFilter}
                  />
                );
              })}
            </div>
            <div className={css.polarityBlock}>
              <Dropdown.Item disabled>More filters</Dropdown.Item>
              <Dropdown.Divider />
              {misc.map((item, index) => {
                return (
                  <Checkbox
                    name={`${item.label}, misc`}
                    key={index}
                    label={item.label}
                    checked={filters.misc.includes(item.label)}
                    onChange={handleFilter}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </FilterDropdown>
    );
  }
}

const mapStateToProps = (state) => ({
  topic: state.topic,
  user: state.user
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      saveTopicSort,
      saveTopicFilters
    },
    dispatch
  );

const Topic = connect(mapStateToProps)(_Topic);
export default connect(mapStateToProps, mapDispatchToProps)(TopicBank);
