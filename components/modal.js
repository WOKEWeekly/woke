import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import css from '~/styles/_components.scss';

export class ConfirmModal extends Component {
  render(){

    const { message, confirmFunc, confirmText, close, visible } = this.props;

    return (
      <Modal
        show={visible}
        centered
        className={css.modal}>
        <Modal.Body>
          <p>{message}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant={'danger'} onClick={confirmFunc}>{confirmText}</Button>
          <Button variant={'secondary'} onClick={close}>Cancel</Button>
        </Modal.Footer>
    </Modal>
    )
  }
}