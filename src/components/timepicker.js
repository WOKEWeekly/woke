import React, { Component } from 'react';
import {Col} from 'react-bootstrap';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { Group, Select, TextInput } from '~/components/form.js';
import { Modal } from '~/components/modal.js';
import css from '~/styles/_components.scss';
import { Icon } from './icon';

import { zDate } from 'zavid-modules';

export class TimePicker extends Component {
  constructor(props){
    super(props);

    const { time } = props;
    this.state = {
      hour: new Date(time).getHours(),
      minute: new Date(time).getMinutes(),
      visible: false
    }
  }

  /** Account for changes to input */
  static getDerivedStateFromProps({time}, state) {
    if (state.visible || !time) return state;

    let hour, minute;

    // Extract hour and minute from time value
    if (typeof time === 'string'){
      hour = parseInt(time.substring(0, 2));
      minute = parseInt(time.substring(3, 5));
    } else {
      hour = new Date(time).getHours();
      minute = new Date(time).getMinutes();
    }

    return { hour, minute };
  }

  /** Handle the change of time values */
  handleTimeChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  /** Apply change to selected time value */
  confirmTimeSelectiom = () => {
    let { hour, minute } = this.state;

    const time = new Date();
    time.setHours(hour);
    time.setMinutes(minute);

    this.props.onConfirm(time, this.props.name);
    this.closeTimeModal();
  }

  /** Close the timepicker modal */
  closeTimeModal = () => this.setState({ visible: false})
  
  render(){

    const { time, placeholderText } = this.props;
    const { hour, minute, visible } = this.state;

    const getHours = () => {
      const hours = [];
      for (let i = 0; i <= 23; i++) {
        hours.push({
          label: i < 10 ? '0' + i : i,
          value: i.toString()
        });
      }
      return hours;
    };
    
    const getMinutes = () => {
      const minutes = [];
      for (let i = 0; i <= 55; i += 5) {
        minutes.push({
          label: i < 10 ? '0' + i : i,
          value: i.toString()
        });
      }
      return minutes;
    };

    const body = (
      <Group className={css.dateModal}>
        <Col xs={6}>
          <Select
            name={'hour'}
            items={getHours()}
            value={hour}
            placeholder={'HH'}
            onChange={this.handleTimeChange} />
        </Col>
        <Col xs={6}>
          <Select
            name={'minute'}
            items={getMinutes()}
            value={minute}
            placeholder={'mm'}
            onChange={this.handleTimeChange} />
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
          onClick={() => this.setState({ visible: true})}
          className={css.datepicker}>
          <Icon
            prefix={'far'}
            name={'clock'}
            className={css.calendarIcon} />
          <TextInput
            value={zDate.formatISOTime(time, false) || '-'}
            placeholder={placeholderText}
            style={{textAlign: 'left'}}
            className={css.dateinput}
            readOnly />
        </button>

        <Modal
          show={visible}
          body={body}
          footer={footer}
          onlyBody={true} />
      </React.Fragment>
    )
  }
}