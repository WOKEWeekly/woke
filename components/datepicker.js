import React, { Component} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Input } from '~/components/form.js';
import { creationDate } from '~/constants/settings.js';

class DateInput extends Component {
  render(){
    return (
      <Input
        type={'button'}
        onClick={this.props.onClick}
        defaultValue={this.props.value}
        style={{textAlign: 'left'}} />
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
        dateFormat={'d MMMM yyyy'}
        placeholderText={'Select a date.'}
        minDate={creationDate}
        fixedHeight
        locale="en" />
    );
  }
}

export class BirthdayPicker extends Component {
  constructor() {
    super();
    this.state = {
      startDate: new Date()
    };
  }
 
  handleChange = (date) => {
    this.setState({
      startDate: date
    });
  }

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