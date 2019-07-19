import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from '~/reducers/store.js';
import App, { Container } from 'next/app';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { loadCountries } from '~/constants/countries';
import { saveCountries } from '~/reducers/actions';

import {PreNavBar, MainNavBar} from "~/partials/header.js";
import Footer from "~/partials/footer.js";

import 'react-toastify/dist/ReactToastify.min.css';
import css from '~/styles/_partials.scss';

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
    document.body.className = css.body;

    /** Retrieve all countries just once */
    // this.unsubscribe = store.subscribe(() => {
    //   const countries = store.getState().countries;
    //   if (!countries || countries.length === 0){
    //     this.preloadCountries();
    //   }
    // });

    // this.setState({isLoaded: true});

    this.preloadCountries();
  }

  componentWillUnmount(){
    this.unsubscribe();
  }

  /** Save country list in Redux store */
  preloadCountries = () => {
    loadCountries().then(data => {
      const countries = [];
      data.forEach(country => {
        countries.push({ label: country.name, demonym: country.demonym });
      });
      store.dispatch(saveCountries(countries));
      this.setState({isLoaded: true});
      // this.unsubscribe();
    });
  }

  render() {
    const { Component, pageProps } = this.props;
    
    if (!this.state.isLoaded) return null;

    return (
      <Container>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
        <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Raleway:400,700" />
        <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Patua+One:400,700" />

        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <PreNavBar/> <MainNavBar/>
            <Component {...pageProps} />
            <Footer/>
          </PersistGate>
        </Provider> 
      </Container>
    );
  }
}