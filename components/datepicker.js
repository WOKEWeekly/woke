import React, { Component} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { formatDate } from '~/constants/date.js';
import { TextInput } from '~/components/form.js';
import { creationDate } from '~/constants/settings.js';
import css from '~/styles/_components.scss';
import { Icon } from './icon';

class DateInput extends Component {
  render(){
    return (
      <button
        onClick={this.props.onClick}
        className={css.datepicker}>
        <Icon
          prefix={'far'}
          name={'calendar-alt'}
          style={{margin: '0 .2em 0 .4em'}} />
        <TextInput
          value={formatDate(this.props.value, this.props.withDay)}
          placeholder={'Select a date.'}
          style={{textAlign: 'left'}}
          className={css.dateinput}
          readOnly />
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
        customInput={<DateInput withDay />}
        placeholderText={'Select a date.'}
        minDate={creationDate}
        peekNextMonth={false}
        fixedHeight
        locale={'en'} />
    );
  }
}

export class BirthdayPicker extends Component {
  render(){
    return (
      <DatePicker
        selected={this.props.date}
        onChange={this.props.onChange}
        customInput={<DateInput />}
        placeholderText={'Select the date of birth.'}
        maxDate={new Date()}
        peekNextMonth={false}
        showMonthDropdown
        showYearDropdown
        dropdownMode={'select'}
        locale={'en'} />
    );
  }
}