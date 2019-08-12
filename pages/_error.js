import React from 'react';
import { Shader } from '~/components/layout';

import css from '~/styles/_partials.scss';

export default class Error extends React.Component {
  static getInitialProps({ res, err, query }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    return { statusCode, ...query }
  }

  render() {

    const { statusCode, message } = this.props;

    if (message) {
      return (
        <Shader>
          <div className={css.error}>
            <div className={css.errorText}>
              <div className={css.message}>{message}</div>
              <div><button onClick={() => location.href = '/'}>Go to Home</button></div>
            </div>
          </div>
        </Shader>
      )
    } else if (statusCode === 404){
      return (
        <Shader>
          <div className={css.error}>
            <div className={css.errorText}>
              <div className={css.message}>So...you're looking for a page that doesn't quite exist.</div>
              <div>
                <button onClick={() => history.back()}>Go back to previous page</button>
                <span> • </span>
                <button onClick={() => location.href = '/'}>Go to Home</button>
              </div>
            </div>
          </div>
        </Shader>
      )
    } else {
      return (
        <Shader>
          <div className={css.error}>
            <div className={css.errorText}>
              <div className={css.message}>We seem to have run into a problem.</div>
              <div>Try refreshing the page. If that didn't work, please bear with us and try again later.</div>
            </div>
          </div>
        </Shader>
      )
    }
  }
}