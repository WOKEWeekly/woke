import React, { Component} from 'react';
import {Col} from 'react-bootstrap';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { Group, Select, TextInput } from '~/components/form.js';
import { Modal } from '~/components/modal.js';
import { creationDate } from '~/constants/settings.js';
import css from '~/styles/_components.scss';
import { Icon } from './icon';

import { zDate, zHandlers } from 'zavid-modules';

export class DatePicker extends Component {
  constructor(props){
    super(props);

    this.state = {
      ...extractDates(this.props.date),
      visible: false
    }
  }

  /** Account for changes to input */
  static getDerivedStateFromProps({date}, state) {
    if (date && state.visible) return state;
    return extractDates(date);
  }

  /** Update component dates on confirmation */
  confirm = () => {
    let { dateOfMonth, month, year } = this.state;
    month = zDate.MONTHS[month.toUpperCase()].NUMBER - 1;
    dateOfMonth = parseInt(dateOfMonth.replace(/([0-9]+)(.*)/g, '$1'));
    
    const date = new Date(year, month, dateOfMonth);
    this.props.onConfirm(date, this.props.name);
    this.close();
  }

  /** Close modal */
  close = () => this.setState({ visible: false})

  render(){
    const { date, placeholderText, minDate, maxDate, withDayOfWeek } = this.props;
    const { dateOfMonth, month, year, visible } = this.state;

    const startYear = minDate && minDate.getFullYear();
    const endYear = maxDate && maxDate.getFullYear();

    const { handleText } = zHandlers(this);

    const body = (
      <Group className={css.dateModal}>
        <Col xs={3}>
          <Select
            name={'dateOfMonth'}
            value={dateOfMonth}
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
        <SubmitButton onClick={this.confirm}>Confirm</SubmitButton>
        <CancelButton onClick={this.close}>Close</CancelButton>
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
            value={zDate.formatDate(date, withDayOfWeek) || ''}
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
 * 
 * @param {Date} date 
 */
const extractDates = (date) => {
  let dateOfMonth, month, year;

  if (date !== null){
    const day = date.getDay() + 1;
    dateOfMonth = `${day}${zDate.getDateSuffix(day)}`;
    month = zDate.getMonthByNumber(date.getMonth() + 1);
    year = date.getFullYear();
  }

  return { dateOfMonth, month, year };
}