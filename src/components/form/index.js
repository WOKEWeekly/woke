import classNames from 'classnames';
import React, { Component } from 'react';
import { Form, Row } from 'react-bootstrap';
import { zForm } from 'zavid-modules';

import { Icon } from 'components/icon.js';
import { VanillaLink } from 'components/text.js';
import { Fader } from 'components/transitioner.js';
import { github } from 'constants/settings';
import css from 'styles/components/Form.module.scss';

export * from './fileselector';
export * from './input';
export * from './subscribe';

/** For the form heading */
export class Heading extends Component {
  constructor() {
    super();
    this.state = { isLoaded: false };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  render() {
    return (
      <Fader determinant={this.state.isLoaded} duration={750}>
        <div className={css.formHeading}>{this.props.children}</div>
      </Fader>
    );
  }
}

/** For grouping form components */
export class Group extends Component {
  constructor() {
    super();
    this.state = { isLoaded: false };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  render() {
    const classes = classNames(css.group, this.props.className);
    return (
      <Fader determinant={this.state.isLoaded} duration={750}>
        <Form.Group as={Row} className={classes} style={this.props.style}>
          {this.props.children}
        </Form.Group>
      </Fader>
    );
  }
}

/** For labels */
export class Label extends Component {
  render() {
    return <Form.Label className={css.label}>{this.props.children}</Form.Label>;
  }
}

/** For labels with information */
export const LabelInfo = (props) => {
  return (
    <div className={css.labelInfo}>
      <Form.Label className={css.label}>{props.children}</Form.Label>
      <InfoCircle />
    </div>
  );
};

/***************************
 * TEXTAREAS
 **************************/

/** For inline long text inputs */
export const ShortTextArea = (props) => {
  return <zForm.ShortTextArea {...props} className={css.textarea} />;
};

/** For block paragraphing text inputs */
export const LongTextArea = (props) => {
  return (
    <zForm.LongTextArea
      {...props}
      className={css.textarea}
      wordCountClassName={css.wordcount}
    />
  );
};

export const InfoCircle = () => {
  return (
    <VanillaLink
      className={css['info-circle']}
      href={github.pages}
      openNewTab={true}>
      <Icon name={'info-circle'} />
    </VanillaLink>
  );
};

/***************************
 * OTHERS
 **************************/

/** A v2 exists. */
export class Select extends Component {
  render() {
    const { name, placeholder, items, onChange } = this.props;

    // Make widgets account for values of '00' (time)
    let { value: currentValue = '' } = this.props;
    if (currentValue === 0) currentValue = '00';

    const color = !currentValue && '#8E8E8E';

    return (
      <select
        className={css.select}
        name={name}
        value={currentValue || ''}
        onChange={onChange}
        style={{ color }}>
        <option value={''} disabled>
          {placeholder}
        </option>
        {items.map((item, index) => {
          const value = item.value || item.label || item;
          const label = item.label || item;
          return (
            <option key={index} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    );
  }
}

/** A v2 exists. */
export class Checkbox extends Component {
  render() {
    const classes = classNames(css.checkbox, this.props.className);
    return (
      <label className={classes}>
        <input
          type={'checkbox'}
          checked={this.props.checked}
          onChange={this.props.onChange}
          className={css.box}
          {...this.props}
        />
        <div>{this.props.label}</div>
      </label>
    );
  }
}
