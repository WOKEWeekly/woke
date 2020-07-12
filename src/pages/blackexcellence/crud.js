import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { setAlert } from 'components/alert.js';
import handlers from 'constants/handlers.js';
import request from 'constants/request.js';
import { OPERATIONS } from 'constants/strings.js';
import { isValidCandidate } from 'constants/validations.js';
import CandidateForm from 'partials/pages/candidates/form.js';

const CandidateCrud = ({
  candidate: currentCandidate,
  operation,
  title,
  user
}) => {
  const [stateCandidate, setCandidate] = useState({
    id: null,
    name: '',
    occupation: '',
    birthday: null,
    description: '',
    image: '',
    socials: {},
    authorId: null,
    dateWritten: new Date()
  });

  const [ethnicities, setEthnicities] = useState(new Array(4).fill(''));
  const [imageHasChanged, setImageChanged] = useState(false);

  const isCreateOperation = operation === OPERATIONS.CREATE;

  useEffect(() => {
    if (isCreateOperation) {
      // Get the next candidate ID number.
      request({
        url: '/api/v1/candidates/latest',
        method: 'GET',
        headers: { Authorization: process.env.AUTH_KEY },
        onSuccess: ({ id = 0 }) => {
          id = id + 1;
          setCandidate(Object.assign({}, currentCandidate, { id }));
        }
      });
    } else {
      const { birthday, ethnicity, socials, dateWritten } = currentCandidate;

      setCandidate(
        Object.assign({}, currentCandidate, {
          socials: JSON.parse(socials),
          birthday: birthday && new Date(birthday),
          dateWritten: dateWritten && new Date(dateWritten)
        })
      );
      setEthnicities(JSON.parse(ethnicity));
    }
  }, []);

  /**
   * Build candidate(s) object from state and props.
   * @returns {object} Payload to be submitted to server.
   */
  const buildRequest = () => {
    const {
      id,
      name,
      occupation,
      image,
      birthday,
      description,
      socials,
      authorId,
      dateWritten
    } = stateCandidate;

    const candidate = {
      id,
      name: name.trim(),
      occupation: occupation.trim(),
      image,
      birthday: zDate.formatISODate(birthday),
      ethnicity: JSON.stringify(ethnicities),
      description: description,
      socials: JSON.stringify(socials),
      authorId,
      dateWritten: zDate.formatISODate(dateWritten)
    };

    let payload;

    if (isCreateOperation) {
      payload = JSON.stringify(candidate);
    } else {
      payload = JSON.stringify({
        candidate: candidate,
        changed: imageHasChanged
      });
    }

    return payload;
  };

  /** Submit the candidate to the server */
  const submitCandidate = () => {
    if (!isValidCandidate({ ...stateCandidate, ethnicities })) return;
    const payload = buildRequest();

    request({
      url: '/api/v1/candidates',
      method: 'POST',
      body: payload,
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully added candidate ${stateCandidate.name}.`
        });
        location.href = '/blackexcellence';
      }
    });
  };

  /** Update candidate on server */
  const updateCandidate = () => {
    if (!isValidCandidate({ ...stateCandidate, ethnicities })) return;
    const payload = buildRequest();

    request({
      url: `/api/v1/candidates/${currentCandidate.id}`,
      method: 'PUT',
      body: payload,
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        const { id, name } = stateCandidate;
        setAlert({
          type: 'success',
          message: `You've successfully edited the details of ${name}.`
        });
        location.href = `/blackexcellence/${id}`;
      }
    });
  };

  const backPath = isCreateOperation
    ? '/blackexcellence'
    : `/blackexcellence/${stateCandidate.id}`;
  return (
    <CandidateForm
      heading={title}
      candidate={stateCandidate}
      ethnicities={ethnicities}
      setEthnicities={setEthnicities}
      setImageChanged={setImageChanged}
      handlers={handlers(setCandidate, stateCandidate)}
      confirmText={isCreateOperation ? 'Submit' : 'Update'}
      confirmFunc={isCreateOperation ? submitCandidate : updateCandidate}
      cancelFunc={() => (location.href = backPath)}
      operation={operation}
      metaTitle={title}
      metaUrl={`/${operation}`}
    />
  );
};

CandidateCrud.getInitialProps = async ({ query }) => {
  return { ...query };
};

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(CandidateCrud);
