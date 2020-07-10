import React, { useState } from 'react';
import { Col } from 'react-bootstrap';

import { setAlert } from 'components/alert.js';
import { DeleteButton } from 'components/button.js';
import { Heading, Group, Label, TextInput } from 'components/form';
import { Shader, Spacer } from 'components/layout.js';
import request from 'constants/request.js';
import { isValidEmail } from 'constants/validations';
import css from 'styles/Auth.module.scss';

const Unsubscribe = () => {
  const [email, setEmail] = useState('');

  const unsubscribe = () => {
    if (!isValidEmail(email)) return;

    request({
      url: `/api/v1/subscribers/email`,
      method: 'DELETE',
      body: JSON.stringify({ email }),
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: () => {
        setAlert({
          type: 'info',
          message: `We've unsubscribed you from our mailing list.`
        });
        location.href = '/';
      }
    });
  };

  return (
    <Shader>
      <Spacer className={css.form}>
        <div>
          <Heading>Unsubscribe</Heading>

          <Group>
            <Col md={12}>
              <Label>Email Address:</Label>
              <TextInput
                name={'email'}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={'Confirm your email address.'}
              />
            </Col>
          </Group>
        </div>

        <div>
          <Group>
            <Col>
              <DeleteButton onClick={unsubscribe} className={'mr-2'}>
                Unsubscribe
              </DeleteButton>
            </Col>
          </Group>
        </div>
      </Spacer>
    </Shader>
  );
};

export default Unsubscribe;
