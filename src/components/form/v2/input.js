import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';

import css from 'styles/components/Form.module.scss';

const Input = forwardRef((props, ref) => {
  const { className, name, placeholder, type, value = '' } = props;
  const [text, setText] = useState(value);

  const classes = classNames(css['input'], className);
  return (
    <input
      {...props}
      autoComplete={'off'}
      className={classes}
      name={name}
      onChange={(e) => setText(e.target.value)}
      ref={ref}
      placeholder={placeholder}
      type={type}
      value={text}
    />
  );
});

export const UsernameInput = forwardRef((props, ref) => {
  return <Input {...props} ref={ref} autoCapitalize={'off'} />;
});

export const PasswordInput = forwardRef((props, ref) => {
  return <Input {...props} ref={ref} type={'password'} />;
});