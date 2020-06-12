import classNames from 'classnames';
import React, { Component } from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';

import { alert } from '@components/alert.js';
import { Icon } from '@components/icon.js';
import { Default, Mobile } from '@components/layout.js';

import request from '@constants/request.js';

import css from '@styles/components/Button.module.scss';

const mapStateToProps = (state) => ({
  theme: state.theme
});

export const SubmitButton = connect(mapStateToProps)((props) => {
  const { theme, children, className } = props;
  const classes = classNames(css[`submit-${theme}`], className);
  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
});

export const DeleteButton = (props) => {
  const { className, children } = props;
  const classes = classNames(css.delete, className);
  return (
    <button {...props} className={classes}>
      {children}
    </button>
  );
};

export const CancelButton = connect(mapStateToProps)((props) => {
  const { children, theme } = props;
  return (
    <button {...props} className={css[`cancel-${theme}`]}>
      {children}
    </button>
  );
});

/*************************
 * PAGE BUTTONS
 *************************/
export class AddEntityButton extends Component {
  render() {
    return (
      <Button
        {...this.props}
        className={css.add}
        variant={'dark'}
        onClick={this.props.onClick}>
        <Icon name={'plus'} />
        <Default>{this.props.title}</Default>
        <Mobile>Add</Mobile>
      </Button>
    );
  }
}

export class EditEntityButton extends Component {
  render() {
    return (
      <Button {...this.props} className={css.button} variant={'success'}>
        <Icon name={'edit'} />
        <Default>{this.props.title}</Default>
        <Mobile>Edit</Mobile>
      </Button>
    );
  }
}

export class DeleteEntityButton extends Component {
  render() {
    return (
      <Button {...this.props} className={css.button} variant={'danger'}>
        <Icon name={'trash'} />
        <Default>{this.props.title}</Default>
        <Mobile>Delete</Mobile>
      </Button>
    );
  }
}

export const BackButton = ({ title, onClick }) => {
  return (
    <button className={css['back-button']} onClick={onClick}>
      <Icon name={'chevron-left'} />
      <span className={css['back-button-text']}>
        <Default>{title}</Default>
        <Mobile>Back</Mobile>
      </span>
    </button>
  );
};

export class AdminButton extends Component {
  render() {
    return (
      <Button {...this.props} className={css.button} variant={'light'}>
        <Icon color={'#212529'} name={'lock'} />
        {this.props.title}
      </Button>
    );
  }
}

/***********************
 * WIDGET BUTTONS
 ***********************/

export class CheckboxButton extends Component {
  constructor(props) {
    super(props);
    this.state = { checked: props.checked };

    this.checkbox = React.createRef();
  }

  static getDerivedStateFromProps(props) {
    return { checked: props.checked };
  }

  check = () => {
    this.setState({ checked: !this.state.checked });
    this.props.onChange(this.checkbox.current);
  };

  render() {
    return (
      <React.Fragment>
        <input
          ref={this.checkbox}
          name={this.props.name}
          type={'checkbox'}
          checked={this.state.checked}
          onChange={this.props.onChange}
          style={{ display: 'none' }}
        />
        <Button
          variant="dark"
          className={css.widgets}
          style={{ display: 'flex' }}
          onClick={this.check}>
          <div>
            <Icon
              name={this.state.checked ? 'check-square' : 'square'}
              prefix={'far'}
            />
            {this.props.label}
          </div>
        </Button>
      </React.Fragment>
    );
  }
}

export class RadioButtonGroup extends Component {
  render() {
    return (
      <ToggleButtonGroup
        className={css.widgets}
        type={'radio'}
        name={this.props.name}
        value={this.props.value}
        onChange={this.props.onChange}>
        {this.props.items.map((item, index) => {
          return (
            <ToggleButton variant="dark" key={index} value={item.value}>
              {item.label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    );
  }
}
