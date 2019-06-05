import React, { Component} from 'react';
import { Col } from 'react-bootstrap';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { EventDatePicker } from '~/components/datepicker.js';
import { Heading, Group, Label, Input, TextArea, FileSelector } from '~/components/form.js';
import { Shader } from '~/components/layout.js';

import Meta from '~/partials/meta.js';
import css from '~/styles/sessions.scss'

export default class SessionForm extends Component {
  render(){
    const { heading, confirmText, confirmFunc, cancelFunc, metaTitle, metaUrl,
      title, date, description,
      handleTitle, handleDate, handleDescription, handleImage } = this.props;

    return (
      <Shader>
        <Meta
					title={`${metaTitle} | #WOKEWeekly`}
          url={`/sessions${metaUrl}`} />

        <div className={css.form}>
          <Heading>{heading}</Heading>

          <Group>
            <Col md={8}>
              <Label>Title:</Label>
              <Input
                value={title}
                onChange={handleTitle}
                placeholder={"Enter the title."} />
            </Col>
            <Col md={4}>
              <Label>Date Held:</Label>
              <EventDatePicker
                date={date}
                onChange={handleDate} />
            </Col>
          </Group>
          <Group>
            <Col>
              <Label>Description:</Label>
              <TextArea
                value={description}
                onChange={handleDescription}
                placeholder={"Enter the description."} />
            </Col>
          </Group>
          <Group>
            <Col>
              <FileSelector onChange={handleImage} />
            </Col>
          </Group>
          <Group>
            <Col>
              <SubmitButton onClick={confirmFunc} className={'mr-2'}>{confirmText}</SubmitButton>
              <CancelButton onClick={cancelFunc}>Cancel</CancelButton>
            </Col>
          </Group>
        </div>
      </Shader>
    );
  }
}