import React, { Component} from 'react';
import {Col} from 'react-bootstrap';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { formatDate } from '~/constants/date.js';
import { Group, Select, TextInput } from '~/components/form.js';
import { Modal } from '~/components/modal.js';
import { creationDate } from '~/constants/settings.js';
import css from '~/styles/_components.scss';
import { Icon } from './icon';
import moment from 'moment';

import { zDate } from 'zavid-modules';

export class DatePicker extends Component {
  constructor({date}){
    super({date});

    this.state = {
      dateOfMonth: moment().date(moment(date).date()).format("Do"),
      month: moment(date).format('MMMM'),
      year: moment(date).year(),
      visible: false
    }
  }

  /** Account for changes to input */
  static getDerivedStateFromProps({date}, state) {
    if (state.visible) return;
    return {
      dateOfMonth: moment().date(moment(date).date()).format("Do"),
      month: moment(date).format('MMMM'),
      year: moment(date).year(),
      changed: true
    }
  }

  handleDateChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  confirm = () => {
    let { dateOfMonth, month, year } = this.state;
    month = parseInt(moment().month(month).format("M")) - 1;
    dateOfMonth = parseInt(dateOfMonth.replace(/([0-9]+)(.*)/g, '$1'));
    
    const date = new Date(year, month, dateOfMonth);
    this.props.onConfirm(date);
    this.close();
  }

  close = () => this.setState({ visible: false})

  render(){
    const { date, placeholderText, minDate, maxDate, withDayOfWeek } = this.props;
    const { dateOfMonth, month, year, visible } = this.state;

    const momentMonth = moment().month(month).format("M");
    const daysInMonth = moment(`${year}-${momentMonth}`, 'YYYY-MM').daysInMonth();

    const getDates = () => {
      const array = [];
      for (let i = 1; i <= daysInMonth; i++){
        array.push(`${i}${zDate.getDateSuffix(i)}`);
      }
      return array;
    };

    const getYears = () => {
      const array = [];
      const startYear = parseInt(moment(minDate ? minDate : moment().subtract(40, 'years')).format('YYYY'));
      const endYear = parseInt(moment(maxDate ? maxDate : moment().add(3, 'years')).format('YYYY'));

      for (let i = startYear; i <= endYear; i++) array.push(i);
      return array;
    };

    const body = (
      <Group className={css.dateModal}>
        <Col xs={3}>
          <Select
            name={'dateOfMonth'}
            items={getDates()}
            value={dateOfMonth}
            placeholder={'DD'}
            onChange={this.handleDateChange} />
        </Col>
        <Col xs={6}>
          <Select
            items={moment.months()}
            name={'month'}
            value={month}
            placeholder={'MMMM'}
            onChange={this.handleDateChange} />
        </Col>
        <Col xs={3}>
          <Select
            items={getYears()}
            name={'year'}
            value={year}
            placeholder={'YYYY'}
            onChange={this.handleDateChange} />
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
            value={formatDate(date, withDayOfWeek) || ''}
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
        date={this.props.date || ''}
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
        date={this.props.date || ''}
        onConfirm={this.props.onConfirm}
        placeholderText={'Select date of birth.'}
        maxDate={new Date()} />
    );
  }
}

export class AuthoredDatePicker extends Component {
  render(){
    let date = new Date(2018, 11, 9);
    date = date.toString();
    return (
      <DatePicker
        date={this.props.date || date}
        onConfirm={this.props.onConfirm}
        placeholderText={'Select the date written.'}
        minDate={creationDate}
        maxDate={new Date()}
        withDayOfWeek />
    );
  }
}