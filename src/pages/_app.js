import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from '~/reducers/store.js';
import App from 'next/app';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { CookiePrompt, setCookie, getCookie } from '~/constants/cookies';
import { loadCountries } from '~/constants/countries';
import { cloudinary } from '~/constants/settings.js';
import { saveCountries, setTheme } from '~/reducers/actions';

import { PreNavBar, MainNavBar } from "~/partials/header.js";
import Footer from "~/partials/footer.js";

import 'react-toastify/dist/ReactToastify.min.css';

library.add(fab, far, fas);

const { store, persistor } = configureStore();

export default class WOKE extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    return { pageProps };
  }

  state = { isLoaded: false }
  
  componentDidMount(){
    const {
      backgroundImage = 'bg-app.jpg',
      theme = 'default'
    } = this.props.router.query;

    // Set the theme
    store.dispatch(setTheme(theme));

    // Fade background image into view
    const image = new Image();
    image.src = `${cloudinary.url}/public/bg/${backgroundImage}`;
    image.onload = () => {
      document.body.style.backgroundImage = `url(${image.src})`;
      document.body.style.opacity = 1;
    };
    
    // Get cookie consent value
    this.setState({cookiesAccepted: getCookie('cookiesAccepted') === 'true'});

    // Loaded countries if not already loaded
    if (!localStorage.getItem('countriesLoaded')){
      this.preloadCountries();
    } else {
      this.setState({isLoaded: true});
    }
  }

  /** Save country list in Redux store */
  preloadCountries = () => {
    loadCountries().then(data => {
      const countries = [];
      data.forEach(country => {
        countries.push({ label: country.name, demonym: country.demonym });
      });
      store.dispatch(saveCountries(countries));
      localStorage.setItem('countriesLoaded', true);
      this.setState({isLoaded: true});
    });
  }

  acceptCookies = () => {
    setCookie('cookiesAccepted', true, 365 * 24);
    this.setState({ cookiesAccepted: true});
  }

  render() {
    const { isLoaded, cookiesAccepted } = this.state;
    const { Component, pageProps } = this.props;
    
    if (!isLoaded) return null;

    return (
      <Provider store={store}>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
        <PersistGate loading={null} persistor={persistor}>
          <PreNavBar/> <MainNavBar/>
          <Component {...pageProps} />
          <Footer/>
          {!cookiesAccepted ? <CookiePrompt acceptCookies={this.acceptCookies} /> :null}
        </PersistGate>
      </Provider> 
    );
  }
}