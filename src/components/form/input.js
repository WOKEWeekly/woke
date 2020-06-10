import classNames from 'classnames';
import React from 'react';

import { Icon } from '@components/icon.js';

import css from '@styles/components/Form.module.scss';

const Input = (props) => {
  const { className, name, onChange, placeholder, type, value = '' } = props;
  const classes = classNames(css['input'], className);
  return (
    <input
      {...props}
      autoComplete={'off'}
      className={classes}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );
};

export const TextInput = (props) => {
  return <Input {...props} type={'text'} />;
};

export const UsernameInput = (props) => {
  return <Input {...props} autoCapitalize={'off'} />;
};

export const EmailInput = (props) => {
  return <Input {...props} type={'email'} />;
};

export const PasswordInput = (props) => {
  return <Input {...props} type={'password'} />;
};

export const ClickInput = (props) => {
  return (
    <button onClick={props.onClick} className={css['click-input']}>
      <Input {...props} readOnly />
    </button>
  );
};

export const NumberPicker = (props) => {
  return <Input {...props} type={'number'} min={1} />;
};

// TODO: Use custom Input, not primitive input
export const SearchBar = ({ onChange, placeholder, value, width }) => {
  return (
    <div className={css.searchContainer}>
      <Icon name={'search'} color={'grey'} />
      <input
        type={'text'}
        className={css.searchBar}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
        style={{ width }}
      />
    </div>
  );
};
