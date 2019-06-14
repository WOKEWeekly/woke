import React, { Component } from 'react';
import { Spinner } from 'react-bootstrap';

import css from '~/styles/_components.scss';

export default class Loader extends Component {
  render(){
    return (
      <div className={css.loader}>
        <Spinner
          animation="border"
          className={css.spinner}
          size={'sm'} />
        <span className={css.spinner}>Loading...</span>
      </div>
    )
  }
}