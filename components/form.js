import React, { Component} from 'react';
import { Form, Row } from 'react-bootstrap';
import Textarea from 'react-textarea-autosize';
import classNames from 'classnames';

import { Icon } from '~/components/icon.js';
import css from '~/styles/_components.scss';

import { Fader } from '~/components/transitioner.js';

/** For the form heading */
export class Heading extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false}
  }

  componentDidMount(){
    this.setState({ isLoaded: true})
  }

  render(){
    return (
      <Fader determinant={this.state.isLoaded} duration={750}>
        <div className={css.heading}>{this.props.children}</div>
      </Fader>
    )
  }
}

/** For grouping form components */
export class Group extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false}
  }

  componentDidMount(){
    this.setState({ isLoaded: true})
  }

  render(){
    const classes = classNames(css.group, this.props.className);
    return (
      <Fader determinant={this.state.isLoaded} duration={750}>
        <Form.Group
          as={Row}
          className={classes}
          style={this.props.style}>
          {this.props.children}
        </Form.Group>
      </Fader>
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

/***************************
 * INPUTS
 **************************/

/** Template for inputs */
class Input extends Component {
  render(){
    const classes = classNames(css.input, this.props.className);
    return (
      <input
        {...this.props}
        type={this.props.type}
        name={this.props.name}
        placeholder={this.props.placeholder}
        className={classes}
        autoComplete={'off'}
        value={this.props.value || ''}
        onChange={this.props.onChange} />
    )
  }
}

/** For inline text inputs */
export class TextInput extends Component {
  render(){
    return (
      <Input
        {...this.props}
        type={'text'} />
    )
  }
}

/** For username inputs */
export class UsernameInput extends Component {
  render(){
    return (
      <Input
        {...this.props}
        autoCapitalize={'off'} />
    )
  }
}

/** For password inputs */
export class PasswordInput extends Component {
  render(){
    return (
      <Input
        {...this.props}
        type={'password'} />
    )
  }
}

export class ClickInput extends Component {
  render(){
    return (
      <button
        onClick={this.props.onClick}
        className={css.invisible_button}
        style={{width: '100%', padding: '0'}}>
        <Input
          {...this.props}
          readOnly />
      </button>
    )
  }
}

/** For number selections */
export class NumberPicker extends Component {
  render(){
    return (
      <Input
        {...this.props}
        type={'number'}
        min={1} />
    )
  }
}

export class SearchBar extends Component {
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

/***************************
 * TEXTAREAS
 **************************/

/** For inline long text inputs */
export class ShortTextArea extends Component {
  render(){
    return (
      <Textarea
        name={this.props.name}
        placeholder={this.props.placeholder}
        className={css.textarea}
        value={this.props.value || ''}
        onChange={this.props.onChange} />
    )
  }
}

/** For long text inputs with word counters */
export class TextArea extends Component {
  constructor(props){
    super(props);
    this.state = {
      wordCount: props.value ? props.value.length : 0
    }
  }

  componentWillReceiveProps(props) {
    this.setState({ wordCount: props.value ? props.value.length : 0 });  
  }

  handleTextChange = (event) => {
    this.props.onChange(event);
    this.setState({wordCount: event.target.value.length})
  }

  render(){
    return (
      <div>
        <Textarea
          name={this.props.name}
          placeholder={this.props.placeholder}
          className={css.textarea}
          minRows={3}
          value={this.props.value || ''}
          onChange={this.handleTextChange} />
        <label className={css.wordcount}>{this.state.wordCount}</label>
      </div>
    )
  }
}

/***************************
 * OTHERS
 **************************/

/** For dropdown menus */
export class Select extends Component {
  render(){
    const { name, placeholder, items, value, onChange } = this.props;
    return (
      <select
        className={css.select}
        name={name}
        value={value || ''}
        onChange={onChange}
        style={{ color: value === '' && '#8E8E8E' }}>
        <option value={''} disabled>{placeholder}</option>
        {items.map((item, index) => {
          return <option key={index} value={item.value || item.label}>{item.label}</option>
        })}
      </select>
    )
  }
}

/** For checkboxes */
export class Checkbox extends Component {
  render(){
    return (
      <label className={css.checkbox}>
        <input
          type={'checkbox'}
          checked={this.props.checked}
          onChange={this.props.onChange}
          className={css.box}
          {...this.props} />
          <div>{this.props.label}</div>
      </label>
    )
  }
}

/** File selector */
export class FileSelector extends Component {
  render(){
    return (
      <div className={css.file}>
        <label className={css.file_button}>
          Browse...
          <input
            type={'file'}
            style={{display: 'none'}}
            onChange={this.props.onChange} />
        </label>
        <input
          type={'text'}
          disabled
          value={this.props.value}
          placeholder={'Choose a file'}
          className={css.file_input} />
      </div>
    )
  }
}