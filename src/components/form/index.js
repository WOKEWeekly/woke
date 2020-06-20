import classNames from 'classnames';
import React, { Component, useState, useRef } from 'react';
import { Form, Row, Overlay, Tooltip } from 'react-bootstrap';
import { zForm, zText } from 'zavid-modules';

import { Icon } from 'components/icon.js';
import { Title } from 'components/text.js';
import { Fader } from 'components/transitioner.js';
import css from 'styles/components/Form.module.scss';

export * from './input';
export * from './file-selector';
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
  const [show, setShow] = useState(false);
  const target = useRef(null);
  return (
    <>
      <button
        className={css.invisible_button}
        ref={target}
        onClick={() => setShow(!show)}>
        <Icon name={'info-circle'} />
      </button>
      <Overlay
        target={target.current}
        show={show}
        placement={'right'}
        rootClose={true}
        onHide={() => setShow(false)}>
        {(props) => (
          <Tooltip {...props}>
            <FormattingGuide />
          </Tooltip>
        )}
      </Overlay>
    </>
  );
};

const FormattingGuide = () => {
  const EmphasisExamples = () => {
    return Object.entries({
      italic: '*Use single asterisk*',
      bold: '**Use double asterisks**',
      ['bold-italic']: '***Use triple asterisks***',
      underline: '_Use underscores_',
      strikethrough: '~Use tildes~',
      hyperlink:
        '[Surround text in square brackets and URL in round brackets](https://www.wokeweekly.co.uk)'
    }).map(([key, value], count) => {
      return (
        <div key={count}>
          <span className={css.subheading}>For {key} text:</span>
          <br />
          {value} --&gt; {zText.formatText(value, { inline: true })}
        </div>
      );
    });
  };

  const SectionExamples = () => {
    return Object.entries({
      headings: '# Single hashtag',
      subheadings: '## Double hashtags',
      ['bullet-point lists']: '+ Plus symbol',
      ['hyphenated lists']: '- Minus symbol',
      blockquotes: '> Right chevron'
    }).map(([key, value], count) => {
      return (
        <div key={count}>
          <span className={css.subheading}>For {key}:</span>
          <br />
          {value}
          <br />
          {zText.formatText(value, { inline: true })}
        </div>
      );
    });
  };

  const EmphasisIntroduction = () => {
    return (
      <p>
        Emphasis formatting can be done on any piece of text inline (except for
        in headings and subheadings).
      </p>
    );
  };

  const SectionIntroduction = () => {
    return (
      <p>
        Section formatting only works when they are done as a standalone
        paragraph (on their own line).
      </p>
    );
  };

  return (
    <div className={css.formattingGuide}>
      <Title className={css.heading}>Emphasis Formatting</Title>
      <EmphasisIntroduction />
      <EmphasisExamples />
      <Title className={css.heading}>Section Formatting</Title>
      <SectionIntroduction />
      <SectionExamples />
    </div>
  );
};

/***************************
 * OTHERS
 **************************/

/** For dropdown menus */
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

/** For checkboxes */
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
