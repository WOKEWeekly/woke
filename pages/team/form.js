import React, { Component} from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import Router from 'next/router';

import { SubmitButton, CancelButton, AddButton } from '~/components/button.js';
import { BirthdayPicker } from '~/components/datepicker.js';
import { Heading, Group, Label, Select, TextInput, ClickInput, TextArea, FileSelector } from '~/components/form.js';
import { listSocials } from '~/components/icon.js';
import { Shader, Spacer } from '~/components/layout.js';
import { EthnicModal, SocialsModal } from '~/components/modal.js';

import { countriesToString } from '~/constants/countries.js';
import CLEARANCES from '~/constants/clearances.js';
import { getFilename } from '~/constants/file.js';

import Meta from '~/partials/meta.js';
import css from '~/styles/team.scss';

class MemberForm extends Component {
  constructor(props){
    super(props);
    this.state = {
      ethnicModalVisible: false,
      socialsModalVisible: false
    }

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_TEAM){
      Router.push('/executives');
    }
  }

  showEthnicModal = () => { this.setState({ ethnicModalVisible: true})}
  hideEthnicModal = () => { this.setState({ ethnicModalVisible: false})}
  showSocialsModal = () => { this.setState({ socialsModalVisible: true})}
  hideSocialsModal = () => { this.setState({ socialsModalVisible: false})}

  render(){
    const { heading, confirmText, confirmFunc, cancelFunc, metaTitle, metaUrl,
      handleText, handleDate, handleImage, clearSelection, confirmSocials } = this.props;

    const { firstname, lastname, level, role, description, birthday, image, socials,
      ethnicity1, ethnicity2, ethnicity3, ethnicity4 } = this.props.candidate;

    const { ethnicModalVisible, socialsModalVisible } = this.state;

    const filename = getFilename(image);
    const ethnicities = countriesToString([ethnicity1, ethnicity2, ethnicity3, ethnicity4]);

    return (
      <Shader>
        <Meta
					title={`${metaTitle} | #WOKEWeekly`}
          url={`/team${metaUrl}`} />

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
              <Col md={4}>
                <Label>Level:</Label>
                <Select
                  name={'level'}
                  value={level}
                  placeholder={'Select a level.'}
                  items={CLEARANCES.LEVELS.MEMBERS}
                  onChange={handleText} />
              </Col>
              <Col md={8}>
                <Label>Ethnic Origin:</Label>
                <ClickInput
                  onClick={this.showEthnicModal}
                  value={ethnicities}
                  placeholder={'Click to select countries of origin...'} />
              </Col>
            </Group>
            <Group>
              <Col md={7}>
                <Label>Role:</Label>
                <TextInput
                  name={'role'}
                  value={role}
                  onChange={handleText}
                  placeholder={"Enter member's role."} />
              </Col>
              <Col md={5}>
                <Label>Birthday:</Label>
                <BirthdayPicker
                  name={'birthday'}
                  date={birthday}
                  onChange={handleDate} />
              </Col>
            </Group>
            <Group>
              <Col md={12}>
                <Label>Socials:</Label>
                <AddButton
                  title={'Add Socials'}
                  onClick={this.showSocialsModal} />
                <div className={'mt-2'}>{listSocials(socials)}</div>
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Description:</Label>
                <TextArea
                  name={'description'}
                  value={description}
                  onChange={handleText}
                  placeholder={"Write out biography of member..."} />
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
  user: state.user
});

export default connect(mapStateToProps)(MemberForm);