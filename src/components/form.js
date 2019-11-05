import React, { Component} from 'react';
import { connect } from 'react-redux';
import { Form, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { Icon } from '~/components/icon.js';
import { Fader, Zoomer } from '~/components/transitioner.js';
import { domain } from '~/constants/settings.js';

import css from '~/styles/_components.scss';

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
        <div className={css.formHeading}>{this.props.children}</div>
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
    return <Form.Label className={css.label}>{this.props.children}</Form.Label>
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
        ref={this.props.ref}
        onChange={this.props.onChange} />
    )
  }
}

/** For inline text inputs */
export class TextInput extends Component {
  render(){
    return <Input {...this.props} type={'text'} />
  }
}

/** For username inputs */
export class UsernameInput extends Component {
  render(){
    return <Input {...this.props} autoCapitalize={'off'} />
  }
}

/** For password inputs */
export class PasswordInput extends Component {
  render(){
    return <Input {...this.props} type={'password'} />
  }
}

export class ClickInput extends Component {
  render(){
    return (
      <button
        onClick={this.props.onClick}
        className={css.invisible_button}
        style={{width: '100%', padding: '0'}}>
        <Input {...this.props} readOnly />
      </button>
    )
  }
}

/** For number selections */
export class NumberPicker extends Component {
  render(){
    return <Input {...this.props} type={'number'} min={1} />
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

 class TextArea extends Component {
  constructor(props){
    super(props);
    this.state = { rows: props.minRows }
  }

  handleTextChange = (event) => {
    this.props.onChange(event);
    const limit = this.props.minRows;

    const text = event.target.value;
    const lines = text.split(/\r*\n/).length;
    const rows = lines > limit ? lines : limit;

    this.setState({ wordCount: text.length, rows });
  }

  render(){
    const { name, placeholder, value } = this.props;
    return (
      <textarea
        name={name}
        placeholder={placeholder}
        className={css.textarea}
        rows={this.state.rows}
        value={value || ''}
        onChange={this.handleTextChange} />
    )
  }
 }

/** For inline long text inputs */
export class ShortTextArea extends Component {
  render(){
    return <TextArea minRows={1} {...this.props} />
  }
}

/** For long text inputs with word counters */
export class LongTextArea extends Component {
  constructor(props){
    super(props);
    this.state = {
      wordCount: props.value ? props.value.length : 0
    }
  }

  static getDerivedStateFromProps(props){
    return { wordCount: props.value ? props.value.length : 0 };
  }

  render(){
    return (
      <div>
        <TextArea minRows={3} {...this.props} />
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
          return <option key={index} value={item.value || item.label || item}>{item.label || item}</option>
        })}
      </select>
    )
  }
}

/** For checkboxes */
export class Checkbox extends Component {
  render(){
    const classes = classNames(css.checkbox, this.props.className);
    return (
      <label className={classes}>
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
export class _FileSelector extends Component {
  constructor(props){
    super(props);

    const { filename, directory } = this.props;

    this.state = {
      image: filename ? `${domain}/static/images/${directory}/${filename}` : null
    }

    this.image = React.createRef();
    this.file = React.createRef();
  }

  handleImageChange = (event) => {
    this.props.onChange(event);
    this.previewImage();
  }

  previewImage = () => {
    const preview = this.image.current;
    const file    = this.file.current.files[0];
    const reader  = new FileReader();

    reader.addEventListener("load", () => {
      const source = reader.result;
      preview.src = source;
      this.setState({ image: source});
    }, false);

    if (file) reader.readAsDataURL(file);
  }

  render(){
    const { image } = this.state;
    const { theme } = this.props;

    return (
      <React.Fragment>
        <div className={css.file}>
          <label className={css[`file_button-${theme}`]}>
            Browse...
            <input
              type={'file'}
              style={{display: 'none'}}
              onChange={this.handleImageChange}
              ref={this.file} />
          </label>
          <input
            type={'text'}
            disabled
            value={this.props.filename}
            placeholder={'Choose a file'}
            className={css.file_input} />
        </div>
        <Zoomer
          determinant={image}
          duration={400}
          className={css.fileImage}
          style={{ display: image ? 'block' : 'none' }}>
          <img
            src={image}
            alt={'Image preview...'}
            ref={this.image} />
       </Zoomer>
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  theme: state.theme
});


export const FileSelector = connect(mapStateToProps)(_FileSelector);