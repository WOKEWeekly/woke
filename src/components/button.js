import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import classNames from 'classnames';

import css from '~/styles/components/Button.module.scss';
import { Icon } from '~/components/icon.js';
import { Default, Mobile } from '~/components/layout.js';

/*****************
 * CUSTOM BUTTONS
 ****************/
class _SubmitButton extends Component {
  render() {
    const { theme } = this.props;
    const classes = classNames(css[`submit-${theme}`], this.props.className);
    return (
      <button {...this.props} className={classes}>
        {this.props.children}
      </button>
    );
  }
}

export class DeleteButton extends Component {
  render() {
    const classes = classNames(css.delete, this.props.className);
    return (
      <button {...this.props} className={classes}>
        {this.props.children}
      </button>
    );
  }
}

class _CancelButton extends Component {
  render() {
    const { theme } = this.props;
    const classes = css[`cancel-${theme}`];
    return (
      <button {...this.props} className={classes}>
        {this.props.children}
      </button>
    );
  }
}

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

export class BackButton extends Component {
  render() {
    return (
      <Button {...this.props} className={css.button} variant={'light'}>
        <Icon color={'#212529'} name={'chevron-left'} />
        <Default>{this.props.title}</Default>
        <Mobile>Back</Mobile>
      </Button>
    );
  }
}

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

const mapStateToProps = (state) => ({
  theme: state.theme
});

export const SubmitButton = connect(mapStateToProps)(_SubmitButton);
export const CancelButton = connect(mapStateToProps)(_CancelButton);
