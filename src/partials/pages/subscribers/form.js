import React, { useState } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import {
  SubmitButton,
  CancelButton,
  CheckboxButton
} from 'components/button.js';
import { DatePicker } from 'components/datepicker.js';
import { Heading, Group, Label, TextInput } from 'components/form';
import { Shader, Spacer } from 'components/layout.js';
import CLEARANCES from 'constants/clearances.js';
import css from 'styles/pages/Members.module.scss';

const SubscriberForm = ({
  backPath,
  user,
  heading,
  confirmText,
  confirmFunc,
  cancelFunc,
  handlers,
  subscriber
}) => {
  if (user.clearance < CLEARANCES.ACTIONS.MEMBERS.MODIFY) {
    return (location.href = backPath);
  }

  const { handleText, handleDate, handleCheckboxButton } = handlers;

  return (
    <Shader>
      <Spacer className={css.form}>
        <div>
          <Heading>{heading}</Heading>

          <Group>
            <Col md={4}>
              <Label>First Name:</Label>
              <TextInput
                name={'firstname'}
                value={subscriber.firstname}
                onChange={handleText}
                placeholder={'Enter first name.'}
              />
            </Col>
            <Col md={4}>
              <Label>Last Name:</Label>
              <TextInput
                name={'lastname'}
                value={subscriber.lastname}
                onChange={handleText}
                placeholder={'Enter last name.'}
              />
            </Col>
            <Col md={4}>
              <Label>Email:</Label>
              <TextInput
                name={'email'}
                value={subscriber.email}
                onChange={handleText}
                placeholder={'Enter your email.'}
              />
            </Col>
            <Col md={6}>
              <Label>Create Time:</Label>
              <DatePicker
                name={'createtime'}
                date={subscriber.createtime}
                onConfirm={handleDate}
              />
            </Col>
          </Group>
          <Group>
            <Col lg={6} xl={4}>
              <Label>Subscription Status:</Label>
              <CheckboxButton
                name={'subscription'}
                checked={subscriber.subscription}
                onChange={handleCheckboxButton}
                label={'This is a subscriber.'}
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
};

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(SubscriberForm);
