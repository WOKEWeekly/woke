import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';

import { DeleteButton, CloseButton } from '~/components/button.js';
import { Paragraph } from '~/components/text.js';
import css from '~/styles/_components.scss';

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