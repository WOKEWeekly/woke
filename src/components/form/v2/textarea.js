import classNames from 'classnames';
import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import css from 'styles/components/Form.module.scss';

const TextArea = (props) => {
  const { minRows, className, name, placeholder, value = '', onChange } = props;

  return (
    <TextareaAutosize
      name={name}
      placeholder={placeholder}
      className={classNames(css['textarea-v2'], className)}
      rows={minRows}
      value={value}
      onChange={onChange}
    />
  );
};

/** For shorter text inputs */
export const ShortTextArea = (props) => {
  const { onChange } = props;
  return <TextArea {...props} minRows={1} onChange={onChange} />;
};

/** For long text inputs with word counters */
export const LongTextArea = (props) => {
  const { onChange, value } = props;
  const [wordCount, setWordCount] = useState(value.length);

  return (
    <>
      <TextArea
        {...props}
        minRows={3}
        onChange={(e) => {
          onChange(e);
          setWordCount(e.target.value.length);
        }}
      />
      <label className={css['word-count']}>{wordCount}</label>
    </>
  );
};
