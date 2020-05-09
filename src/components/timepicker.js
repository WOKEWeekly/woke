import React, { Component } from 'react';
import { Col } from 'react-bootstrap';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { Group, Select, TextInput } from '~/components/form.js';
import { Modal } from '~/components/modal.js';
import css from '~/styles/components/Form.module.scss';
import { Icon } from './icon';

import { zDate, zHandlers } from 'zavid-modules';

export class TimePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ...extractTime(props.time),
      visible: false
    };
  }

  /** Account for changes to input */
  static getDerivedStateFromProps({ time }, state) {
    if (state.visible) return state;
    return extractTime(time);
  }

  /** Apply change to selected time value */
  confirmTimeSelectiom = () => {
    let { hour, minute } = this.state;

    const time = new Date();
    time.setHours(hour);
    time.setMinutes(minute);

    this.props.onConfirm(time, this.props.name);
    this.closeTimeModal();
  };

  /** Close the timepicker modal */
  closeTimeModal = () => this.setState({ visible: false });

  render() {
    const { time } = this.props;
    const { hour, minute, visible } = this.state;

    const { handleText } = zHandlers(this);

    const body = (
      <Group className={css.dateModal}>
        <Col xs={6}>
          <Select
            name={'hour'}
            items={zDate.getAllHours()}
            value={hour}
            placeholder={'HH'}
            onChange={handleText}
          />
        </Col>
        <Col xs={6}>
          <Select
            name={'minute'}
            items={zDate.getAllMinutes(5)}
            value={minute}
            placeholder={'mm'}
            onChange={handleText}
          />
        </Col>
      </Group>
    );

    const footer = (
      <React.Fragment>
        <SubmitButton onClick={this.confirmTimeSelectiom}>Confirm</SubmitButton>
        <CancelButton onClick={this.closeTimeModal}>Close</CancelButton>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <button
          onClick={() => this.setState({ visible: true })}
          className={css.datepicker}>
          <Icon prefix={'far'} name={'clock'} className={css.calendarIcon} />
          <TextInput
            value={time ? zDate.formatISOTime(time, false) : null}
            placeholder={'HH:mm'}
            style={{ textAlign: 'left' }}
            className={css.dateinput}
            readOnly
          />
        </button>

        <Modal show={visible} body={body} footer={footer} onlyBody={true} />
      </React.Fragment>
    );
  }
}

/**
 * Extract the hour and minute from a specified time.
 * @param {(string|Date}} time - The specified time.
 * @returns {object[]} The hour and minute.
 */
const extractTime = (time) => {
  let hour, minute;

  if (time !== null) {
    // Extract hour and minute from time value
    if (typeof time === 'string') {
      hour = parseInt(time.substring(0, 2));
      minute = parseInt(time.substring(3, 5));
    } else {
      const date = new Date(time);
      hour = date.getHours();
      minute = date.getMinutes();
    }
  }

  return { hour, minute };
};
