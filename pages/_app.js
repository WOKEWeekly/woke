import React from 'react';
import App, { Container } from 'next/app';
import Header from "~/partials/header.js";
import Footer from "~/partials/footer.js";

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </Container>
    );
  }
}

export default MyApp;