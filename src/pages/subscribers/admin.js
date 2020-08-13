import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { alert } from 'components/alert.js';
import { AddEntityButton } from 'components/button.js';
import { Icon } from 'components/icon.js';
import { Shader } from 'components/layout.js';
import { ConfirmModal } from 'components/modal.js';
import Tabler from 'components/tabler';
import { BottomToolbar } from 'components/toolbar.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import css from 'styles/pages/Members.module.scss';

/**
 * The admin page for members.
 * @param {object} props - The component properties.
 * @param {object} props.user - The current user.
 * @returns {React.Component} The component.
 */
const SubscriberAdmin = (props) => {
  const { user } = props;

  if (user.clearance < CLEARANCES.ACTIONS.SUBSCRIBERS.VIEW) {
    return (location.href = '/');
  }

  return (
    <>
      <Shader>
        <SubscriberCollection {...props} />
      </Shader>
      <BottomToolbar>
        <AddEntityButton
          title={'Add Subscriber'}
          onClick={() => (location.href = '/admin/subscribers/add')}
        />
      </BottomToolbar>
    </>
  );
};

/**
 * The collection of members.
 * @param {object} props - The component properties.
 * @param {object} props.user - The current user.
 * @returns {React.Component} The component.
 */
const SubscriberCollection = ({ user }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoaded, setLoaded] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState({});
  const [deleteModalVisible, setDeleteModalVisibility] = useState(false);

  useEffect(() => getSubscribers(), [isLoaded]);

  /** Retrieve a list of all subscribers */
  const getSubscribers = () => {
    request({
      url: '/api/v1/subscribers',
      method: 'GET',
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: (subscribers) => {
        setSubscribers(subscribers);
        setLoaded(true);
      }
    });
  };

  /**
   * Delete a subscriber from the server.
   */
  const deleteSubscriber = () => {
    const { id, fullname } = selectedSubscriber;
    request({
      url: `/api/v1/subscribers/${id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        alert.success(`You've deleted the subscriber: ${fullname}.`);
        setDeleteModalVisibility(false);
        getSubscribers();
      }
    });
  };

  return (
    <>
      <Tabler
        heading={'List of #WOKEWeekly Subscriptions'}
        itemsLoaded={isLoaded}
        emptyMessage={'No members found.'}
        columns={[
          ['#', { centerAlign: true }],
          ['Name'],
          ['Email'],
          ['Subscriptions'],
          ['Created Time']
        ]}
        items={subscribers.map((subscriber, key) => {
          subscriber.fullname = `${subscriber.firstname} ${subscriber.lastname}`;
          subscriber.parsedSubscription = JSON.parse(subscriber.subscriptions);

          return [
            [key + 1, { type: 'index' }],
            [subscriber.fullname, { icon: 'user' }],
            [subscriber.email, { icon: 'email' }],
            [
              subscriber.parsedSubscription.articles ? 'true' : ' ',
              { icon: 'sub' }
            ],
            [
              zDate.formatDate(subscriber.createTime),
              { icon: 'time', hideIfEmpty: true }
            ],
            [<EditButton id={subscriber.id} key={key} />, { type: 'button' }],
            [
              <DeleteButton
                subscriber={subscriber}
                setDeleteModalVisibility={setDeleteModalVisibility}
                setSelectedSubscriber={setSelectedSubscriber}
                key={key}
              />,
              { type: 'button' }
            ]
          ];
        })}
        distribution={'4% 1fr 1fr 1fr 1fr 4% 4%'}
      />
      <ConfirmModal
        visible={deleteModalVisible}
        message={`Are you sure you want to delete subscriber: ${selectedSubscriber.fullname}?`}
        confirmFunc={deleteSubscriber}
        confirmText={'Delete'}
        close={() => setDeleteModalVisibility(false)}
      />
    </>
  );
};

/**
 * Attempt to delete a subscriber.
 * @param {object} props - The component properties.
 * @param {number} props.subscriber - The subscriber to be deleted.
 * @param {Function} props.setDeleteModalVisibility - The hook for setting modal visibility.
 * @param {Function} props.setSelectedSubscriber - The hook for setting the currently-selected subscriber.
 * @returns {React.Component} The component.
 */
const DeleteButton = ({
  subscriber,
  setDeleteModalVisibility,
  setSelectedSubscriber
}) => {
  const { id, firstname, lastname } = subscriber;
  return (
    <button
      className={css.invisible_button}
      onClick={() => {
        setDeleteModalVisibility(true);
        setSelectedSubscriber(
          Object.assign(
            {},
            {
              id,
              fullname: `${firstname} ${lastname}`
            }
          )
        );
      }}>
      <Icon name={'trash'} />
    </button>
  );
};

/**
 * Navigate to edit a subscriber.
 * @param {object} props - The component properties.
 * @param {number} props.id - The ID of the subcriber.
 * @returns {React.Component} The component.
 */
const EditButton = ({ id }) => {
  const link = `/admin/subscribers/edit/${id}`;
  return (
    <button
      className={css.invisible_button}
      onClick={() => (location.href = link)}>
      <Icon name={'edit'} />
    </button>
  );
};

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(SubscriberAdmin);
