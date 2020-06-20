import React from 'react';

import { Shader } from 'components/layout';
import css from 'styles/Partials.module.scss';

export default class NotFound404 extends React.Component {
  render() {
    return (
      <Shader>
        <div className={css.error}>
          <div className={css.errorText}>
            <div className={css.message}>
              So...you&#39;re looking for a page that doesn&#39;t quite exist.
            </div>
            <div>
              <button onClick={() => history.back()}>
                Go back to previous page
              </button>
              <span> • </span>
              <button onClick={() => (location.href = '/')}>Go to Home</button>
            </div>
          </div>
        </div>
      </Shader>
    );
  }
}
