import React, { Component } from 'react';
import { Spinner } from 'react-bootstrap';

import css from '~/styles/_components.scss';

export class Loader extends Component {
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

export class LoaderIcon extends Component {
  render(){
    return (
      <div className={css.loader}>
      <Spinner
        animation="grow"
        className={css.spinner}
        size={'sm'} />
        </div>
    )
  }
}

export class Empty extends Component {
  render(){
    return (
      <div className={css.loader}>
        <span className={css.spinner}>{this.props.message}</span>
      </div>
    )
  }
}
