import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { saveCandidateSort } from '~/reducers/actions';
import Link from 'next/link';
import Router from 'next/router';

import { AddEntityButton } from '~/components/button.js';
import { SortDropdown } from '~/components/dropdown.js';
import { Cover, Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { BottomToolbar } from '~/components/toolbar.js';
import { Fader } from '~/components/transitioner.js';

import CLEARANCES from '~/constants/clearances.js';


import css from '~/styles/blackex.scss';
import '~/styles/_categories.scss';


class BlackExcellence extends Component {
  /** Retrieve information from server */
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor(props){
    super(props);
    this.state = {
      candidates: [],
      sort: props.blackex.sort,
      isLoaded: false
    };
  }

  /** Get candidates on mount */
  componentDidMount() {
    this.getCandidates();
  }

  /** Retrieve all candidates */
  getCandidates = () => {
    fetch('/getCandidates', {
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(candidates => {
      this.setState({
        candidates: candidates
      }, () => this.sortCandidates(this.state.sort));
    })
    .catch(error => console.error(error));
  }

  /** Sort candidates according to value */
  sortCandidates = (sort) => {
    const {candidates} = this.state;
    let key, order = '';

		switch (sort){
			case '1': key = 'id'; order = 'ASC'; break;
			case '2': key = 'id'; order = 'DESC'; break;
			case '3': key = 'name'; order = 'ASC'; break;
			case '4': key = 'name'; order = 'DESC'; break;
			case '5': key = 'birthday'; order = 'DESC'; break;
			case '6': key = 'birthday'; order = 'ASC'; break;
			default: key = 'id'; order = 'ASC'; break;
		}

    candidates.sort(function (a,b) {
      a = a[key];
      b = b[key];
      return a < b ? -1 : a > b ? 1 : 0
		});

		this.setState({
      candidates: order === 'DESC' ? candidates.reverse() : candidates,
      sort: sort,
      isLoaded: true
    });
  }

  /** Switch the sort value */
  switchSort = (value) => {
    this.props.saveCandidateSort(value);
    this.sortCandidates(value);
  }

	render(){

    const { isLoaded, candidates } = this.state;
    const { user, title, description } = this.props;

    const sortItems = [
      'Sort by Number (Ascending)',
      'Sort by Number (Descending)',
      'Sort by Name (Ascending)',
      'Sort by Name (Descending)',
      'Sort by Age (Ascending)',
      'Sort by Age (Descending)'
    ];

    const CandidateGrid = () => {
      if (!isLoaded){
        return <Loader/>;
      } else if (candidates.length === 0){
        return <Empty message={'No candidates found.'}/>;
      } else {
        const items = [];

        for (const [index, item] of candidates.entries()) {
          items.push(<Candidate key={index} idx={index} item={item} />);
        }

        return <div className={css.grid}>{items}</div>;
      }
    };

    return (
      <Shader>
        <Spacer gridrows={'auto 1fr auto'}>
          <Cover
            title={title}
            subtitle={description}
            image={'header-blackex.jpg'}
            height={200}
            backgroundPosition={'center'}
            imageTitle={
              <img
                src={`/static/images/logos/blackex-logo.png`}
                alt={'#BlackExcellence logo'}
                className={css.image}
                onLoad={this.showImage}
                height={150}
                onError={this.showImage} />} />

          <CandidateGrid/>

          <BottomToolbar>
            {user.clearance >= CLEARANCES.ACTIONS.CRUD_BLACKEX ?
            <AddEntityButton
              title={'Add Candidate'}
              onClick={() => Router.push('/blackexcellence/add')} /> : null}
      
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

class Candidate extends PureComponent {
  constructor(){
    super();
    this.state = {
      isLoaded: false
    }
  }

  showImage = () => this.setState({isLoaded: true});

  render(){
    const { item, idx } = this.props;
    const label = `#${item.id}: ${item.name}`;    

    return (
      <Fader
        key={idx}
        determinant={this.state.isLoaded}
        duration={500}
        delay={75 * idx}>
        <Link href={`/blackexcellence/candidate/${item.id}`}>
          <div className={css.cell}>
            <img
              src={`/static/images/blackexcellence/${item.image}`}
              alt={label}
              className={css.image}
              onLoad={this.showImage}
              onError={this.showImage} />
          </div>
        </Link>
      </Fader>
    );
  }
}

const mapStateToProps = state => ({
  blackex: state.blackex,
  user: state.user
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    saveCandidateSort
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(BlackExcellence);