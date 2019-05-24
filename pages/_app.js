import React from 'react';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';

import App, { Container } from 'next/app';
import {PreNavBar, MainNavBar} from "../partials/header.js";
import Footer from "../partials/footer.js";

import css from '~/styles/app.scss';

library.add(fab);

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  componentDidMount(){
    document.body.className = css.body;
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossOrigin="anonymous" />
        <link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Raleway:400,700" />
        <link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Patua+One:400,700" />

        <PreNavBar /> <MainNavBar />
        <Component {...pageProps} />
        <Footer />
      </Container>
    );
  }
}

export default MyApp;