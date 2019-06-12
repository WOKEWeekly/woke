import React, { Component} from 'react';
import { Col, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { Heading, Group, Label, Input, TextArea, Select, Checkbox } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import {categories} from '~/constants/categories.js';

import Meta from '~/partials/meta.js';
import css from '~/styles/topics.scss'

export default class TopicForm extends Component {
  render(){
    const { heading, confirmText, confirmFunc, cancelFunc, metaTitle, metaUrl, handleText, handleRadio , handleCheckbox} = this.props;
    const { headline, category, question, type, polarity, option1, option2, description } = this.props.topic;

    const listCategories = () => {
      const items = [];
      categories.forEach(category => {
        items.push(category.label);
      });
      return items;
    }

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
                <Label>Headline:</Label>
                <Input
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
                  items={listCategories()}
                  onChange={handleText} />
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Question:</Label>
                <Input
                  name={'question'}
                  value={question}
                  onChange={handleText}
                  placeholder={"Enter the question."} />
              </Col>
            </Group>
            <Group>
              <Col md={5}>
                <Label>Type:</Label>
                <ToggleButtonGroup
                  name={'type'}
                  type={'radio'}
                  className={css.type}
                  defaultValue={type}
                  onChange={handleRadio}>
                  <ToggleButton variant="dark" value={'Debate'}>Debate</ToggleButton>
                  <ToggleButton variant="dark" value={'Discussion'}>Discussion</ToggleButton>
                </ToggleButtonGroup>
              </Col>
              <Col md={7}>
                <Label>Polarity:</Label>
                <CheckboxButton
                  name={'polarity'}
                  onChange={handleCheckbox} />
              </Col>
            </Group>
            <Group className={css.options} style={{ display: polarity ? 'flex' : 'none' }}>
              <Col md={6}>
                <Label>Option 1:</Label>
                <Input
                  name={'option1'}
                  value={option1}
                  onChange={handleText}
                  placeholder={"Enter the first option."} />
              </Col>
              <Col md={6}>
                <Label>Option 2:</Label>
                <Input
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

class CheckboxButton extends Component {
  render(){
    return (
      <ToggleButtonGroup
        type={'checkbox'}
        className={css.polarity}
        {...this.props}>
        <ToggleButton variant="dark" value={true}>This is a polar question.</ToggleButton>
      </ToggleButtonGroup>
    )
  }
}