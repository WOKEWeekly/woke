import React, { Component} from 'react';

import { EventDatePicker } from '~/components/datepicker.js';
import { Group, Label, Input, TextArea } from '~/components/form.js';
import { Shader } from '~/components/layout.js';

import css from '~/styles/sessions.scss'

export default class SessionForm extends Component {
  constructor() {
    super();
    this.state = {
      date: new Date()
    };
  }
 
  handleDate = (date) => { this.setState({date}); }

  render(){
    return (
      <Shader>
        <div className={css.form}>
          <Group>
            <Label>Title:</Label>
            <Input placeholder={"Enter the title."} />
          </Group>

          <Group>
            <Label>Date Held:</Label>
            <EventDatePicker
              date={this.state.date}
              onChange={this.handleDate} />
          </Group>

          <Group>
            <Label>Description:</Label>
            <TextArea placeholder={"Enter the description."} />
          </Group>
        </div>
      </Shader>
    );
  }
}