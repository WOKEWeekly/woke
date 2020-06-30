import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import App from 'next/app';
import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { CookiePrompt, setCookie, getCookie } from 'constants/cookies';
import { loadCountries } from 'constants/countries';
import { cloudinary } from 'constants/settings.js';
import Footer from 'partials/footer.js';
import Header from 'partials/header.js';
import { saveCountries, setTheme } from 'reducers/actions';
import configureStore from 'reducers/store.js';

import 'styles/App.scss';
import 'styles/Categories.scss';
import 'react-toastify/dist/ReactToastify.min.css';

library.add(fab, far, fas);

const { store, persistor } = configureStore();

export default class WOKE extends App {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <WOKEApp {...this.props} />
        </PersistGate>
      </Provider>
    );
  }
}

/**
 * The root of the #WOKEWeekly applcation
 * @param {object} props - The inherited props from the Next App.
 * @param {object} props.Component - The current component in view.
 * @param {object} props.pageProps - The properties for each page.
 * @param {object} props.router - The server-side router object.
 * @returns {React.Component} - The full page including the header and footer.
 */
const WOKEApp = ({ Component, pageProps, router }) => {
  const [isLoaded, setLoaded] = useState(false);
  const [isCookiePolicyAccepted, setCookieAcceptedState] = useState(
    getCookie('cookiesAccepted') === 'true'
  );

  useEffect(() => {
    const { backgroundImage = 'bg-app.jpg', theme = 'default' } = router.query;

    // Fade background image into view
    const image = new Image();
    image.src = `${cloudinary.url}/public/bg/${backgroundImage}`;
    image.onload = () => {
      document.body.style.backgroundImage = `url(${image.src})`;
      document.body.style.opacity = 1;
    };

    // Load countries if not already loaded
    const countries = store.getState().countries;
    if (!countries.length) {
      loadCountries().then((data) => {
        const countries = data.map((country) => {
          return {
            label: country.name,
            demonym: country.demonym,
            iso: country.alpha2Code
          };
        });
        store.dispatch(saveCountries(countries));
        loadAndSetTheme(theme);
      });
    } else {
      loadAndSetTheme(theme);
    }
  }, [isLoaded]);

  /**
   * Load the page and set the page's theme
   * @param {string} theme - The current page theme.
   */
  const loadAndSetTheme = (theme) => {
    setLoaded(true);
    store.dispatch(setTheme(theme));
  };

  /**
   * Show the cookies prompt if the cookie policy has not been accepted.
   * @returns The cookie prompt component. Null if cookies have been accepted.
   */
  const CookiePolicyAlert = () => {
    if (isCookiePolicyAccepted) return null;
    return (
      <CookiePrompt
        acceptCookies={() => {
          setCookie('cookiesAccepted', true, 365 * 24);
          setCookieAcceptedState(true);
        }}
      />
    );
  };

  if (!isLoaded) return null;

  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
      <CookiePolicyAlert />
    </>
  );
};
