import React, { Component, useState, useEffect } from 'react';
import { Col, Modal as IModal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { zHandlers } from 'zavid-modules';

import { SubmitButton, CancelButton, DeleteButton } from 'components/button.js';
import { Group, Label, Select, UsernameInput } from 'components/form';
import { SocialIcon } from 'components/icon.js';
import { Paragraph } from 'components/text.js';
import { socialPlatforms } from 'constants/settings';
import css from 'styles/components/Modal.module.scss';

/**
 * Custom hook for controlling modal visibility
 * @param {boolean} initial - The modal's initial visibility.
 * @returns {any[]} The hook.
 */
export const useModal = (initial = false) => {
  const [isVisible, setVisibility] = useState(initial);
  return [isVisible, setVisibility];
};

// TODO: Clean up modals
export const Modal = (props) => {
  const { visible, header, body, footer, onlyBody, onHide } = props;

  const Header = () => {
    if (!header) return null;

    return <IModal.Header className={css.modal_header}>{header}</IModal.Header>;
  };

  const Body = () => {
    return (
      <IModal.Body
        className={css.modal_body}
        style={{ padding: onlyBody ? '1rem' : '0 1rem' }}>
        {body}
      </IModal.Body>
    );
  };

  const Footer = () => {
    if (!footer) return null;

    return <IModal.Footer className={css.modal_footer}>{footer}</IModal.Footer>;
  };

  return (
    <IModal show={visible} onHide={onHide} centered {...props}>
      <Header />
      <Body />
      <Footer />
    </IModal>
  );
};

export const ConfirmModal = ({
  message,
  confirmFunc,
  confirmText,
  close,
  visible
}) => {
  const [isLoaded, setLoaded] = useState(visible);
  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  const Body = (
    <Paragraph className={css.text} style={{ fontSize: '1.1em' }}>
      {message}
    </Paragraph>
  );

  const Footer = (
    <>
      <DeleteButton onClick={confirmFunc}>{confirmText}</DeleteButton>
      <CancelButton onClick={close}>Cancel</CancelButton>
    </>
  );

  return (
    <Modal
      show={visible && isLoaded}
      body={Body}
      footer={Footer}
      onlyBody={true}
      onHide={close}
    />
  );
};

export class EthnicModal extends Component {
  render() {
    const { close, visible, handleSelect, clearSelection, entity } = this.props;
    const { ethnicity1, ethnicity2, ethnicity3, ethnicity4 } = entity;

    const body = (
      <React.Fragment>
        <Group>
          <EthnicSelect
            label={'First ethnicity'}
            name={'ethnicity1'}
            value={ethnicity1}
            onChange={handleSelect}
            clearSelection={clearSelection}
            placeholder={'Select first country...'}
          />
          <EthnicSelect
            label={'Second ethnicity'}
            name={'ethnicity2'}
            value={ethnicity2}
            onChange={handleSelect}
            clearSelection={clearSelection}
            placeholder={'Select second country...'}
          />
        </Group>
        <Group>
          <EthnicSelect
            label={'Third ethnicity'}
            name={'ethnicity3'}
            value={ethnicity3}
            onChange={handleSelect}
            clearSelection={clearSelection}
            placeholder={'Select third country...'}
          />
          <EthnicSelect
            label={'Fourth ethnicity'}
            name={'ethnicity4'}
            value={ethnicity4}
            onChange={handleSelect}
            clearSelection={clearSelection}
            placeholder={'Select fourth country...'}
          />
        </Group>
      </React.Fragment>
    );

    const footer = <CancelButton onClick={close}>Close</CancelButton>;

    return (
      <Modal
        show={visible}
        scrollable
        body={body}
        footer={footer}
        onlyBody={true}
      />
    );
  }
}

class _EthnicSelect extends Component {
  render() {
    const {
      label,
      name,
      value,
      onChange,
      clearSelection,
      placeholder,
      countries
    } = this.props;
    return (
      <Col md={6}>
        <Label>{label}:</Label>
        <Select
          name={name}
          value={value}
          items={countries}
          onChange={onChange}
          placeholder={placeholder}
        />
        <button onClick={() => clearSelection(name)} className={css.clear}>
          Clear
        </button>
      </Col>
    );
  }
}

export class SocialsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    for (const idx of Object.keys(socialPlatforms)) {
      this.state[idx] = '';
    }
  }

  /** Receive socials from props and populate state */
  static getDerivedStateFromProps(props, state) {
    if (props.visible) return;

    if (props.socials) {
      for (const idx of Object.keys(socialPlatforms)) {
        let social = props.socials[idx];
        state[idx] = social ? social : state[idx];
      }
    }
    return state;
  }

  confirmSocials = () => {
    this.props.confirm(this.state);
    this.props.close();
  };

  render() {
    const { close, visible } = this.props;

    const renderFields = () => {
      const items = [];

      for (const idx of Object.keys(socialPlatforms)) {
        let social = socialPlatforms[idx];
        items.push(
          <Col md={6} key={idx} style={{ marginBottom: '1em' }}>
            <Label>{social.name}</Label>
            <div className={css.social_fields}>
              <SocialIcon icon={social.icon} className={css.icons} />
              <UsernameInput
                name={idx}
                value={this.state[idx]}
                onChange={zHandlers(this).handleText}
                placeholder={`${social.name} ${
                  social.domain === '' ? 'URL' : 'username'
                }`}
              />
            </div>
          </Col>
        );
      }

      return items;
    };

    const body = <Group>{renderFields()}</Group>;

    const footer = (
      <React.Fragment>
        <SubmitButton onClick={this.confirmSocials}>Confirm</SubmitButton>
        <CancelButton onClick={close}>Close</CancelButton>
      </React.Fragment>
    );

    return (
      <Modal
        show={visible}
        scrollable
        body={body}
        footer={footer}
        onlyBody={true}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  countries: state.countries
});

const EthnicSelect = connect(mapStateToProps)(_EthnicSelect);
