import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';
import Router from 'next/router';

import { alert, setAlert, displayErrorMessage } from '~/components/alert.js';
import { SubmitButton, CancelButton } from '~/components/button.js';
import { Heading, Group, Label, TextArea } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import CLEARANCES from '~/constants/clearances.js';

import css from '~/styles/about.scss';

class EditAbout extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      text: ''
    }

    if (props.user.clearance < CLEARANCES.ACTIONS.EDIT_ABOUT){
      Router.push('/about');
    }
  }

  componentDidMount(){
    this.getDescription();
  }

  /** Update about description */
  updateAbout = () => {
    const about = {
      text: this.state.text
    }

    fetch('/updateAbout', {
      method: 'PUT',
      body: JSON.stringify(about),
      headers: {
        'Authorization': `Bearer ${this.props.user.token}`,
        'Clearance': CLEARANCES.ACTIONS.EDIT_ABOUT,
        'Content-Type': 'application/json'
      }
    })
    .then(res => Promise.all([res, res.json()]))
    .then(([status, response]) => { 
      if (status.ok){
        setAlert({ type: 'success', message: `You've successfully updated the "About" description.` });
        location.href = '/about';
      } else {
        alert.error(response.message)
      }
    }).catch(error => {
      displayErrorMessage(error);
    });
  }

  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }

  /** Retrieve text from about.txt */
  getDescription = () => {
    fetch('/static/resources/about.txt')
    .then(res => res.text())
    .then(text => this.setState({ text, isLoaded: true}));
  }

  render(){
    const { isLoaded, text } = this.state;

    if (!isLoaded) return null;

    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>Edit About</Heading>

            <Group>
              <Col>
                <Label>Description:</Label>
                <TextArea
                  name={'text'}
                  value={text}
                  onChange={this.handleText}
                  placeholder={"Write about #WOKEWeekly..."} />
              </Col>
            </Group>
          </div>

          <div>
            <Group>
              <Col>
                <SubmitButton onClick={this.updateAbout} className={'mr-2'}>Update</SubmitButton>
                <CancelButton onClick={Router.back}>Cancel</CancelButton>
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

export default connect(mapStateToProps)(EditAbout);