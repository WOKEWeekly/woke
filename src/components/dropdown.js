import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';

import { Icon } from 'components/icon.js';
import css from 'styles/components/Form.module.scss';

import { zIndices } from './layout';

export class DropdownButton extends Component {
  render() {
    return (
      <Dropdown
        className={css.widgets}
        onSelect={this.props.onSelect}
        alignRight={this.props.alignRight}>
        <Dropdown.Toggle variant="dark">{this.props.children}</Dropdown.Toggle>
        <Dropdown.Menu className={css.dropdown_menu}>
          {React.Children.map(this.props.items, (item, index) => {
            return (
              <Dropdown.Item className={css.dropdown_item} eventKey={index + 1}>
                {item}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export class SortDropdown extends Component {
  render() {
    return (
      <DropdownButton
        items={this.props.items}
        onSelect={this.props.onSelect}
        alignRight={true}>
        <Icon name={'sort-amount-down'} />
        {this.props.title}
      </DropdownButton>
    );
  }
}

export class FilterDropdown extends Component {
  render() {
    return (
      <Dropdown className={css.widgets} alignRight={true}>
        <Dropdown.Toggle variant="dark">
          <Icon name={'filter'} />
          {this.props.title}
        </Dropdown.Toggle>
        <Dropdown.Menu
          className={css.filter_menu}
          style={{ zIndex: zIndices.filterMenu }}>
          {this.props.children}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
