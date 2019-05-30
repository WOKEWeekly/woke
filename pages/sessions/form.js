import React, { Component} from 'react';
import {Col, Row} from 'react-bootstrap';

import { EventDatePicker } from '~/components/datepicker.js';
import { Heading, Group, Label, Input, TextArea } from '~/components/form.js';
import { Shader } from '~/components/layout.js';

import css from '~/styles/sessions.scss'

export default class SessionForm extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
      date: new Date(),
      description: ''
    };
  }
 
  handleTitle = (event) => { this.setState({title: event.target.value}); }
  handleDate = (date) => { this.setState({date}); }
  handleDescription = (event) => { this.setState({description: event.target.value}); }

  render(){
    const { title, date, description } = this.state;

    return (
      <Shader>
        <div className={css.form}>

          <Heading>Add New Session</Heading>

          <Group>
            <Col md={8}>
              <Label>Title:</Label>
              <Input
                value={title}
                onChange={this.handleTitle}
                placeholder={"Enter the title."} />
            </Col>

            <Col md={4}>
              <Label>Date Held:</Label>
              <EventDatePicker
                date={date}
                onChange={this.handleDate} />
            </Col>
          </Group>

          <Group>
            <Col>
              <Label>Description:</Label>
              <TextArea
                value={description}
                onChange={this.handleDescription}
                placeholder={"Enter the description."} />
            </Col>
          </Group>


        </div>
      </Shader>
    );
  }
}