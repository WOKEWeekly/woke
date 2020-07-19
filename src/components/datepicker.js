/* eslint-disable jsdoc/require-returns */
import React, { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import { zDate } from 'zavid-modules';

import { alert } from 'components/alert.js';
import { SubmitButton, CancelButton } from 'components/button.js';
import { Group, Select, TextInput } from 'components/form';
import { Icon } from 'components/icon';
import { Modal, ConfirmModal } from 'components/modal.js';
import { creationDate } from 'constants/settings.js';
import css from 'styles/components/Form.module.scss';

export const DatePicker = (props) => {
  const { date, name, onConfirm, placeholderText, withDayOfWeek } = props;

  const [selectedDay, setDay] = useState(1);
  const [selectedMonth, setMonth] = useState(1);
  const [selectedYear, setYear] = useState(2000);

  const [datePickerVisible, setDatePickerVisibility] = useState(false);
  const [clearDateModalVisible, setClearDateModalVisibility] = useState(false);

  useEffect(() => {
    const {
      day: initialDay,
      month: initialMonth,
      year: initialYear
    } = extractDates(date);
    setDay(initialDay);
    setMonth(initialMonth);
    setYear(initialYear);

  }, [datePickerVisible]);

  /** Clear the date */
  const clearDate = () => {
    onConfirm(null, name);
    setClearDateModalVisibility(false);
  };

  return (
    <>
      <div className={css['datepicker-field']}>
        <button
          onClick={() => setDatePickerVisibility(true)}
          className={css['datepicker']}>
          <Icon
            prefix={'far'}
            name={'calendar-alt'}
            className={css['calendar-icon']}
          />
          <TextInput
            value={date ? zDate.formatDate(date, withDayOfWeek) : null}
            placeholder={placeholderText}
            style={{ textAlign: 'left' }}
            className={css['datepicker-text-input']}
            readOnly
          />
        </button>
        <ClearDateButton
          date={date}
          setClearDateModalVisibility={setClearDateModalVisibility}
        />
      </div>

      <Modal
        show={datePickerVisible}
        body={
          <DatePickerBody
            {...props}
            selectedDay={selectedDay}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setDay={setDay}
            setMonth={setMonth}
            setYear={setYear}
          />
        }
        footer={
          <DatePickerFooter
            {...props}
            day={selectedDay}
            month={selectedMonth}
            year={selectedYear}
            setDatePickerVisibility={setDatePickerVisibility}
          />
        }
        onlyBody={true}
      />

      <ConfirmModal
        visible={clearDateModalVisible}
        message={`Clear this date?`}
        confirmFunc={clearDate}
        confirmText={'Clear'}
        close={() => setClearDateModalVisibility(false)}
      />
    </>
  );
};

const DatePickerBody = ({
  minDate,
  maxDate,
  selectedDay,
  selectedMonth,
  selectedYear,
  setDay,
  setMonth,
  setYear
}) => {
  const startYear = minDate && minDate.getFullYear();
  const endYear = maxDate && maxDate.getFullYear();

  return (
    <Group className={css['datepicker-modal']}>
      <Col xs={3}>
        <Select
          name={'day'}
          value={selectedDay}
          items={zDate.getDatesForMonth(selectedMonth)}
          placeholder={'DD'}
          onChange={(event) => setDay(event.target.value)}
        />
      </Col>
      <Col xs={6}>
        <Select
          name={'month'}
          value={selectedMonth}
          items={zDate.getAllMonths()}
          placeholder={'MMMM'}
          onChange={(event) => setMonth(event.target.value)}
        />
      </Col>
      <Col xs={3}>
        <Select
          name={'year'}
          value={selectedYear}
          items={zDate.getYearsInRange(startYear, endYear)}
          placeholder={'YYYY'}
          onChange={(event) => setYear(event.target.value)}
        />
      </Col>
    </Group>
  );
};

const DatePickerFooter = ({
  name,
  day,
  month,
  year,
  onConfirm,
  setDatePickerVisibility,
}) => {
  /** Update component dates on confirmation */
  const confirmDateSelection = () => {
    if (!day) return alert.error('Please set the day of the month.');
    if (!month) return alert.error('Please set the month of the year.');
    if (!year) return alert.error('Please set the year.');

    month = zDate.MONTHS[month.toUpperCase()].NUMBER - 1;
    day = parseInt(day.replace(/([0-9]+)(.*)/g, '$1'));

    const date = new Date(year, month, day);
    onConfirm(date, name);
    setDatePickerVisibility(false);
  };

  return (
    <>
      <SubmitButton onClick={confirmDateSelection}>Confirm</SubmitButton>
      <CancelButton onClick={() => setDatePickerVisibility(false)}>
        Close
      </CancelButton>
    </>
  );
};

const ClearDateButton = ({ date, setClearDateModalVisibility }) => {
  if (date === null) return null;
  return (
    <button
      onClick={() => setClearDateModalVisibility(true)}
      className={css['invisible_button']}>
      <Icon name={'times'} />
    </button>
  );
};

export const EventDatePicker = ({ name, date, onConfirm }) => {
  return (
    <DatePicker
      name={name}
      date={date}
      onConfirm={onConfirm}
      placeholderText={'Select a date.'}
      minDate={creationDate}
      withDayOfWeek
    />
  );
};

export const BirthdayPicker = ({ name, date, onConfirm }) => {
  return (
    <DatePicker
      name={name}
      date={date}
      onConfirm={onConfirm}
      placeholderText={'Select date of birth.'}
      maxDate={new Date()}
    />
  );
};

export const AuthoredDatePicker = ({ name, date, onConfirm }) => {
  return (
    <DatePicker
      name={name}
      date={date}
      onConfirm={onConfirm}
      placeholderText={'Select the date written.'}
      minDate={creationDate}
      maxDate={new Date()}
      withDayOfWeek
    />
  );
};

/**
 * Extract the day, month and year from a specified date.
 * @param {Date} date - The specified date.
 * @returns {object[]} The day, month and year.
 */
const extractDates = (date) => {
  let day, month, year;

  if (date !== null) {
    date = new Date(date);
    const dayNum = date.getDate();
    const monthNum = date.getMonth() + 1;

    day = zDate.getDateAndSuffix(dayNum);
    month = zDate.getMonthByNumber(monthNum);
    year = date.getFullYear();
  }

  return { day, month, year };
};
