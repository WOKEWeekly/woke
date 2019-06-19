import React, { Component} from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import Router from 'next/router';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { EventDatePicker } from '~/components/datepicker.js';
import { Heading, Group, Label, TextInput, TextArea, FileSelector } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import CLEARANCES from '~/constants/clearances.js';
import { getFilename } from '~/constants/file.js';

import Meta from '~/partials/meta.js';
import css from '~/styles/sessions.scss'

class SessionForm extends Component {
  constructor(props){
    super(props);

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_SESSIONS){
      Router.push('/sessions');
    }
  }

  render(){
    const { heading, confirmText, confirmFunc, cancelFunc, metaTitle, metaUrl,
      handleTitle, handleDate, handleDescription, handleImage } = this.props;
    const {title, date, description, image} = this.props.session;

    const filename = getFilename(image);

    return (
      <Shader>
        <Meta
					title={`${metaTitle} | #WOKEWeekly`}
          url={`/sessions${metaUrl}`} />

        <Spacer className={css.form}>
          <div>
            <Heading>{heading}</Heading>

            <Group>
              <Col md={7}>
                <Label>Title:</Label>
                <TextInput
                  value={title}
                  onChange={handleTitle}
                  placeholder={"Enter the title."} />
              </Col>
              <Col md={5}>
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
                <FileSelector
                  value={filename}
                  onChange={handleImage} />
              </Col>
            </Group>
          </div>

          <div>
            <Group>
              <Col>
                <SubmitButton onClick={confirmFunc} className={'mr-2'}>{confirmText}</SubmitButton>
                <CancelButton onClick={cancelFunc}>Cancel</CancelButton>
              </Col>
            </Group>
          </div>
        </Spacer>
      </Shader>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(SessionForm);