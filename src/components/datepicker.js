import React, { Component} from 'react';
import {Col} from 'react-bootstrap';


import { alert } from '~/components/alert.js';
import { SubmitButton, CancelButton } from '~/components/button.js';
import { Group, Select, TextInput } from '~/components/form.js';
import { Modal } from '~/components/modal.js';
import { creationDate } from '~/constants/settings.js';
import css from '~/styles/components/Form.module.scss';
import { Icon } from './icon';

import { zDate, zHandlers } from 'zavid-modules';

export class DatePicker extends Component {
  constructor(props){
    super(props);

    this.state = {
      ...extractDates(props.date),
      visible: false
    }
  }

  /** Account for changes to input */
  static getDerivedStateFromProps({date}, state) {
    if (state.visible) return state;
    return extractDates(date);
  }

  /** Update component dates on confirmation */
  confirmDateSelection = () => {
    let { day, month, year } = this.state;

    if (!day) return alert.error('Please set the day of the month.');
    if (!month) return alert.error('Please set month of the year.');
    if (!year) return alert.error('Please set the year.');

    month = zDate.MONTHS[month.toUpperCase()].NUMBER - 1;
    day = parseInt(day.replace(/([0-9]+)(.*)/g, '$1'));
    
    const date = new Date(year, month, day);
    this.props.onConfirm(date, this.props.name);
    this.closeDateModal();
  }

  /** Close modal */
  closeDateModal = () => this.setState({ visible: false})

  render(){
    const { date, placeholderText, minDate, maxDate, withDayOfWeek } = this.props;
    const { day, month, year, visible } = this.state;

    const startYear = minDate && minDate.getFullYear();
    const endYear = maxDate && maxDate.getFullYear();

    const { handleText } = zHandlers(this);

    const body = (
      <Group className={css.dateModal}>
        <Col xs={3}>
          <Select
            name={'day'}
            value={day}
            items={zDate.getDatesForMonth(month)}
            placeholder={'DD'}
            onChange={handleText} />
        </Col>
        <Col xs={6}>
          <Select
            name={'month'}
            value={month}
            items={zDate.getAllMonths()}
            placeholder={'MMMM'}
            onChange={handleText} />
        </Col>
        <Col xs={3}>
          <Select
            name={'year'}
            value={year}
            items={zDate.getYearsInRange(startYear, endYear)}
            placeholder={'YYYY'}
            onChange={handleText} />
        </Col>
      </Group>
    );

    const footer = (
      <React.Fragment>
        <SubmitButton onClick={this.confirmDateSelection}>Confirm</SubmitButton>
        <CancelButton onClick={this.closeDateModal}>Close</CancelButton>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <button
          onClick={() => this.setState({ visible: true})}
          className={css.datepicker}>
          <Icon
            prefix={'far'}
            name={'calendar-alt'}
            className={css.calendarIcon} />
          <TextInput
            value={date ? zDate.formatDate(date, withDayOfWeek) : null}
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

export class EventDatePicker extends Component {
  render(){
    return (
      <DatePicker
        name={this.props.name}
        date={this.props.date}
        onConfirm={this.props.onConfirm}
        placeholderText={'Select a date.'}
        minDate={creationDate}
        withDayOfWeek />
    );
  }
}

export class BirthdayPicker extends Component {
  render(){
    return (
      <DatePicker
        name={this.props.name}
        date={this.props.date}
        onConfirm={this.props.onConfirm}
        placeholderText={'Select date of birth.'}
        maxDate={new Date()} />
    );
  }
}

export class AuthoredDatePicker extends Component {
  render(){
    return (
      <DatePicker
        name={this.props.name}
        date={this.props.date}
        onConfirm={this.props.onConfirm}
        placeholderText={'Select the date written.'}
        minDate={creationDate}
        maxDate={new Date()}
        withDayOfWeek />
    );
  }
}

/**
 * Extract the day, month and year from a specified date.
 * @param {Date} date - The specified date.
 * @returns {object[]} The day, month and year.
 */
const extractDates = (date) => {
  let day, month, year;

  if (date !== null){
    date = new Date(date);
    const dayNum = date.getDate();
    const monthNum = date.getMonth() + 1;

    day = zDate.getDateAndSuffix(dayNum);
    month = zDate.getMonthByNumber(monthNum);
    year = date.getFullYear();
  }

  return { day, month, year };
}