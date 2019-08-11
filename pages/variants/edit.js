import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';
import Router from 'next/router';

import { setAlert } from '~/components/alert.js';
import { SubmitButton, CancelButton } from '~/components/button.js';
import { Heading, Group, Label, TextArea } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import CLEARANCES from '~/constants/clearances.js';
import request from '~/constants/request.js';

import css from '~/styles/info.scss';

class EditVariantPage extends Component {
  /** Retrieve informaiton from server */
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      text: props.pageText
    }

    if (props.user.clearance < CLEARANCES.ACTIONS.EDIT_VARIANTS){
      const path = location.pathname;
      return location.href = path.substring(0, path.indexOf('/', 1));
    }
  }

  componentDidMount(){
    this.setState({isLoaded: true})
  }

  /** Update variant page */
  updateInfo = () => {
    const { user, title, resource } = this.props;
    const { text } = this.state;

    request({
      url: '/updateVariantPage',
      method: 'PUT',
      body: JSON.stringify({text, resource}),
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Clearance': CLEARANCES.ACTIONS.EDIT_INFO,
        'Content-Type': 'application/json'
      },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully updated the '${title.substring(5)}'.` });
        const path = location.pathname;
        location.href = path.substring(0, path.indexOf('/', 1));
      }
    });
  }

  /** Handle text changes */
  handleText = (event) => {
    const { name, value } = event.target;
    this.setState({[name]: value}); }

  render(){
    const { isLoaded, text } = this.state;
    const { title, placeholder } = this.props;

    if (!isLoaded) return null;

    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>{title}</Heading>

            <Group>
              <Col>
                <Label>Description:</Label>
                <TextArea
                  name={'text'}
                  value={text}
                  onChange={this.handleText}
                  placeholder={placeholder} />
              </Col>
            </Group>
          </div>

          <div>
            <Group>
              <Col>
                <SubmitButton onClick={this.updateInfo} className={'mr-2'}>Update</SubmitButton>
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

export default connect(mapStateToProps)(EditVariantPage);