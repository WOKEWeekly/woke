import React, { Component} from 'react';
import {Col} from 'react-bootstrap';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { Group, Select, TextInput } from '~/components/form.js';
import { Modal } from '~/components/modal.js';
import { creationDate } from '~/constants/settings.js';
import css from '~/styles/_components.scss';
import { Icon } from './icon';
import moment from 'moment';

import { zDate, zHandlers } from 'zavid-modules';

export class DatePicker extends Component {
  constructor(props){
    super(props);

    const { dateOfMonth, month, year } = extractDates(this.props.date);

    this.state = {
      dateOfMonth,
      month,
      year,
      visible: false
    }
  }

  /** Account for changes to input */
  static getDerivedStateFromProps({date}, state) {
    if (date && state.visible) return state;
    return extractDates(date);
  }

  /** Update component dates on selection */
  confirm = () => {
    let { dateOfMonth, month, year } = this.state;
    month = parseInt(moment().month(month).format("M")) - 1;
    dateOfMonth = parseInt(dateOfMonth.replace(/([0-9]+)(.*)/g, '$1'));
    
    const date = new Date(year, month, dateOfMonth);
    this.props.onConfirm(date, this.props.name);
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

    const { handleText } = zHandlers(this);

    const body = (
      <Group className={css.dateModal}>
        <Col xs={3}>
          <Select
            name={'dateOfMonth'}
            items={getDates()}
            value={dateOfMonth}
            placeholder={'DD'}
            onChange={handleText} />
        </Col>
        <Col xs={6}>
          <Select
            items={moment.months()}
            name={'month'}
            value={month}
            placeholder={'MMMM'}
            onChange={handleText} />
        </Col>
        <Col xs={3}>
          <Select
            items={getYears()}
            name={'year'}
            value={year}
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

const extractDates = (date) => {
  const dateOfMonth = date ? moment().date(moment(date).date()).format("Do") : null;
  const month = date ? moment(date).format('MMMM') : null;
  const year = date ? moment(date).year() : null;

  return { dateOfMonth, month, year };
}