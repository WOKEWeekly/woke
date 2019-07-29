import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';
import Router from 'next/router';

import { alert, setAlert, displayErrorMessage } from './node_modules/~/components/alert.js.js';
import { SubmitButton, CancelButton } from './node_modules/~/components/button.js.js';
import { Heading, Group, Label, TextArea } from './node_modules/~/components/form.js.js';
import { Shader, Spacer } from './node_modules/~/components/layout.js.js';

import CLEARANCES from './node_modules/~/constants/clearances.js.js';

import css from './node_modules/~/styles/about.scss';

class EditAbout extends Component {
  /** Retrieve about description from server */
  static async getInitialProps({ query }) {
    return { text: query.description };
  }

  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      text: props.text
    }

    if (props.user.clearance < CLEARANCES.ACTIONS.EDIT_ABOUT){
      return Router.push('/about');
    }
  }

  componentDidMount(){
    this.setState({isLoaded: true})
  }

  /** Update about description */
  updateAbout = () => {
    const about = { text: this.state.text }

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

  render(){
    const { isLoaded, text } = this.state;
    console.log(text);

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