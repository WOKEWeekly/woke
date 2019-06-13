import React, { Component } from 'react';
import { Button, Dropdown, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import classNames from 'classnames';

import css from '~/styles/_components.scss';
import { Icon } from '~/components/icon.js';


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
        className={css.button}
        variant={'dark'}
        onClick={this.props.onClick}>
        <Icon name={'plus'} /> {this.props.title}
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
 * WIDGET BUTTONS
 ***********************/

export class DropdownButton extends Component {
  render(){
    return (
      <Dropdown className={css.widgets} onSelect={this.props.onSelect}>
        <Dropdown.Toggle variant="dark"><Icon name={'sort-amount-down'} />Sort</Dropdown.Toggle>
        <Dropdown.Menu>
          {React.Children.map(this.props.items, (item, index) => {
            return <Dropdown.Item eventKey={index+1}>{item}</Dropdown.Item>
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

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
          {React.Children.map(this.props.items, (item, index) => {
            return <ToggleButton variant="dark" value={index+1}>{item}</ToggleButton>
          })}
      </ToggleButtonGroup>
    )
  }
}