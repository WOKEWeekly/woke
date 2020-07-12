import React, { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import {
  SubmitButton,
  CancelButton,
  AddEntityButton
} from 'components/button.js';
import { AuthoredDatePicker, BirthdayPicker } from 'components/datepicker.js';
import {
  Heading,
  Group,
  Label,
  LabelInfo,
  TextInput,
  Select,
  ClickInput,
  NumberPicker,
  LongTextArea,
  FileSelector
} from 'components/form';
import { SocialsList } from 'components/icon.js';
import { Shader, Spacer } from 'components/layout.js';
import { EthnicModal, SocialsModal } from 'components/modal.js';
import CLEARANCES from 'constants/clearances.js';
import { countriesToString } from 'constants/countries.js';
import request from 'constants/request.js';
import css from 'styles/pages/Candidates.module.scss';

const CandidateForm = ({
  cancelFunc,
  candidate,
  confirmFunc,
  confirmText,
  countries,
  ethnicities,
  handlers,
  heading,
  operation,
  setEthnicities,
  setImageChanged,
  user
}) => {
  const [isEthnicModalVisible, setEthnicModalVisibility] = useState(false);
  const [isSocialsModalVisible, setSocialsModalVisibility] = useState(false);
  const [authors, setAuthors] = useState([]);

  if (user.clearance < CLEARANCES.ACTIONS.CRUD_BLACKEX) {
    return (location.href = '/blackexcellence');
  }

  useEffect(() => {
    request({
      url: '/api/v1/members/authors',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (response) => {
        const authors = response
          .map((author) => {
            return {
              value: author.id,
              label: `${author.firstname} ${author.lastname}`
            };
          })
          .sort((a, b) => {
            a = a.label;
            b = b.label;
            return a < b ? -1 : a > b ? 1 : 0;
          });
        setAuthors(authors);
      }
    });
  }, []);

  const { handleText, handleDate, handleFile, confirmSocials } = handlers;

  return (
    <Shader>
      <Spacer className={css.form}>
        <div>
          <Heading>{heading}</Heading>

          <Group>
            <Col md={6}>
              <Label>Name:</Label>
              <TextInput
                name={'name'}
                value={candidate.name}
                onChange={handleText}
                placeholder={"Enter candidate's name."}
              />
            </Col>
            <Col md={2}>
              <Label>Number:</Label>
              <NumberPicker
                name={'id'}
                value={candidate.id}
                onChange={handleText}
                placeholder={'ID No.'}
              />
            </Col>
            <Col md={4}>
              <Label>Birthday:</Label>
              <BirthdayPicker
                name={'birthday'}
                date={candidate.birthday}
                onConfirm={handleDate}
              />
            </Col>
          </Group>
          <Group>
            <Col md={5}>
              <Label>Occupation:</Label>
              <TextInput
                name={'occupation'}
                value={candidate.occupation}
                onChange={handleText}
                placeholder={"Enter candidate's occupation."}
              />
            </Col>
            <Col md={7}>
              <Label>Ethnic Origin:</Label>
              <ClickInput
                onClick={() => setEthnicModalVisibility(true)}
                value={countriesToString(ethnicities, countries)}
                placeholder={'Click to select countries of origin...'}
              />
            </Col>
          </Group>
          <Group>
            <Col md={12}>
              <Label>Socials:</Label>
              <AddEntityButton
                title={'Add Socials'}
                onClick={() => setSocialsModalVisibility(true)}
              />
              <SocialsList socials={candidate.socials} />
            </Col>
          </Group>
          <Group>
            <Col>
              <LabelInfo>Description</LabelInfo>
              <LongTextArea
                name={'description'}
                value={candidate.description}
                onChange={handleText}
                placeholder={'Write out candidate tribute...'}
              />
            </Col>
          </Group>
          <Group>
            <Col md={5}>
              <Label>Author:</Label>
              <Select
                name={'authorId'}
                value={candidate.authorId}
                placeholder={'Select the author.'}
                items={authors}
                onChange={handleText}
              />
            </Col>
            <Col md={{ span: 5, offset: 2 }}>
              <Label>Date Written:</Label>
              <AuthoredDatePicker
                name={'dateWritten'}
                date={candidate.dateWritten}
                onConfirm={handleDate}
              />
            </Col>
          </Group>
          <Group>
            <Col>
              <FileSelector
                image={candidate.image}
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
        confirm={setEthnicities}
        close={() => setEthnicModalVisibility(false)}
        ethnicities={ethnicities}
        visible={isEthnicModalVisible}
      />

      <SocialsModal
        close={() => setSocialsModalVisibility(false)}
        confirm={confirmSocials}
        socials={candidate.socials}
        visible={isSocialsModalVisible}
      />
    </Shader>
  );
};

const mapStateToProps = ({ countries, user }) => ({
  countries,
  user
});

export default connect(mapStateToProps)(CandidateForm);
