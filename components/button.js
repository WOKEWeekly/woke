import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import css from '~/styles/_components.scss';

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