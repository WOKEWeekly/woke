import Document, { Html, Head, Main, NextScript } from 'next/document';
import Meta from '~/partials/meta.js';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const meta = await Document.getInitialProps(ctx);
    return { ...meta };
  }

  render() {
    return (
      <Html>
        <Head>
          <Meta {...this.props.__NEXT_DATA__.query}/>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}