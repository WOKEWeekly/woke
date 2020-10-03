import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { alert } from 'components/alert.js';
import { SubmitButton, CancelButton } from 'components/button.js';
import { TextInput, Group, Label } from 'components/form';
import { Shader } from 'components/layout.js';
import { ConfirmModal, Modal } from 'components/modal.js';
import { VanillaLink } from 'components/text.js';
import request from 'constants/request.js';
import { domain } from 'constants/settings.js';
import css from 'styles/Auth.module.scss';

const links = [
  // { name: 'Sessions', url: 'sessions' },
  { name: 'Members', url: 'members' },
  { name: 'Articles', url: 'articles' },
  // { name: 'Candidates', url: 'candidates' },
  { name: 'Reviews', url: 'reviews' },
  { name: 'Users', url: 'users' },
  { name: 'Subscribers', url: 'subscribers' },
  { name: 'Documents', url: 'documents' }
];

const Admin = ({ zoomLink }) => {
  const [isLoaded, setLoaded] = useState(false);
  const user = useSelector(({ user }) => user);

  if (user.clearance < 7) {
    return (location.href = '/');
  }

  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  return (
    <Shader>
      <div className={css['admin-page']}>
        <div className={css['admin-block-wrapper']}>
          {links.map(({ name, url }, key) => {
            return (
              <VanillaLink
                href={`/admin/${url}`}
                key={key}
                className={css['admin-block']}>
                {name}
              </VanillaLink>
            );
          })}
        </div>
        <div className={css['admin-subblock-wrapper']}>
          <TopicTokenGenerateButton />
          <ZoomLinkUpdateButton zoomLink={zoomLink} />
        </div>
      </div>
    </Shader>
  );
};

const TopicTokenGenerateButton = () => {
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const hideTokenModal = () => {
    setTokenModalVisible(false);
  };
  const user = useSelector(({ user }) => user);

  /** Regenerate a new Topic Bank access token */
  const generateTopicBankToken = () => {
    request({
      url: '/api/v1/topics/token',
      method: 'GET',
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: ({ token }) => {
        hideTokenModal();
        copyAccessLink(`${domain}/topics?access=${token}`);
      }
    });
  };

  /**
   * Copy access link to clipboard
   * @param {string} accessLink The link to be copied.
   */
  const copyAccessLink = (accessLink) => {
    navigator.clipboard.writeText(accessLink).then(
      () => {
        alert.info(
          'Topic Bank token successfully regenerated. Access link copied to clipboard.'
        );
      },
      () => {
        alert.error('Could not copy access link.');
      }
    );
  };

  return (
    <>
      <SubmitButton
        onClick={() => setTokenModalVisible(true)}
        className={css['generate-token-button']}>
        Regenerate Topic Bank Token
      </SubmitButton>
      <ConfirmModal
        visible={tokenModalVisible}
        message={`Are you sure you want to regenerate the access token for the Topic Bank? The previous link will no longer work.`}
        confirmFunc={generateTopicBankToken}
        confirmText={'Regenerate'}
        close={hideTokenModal}
      />
    </>
  );
};

const ZoomLinkUpdateButton = ({ zoomLink: serverZoomLink = '' }) => {
  const [zoomLinkModalVisible, setZoomLinkModalVisible] = useState(false);
  const [clientZoomLink, setZoomLink] = useState(serverZoomLink);
  const user = useSelector(({ user }) => user);

  const hideZoomLinkModal = () => setZoomLinkModalVisible(false);

  const updateZoomLink = () => {
    request({
      url: '/api/v1/tokens/zoom',
      method: 'PUT',
      body: JSON.stringify({ value: clientZoomLink }),
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        alert.success('Zoom link successfully updated.');
      }
    });
  };

  return (
    <>
      <SubmitButton
        onClick={() => setZoomLinkModalVisible(true)}
        className={css['generate-token-button']}>
        Update Zoom Link
      </SubmitButton>

      <Modal
        visible={zoomLinkModalVisible}
        onHide={hideZoomLinkModal}
        body={
          <Group className={css['admin-zoom-field']}>
            <Label>New Zoom Link</Label>
            <TextInput
              value={clientZoomLink}
              placeholder={'Enter the new Zoom link'}
              onChange={(e) => setZoomLink(e.target.value)}
            />
          </Group>
        }
        footer={
          <>
            <SubmitButton onClick={updateZoomLink}>Update</SubmitButton>
            <CancelButton onClick={hideZoomLinkModal}>Cancel</CancelButton>
          </>
        }
      />
    </>
  );
};

Admin.getInitialProps = async ({ query }) => {
  return { ...query };
};

export default Admin;
