import React, { Component} from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SubmitButton, CancelButton, CheckboxButton, AddEntityButton, RadioButtonGroup } from '~/components/button.js';
import { BirthdayPicker } from '~/components/datepicker.js';
import { Heading, Group, Label, Select, TextInput, ClickInput, LongTextArea, FileSelector } from '~/components/form.js';
import { SocialsList } from '~/components/icon.js';
import { Shader, Spacer } from '~/components/layout.js';
import { EthnicModal, SocialsModal } from '~/components/modal.js';

import { countriesToString } from '~/constants/countries.js';
import CLEARANCES from '~/constants/clearances.js';

import css from '~/styles/team.scss';

class MemberForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      ethnicModalVisible: false,
      socialsModalVisible: false
    }

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_TEAM){
      return location.href = props.backPath;
    }
  }

  showEthnicModal = () => { this.setState({ ethnicModalVisible: true})}
  hideEthnicModal = () => { this.setState({ ethnicModalVisible: false})}
  showSocialsModal = () => { this.setState({ socialsModalVisible: true})}
  hideSocialsModal = () => { this.setState({ socialsModalVisible: false})}

  render(){
    const { heading, confirmText, confirmFunc, cancelFunc, countries, handlers, operation } = this.props;
    const { handleText, handleBirthday, handleImage, handleRadio, handleCheckboxButton, clearSelection, confirmSocials } = handlers;

    const { firstname, lastname, level, sex, role, description, birthday, image, socials,
      ethnicity1, ethnicity2, ethnicity3, ethnicity4, verified, slackId } = this.props.member;

    const { ethnicModalVisible, socialsModalVisible } = this.state;

    const ethnicities = countriesToString([ethnicity1, ethnicity2, ethnicity3, ethnicity4], countries);

    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>{heading}</Heading>

            <Group>
              <Col md={6}>
                <Label>First Name:</Label>
                <TextInput
                  name={'firstname'}
                  value={firstname}
                  onChange={handleText}
                  placeholder={"Enter first name."} />
              </Col>
              <Col md={6}>
                <Label>Last Name:</Label>
                <TextInput
                  name={'lastname'}
                  value={lastname}
                  onChange={handleText}
                  placeholder={"Enter last name."} />
              </Col>
            </Group>
            <Group>
              <Col md={3}>
                <Label>Sex:</Label>
                <RadioButtonGroup
                  name={'sex'}
                  value={sex}
                  onChange={handleRadio}
                  items={[
                    { label: 'Male', value: 'M' },
                    { label: 'Female', value: 'F' }
                  ]} />
              </Col>
              <Col md={9}>
                <Label>Ethnic Origin:</Label>
                <ClickInput
                  onClick={this.showEthnicModal}
                  value={ethnicities}
                  placeholder={'Click to select countries of origin...'} />
              </Col>
            </Group>
            <Group>
              <Col md={7}>
                <Label>Birthday:</Label>
                <BirthdayPicker date={birthday} onConfirm={handleBirthday} />
              </Col>
              <Col md={5}>
                <Label>Level:</Label>
                <Select
                  name={'level'}
                  value={level}
                  placeholder={'Select a level.'}
                  items={CLEARANCES.LEVELS.MEMBERS}
                  onChange={handleText} />
              </Col>
            </Group>
            <Group>
              <Col md={8}>
                <Label>Role:</Label>
                <TextInput
                  name={'role'}
                  value={role}
                  onChange={handleText}
                  placeholder={"Enter member's role."} />
              </Col>
              <Col md={4}>
                <Label>Slack ID:</Label>
                <TextInput
                  name={'slackId'}
                  value={slackId}
                  onChange={handleText}
                  placeholder={"e.g. UDL5UM6KG"} />
              </Col>
            </Group>
            <Group>
              <Col md={7}>
                <Label>Socials:</Label>
                <AddEntityButton
                  title={'Add Socials'}
                  onClick={this.showSocialsModal} />
                <SocialsList socials={socials} />
              </Col>
              <Col md={5}>
                <Label>Status:</Label>
                <CheckboxButton
                  name={'verified'}
                  checked={verified}
                  onChange={handleCheckboxButton}
                  label={'This is a verified member.'} />
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Description:</Label>
                <LongTextArea
                  name={'description'}
                  value={description}
                  onChange={handleText}
                  placeholder={"Write out biography of member..."} />
              </Col>
            </Group>
            <Group>
              <Col>
                <FileSelector
                  image={image}
                  operation={operation}
                  directory={`team`}
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
          entity={this.props.member}
          handleSelect={handleText}
          clearSelection={clearSelection}
          close={this.hideEthnicModal} />

        <SocialsModal
          visible={socialsModalVisible}
          socials={socials}
          handleText={handleText}
          confirm={confirmSocials}
          close={this.hideSocialsModal} />
      </Shader>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
  countries: state.countries
});

export default connect(mapStateToProps)(MemberForm);