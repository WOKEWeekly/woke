import React, { Component } from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import classNames from 'classnames';

import css from '~/styles/_components.scss';
import { Icon } from '~/components/icon.js';
import { Default, Mobile } from '~/components/layout.js';

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

export class DeleteButton extends Component {
  render(){
    const classes = classNames(css.delete, this.props.className);
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
 * PAGE BUTTONS 
 *************************/
export class AddEntityButton extends Component {
  render(){
    return (
      <Button
        className={css.add}
        variant={'dark'}
        onClick={this.props.onClick}>
        <Icon name={'plus'} />
        <Default>{this.props.title}</Default>
        <Mobile>Add</Mobile>
      </Button>
    )
  }
}

export class EditEntityButton extends Component {
  render(){
    return (
      <Button
        {...this.props}
        className={css.button}
        variant={'success'}>
        <Icon name={'edit'} />
        <Default>{this.props.title}</Default>
        <Mobile>Edit</Mobile>
      </Button>
    )
  }
}

export class DeleteEntityButton extends Component {
  render(){
    return (
      <Button
        {...this.props}
        className={css.button}
        variant={'danger'}>
        <Icon name={'trash'} />
        <Default>{this.props.title}</Default>
        <Mobile>Delete</Mobile>
      </Button>
    )
  }
}

export class BackButton extends Component {
  render(){
    return (
      <Button
        {...this.props}
        className={css.button}
        variant={'light'}>
        <Icon color={'#212529'} name={'chevron-left'} />
        <Default>{this.props.title}</Default>
        <Mobile>Back</Mobile>
      </Button>
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