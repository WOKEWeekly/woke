import React, { Component } from 'react';
import { Col, Modal } from 'react-bootstrap';

import { EditButton, DeleteButton, CloseButton } from '~/components/button.js';
import { Group, Label, Select } from '~/components/form.js';
import { Paragraph } from '~/components/text.js';
import css from '~/styles/_components.scss';
import { loadCountries } from '~/constants/countries';

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
          <DeleteButton onClick={confirmFunc}>{confirmText}</DeleteButton>
          <CloseButton onClick={close}>Cancel</CloseButton>
        </Modal.Footer>
     </Modal>
    )
  }
}

export class EthnicModal extends Component {
  constructor(){
    super();
    this.state = {
      countries: []
    }
  }

  componentDidMount(){
    loadCountries().then(countries => this.setState({countries}));
  }

  render(){
    const { confirm, close, visible, handleSelect, entity } = this.props;
    const { ethnicity1, ethnicity2, ethnicity3, ethnicity4 } = entity;
    const { countries } = this.state;
    return (
      <Modal
        show={visible}
        onHide={null}
        centered>
        <Modal.Body className={css.modal_body}>
          <Group>
            <Col md={6}>
              <Label>First ethnicity:</Label>
              <Select
                name={'ethnicity1'}
                value={ethnicity1}
                items={countries}
                onChange={handleSelect}
                placeholder={"Select first country."} />
              <a style={{
                fontSize: 12,
                color: 'skyblue',
                textAlign: 'right',
                width: '100%'
              }}>Clear</a>
            </Col>
            <Col md={6}>
              <Label>Second ethnicity:</Label>
              <Select
                name={'ethnicity2'}
                value={ethnicity2}
                items={countries}
                onChange={handleSelect}
                placeholder={"Select second country."} />
            </Col>
          </Group>
          <Group>
            <Col md={6}>
              <Label>Third ethnicity:</Label>
              <Select
                name={'ethnicity3'}
                value={ethnicity3}
                items={countries}
                onChange={handleSelect}
                placeholder={"Select third country."} />
            </Col>
            <Col md={6}>
              <Label>Fourth ethnicity:</Label>
              <Select
                name={'ethnicity4'}
                value={ethnicity4}
                items={countries}
                onChange={handleSelect}
                placeholder={"Select fourth country."} />
            </Col>
          </Group>
        </Modal.Body>

        <Modal.Footer className={css.modal_footer}>
          <EditButton onClick={confirm}>Confirm</EditButton>
          <CloseButton onClick={close}>Cancel</CloseButton>
        </Modal.Footer>
      </Modal>
    )
  }
}