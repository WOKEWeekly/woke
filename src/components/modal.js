import React, { Component } from 'react';
import { Col, Modal as DefaultModal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { zHandlers } from 'zavid-modules';

import {
  SubmitButton,
  CancelButton,
  DeleteButton
} from '@components/button.js';
import { Group, Label, Select, UsernameInput } from '@components/form.js';
import { SocialIcon } from '@components/icon.js';
import { Paragraph } from '@components/text.js';

import { socialPlatforms } from '@constants/settings';

import css from '@styles/components/Modal.module.scss';

export class Modal extends Component {
  render() {
    const { visible, header, body, footer, onlyBody } = this.props;

    const modalHeader = (
      <DefaultModal.Header className={css.modal_header}>
        {header}
      </DefaultModal.Header>
    );

    const modalBody = (
      <DefaultModal.Body
        className={css.modal_body}
        style={{ padding: onlyBody ? '1rem' : '0 1rem' }}>
        {body}
      </DefaultModal.Body>
    );

    const modalFooter = (
      <DefaultModal.Footer className={css.modal_footer}>
        {footer}
      </DefaultModal.Footer>
    );

    return (
      <DefaultModal show={visible} onHide={null} centered {...this.props}>
        {header ? modalHeader : null}
        {modalBody}
        {footer ? modalFooter : null}
      </DefaultModal>
    );
  }
}

export class ConfirmModal extends Component {
  render() {
    const { message, confirmFunc, confirmText, close, visible } = this.props;

    const body = (
      <Paragraph className={css.text} style={{ fontSize: '1.1em' }}>
        {message}
      </Paragraph>
    );

    const footer = (
      <React.Fragment>
        <DeleteButton onClick={confirmFunc}>{confirmText}</DeleteButton>
        <CancelButton onClick={close}>Cancel</CancelButton>
      </React.Fragment>
    );

    return <Modal show={visible} body={body} footer={footer} onlyBody={true} />;
  }
}

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
