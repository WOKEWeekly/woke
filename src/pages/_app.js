import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import App from 'next/app';
import React, { useState, useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { checkAlert } from 'components/alert';
import { CookiePrompt, setCookie, getCookie } from 'constants/cookies';
import { loadCountries } from 'constants/countries';
import { cloudinary } from 'constants/settings.js';
import Footer from 'partials/footer.js';
import Header from 'partials/header.js';
import { saveCountries, setTheme, clearUser } from 'reducers/actions';
import configureStore from 'reducers/store.js';

import 'styles/App.scss';
import 'styles/Categories.scss';

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
  const countries = useSelector(({ countries }) => countries);
  const dispatch = useDispatch();

  useEffect(() => {
    const {
      backgroundImage = 'bg-app.jpg',
      theme: currentTheme = 'default'
    } = router.query;

    loadAllCountries(dispatch, countries);
    loadTheme(dispatch, currentTheme);
    loadBackgroundImage(backgroundImage);
    setLoaded(true);
    checkUserSessionActive(dispatch);
    checkAlert();
  }, [isLoaded]);

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

/**
 * Load all countries and save to store.
 * @param {Function} dispatch The Redux dispatch function.
 * @param {object[]} countries The map of countries.
 */
const loadAllCountries = (dispatch, countries) => {
  if (!countries.length) {
    Promise.resolve()
      .then(() => loadCountries())
      .then((data) => {
        const countries = data.map((country) => {
          return {
            label: country.name,
            demonym: country.demonym,
            iso: country.alpha2Code
          };
        });
        dispatch(saveCountries(countries));
      });
  }
};

/**
 * Load the page and set the page's theme
 * @param {Function} dispatch The Redux dispatch function.
 * @param {string} theme The current page theme.
 */
const loadTheme = (dispatch, theme) => {
  dispatch(setTheme(theme));
};

/**
 * Clear user from store if no session exists.
 * @param {Function} dispatch The Redux dispatch function.
 */
const checkUserSessionActive = (dispatch) => {
  if (!getCookie('wokeAuth')) dispatch(clearUser());
};

/**
 * Fade background image into view.
 * @param {string} bgImage The filename of the background image.
 */
const loadBackgroundImage = (bgImage) => {
  const image = new Image();
  image.src = `${cloudinary.url}/public/bg/${bgImage}`;
  image.onload = () => {
    document.body.style.backgroundImage = `url(${image.src})`;
    document.body.style.opacity = 1;
  };
};

/**
 * Show the cookies prompt if the cookie policy has not been accepted.
 * @returns {React.Component}The cookie prompt component. Null if cookies have been accepted.
 */
const CookiePolicyAlert = () => {
  const [isCookiePolicyAccepted, setCookieAcceptedState] = useState(
    getCookie('cookiesAccepted') === 'true'
  );
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

WOKE.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }
  return { pageProps };
};
