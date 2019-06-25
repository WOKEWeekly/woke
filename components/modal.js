import React, { Component } from 'react';
import { Col, Modal } from 'react-bootstrap';

import { DeleteButton2, ConfirmButton, CloseButton } from '~/components/button.js';
import { Group, Label, Select, TextInput } from '~/components/form.js';
import { Paragraph } from '~/components/text.js';
import css from '~/styles/_components.scss';
import { COUNTRIES } from '~/constants/countries';

import { socialPlatforms } from '~/constants/settings';

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
    const { close, visible, handleSelect, clearSelection, entity } = this.props;
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
              clearSelection={clearSelection}
              placeholder={'Select first country...'} />
            <EthnicSelect
              label={'Second ethnicity'}
              name={'ethnicity2'}
              value={ethnicity2}
              onChange={handleSelect}
              clearSelection={clearSelection}
              placeholder={'Select second country...'} />
          </Group>
          <Group>
            <EthnicSelect 
              label={'Third ethnicity'}
              name={'ethnicity3'}
              value={ethnicity3}
              onChange={handleSelect}
              clearSelection={clearSelection}
              placeholder={'Select third country...'} />
            <EthnicSelect
              label={'Fourth ethnicity'}
              name={'ethnicity4'}
              value={ethnicity4}
              onChange={handleSelect}
              clearSelection={clearSelection}
              placeholder={'Select fourth country...'} />
          </Group>
        </Modal.Body>

        <Modal.Footer className={css.modal_footer}>
          <CloseButton onClick={close}>Close</CloseButton>
        </Modal.Footer>
      </Modal>
    )
  }
}

class EthnicSelect extends Component {
  render(){
    const { label, name, value, onChange, clearSelection, placeholder } = this.props;
    return (
      <Col md={6}>
        <Label>{label}:</Label>
        <Select
          name={name}
          value={value}
          items={COUNTRIES}
          onChange={onChange}
          placeholder={placeholder}
          ref={this.select} />
        <div>
          <button
            onClick={() => clearSelection(name)}
            className={css.clear}>
            Clear
          </button>
        </div>
      </Col>
    )
  }
}

export class SocialsModal extends Component {
  constructor(props){
    super(props);

    this.state = {}
    for (const idx of Object.keys(socialPlatforms)) {
      this.state[idx] = '';
    }
  }

  componentWillReceiveProps(props) {
    this.setState((state) => {
      for (const idx of Object.keys(socialPlatforms)) {
        let social = props.socials[idx];
        state[idx] = social ? social : state[idx];
      }
      return state;
    });  
  }

  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }

  confirmSocials = () => {
    this.props.confirm(this.state);
    this.props.close();
  }

  render(){
    const { close, visible } = this.props;

    const renderFields = () => {
      const items = [];
      
      for (const idx of Object.keys(socialPlatforms)) {
        let social = socialPlatforms[idx];
        items.push(
          <Col md={6} key={idx} style={{marginBottom: '1em'}}>
            <Label>{social.name}</Label>
            <TextInput
              name={idx}
              value={this.state[idx]}
              onChange={this.handleText}
              placeholder={`Enter ${social.name} ${social.domain === '' ? 'URL' : 'username'}...`} />
          </Col>
        );
      }
      
      return items;
    }

    return (
      <Modal
        show={visible}
        onHide={null}
        centered
        scrollable>
        <Modal.Body
          className={css.modal_body}
          style={{ maxHeight: '75vh' }}>
          <Group>{renderFields()}</Group>
        </Modal.Body>

        <Modal.Footer className={css.modal_footer}>
          <ConfirmButton onClick={this.confirmSocials}>Confirm</ConfirmButton>
          <CloseButton onClick={close}>Close</CloseButton>
        </Modal.Footer>
      </Modal>
    )
  }
}