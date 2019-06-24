import React, { Component} from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import Router from 'next/router';

import { SubmitButton, CancelButton, AddButton } from '~/components/button.js';
import { BirthdayPicker } from '~/components/datepicker.js';
import { Heading, Group, Label, TextInput, NumberPicker, TextArea, FileSelector } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';
import { EthnicModal } from '~/components/modal.js';

import CLEARANCES from '~/constants/clearances.js';

import { getFilename } from '~/constants/file.js';

import Meta from '~/partials/meta.js';
import css from '~/styles/blackex.scss';

class CandidateForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      ethnicModalVisible: false,
      socialsModalVisible: false
    }

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_SESSIONS){
      Router.push('/blackexcellence');
    }
  }

  showEthnicModal = () => { this.setState({ ethnicModalVisible: true})}
  hideEthnicModal = () => { this.setState({ ethnicModalVisible: false})}

  render(){
    const { heading, confirmText, confirmFunc, cancelFunc, metaTitle, metaUrl,
      handleText, handleDate, handleImage } = this.props;
    const { id, name, description, occupation, birthday, image } = this.props.candidate;
    const { ethnicModalVisible } = this.state;

    const filename = getFilename(image);

    return (
      <Shader>
        <Meta
					title={`${metaTitle} | #WOKEWeekly`}
          url={`/blackexcellence${metaUrl}`} />

        <Spacer className={css.form}>
          <div>
            <Heading>{heading}</Heading>

            <Group>
              <Col md={6}>
                <Label>Name:</Label>
                <TextInput
                  name={'name'}
                  value={name}
                  onChange={handleText}
                  placeholder={"Enter the candidate's name."} />
              </Col>
              <Col md={2}>
                <Label>Number:</Label>
                <NumberPicker
                  name={'id'}
                  value={id}
                  onChange={handleText}
                  placeholder={"Enter the candidate's ID number."} />
              </Col>
              <Col md={4}>
                <Label>Birthday:</Label>
                <BirthdayPicker
                  name={'birthday'}
                  date={birthday}
                  onChange={handleDate} />
              </Col>
            </Group>
            <Group>
              <Col md={6}>
                <Label>Occupation:</Label>
                <TextInput
                  name={'occupation'}
                  value={occupation}
                  onChange={handleText}
                  placeholder={"Enter the candidate's occupation."} />
              </Col>
              <Col md={3}>
                <Label>Ethnic Origin:</Label>
                <AddButton
                  onClick={this.showEthnicModal}
                  title={'Add Countries'} />
              </Col>
              <Col md={3}>
                <Label>Socials:</Label>
                <AddButton title={'Add Socials'} />
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Description:</Label>
                <TextArea
                  name={'description'}
                  value={description}
                  onChange={handleText}
                  placeholder={"Write out candidate tribute..."} />
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

        <EthnicModal
          visible={ethnicModalVisible}
          entity={this.props.candidate}
          handleSelect={handleText}
          confirm={this.hideEthnicModal}
          close={this.hideEthnicModal} />
      </Shader>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(CandidateForm);