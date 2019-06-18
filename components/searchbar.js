import React, {Component} from 'react';

import { Icon } from '~/components/icon.js';
import css from '~/styles/_components.scss';

export default class SearchBar extends Component {
  render(){
    return (
      <div className={css.searchContainer}>
        <Icon name={'search'} color={'grey'} />
        <input
          type={'text'}
          className={css.searchBar}
          onChange={this.props.onChange}
          placeholder={this.props.placeholder}
          value={this.props.value}
          style={{ width: this.props.width }} />
      </div>
    )
  }
}