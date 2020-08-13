import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { setAlert } from 'components/alert.js';
import handlers from 'constants/handlers.js';
import request from 'constants/request.js';
import { OPERATIONS } from 'constants/strings.js';
import { isValidSubscriber } from 'constants/validations.js';
import SubscriberForm from 'partials/pages/subscribers/form.js';

const adminPage = '/admin/subscribers';

const SubscriberCrud = ({
  subscriber: currentSubscriber,
  operation,
  title,
  user
}) => {
  const [stateSubscriber, setSubscriber] = useState({
    firstname: '',
    lastname: '',
    email: '',
    subscriptions: { articles: false },
    createtime: null
  });

  const isCreateOperation = operation === OPERATIONS.CREATE;

  useEffect(() => {
    if (!isCreateOperation) {
      const {
        createTime,
        firstname,
        lastname,
        email,
        subscriptions
      } = currentSubscriber;
      const subscription = JSON.parse(subscriptions);
      setSubscriber(
        Object.assign({}, currentSubscriber, {
          firstname,
          lastname,
          email,
          subscription: subscription.articles,
          createtime: createTime !== null ? new Date(createTime) : null
        })
      );
    }
  }, []);

  const buildRequest = () => {
    const {
      firstname,
      lastname,
      email,
      subscriptions,
      createtime
    } = stateSubscriber;

    const subscriber = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      subscriptions: subscriptions
        ? JSON.stringify({ articles: true })
        : JSON.stringify({ articles: false }),
      createtime: zDate.formatISODate(createtime) || null
    };

    let payload;

    payload = JSON.stringify(subscriber);
    return payload;
  };

  /** POST subscriber to the server */
  const submitSubscriber = () => {
    if (!isValidSubscriber({ ...stateSubscriber })) return;
    const payload = buildRequest();

    request({
      url: `/api/v1/subscribers`,
      method: 'POST',
      body: payload,
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        const { firstname, lastname } = stateSubscriber;
        setAlert({
          type: 'success',
          message: `You've successfully added a subscriber: ${firstname} ${lastname}.`
        });
        location.href = adminPage;
      }
    });
  };

  /** PUT subscriber on server */
  const updateSubscriber = () => {
    if (!isValidSubscriber({ ...stateSubscriber })) return;
    const data = buildRequest();

    request({
      url: `/api/v1/subscribers/${currentSubscriber.id}`,
      method: 'PUT',
      body: data,
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: ({ slug }) => {
        const { firstname, lastname } = stateSubscriber;
        const backPath = !slug ? '/admin/subscribers' : `/subscribers/${slug}`;

        setAlert({
          type: 'success',
          message: `You've successfully edited the details of ${firstname} ${lastname}.`
        });
        location.href = backPath;
      }
    });
  };

  return (
    <SubscriberForm
      heading={title}
      subscriber={stateSubscriber}
      handlers={handlers(setSubscriber, stateSubscriber)}
      confirmText={isCreateOperation ? 'Submit' : 'Update'}
      confirmFunc={isCreateOperation ? submitSubscriber : updateSubscriber}
      cancelFunc={() => (location.href = adminPage)}
    />
  );
};

SubscriberCrud.getInitialProps = async ({ query }) => {
  return { ...query };
};

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(SubscriberCrud);
