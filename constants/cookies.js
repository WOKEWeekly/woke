import React, { Component } from 'react';
import { alert } from '~/components/alert.js';
import { Fader } from '~/components/transitioner.js';
import css from '~/styles/_components.scss';

export class CookiePrompt extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  componentDidMount(){
    setTimeout(() => {
      this.setState({ isLoaded: true});
    }, 2000);
  }

  render(){
    const { isLoaded } = this.state;

    return (
      <Fader determinant={isLoaded} duration={500} notDiv>
        <div className={css.cookiePrompt}>
          <span>This site uses cookies to ensure a smooth user experience.</span>
          <button variant={'light'} onClick={this.props.acceptCookies}>Accept</button>
        </div>
      </Fader>
    )
  }
}

export function setCookie(name, value, hours) {
  const date = new Date();
  date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
  const expires = `${expires}${date.toUTCString()}`;
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
  return "";
}

export function checkCookies(message){
  if (!getCookie('cookiesAccepted')){
    if (message){
      return alert.error(message);
    } else {
      return false;
    }
  } else {
    return true;
  }
}