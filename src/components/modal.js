import React, { useEffect, useRef, useState } from 'react';
import { Col, Modal as IModal } from 'react-bootstrap';
import { connect } from 'react-redux';

import { CancelButton, DeleteButton, SubmitButton } from 'components/button.js';
import { Group, Label } from 'components/form';
import { Select, UsernameInput } from 'components/form/v2';
import { SocialIcon } from 'components/icon.js';
import { Paragraph } from 'components/text.js';
import { socialPlatforms } from 'constants/settings';
import css from 'styles/components/Modal.module.scss';

const platformList = Object.keys(socialPlatforms);

/**
 * Custom hook for controlling modal visibility
 * @param {boolean} initial - The modal's initial visibility.
 * @returns {any[]} The hook.
 */
export const useModal = (initial = false) => {
  const [isVisible, setVisibility] = useState(initial);
  return [isVisible, setVisibility];
};

// TODO: Clean up modals
export const Modal = (props) => {
  const { visible, header, body, footer, onlyBody, onHide } = props;

  const Header = () => {
    if (!header) return null;

    return (
      <IModal.Header className={css['modal-header']}>{header}</IModal.Header>
    );
  };

  const Body = () => {
    return (
      <IModal.Body
        className={css['modal-body']}
        style={{ padding: onlyBody ? '1rem' : '0 1rem' }}>
        {body}
      </IModal.Body>
    );
  };

  const Footer = () => {
    if (!footer) return null;

    return (
      <IModal.Footer className={css['modal-footer']}>{footer}</IModal.Footer>
    );
  };

  return (
    <IModal show={visible} onHide={onHide} centered {...props}>
      <Header />
      <Body />
      <Footer />
    </IModal>
  );
};

export const ConfirmModal = ({
  message,
  confirmFunc,
  confirmText,
  close,
  visible
}) => {
  const [isLoaded, setLoaded] = useState(visible);
  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  const Body = (
    <Paragraph className={css['text']} style={{ fontSize: '1.1em' }}>
      {message}
    </Paragraph>
  );

  const Footer = (
    <>
      <DeleteButton onClick={confirmFunc}>{confirmText}</DeleteButton>
      <CancelButton onClick={close}>Cancel</CancelButton>
    </>
  );

  return (
    <Modal
      show={visible && isLoaded}
      body={Body}
      footer={Footer}
      onlyBody={true}
      onHide={close}
    />
  );
};

/**
 * The modal for inputting social media handles.
 * @param {object} props - The component props.
 * @param {Function} props.confirm - The function to confirm input socials on the form.
 * @param {Function} props.close - The function to close the modal.
 * @param {object} props.socials - The map of social media handles.
 * @param {boolean} props.visible - An indicator for whether the modal is visible or not.
 * @returns {React.Component} - The component.
 */
export const SocialsModal = ({ confirm, close, socials = {}, visible }) => {
  // Create a map of references.
  const socialRefs = {};
  platformList.forEach((platform) => {
    socialRefs[platform] = useRef(socials[platform] || '');
  });

  /** Confirm the input socials on the form. */
  const confirmSocials = () => {
    const socials = {};
    platformList.forEach((platform) => {
      socials[platform] = socialRefs[platform].current.value;
    });
    confirm(socials);
    close();
  };

  const SocialFields = () => {
    return platformList.map((platform, key) => {
      const social = socialPlatforms[platform];
      return (
        <Col md={6} key={key} style={{ marginBottom: '1em' }}>
          <Label>{social.name}</Label>
          <div className={css['social-modal-fields']}>
            <SocialIcon
              icon={social.icon}
              className={css['social-modal-icons']}
            />
            <UsernameInput
              value={socials[platform]}
              ref={socialRefs[platform]}
              placeholder={`${social.name} ${
                social.domain ? 'username' : 'URL'
              }`}
            />
          </div>
        </Col>
      );
    });
  };

  return (
    <Modal
      show={visible}
      scrollable
      onlyBody={true}
      body={
        <Group>
          <SocialFields />
        </Group>
      }
      footer={
        <>
          <SubmitButton onClick={confirmSocials}>Confirm</SubmitButton>
          <CancelButton onClick={close}>Close</CancelButton>
        </>
      }
    />
  );
};

/**
 * The modal for selecting countries of origin.
 * @param {object} props - The component props.
 * @param {Function} props.close - The function to close the modal.
 * @param {object[]} props.countries - The array of countries from Redux.
 * @param {object} props.ethnicities - The map of ethnicities.
 * @param {true} props.visible - Indicates whether the modal is visible or not.
 * @returns {React.Component} - The component.
 */
const IEthnicModal = ({ confirm, close, countries, ethnicities, visible }) => {
  const [ethnicity1, ethnicity2, ethnicity3, ethnicity4] = ethnicities;

  const selects = [
    [
      'First ethnicity',
      ethnicity1,
      'Select first country...',
      useRef(ethnicity1)
    ],
    [
      'Second ethnicity',
      ethnicity2,
      'Select second country...',
      useRef(ethnicity2)
    ],
    [
      'Third ethnicity',
      ethnicity3,
      'Select third country...',
      useRef(ethnicity3)
    ],
    [
      'Fourth ethnicity',
      ethnicity4,
      'Select fourth country...',
      useRef(ethnicity4)
    ]
  ];

  /** Confirm the selected ethnicities on the form. */
  const confirmEthnicities = () => {
    const ethnicList = selects.map(([, , , ref]) => ref.current.value);
    confirm(ethnicList);
    close();
  };

  const clearSelectedEthnicity = (ref) => {
    ref.current.value = '';
  };

  return (
    <Modal
      show={visible}
      scrollable
      body={
        <Group>
          {selects.map(([label, value, placeholder, ref], key) => {
            return (
              <Col md={6} key={key}>
                <Label>{label}:</Label>
                <Select
                  ref={ref}
                  value={value}
                  items={countries}
                  placeholder={placeholder}
                />
                <button
                  onClick={() => clearSelectedEthnicity(ref)}
                  className={css['ethnic-clear-button']}>
                  Clear
                </button>
              </Col>
            );
          })}
        </Group>
      }
      footer={
        <>
          <SubmitButton onClick={confirmEthnicities}>Confirm</SubmitButton>
          <CancelButton onClick={close}>Close</CancelButton>
        </>
      }
      onlyBody={true}
    />
  );
};

const mapStateToProps = ({ countries }) => ({
  countries
});

export const EthnicModal = connect(mapStateToProps)(IEthnicModal);
