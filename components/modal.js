import React, { Component } from 'react';
import { Col, Modal } from 'react-bootstrap';

import { ConfirmButton, DeleteButton2, CloseButton } from '~/components/button.js';
import { Group, Label, Select } from '~/components/form.js';
import { Paragraph } from '~/components/text.js';
import css from '~/styles/_components.scss';
import { COUNTRIES } from '~/constants/countries';

export class ConfirmModal extends Component {
  render(){

    const { message, confirmFunc, confirmText, close, visible } = this.props;

    return (
      <Modal
        show={visible}
        onHide={null}
        centered>
        <Modal.Body className={css.modal_body}>
          <Paragraph className={css.text}>{message}</Paragraph>
        </Modal.Body>

        <Modal.Footer className={css.modal_footer}>
          <DeleteButton2 onClick={confirmFunc}>{confirmText}</DeleteButton2>
          <CloseButton onClick={close}>Cancel</CloseButton>
        </Modal.Footer>
     </Modal>
    )
  }
}

export class EthnicModal extends Component {
  render(){
    const { confirm, close, visible, handleSelect, entity } = this.props;
    const { ethnicity1, ethnicity2, ethnicity3, ethnicity4 } = entity;
    return (
      <Modal
        show={visible}
        onHide={null}
        centered>
        <Modal.Body className={css.modal_body}>
          <Group>
            <EthnicSelect
              label={'First ethnicity'}
              name={'ethnicity1'}
              value={ethnicity1}
              onChange={handleSelect}
              placeholder={'Select first country'} />
            <EthnicSelect
              label={'Second ethnicity'}
              name={'ethnicity2'}
              value={ethnicity2}
              onChange={handleSelect}
              placeholder={'Select second country'} />
          </Group>
          <Group>
            <EthnicSelect 
              label={'Third ethnicity'}
              name={'ethnicity3'}
              value={ethnicity3}
              onChange={handleSelect}
              placeholder={'Select third country'} />
            <EthnicSelect
              label={'Fourth ethnicity'}
              name={'ethnicity4'}
              value={ethnicity4}
              onChange={handleSelect}
              placeholder={'Select fourth country'} />
          </Group>
        </Modal.Body>

        <Modal.Footer className={css.modal_footer}>
          <ConfirmButton onClick={confirm}>Confirm</ConfirmButton>
          <CloseButton onClick={close}>Cancel</CloseButton>
        </Modal.Footer>
      </Modal>
    )
  }
}

class EthnicSelect extends Component {
  render(){
    const { label, name, value, onChange, placeholder } = this.props;
    return (
      <Col md={6}>
        <Label>{label}:</Label>
          <Select
            name={name}
            value={value}
            items={COUNTRIES}
            onChange={onChange}
            placeholder={placeholder} />
          <a style={{
            fontSize: 12,
            color: 'skyblue',
            textAlign: 'right',
            width: '100%'
          }}>Clear</a>
      </Col>
    )
  }
}