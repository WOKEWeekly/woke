import React, { Component} from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import Router from 'next/router';

import { SubmitButton, CancelButton, CheckboxButton, RadioButtonGroup } from '~/components/button.js';
import { Heading, Group, Label, TextInput, TextArea, ShortTextArea, Select } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import {categories} from '~/constants/categories.js';
import CLEARANCES from '~/constants/clearances.js';


import css from '~/styles/topics.scss'

class TopicForm extends Component {
  constructor(props){
    super(props);

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_TOPICS){
      return Router.push('/topics');
    }
  }

  render(){
    const { heading, confirmText, confirmFunc, cancelFunc, handleText, handleRadio, handleCheckbox} = this.props;
    const { headline, category, question, type, polarity, option1, option2, description } = this.props.topic;

    const radioItems = [
      { label: 'Debate', value: 'Debate' },
      { label: 'Discussion', value: 'Discussion' }
    ];

    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>{heading}</Heading>

            <Group>
              <Col md={7}>
                <Label>Headline:</Label>
                <TextInput
                  name={'headline'}
                  value={headline}
                  onChange={handleText}
                  placeholder={"Enter the headline."} />
              </Col>
              <Col md={5}>
                <Label>Category:</Label>
                <Select
                  name={'category'}
                  value={category}
                  placeholder={'Select a category.'}
                  items={categories}
                  onChange={handleText} />
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Question:</Label>
                <ShortTextArea
                  name={'question'}
                  value={question}
                  onChange={handleText}
                  placeholder={"Enter the question."} />
              </Col>
            </Group>
            <Group>
              <Col md={5}>
                <Label>Type:</Label>
                <RadioButtonGroup
                  name={'type'}
                  defaultValue={type}
                  onChange={handleRadio}
                  items={radioItems} />
              </Col>
              <Col md={7}>
                <Label>Polarity:</Label>
                <CheckboxButton
                  name={'polarity'}
                  onChange={handleCheckbox}
                  label={'This is a polar question.'} />
              </Col>
            </Group>
            <Group className={css.options} style={{ display: polarity ? 'flex' : 'none' }}>
              <Col md={6}>
                <Label>Option 1:</Label>
                <TextInput
                  name={'option1'}
                  value={option1}
                  onChange={handleText}
                  placeholder={"Enter the first option."} />
              </Col>
              <Col md={6}>
                <Label>Option 2:</Label>
                <TextInput
                  name={'option2'}
                  value={option2}
                  onChange={handleText}
                  placeholder={"Enter the second option."} />
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Description:</Label>
                <TextArea
                  name={'description'}
                  value={description}
                  onChange={handleText}
                  placeholder={"Provide background or context to this question. (Optional)"} />
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

export default connect(mapStateToProps)(TopicForm);