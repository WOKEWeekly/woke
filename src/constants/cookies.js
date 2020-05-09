import React, { Component } from 'react';
import { alert } from '~/components/alert.js';
import { Icon } from '~/components/icon';
import { Fader } from '~/components/transitioner.js';
import css from '~/styles/components/Alert.module.scss';

export class CookiePrompt extends Component {
  constructor() {
    super();
    this.state = { isLoaded: false };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ isLoaded: true });
    }, 2000);
  }

  render() {
    const { isLoaded } = this.state;

    return (
      <Fader determinant={isLoaded} duration={500} notDiv>
        <div className={css.cookiePrompt}>
          <div>
            <span>
              This site uses cookies and similar technologies to recognise your
              preferences. Stay woke on cookies by viewing our{' '}
              <a href={'/cookies'}>Cookie Policy</a>. By closing this pop-up,
              you consent to our usage of cookies.
            </span>
            <button onClick={this.props.acceptCookies}>
              <Icon name={'times'} />
            </button>
          </div>
        </div>
      </Fader>
    );
  }
}

export function setCookie(name, value, hours) {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

export function getCookie(cname) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export function checkCookies(message) {
  if (getCookie('cookiesAccepted') === 'true') {
    return true;
  } else {
    if (message) {
      return alert.error(message);
    } else {
      return false;
    }
  }
}
