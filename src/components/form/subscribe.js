import classNames from 'classnames';
import React, { useState } from 'react';
import { Col } from 'react-bootstrap';

import { alert } from '@components/alert';
import { SubmitButton } from '@components/button';

import request from '@constants/request';
import { isValidEmail } from '@constants/validations';

import css from '@styles/components/Form.module.scss';

import { Group, Label, TextInput } from './index';

export const SubscribeField = () => {
  const [email, setEmail] = useState('');

  const subscribe = () => {
    if (!isValidEmail(email)) return;

    const subscriptions = JSON.stringify({
      articles: true
    });

    request({
      url: '/api/v1/subscribers',
      method: 'POST',
      body: JSON.stringify({ email, subscriptions }),
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: () => {
        alert.success(
          `We've successfully subscribed ${email} to our mailing list!`
        );
      }
    });
  };

  return (
    <Group>
      <Col>
        <Label>Subscribe to never miss an article!</Label>
        <TextInput
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={'Enter your email'}
          className={css['subscribe-input']}
        />
        <SubmitButton onClick={subscribe}>Subscribe</SubmitButton>
      </Col>
    </Group>
  );
};
