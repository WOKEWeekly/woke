import React, { Component } from 'react';
import { Button, Dropdown, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import classNames from 'classnames';

import css from '~/styles/_components.scss';
import { Icon } from '~/components/icon.js';
import { Default, Mobile } from '~/components/layout.js';

import { Checkbox } from '~/components/form.js';
import { zIndices } from './layout';

/*****************
 * CUSTOM BUTTONS
 ****************/
export class SubmitButton extends Component {
  render(){
    const classes = classNames(css.submit, this.props.className);
    return (
      <button
        {...this.props}
        className={classes}>
        {this.props.children}
      </button>
    )
  }
}

export class CancelButton extends Component {
  render(){
    return (
      <button
        {...this.props}
        className={css.cancel}>
        {this.props.children}
      </button>
    )
    
  }
}

/*************************
 * BOOTSTRAP CRUD BUTTONS 
 *************************/
export class AddButton extends Component {
  render(){
    return (
      <Button
        className={css.add}
        variant={'dark'}
        onClick={this.props.onClick}>
        <Icon name={'plus'} />
        <Default>{this.props.title}</Default>
        <Mobile>{this.props.mobileTitle || this.props.title}</Mobile>
      </Button>
    )
  }
}

export class EditButton extends Component {
  render(){
    return (
      <Button
        {...this.props}
        className={css.button}
        variant={'success'}>{this.props.children}</Button>
    )
  }
}

export class DeleteButton extends Component {
  render(){
    return (
      <Button
        {...this.props}
        className={css.button}
        variant={'danger'}>{this.props.children}</Button>
    )
  }
}

export class CloseButton extends Component {
  render(){
    return (
      <Button
        {...this.props}
        className={css.button}
        variant={'secondary'}>{this.props.children}</Button>
    )
  }
}

/***********************
 * DROPDOWNS BUTTONS
 ***********************/

export class DropdownButton extends Component {
  render(){
    return (
      <Dropdown className={css.widgets} onSelect={this.props.onSelect}>
        <Dropdown.Toggle variant="dark">{this.props.children}</Dropdown.Toggle>
        <Dropdown.Menu className={css.dropdown_menu}>
          {React.Children.map(this.props.items, (item, index) => {
            return <Dropdown.Item eventKey={index+1}>{item}</Dropdown.Item>
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

export class SortButton extends Component {
  render(){
    return (
      <DropdownButton
        items={this.props.items}
        onSelect={this.props.onSelect}
        alignRight>
        <Icon name={'sort-amount-down'} />{this.props.title}
      </DropdownButton>
    )
  }
}

export class FilterButton extends Component {
  render(){
    return (
      <Dropdown className={css.widgets} alignRight>
        <Dropdown.Toggle variant="dark"><Icon name={'filter'} />{this.props.title}</Dropdown.Toggle>
        <Dropdown.Menu className={css.filter_menu} style={{zIndex: zIndices.filterMenu}}>
        <Dropdown.Item disabled>Filter by category</Dropdown.Item>
        <Dropdown.Divider />
          {this.props.items.map((item, index) => {
            return <Checkbox key={index} label={item.label} />
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

/***********************
 * WIDGET BUTTONS
 ***********************/

export class CheckboxButton extends Component {
  render(){
    return (
      <ToggleButtonGroup
        className={css.widgets}
        type={'checkbox'}
        name={this.props.name}
        onChange={this.props.onChange}>
        <ToggleButton variant="dark" value={true}>{this.props.label}</ToggleButton>
      </ToggleButtonGroup>
    )
  }
}

export class RadioButtonGroup extends Component {
  render(){
    return (
      <ToggleButtonGroup
        className={css.widgets}
        type={'radio'}
        name={this.props.name}
        defaultValue={this.props.defaultValue}
        onChange={this.props.onChange}>
          {this.props.items.map((item, index) => {
            return <ToggleButton variant="dark" key={index} value={item.value}>{item.label}</ToggleButton>;
          })}
      </ToggleButtonGroup>
    )
  }
}