import React from 'react';

import { Shader } from 'components/layout';
import css from 'styles/Partials.module.scss';

export default class Error extends React.Component {
  static getInitialProps({ res, err, query }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null;
    return { statusCode, ...query };
  }

  render() {
    const { message } = this.props;

    const ErrorMessage = () => {
      if (message) {
        return (
          <React.Fragment>
            <div className={css.message}>{message}</div>
            <div>
              <button onClick={() => (location.href = '/')}>Go to Home</button>
            </div>
          </React.Fragment>
        );
      } else {
        return (
          <React.Fragment>
            <div className={css.message}>
              We seem to have run into a problem.
            </div>
            <div>
              Try refreshing the page. If that didn&#39;t work, please bear with
              us and try again later.
            </div>
          </React.Fragment>
        );
      }
    };

    return (
      <Shader>
        <div className={css.error}>
          <div className={css.errorText}>
            <ErrorMessage />
          </div>
        </div>
      </Shader>
    );
  }
}
