import React, { useState } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import {
  SubmitButton,
  CancelButton,
  CheckboxButton,
  AddEntityButton,
  RadioButtonGroup
} from 'components/button.js';
import { BirthdayPicker } from 'components/datepicker.js';
import {
  Heading,
  Group,
  Label,
  LabelInfo,
  Select,
  TextInput,
  ClickInput,
  LongTextArea,
  FileSelector
} from 'components/form';
import { SocialsList } from 'components/icon.js';
import { Shader, Spacer } from 'components/layout.js';
import { EthnicModal, SocialsModal } from 'components/modal.js';
import CLEARANCES from 'constants/clearances.js';
import { countriesToString } from 'constants/countries.js';
import css from 'styles/pages/Members.module.scss';

const MemberForm = ({
  backPath,
  user,
  heading,
  confirmText,
  confirmFunc,
  cancelFunc,
  countries,
  handlers,
  operation,
  member,
  ethnicities,
  setEthnicities,
  setImageChanged
}) => {
  const [isEthnicModalVisible, setEthnicModalVisibility] = useState(false);
  const [isSocialsModalVisible, setSocialsModalVisibility] = useState(false);

  if (user.clearance < CLEARANCES.ACTIONS.MEMBERS.MODIFY) {
    return (location.href = backPath);
  }

  const {
    handleText,
    handleDate,
    handleFile,
    handleRadio,
    handleCheckboxButton,
    confirmSocials
  } = handlers;

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
                value={member.firstname}
                onChange={handleText}
                placeholder={'Enter first name.'}
              />
            </Col>
            <Col md={6}>
              <Label>Last Name:</Label>
              <TextInput
                name={'lastname'}
                value={member.lastname}
                onChange={handleText}
                placeholder={'Enter last name.'}
              />
            </Col>
          </Group>
          <Group>
            <Col md={3}>
              <Label>Sex:</Label>
              <RadioButtonGroup
                name={'sex'}
                value={member.sex}
                onChange={handleRadio}
                items={[
                  { label: 'Male', value: 'M' },
                  { label: 'Female', value: 'F' }
                ]}
              />
            </Col>
            <Col md={9}>
              <Label>Ethnic Origin:</Label>
              <ClickInput
                onClick={() => setEthnicModalVisibility(true)}
                value={countriesToString(ethnicities, countries)}
                placeholder={'Click to select countries of origin...'}
              />
            </Col>
          </Group>
          <Group>
            <Col md={7}>
              <Label>Birthday:</Label>
              <BirthdayPicker
                name={'birthday'}
                date={member.birthday}
                onConfirm={handleDate}
              />
            </Col>
            <Col md={5}>
              <Label>Level:</Label>
              <Select
                name={'level'}
                value={member.level}
                placeholder={'Select a level.'}
                items={CLEARANCES.LEVELS.MEMBERS}
                onChange={handleText}
              />
            </Col>
          </Group>
          <Group>
            <Col md={8}>
              <Label>Role:</Label>
              <TextInput
                name={'role'}
                value={member.role}
                onChange={handleText}
                placeholder={"Enter member's role."}
              />
            </Col>
            <Col md={4}>
              <Label>Slack ID:</Label>
              <TextInput
                name={'slackId'}
                value={member.slackId}
                onChange={handleText}
                placeholder={'e.g. UDL5UM6KG'}
              />
            </Col>
          </Group>
          <Group>
            <Col md={6}>
              <Label>Socials:</Label>
              <AddEntityButton
                title={'Add Socials'}
                onClick={() => setSocialsModalVisibility(true)}
              />
              <SocialsList socials={member.socials} />
            </Col>
            <Col md={3}>
              <Label>Author:</Label>
              <CheckboxButton
                name={'isAuthor'}
                checked={member.isAuthor}
                onChange={handleCheckboxButton}
                label={'This member is an author.'}
              />
            </Col>
            <Col md={3}>
              <Label>Status:</Label>
              <CheckboxButton
                name={'verified'}
                checked={member.verified}
                onChange={handleCheckboxButton}
                label={'This is a verified member.'}
              />
            </Col>
          </Group>
          <Group>
            <Col>
              <LabelInfo>Description:</LabelInfo>
              <LongTextArea
                name={'description'}
                value={member.description}
                onChange={handleText}
                placeholder={"Write out the member's full biography..."}
              />
            </Col>
          </Group>
          <Group>
            <Col>
              <FileSelector
                image={member.image}
                operation={operation}
                onChange={(img) => {
                  handleFile(img);
                  setImageChanged(true);
                }}
              />
            </Col>
          </Group>
        </div>

        <div>
          <Group>
            <Col>
              <SubmitButton onClick={confirmFunc} className={'mr-2'}>
                {confirmText}
              </SubmitButton>
              <CancelButton onClick={cancelFunc}>Cancel</CancelButton>
            </Col>
          </Group>
        </div>
      </Spacer>

      <EthnicModal
        close={() => setEthnicModalVisibility(false)}
        confirm={setEthnicities}
        ethnicities={ethnicities}
        visible={isEthnicModalVisible}
      />

      <SocialsModal
        close={() => setSocialsModalVisibility(false)}
        confirm={confirmSocials}
        socials={member.socials}
        visible={isSocialsModalVisible}
      />
    </Shader>
  );
};

const mapStateToProps = ({ countries, user }) => ({
  countries,
  user
});

export default connect(mapStateToProps)(MemberForm);
