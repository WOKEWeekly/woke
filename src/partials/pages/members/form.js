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
  LongTextArea
} from 'components/form';
import {
  FileSelector,
  ASPECT_RATIO,
  SELECTOR_LOOK
} from 'components/form/fileselector';
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
    removeFile,
    confirmSocials
  } = handlers;

  const isNotGuest = member.level !== 'Guest';

  return (
    <Shader>
      <Spacer className={css.form}>
        <div>
          <Heading>{heading}</Heading>

          <Group>
            <Col md={4}>
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
            <Col md={4}>
              <Label>First Name:</Label>
              <TextInput
                name={'firstname'}
                value={member.firstname}
                onChange={handleText}
                placeholder={'Enter first name.'}
              />
            </Col>
            <Col md={4}>
              <Label>Last Name:</Label>
              <TextInput
                name={'lastname'}
                value={member.lastname}
                onChange={handleText}
                placeholder={'Enter last name.'}
              />
            </Col>
            <Col md={4}>
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
          </Group>
          {isNotGuest ? (
            <>
              <Group>
                <Col md={6}>
                  <Label>Ethnic Origin:</Label>
                  <ClickInput
                    onClick={() => setEthnicModalVisibility(true)}
                    value={countriesToString(ethnicities, countries)}
                    placeholder={'Click to select countries of origin...'}
                  />
                </Col>
                <Col md={6}>
                  <Label>Birthday:</Label>
                  <BirthdayPicker
                    name={'birthday'}
                    date={member.birthday}
                    onConfirm={handleDate}
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
            </>
          ) : null}
          <Group>
            <Col md={12}>
              <Label>Socials:</Label>
              <AddEntityButton
                title={'Add Socials'}
                onClick={() => setSocialsModalVisibility(true)}
              />
              <SocialsList socials={member.socials} />
            </Col>
          </Group>
          <Group>
            <Col lg={6} xl={4}>
              <Label>Author:</Label>
              <CheckboxButton
                name={'isAuthor'}
                checked={member.isAuthor}
                onChange={handleCheckboxButton}
                label={'This member is an author.'}
              />
            </Col>
            <Col lg={6} xl={4}>
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
                className={css['member-file-selector']}
                image={member.image}
                operation={operation}
                onChange={(img) => {
                  handleFile(img);
                  setImageChanged(true);
                }}
                aspectRatio={ASPECT_RATIO.SQUARE}
                removeImage={removeFile}
                selectorLook={SELECTOR_LOOK.PLACEHOLDER}
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
