import React, { Component } from 'react';
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