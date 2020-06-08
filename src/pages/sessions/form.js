import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SubmitButton, CancelButton } from '@components/button.js';
import { EventDatePicker } from '@components/datepicker.js';
import {
  Heading,
  Group,
  Label,
  LabelInfo,
  TextInput,
  LongTextArea,
  FileSelector
} from '@components/form.js';
import { Shader, Spacer } from '@components/layout.js';
import { TimePicker } from '@components/timepicker.js';

import CLEARANCES from '@constants/clearances.js';

import css from '@styles/pages/Sessions.module.scss';

class SessionForm extends Component {
  constructor(props) {
    super(props);

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_SESSIONS) {
      return (location.href = '/sessions');
    }
  }

  render() {
    const {
      heading,
      confirmText,
      confirmFunc,
      cancelFunc,
      handlers,
      operation
    } = this.props;
    const { handleText, handleDate, handleTime, handleFile } = handlers;
    const {
      title,
      dateHeld,
      timeHeld,
      description,
      image
    } = this.props.session;

    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>{heading}</Heading>

            <Group>
              <Col>
                <Label>Title:</Label>
                <TextInput
                  name={'title'}
                  value={title}
                  onChange={handleText}
                  placeholder={'Enter the title.'}
                />
              </Col>
            </Group>
            <Group>
            <Col md={6}>
                <Label>Date Held:</Label>
                <EventDatePicker
                  name={'dateHeld'}
                  date={dateHeld}
                  onConfirm={handleDate}
                />
              </Col>
              <Col md={3}>
                <Label>Time Held:</Label>
                <TimePicker
                  name={'timeHeld'}
                  time={timeHeld}
                  onConfirm={handleTime}
                />
              </Col>
            </Group>
            <Group>
              <Col>
                <LabelInfo>Description:</LabelInfo>
                <LongTextArea
                  name={'description'}
                  value={description}
                  onChange={handleText}
                  placeholder={'Enter the description.'}
                />
              </Col>
            </Group>
            <Group>
              <Col>
                <FileSelector
                  image={image}
                  operation={operation}
                  onChange={handleFile}
                />
              </Col>
            </Group>
          </div>

          <div>
            <Group>
              <Col>
                <SubmitButton onClick={confirmFunc} className={'mr-2'}>
                  {confirmText}
                </SubmitButton>
                <CancelButton onClick={cancelFunc}>Cancel</CancelButton>
              </Col>
            </Group>
          </div>
        </Spacer>
      </Shader>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(SessionForm);
