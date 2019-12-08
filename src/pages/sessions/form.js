import React, { Component} from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { EventDatePicker } from '~/components/datepicker.js';
import { Heading, Group, Label, TextInput, LongTextArea, FileSelector } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import CLEARANCES from '~/constants/clearances.js';
// import { getFilename } from '../../private/filer.js';

import css from '~/styles/sessions.scss';

class SessionForm extends Component {
  constructor(props){
    super(props);

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_SESSIONS){
      return location.href = '/sessions';
    }
  }

  render(){
    const { heading, confirmText, confirmFunc, cancelFunc, handlers } = this.props;
    const { handleText, handleDate, handleImage } = handlers;
    const { title, date, description, image } = this.props.session;

    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>{heading}</Heading>

            <Group>
              <Col md={7}>
                <Label>Title:</Label>
                <TextInput
                  name={'title'}
                  value={title}
                  onChange={handleText}
                  placeholder={"Enter the title."} />
              </Col>
              <Col md={5}>
                <Label>Date Held:</Label>
                <EventDatePicker date={date} onConfirm={handleDate} />
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Description:</Label>
                <LongTextArea
                  name={'description'}
                  value={description}
                  onChange={handleText}
                  placeholder={"Enter the description."} />
              </Col>
            </Group>
            <Group>
              <Col>
                <FileSelector
                  image={image}
                  directory={`sessions`}
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