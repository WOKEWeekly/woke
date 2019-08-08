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

export class DatePicker extends Component {
  constructor(props){
    super(props);

    this.state = {
      dateOfMonth: moment().date(moment(props.date).date()).format("Do"),
      month: moment(props.date).format('MMMM'),
      year: moment(props.date).year(),
      visible: false
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
    const { placeholderText, minDate, maxDate } = this.props;
    const { dateOfMonth, month, year, visible } = this.state;

    const daysInMonth = moment(`${year}-${moment().month(month).format("M")}`, 'YYYY-MM').daysInMonth();

    const getDates = () => {
      const array = [];
      for (let i = 1; i <= daysInMonth; i++) array.push(moment().date(i).format("Do"));
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
            name={'dateOfMonth'}
            value={dateOfMonth}
            placeholder={'Select date'}
            onChange={this.handleDateChange} />
        </Col>
        <Col xs={6}>
          <Select
            items={moment.months()}
            name={'month'}
            value={month}
            placeholder={'Select month'}
            onChange={this.handleDateChange} />
        </Col>
        <Col xs={3}>
          <Select
            items={getYears()}
            name={'year'}
            value={year}
            placeholder={'Select year'}
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
            value={formatDate(this.props.date, this.props.withDay) || ''}
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
        minDate={creationDate} />
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