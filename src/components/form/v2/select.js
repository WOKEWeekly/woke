import classNames from 'classnames';
import React, { forwardRef, useState } from 'react';

import css from 'styles/components/Form.module.scss';

export const Select = forwardRef((props, ref) => {
  const { className, placeholder, items } = props;

  // Make widgets account for values of '00' (time).
  let currentValue = props.value || '';
  if (currentValue === 0) currentValue = '00';

  const [selectedValue, setSelectedValue] = useState(currentValue);

  const color = selectedValue === '' ? '#8E8E8E' : 'white';

  return (
    <select
      className={classNames(css['select'], className)}
      value={selectedValue}
      onChange={(e) => setSelectedValue(e.target.value)}
      ref={ref}
      style={{ color }}>
      <option value={''} disabled>
        {placeholder}
      </option>
      {items.map((item, key) => {
        const value = item.value || item.label || item;
        const label = item.label || item;
        return (
          <option key={key} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
});
