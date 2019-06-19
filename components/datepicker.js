import React, { Component} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { TextInput } from '~/components/form.js';
import { creationDate } from '~/constants/settings.js';
import css from '~/styles/_components.scss';

class DateInput extends Component {
  render(){
    return (
      <button
        onClick={this.props.onClick}
        className={css.datepicker}>
        <TextInput
          value={this.props.value}
          placeholder={'Select a date.'}
          style={{textAlign: 'left'}} />
      </button>
    );
  }
}

export class EventDatePicker extends Component {
  render(){
    return (
      <DatePicker
        selected={this.props.date}
        onChange={this.props.onChange}
        customInput={<DateInput />}
        dateFormat={'EEEE d MMMM yyyy'}
        placeholderText={'Select a date.'}
        minDate={creationDate}
        peekNextMonth={false}
        fixedHeight
        locale="en" />
    );
  }
}

export class BirthdayPicker extends Component {
  render(){
    return (
      <DatePicker
        locale="en"
        dateFormat="d MMMM yyyy"
        placeholderText="Click to select a date"
        maxDate={new Date()}
        selected={new Date()}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        onChange={this.handleChange} />
    );
  }
}