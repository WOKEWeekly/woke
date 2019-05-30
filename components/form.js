import React, { Component} from 'react';
import { Form, Col, Row } from 'react-bootstrap';
import Textarea from 'react-textarea-autosize';

import css from '~/styles/_components.scss';

/** For the form heading */
export class Heading extends Component {
  render(){
    return (
      <div className={css.heading}>{this.props.children}</div>
    )
  }
}

/** For grouping form components */
export class Group extends Component {
  render(){
    return (
      <Form.Group as={Row} className={css.group}>
        {this.props.children}
      </Form.Group>
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
  constructor(props){
    super(props);
    this.state = {
      value: props.value
    }
  }
  render(){
    return (
      <input
        type={'text'}
        placeholder={this.props.placeholder}
        className={css.input}
        {...this.props}>
        </input>
    )
  }
}

/** For long text inputs */
export class TextArea extends Component {
  render(){
    return (
      <Textarea
        placeholder={this.props.placeholder}
        className={css.textarea}
        minRows={5}
        {...this.props} />
    )
  }
}