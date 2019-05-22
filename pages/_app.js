import React from 'react';
import App, { Container } from 'next/app';
import Header from "../partials/header.js";
import Footer from "../partials/footer.js";

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

    const Bootstrap = () => {
      return <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossorigin="anonymous" />
    }

    return (
      <Container>
        
        <Bootstrap />

        <Header />
        <Component {...pageProps} />
        <Footer />
      </Container>
    );
  }
}

export default MyApp;