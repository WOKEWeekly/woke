import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';

import css from 'styles/components/Form.module.scss';

export const Checkbox = forwardRef((props, ref) => {
  const { checked, label } = props;
  const [isChecked, setChecked] = useState(checked);
  const classes = classNames(css.checkbox, props.className);
  return (
    <label className={classes}>
      <input
        {...props}
        checked={isChecked}
        className={css.box}
        onChange={(e) => setChecked(e.target.checked)}
        ref={ref}
        type={'checkbox'}
      />
      <div>{label}</div>
    </label>
  );
});
