import React, { Component} from 'react';
import { Form } from 'react-bootstrap';

import css from '~/styles/_components.scss';

/** For grouping form components */
export class Group extends Component {
  render(){
    return (
      <Form.Group className={css.group}>{this.props.children}</Form.Group>
    )
  }
}

/** For labels */
export class Label extends Component {
  render(){
    return (
      <Form.Label className={css.label}>{this.props.children}</Form.Label>
    )
  }
}

/** For inline text inputs */
export class Input extends Component {
  render(){
    return (
      <Form.Control
        type={'text'}
        placeholder={this.props.placeholder}
        className={css.input}
        {...this.props}>
          {this.props.children}
        </Form.Control>
    )
  }
}

/** For long text inputs */
export class TextArea extends Component {
  render(){
    return (
      <Form.Control
        as={'textarea'}
        placeholder={this.props.placeholder}
        className={css.textarea}>
          {this.props.children}
        </Form.Control>
    )
  }
}